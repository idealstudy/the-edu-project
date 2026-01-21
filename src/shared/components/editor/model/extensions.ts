import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { ListKit } from '@tiptap/extension-list';
import Placeholder from '@tiptap/extension-placeholder';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import StarterKitExtension from '@tiptap/starter-kit';

import { CustomImage } from './custom-image-extension';
import { Embed } from './embed-extension';
import { FileAttachment } from './file-attachment-extension';
import { KeyboardShortcuts } from './keyboard-shortcuts-extension';
import { LinkPreview } from './link-preview-extension';
import { createSlashCommandExtension } from './slash-command-extension';

// 기본 확장 (레거시 호환용)
export const defaultExtensions = [
  StarterKitExtension.configure({
    gapcursor: false,
  }),
  TextStyleKit,
  ListKit,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
];

// Notion 스타일 에디터를 위한 확장
export const createNotionExtensions = (options?: {
  placeholder?: string;
  enableSlashCommand?: boolean;
  onLinkShortcut?: () => void;
}) => {
  const {
    placeholder = '내용을 입력하세요. "/" 를 입력하면 명령어를 사용할 수 있습니다.',
    enableSlashCommand = true,
    onLinkShortcut,
  } = options || {};

  const extensions = [
    StarterKitExtension.configure({
      heading: {
        levels: [1, 2, 3],
      },
      codeBlock: {
        HTMLAttributes: {
          class: 'notion-code-block',
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: 'notion-blockquote',
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: 'notion-divider',
        },
      },
      dropcursor: false,
      gapcursor: false,
    }),
    TextStyleKit,
    ListKit.configure({
      bulletList: {
        HTMLAttributes: {
          class: 'notion-bullet-list',
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: 'notion-ordered-list',
        },
      },
      listItem: {
        HTMLAttributes: {
          class: 'notion-list-item',
        },
      },
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),
    CustomImage.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'notion-image',
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      HTMLAttributes: {
        class: 'notion-link',
      },
    }),
    Underline,
    TaskList.configure({
      HTMLAttributes: {
        class: 'notion-task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'notion-task-item',
      },
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Typography,
    Dropcursor.configure({
      color: '#FF6B35',
      width: 2,
    }),
    Gapcursor,
    // 파일 첨부 확장
    FileAttachment,
    // 링크 미리보기 확장
    LinkPreview,
    // 임베드 확장 (YouTube, Vimeo 등)
    Embed,
    // 키보드 단축키 확장
    KeyboardShortcuts.configure({
      onLinkShortcut,
    }),
  ];

  if (enableSlashCommand) {
    extensions.push(createSlashCommandExtension());
  }

  return extensions;
};
