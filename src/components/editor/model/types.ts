import { Editor, JSONContent } from '@tiptap/react';

export type TextEditorValue = JSONContent;

export type ToolbarProps = {
  editor: Editor;
};

export type TextEditorProps = {
  className?: string;
  value: TextEditorValue;
  onChange: (value: TextEditorValue) => void;
  placeholder?: string;
};

export type TextViewerProps = {
  className?: string;
  value: TextEditorValue;
};
