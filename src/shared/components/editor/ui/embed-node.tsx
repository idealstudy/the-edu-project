'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { X } from 'lucide-react';

import { EmbedAttributes } from '../model/embed-extension';

export const EmbedNode = ({ node, deleteNode, editor }: NodeViewProps) => {
  const attrs = node.attrs as EmbedAttributes;
  const { embedUrl, type, title } = attrs;

  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper className="embed-wrapper my-3">
      <div
        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-black dark:border-gray-700"
        contentEditable={false}
      >
        {isEditable && (
          <button
            type="button"
            onClick={() => deleteNode()}
            className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-900/80"
            title="삭제"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <div
          className="relative w-full"
          style={{ paddingBottom: '56.25%' }}
        >
          <iframe
            src={embedUrl}
            title={title || `${type} embed`}
            className="absolute top-0 left-0 h-full w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
};
