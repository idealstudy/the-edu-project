import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { LinkPreviewNode } from '../ui/link-preview-node';

export interface LinkPreviewOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface LinkPreviewAttributes {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  loading?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    linkPreview: {
      setLinkPreview: (options: LinkPreviewAttributes) => ReturnType;
    };
  }
}

export const LinkPreview = Node.create<LinkPreviewOptions>({
  name: 'linkPreview',

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
      title: {
        default: null,
      },
      description: {
        default: null,
      },
      image: {
        default: null,
      },
      siteName: {
        default: null,
      },
      loading: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="link-preview"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'link-preview',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkPreviewNode);
  },

  addCommands() {
    return {
      setLinkPreview:
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
