import { useEffect, useMemo } from 'react';

import { defaultExtensions } from '@/shared/components/editor/model/extensions';
import { TextEditorProps } from '@/shared/components/editor/model/types';
import { cn } from '@/shared/lib';
import { Placeholder } from '@tiptap/extensions';
import { EditorContent, useEditor } from '@tiptap/react';

import { Toolbar } from './toolbar';

export const TextEditor = ({
  className,
  value,
  onChange,
  placeholder = '',
}: TextEditorProps) => {
  const extensions = useMemo(
    () => [
      ...defaultExtensions,
      Placeholder.configure({
        placeholder,
      }),
    ],
    [placeholder]
  );

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: cn(
          'outline-none min-h-[310px] max-h-[500px] overflow-y-auto px-5 py-4 w-full',
          className
        ),
      },
    },
    immediatelyRender: false,
  });

  // content prop이 변경되면 에디터 내용 업데이트
  // 폼이 reset()으로 업데이트될 때 에디터도 함께 업데이트되도록 함
  useEffect(() => {
    if (!editor || !value) return;

    const currentContent = editor.getJSON();
    const currentContentStr = JSON.stringify(currentContent);
    const newContentStr = JSON.stringify(value);

    // 내용이 실제로 변경된 경우에만 업데이트
    if (currentContentStr !== newContentStr) {
      editor.commands.setContent(value); // false = emitUpdate을 비활성화하여 무한 루프 방지
    }
  }, [editor, value]);

  if (editor === null) {
    return null;
  }

  return (
    <div className="border-line-line2 flex w-full flex-col rounded-[4px] border">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
