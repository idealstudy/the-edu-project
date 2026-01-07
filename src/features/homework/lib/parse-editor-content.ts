import { JSONContent } from '@tiptap/react';

export const parseEditorContent = (content: string): JSONContent => {
  // 기본값
  const emptyDoc: JSONContent = {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  };

  if (!content) return emptyDoc;

  try {
    const parsed = JSON.parse(content);

    // tiptap JSONContent 형태면 그대로 사용
    if (parsed && typeof parsed === 'object' && 'type' in parsed) {
      return parsed as JSONContent;
    }

    // JSON이긴 한데 tiptap 형식이 아니면 텍스트로 래핑
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: String(content) }],
        },
      ],
    };
  } catch {
    // JSON이 아니면 일반 텍스트로 래핑
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: content }],
        },
      ],
    };
  }
};
