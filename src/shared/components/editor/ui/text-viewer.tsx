import { defaultExtensions } from '@/shared/components/editor/model/extensions';
import { TextViewerProps } from '@/shared/components/editor/types';
import { cn } from '@/shared/lib';
import { EditorContent, useEditor } from '@tiptap/react';

export const TextViewer = ({ className, value }: TextViewerProps) => {
  const editor = useEditor({
    extensions: defaultExtensions,
    content: value,
    editable: false, // 읽기 전용으로 설정
    editorProps: {
      attributes: {
        class: cn('outline-none w-full', className),
      },
    },
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
};
