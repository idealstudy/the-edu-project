import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { FileAttachmentNode } from '../ui/file-attachment-node';

export interface FileAttachmentOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (options: {
        url: string;
        name: string;
        size: number;
        mediaId?: string;
        isUploading?: boolean;
      }) => ReturnType;
    };
  }
}

export const FileAttachment = Node.create<FileAttachmentOptions>({
  name: 'fileAttachment',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
      },
      name: {
        default: null,
      },
      size: {
        default: 0,
      },
      mediaId: {
        default: null,
      },
      isUploading: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'file-attachment',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentNode);
  },

  addCommands() {
    return {
      setFileAttachment:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
