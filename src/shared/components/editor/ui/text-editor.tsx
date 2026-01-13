import { useCallback, useEffect, useMemo, useRef } from 'react';

import { UPLOAD_ERROR_MESSAGES } from '@/shared/components/editor/constants';
import { createNotionExtensions } from '@/shared/components/editor/model/extensions';
import { useFileUpload } from '@/shared/components/editor/model/use-file-upload';
import { useImageUpload } from '@/shared/components/editor/model/use-image-upload';
import { NotionEditorProps } from '@/shared/components/editor/types';
import {
  getUploadErrorMessage,
  validateAttachmentFile,
  validateImageFile,
} from '@/shared/components/editor/utils';
import { cn } from '@/shared/lib';
import { Editor } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';

import '../styles/text-editor.css';
import { BubbleMenuToolbar } from './bubble-menu-toolbar';
import { EditorToolbar } from './editor-toolbar';

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
  targetType = 'TEACHING_NOTE',
  onImageUpload: customImageUpload,
  onFileUpload: customFileUpload,
  onError,
  ariaLabel,
}: NotionEditorProps) => {
  const editorRef = useRef<Editor | null>(null);
  const prevValueRef = useRef<string>('');
  const isInternalChangeRef = useRef(false);

  const extensions = useMemo(
    () =>
      createNotionExtensions({
        placeholder,
        enableSlashCommand,
      }),
    [placeholder, enableSlashCommand]
  );

  const { uploadAsync: uploadImageAsync } = useImageUpload({
    targetType,
    onError: (error) => {
      onError?.(error.message || UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    },
  });

  const { uploadAsync: uploadFileAsync } = useFileUpload({
    targetType,
    onError: (error) => {
      onError?.(error.message || UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
    },
  });

  // 이미지 업로드 핸들러 - 낙관적 업데이트 적용
  const handleImageUpload = useCallback(
    async (file: File) => {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        onError?.(validation.error || UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
        return;
      }

      // 즉시 blob URL로 이미지를 삽입하여 즉각적인 피드백 제공
      const blobUrl = URL.createObjectURL(file);
      const uploadId = `upload-${Date.now()}-${Math.random()}`;

      currentEditor
        .chain()
        .focus()
        .setImage({
          src: blobUrl,
          isUploading: true,
          mediaId: uploadId,
        })
        .run();

      // 백그라운드에서 업로드 진행
      try {
        if (customImageUpload) {
          const url = await customImageUpload(file);
          let nodePos: number | null = null;

          currentEditor.state.doc.descendants((node, pos) => {
            if (
              nodePos === null &&
              node.type.name === 'image' &&
              node.attrs.mediaId === uploadId
            ) {
              nodePos = pos;
              return false;
            }
          });

          if (nodePos !== null) {
            const node = currentEditor.state.doc.nodeAt(nodePos);
            if (node) {
              const transaction = currentEditor.state.tr.setNodeMarkup(
                nodePos,
                undefined,
                {
                  ...node.attrs,
                  src: url,
                  isUploading: false,
                }
              );
              currentEditor.view.dispatch(transaction);
            }
          }

          URL.revokeObjectURL(blobUrl);
        } else {
          const result = await uploadImageAsync(file);
          let nodePos: number | null = null;

          currentEditor.state.doc.descendants((node, pos) => {
            if (
              nodePos === null &&
              node.type.name === 'image' &&
              node.attrs.mediaId === uploadId
            ) {
              nodePos = pos;
              return false;
            }
          });

          if (nodePos !== null) {
            const node = currentEditor.state.doc.nodeAt(nodePos);
            if (node) {
              // blob URL 유지, mediaId만 업데이트 (저장 시 변환용)
              const transaction = currentEditor.state.tr.setNodeMarkup(
                nodePos,
                undefined,
                {
                  ...node.attrs,
                  mediaId: result.mediaId,
                  isUploading: false,
                }
              );
              currentEditor.view.dispatch(transaction);
            }
          }
        }
      } catch (error) {
        // 업로드 실패 시 이미지 노드 제거
        let nodePos: number | null = null;
        let nodeSize = 0;

        currentEditor.state.doc.descendants((node, pos) => {
          if (
            nodePos === null &&
            node.type.name === 'image' &&
            node.attrs.mediaId === uploadId
          ) {
            nodePos = pos;
            nodeSize = node.nodeSize;
            return false;
          }
        });

        if (nodePos !== null) {
          const transaction = currentEditor.state.tr.delete(
            nodePos,
            nodePos + nodeSize
          );
          currentEditor.view.dispatch(transaction);
        }

        URL.revokeObjectURL(blobUrl);

        const errorMessage =
          error instanceof Error
            ? getUploadErrorMessage(error)
            : UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED;

        onError?.(errorMessage);
      }
    },
    [customImageUpload, uploadImageAsync, onError]
  );

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(
    async (file: File) => {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;

      const validation = validateAttachmentFile(file);
      if (!validation.valid) {
        onError?.(validation.error || UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED);
        return;
      }

      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      const blobUrl = URL.createObjectURL(file);

      currentEditor
        .chain()
        .focus()
        .insertContent({
          type: 'fileAttachment',
          attrs: {
            url: blobUrl,
            name: file.name,
            size: file.size,
            mediaId: uploadId,
            isUploading: true,
          },
        })
        .run();

      try {
        if (customFileUpload) {
          const { url, name, size } = await customFileUpload(file);
          let nodePos: number | null = null;

          currentEditor.state.doc.descendants((node, pos) => {
            if (
              nodePos === null &&
              node.type.name === 'fileAttachment' &&
              node.attrs.mediaId === uploadId
            ) {
              nodePos = pos;
              return false;
            }
          });

          if (nodePos !== null) {
            const node = currentEditor.state.doc.nodeAt(nodePos);
            if (node) {
              const transaction = currentEditor.state.tr.setNodeMarkup(
                nodePos,
                undefined,
                {
                  ...node.attrs,
                  url,
                  name,
                  size,
                  isUploading: false,
                }
              );
              currentEditor.view.dispatch(transaction);
            }
          }

          URL.revokeObjectURL(blobUrl);
        } else {
          const result = await uploadFileAsync(file);
          let nodePos: number | null = null;

          currentEditor.state.doc.descendants((node, pos) => {
            if (
              nodePos === null &&
              node.type.name === 'fileAttachment' &&
              node.attrs.mediaId === uploadId
            ) {
              nodePos = pos;
              return false;
            }
          });

          if (nodePos !== null) {
            const node = currentEditor.state.doc.nodeAt(nodePos);
            if (node) {
              // blob URL 유지, mediaId와 메타데이터만 업데이트
              const transaction = currentEditor.state.tr.setNodeMarkup(
                nodePos,
                undefined,
                {
                  ...node.attrs,
                  name: result.fileName,
                  size: result.sizeBytes,
                  mediaId: result.mediaId,
                  isUploading: false,
                }
              );
              currentEditor.view.dispatch(transaction);
            }
          }
        }
      } catch (error) {
        let nodePos: number | null = null;
        let nodeSize = 0;

        currentEditor.state.doc.descendants((node, pos) => {
          if (
            nodePos === null &&
            node.type.name === 'fileAttachment' &&
            node.attrs.mediaId === uploadId
          ) {
            nodePos = pos;
            nodeSize = node.nodeSize;
            return false;
          }
        });

        if (nodePos !== null) {
          const transaction = currentEditor.state.tr.delete(
            nodePos,
            nodePos + nodeSize
          );
          currentEditor.view.dispatch(transaction);
        }

        const errorMessage =
          error instanceof Error
            ? getUploadErrorMessage(error)
            : UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED;

        onError?.(errorMessage);
      }
    },
    [customFileUpload, uploadFileAsync, onError]
  );

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    autofocus: autoFocus,
    onUpdate: ({ editor: updatedEditor }) => {
      // 에디터 내부에서 발생한 변경임을 표시
      isInternalChangeRef.current = true;
      onChange(updatedEditor.getJSON());
    },
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
          if (file) {
            // 이미지 파일인 경우
            if (file.type.startsWith('image/')) {
              event.preventDefault();
              handleImageUpload(file);
              return true;
            }
            // 일반 파일인 경우 (첨부 파일)
            const fileValidation = validateAttachmentFile(file);
            if (fileValidation.valid) {
              event.preventDefault();
              handleFileUpload(file);
              return true;
            }
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of items) {
            // 이미지 붙여넣기
            if (item.type.startsWith('image/')) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file);
                return true;
              }
            }
          }
          // 파일 붙여넣기 (일부 브라우저에서 지원)
          for (const item of items) {
            if (item.kind === 'file' && !item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (file) {
                const fileValidation = validateAttachmentFile(file);
                if (fileValidation.valid) {
                  event.preventDefault();
                  handleFileUpload(file);
                  return true;
                }
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

  // 외부에서 content가 변경되면 에디터 동기화
  useEffect(() => {
    if (!editor || !value) return;

    // 내부 변경은 무시 (커서 위치 보존)
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      prevValueRef.current = JSON.stringify(value);
      return;
    }

    const newContentStr = JSON.stringify(value);

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
          onFileUpload={handleFileUpload}
        />
      )}
      {showBubbleMenu && !readOnly && (
        <BubbleMenuToolbar
          editor={editor}
          darkMode={darkMode}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
};
