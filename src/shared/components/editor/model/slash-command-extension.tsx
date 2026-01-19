'use client';

import { Root, createRoot } from 'react-dom/client';

import { Editor, Extension, Range } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

import { SlashCommandMenu } from '../ui/slash-command-menu';
import { getAllSlashCommands } from '../utils';

export type SlashCommandSuggestionProps = {
  editor: Editor;
  range: Range;
  query: string;
  onClose: () => void;
};

const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({
          editor,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: { command: (editor: Editor) => void };
        }) => {
          props.command(editor);
        },
      } as Partial<SuggestionOptions>,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const createSlashCommandExtension = () => {
  return SlashCommandExtension.configure({
    suggestion: {
      char: '/',
      startOfLine: false,
      items: ({ query }: { query: string }) => {
        const allCommands = getAllSlashCommands();
        if (!query) return allCommands;

        const lowerQuery = query.toLowerCase();
        return allCommands.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.keywords.some((keyword) =>
              keyword.toLowerCase().includes(lowerQuery)
            )
        );
      },
      render: () => {
        let popup: HTMLDivElement | null = null;
        let root: Root | null = null;

        return {
          onStart: (props: {
            editor: Editor;
            range: Range;
            query: string;
            clientRect: (() => DOMRect | null) | null;
          }) => {
            popup = document.createElement('div');
            popup.style.position = 'absolute';
            popup.style.zIndex = '9999';
            document.body.appendChild(popup);

            const rect = props.clientRect?.();
            if (rect) {
              popup.style.left = `${rect.left + window.scrollX}px`;
              popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
            }

            root = createRoot(popup);
            root.render(
              <SlashCommandMenu
                editor={props.editor}
                range={props.range}
                query={props.query}
                onClose={() => {
                  popup?.remove();
                  root?.unmount();
                }}
              />
            );
          },

          onUpdate: (props: {
            editor: Editor;
            range: Range;
            query: string;
            clientRect: (() => DOMRect | null) | null;
          }) => {
            const rect = props.clientRect?.();
            if (rect && popup) {
              popup.style.left = `${rect.left + window.scrollX}px`;
              popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
            }

            root?.render(
              <SlashCommandMenu
                editor={props.editor}
                range={props.range}
                query={props.query}
                onClose={() => {
                  popup?.remove();
                  root?.unmount();
                }}
              />
            );
          },

          onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === 'Escape') {
              popup?.remove();
              root?.unmount();
              return true;
            }

            // Enter, ArrowUp, ArrowDown은 SlashCommandMenu에서 처리
            if (
              props.event.key === 'Enter' ||
              props.event.key === 'ArrowUp' ||
              props.event.key === 'ArrowDown'
            ) {
              return true;
            }

            return false;
          },

          onExit: () => {
            popup?.remove();
            root?.unmount();
          },
        };
      },
    },
  });
};
