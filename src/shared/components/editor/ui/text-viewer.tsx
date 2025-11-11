import { defaultExtensions } from '@/shared/components/editor/model/extensions';
import { TextViewerProps } from '@/shared/components/editor/model/types';
import { cn } from '@/shared/lib';
import { EditorContent, useEditor } from '@tiptap/react';

export const TextViewer = ({ className, value }: TextViewerProps) => {
  const editor = useEditor({
    extensions: defaultExtensions,
    content: value,
    editorProps: {
      attributes: {
        class: cn('outline-none w-full', className),
      },
    },
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
};
