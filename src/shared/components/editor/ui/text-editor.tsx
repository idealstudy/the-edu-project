import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { UPLOAD_ERROR_MESSAGES } from '@/shared/components/editor/constants';
import { createNotionExtensions } from '@/shared/components/editor/model/extensions';
import { useImageUpload } from '@/shared/components/editor/model/use-image-upload';
import { TextEditorProps } from '@/shared/components/editor/types';
import {
  getUploadErrorMessage,
  validateImageFile,
} from '@/shared/components/editor/utils';
import { cn } from '@/shared/lib';
import { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';

import '../styles/text-editor.css';
import { BubbleMenuToolbar } from './bubble-menu-toolbar';
import { EditorToolbar } from './editor-toolbar';
import { ImageUploadOverlay } from './image-upload-overlay';

export type NotionEditorProps = TextEditorProps & {
  /** 다크모드 활성화 */
  darkMode?: boolean;
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 슬래시 커맨드 활성화 */
  enableSlashCommand?: boolean;
  /** 툴바 표시 여부 */
  showToolbar?: boolean;
  /** 버블 메뉴 표시 여부 */
  showBubbleMenu?: boolean;
  /** 최소 높이 */
  minHeight?: string;
  /** 최대 높이 */
  maxHeight?: string;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 커스텀 이미지 업로드 핸들러 (제공하지 않으면 기본 API 사용) */
  onImageUpload?: (file: File) => Promise<string>;
  /** 커스텀 파일 업로드 핸들러 */
  onFileUpload?: (
    file: File
  ) => Promise<{ url: string; name: string; size: number }>;
  /** 에러 핸들러 */
  onError?: (message: string) => void;
  /** 접근성 레이블 */
  ariaLabel?: string;
};

export const TextEditor = ({
  className,
  value,
  onChange,
  placeholder = '내용을 입력하세요. "/" 를 입력하면 명령어를 사용할 수 있습니다.',
  darkMode = false,
  autoFocus = false,
  enableSlashCommand = true,
  showToolbar = true,
  showBubbleMenu = true,
  minHeight = '200px',
  maxHeight = '600px',
  readOnly = false,
  onImageUpload: customImageUpload,
  onFileUpload: customFileUpload,
  onError,
  ariaLabel,
}: NotionEditorProps) => {
  const [isUploading, setIsUploading] = useState(false);

  // useRef는 반드시 컴포넌트 최상단에서 호출
  const editorRef = useRef<Editor | null>(null);
  const prevValueRef = useRef<string>('');

  const extensions = useMemo(
    () =>
      createNotionExtensions({
        placeholder,
        enableSlashCommand,
      }),
    [placeholder, enableSlashCommand]
  );

  const { uploadAsync } = useImageUpload({
    onError: (error) => {
      onError?.(error.message || UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    },
  });

  // 이미지 업로드 핸들러 - editorRef를 사용하여 순환 참조 방지
  const handleImageUpload = useCallback(
    async (file: File) => {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        onError?.(validation.error || UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
        return;
      }

      setIsUploading(true);

      try {
        let url: string;

        if (customImageUpload) {
          url = await customImageUpload(file);
        } else {
          const result = await uploadAsync(file);
          // media:{mediaId} 형식으로 저장
          url = result.mediaUrl;
        }

        currentEditor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? getUploadErrorMessage(error)
            : UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED;

        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [customImageUpload, uploadAsync, onError]
  );

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(
    async (file: File) => {
      const currentEditor = editorRef.current;
      if (!currentEditor || !customFileUpload) return;

      setIsUploading(true);

      try {
        const { url, name, size } = await customFileUpload(file);

        currentEditor
          .chain()
          .focus()
          .insertContent({
            type: 'fileAttachment',
            attrs: { url, name, size },
          })
          .run();
      } catch {
        onError?.(UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
      } finally {
        setIsUploading(false);
      }
    },
    [customFileUpload, onError]
  );

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    autofocus: autoFocus,
    onUpdate: ({ editor: updatedEditor }) => onChange(updatedEditor.getJSON()),
    editorProps: {
      attributes: {
        class: cn(
          'notion-editor-content',
          'outline-none w-full px-4 py-3',
          'prose prose-sm sm:prose-base max-w-none',
          darkMode && 'prose-invert',
          className
        ),
        style: `min-height: ${minHeight}; max-height: ${maxHeight}; overflow-y: auto;`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file?.type.startsWith('image/')) {
            event.preventDefault();
            handleImageUpload(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
                return true;
              }
            }
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  // editor가 생성된 후 ref 업데이트
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // content prop이 변경되면 에디터 내용 업데이트
  // 폼이 reset()으로 업데이트될 때 에디터도 함께 업데이트되도록 함
  useEffect(() => {
    if (!editor || !value) return;

    const newContentStr = JSON.stringify(value);

    // 이전 값과 비교하여 불필요한 setContent 호출 방지
    if (prevValueRef.current !== newContentStr) {
      prevValueRef.current = newContentStr;
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (editor === null) {
    return (
      <div
        className={cn(
          'notion-editor-skeleton',
          'animate-pulse rounded-lg border',
          darkMode
            ? 'border-gray-scale-gray-70 bg-gray-scale-gray-90'
            : 'border-line-line2 bg-gray-scale-gray-5'
        )}
        style={{ minHeight }}
        aria-label="에디터 로딩 중"
      />
    );
  }

  return (
    <div
      className={cn(
        'notion-editor',
        'relative flex w-full flex-col rounded-lg border transition-colors',
        darkMode
          ? 'border-gray-scale-gray-70 bg-gray-scale-gray-90 text-gray-scale-white'
          : 'border-line-line2 bg-gray-scale-white text-text-main',
        'focus-within:border-key-color-primary focus-within:ring-key-color-primary/20 focus-within:ring-1'
      )}
      role="textbox"
      aria-label={ariaLabel || '리치 텍스트 에디터'}
      aria-multiline="true"
      data-dark-mode={darkMode}
    >
      {showToolbar && !readOnly && (
        <EditorToolbar
          editor={editor}
          darkMode={darkMode}
          onImageUpload={handleImageUpload}
          onFileUpload={customFileUpload ? handleFileUpload : undefined}
        />
      )}
      {showBubbleMenu && !readOnly && (
        <BubbleMenuToolbar
          editor={editor}
          darkMode={darkMode}
        />
      )}
      <EditorContent editor={editor} />

      {/* 이미지 업로드 로딩 오버레이 */}
      <ImageUploadOverlay
        isUploading={isUploading}
        darkMode={darkMode}
      />
    </div>
  );
};
