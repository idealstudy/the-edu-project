import { useState } from 'react';

import {
  TextEditor,
  TextViewer,
  initialTextEditorValue,
  useAutoSave,
  useTextEditor,
} from '@/shared/components/editor';
import type { TextEditorValue } from '@/shared/components/editor';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const meta = {
  title: 'ui/TextEditor',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof TextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 에디터
const EditorComponent = () => {
  const textEditor = useTextEditor();

  return (
    <div className="w-[700px]">
      <TextEditor
        value={textEditor.value}
        onChange={textEditor.onChange}
        placeholder='내용을 입력하세요. "/" 를 입력하면 명령어를 사용할 수 있습니다.'
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <EditorComponent />,
};

// 다크모드 에디터
const DarkModeEditor = () => {
  const textEditor = useTextEditor();

  return (
    <div className="w-[700px] rounded-lg bg-gray-900 p-6">
      <TextEditor
        value={textEditor.value}
        onChange={textEditor.onChange}
        placeholder='내용을 입력하세요. "/" 를 입력하면 명령어를 사용할 수 있습니다.'
        darkMode
      />
    </div>
  );
};

export const DarkMode: Story = {
  render: () => <DarkModeEditor />,
};

// 툴바 없는 미니멀 에디터
const MinimalEditor = () => {
  const textEditor = useTextEditor();

  return (
    <div className="w-[500px]">
      <TextEditor
        value={textEditor.value}
        onChange={textEditor.onChange}
        placeholder="간단한 메모를 작성하세요..."
        showToolbar={false}
        minHeight="120px"
        maxHeight="300px"
      />
    </div>
  );
};

export const Minimal: Story = {
  render: () => <MinimalEditor />,
};

// 자동 저장 에디터
const AutoSaveEditor = () => {
  const [savedValue, setSavedValue] = useState<TextEditorValue>(
    initialTextEditorValue
  );

  const { status, lastSavedAt, hasUnsavedChanges, handleChange } = useAutoSave(
    initialTextEditorValue,
    {
      enabled: true,
      debounceMs: 1500,
      onSave: async (value) => {
        // 실제로는 API 호출
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSavedValue(value);
      },
    }
  );

  return (
    <div className="w-[700px]">
      <div className="mb-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">자동 저장:</span>
          <span
            className={
              status === 'saving'
                ? 'text-yellow-500'
                : status === 'saved'
                  ? 'text-green-500'
                  : status === 'error'
                    ? 'text-red-500'
                    : 'text-gray-400'
            }
          >
            {status === 'saving' && '저장 중...'}
            {status === 'saved' && '저장됨'}
            {status === 'error' && '저장 실패'}
            {status === 'idle' &&
              (hasUnsavedChanges ? '변경사항 있음' : '대기 중')}
          </span>
        </div>
        {lastSavedAt && (
          <span className="text-gray-400">
            마지막 저장: {lastSavedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
      <TextEditor
        value={savedValue}
        onChange={handleChange}
        placeholder="내용을 입력하면 자동으로 저장됩니다..."
      />
    </div>
  );
};

export const AutoSave: Story = {
  render: () => <AutoSaveEditor />,
};

// 이미지 업로드 에디터 (커스텀 핸들러)
const ImageUploadEditor = () => {
  const textEditor = useTextEditor();

  // 커스텀 이미지 업로드 핸들러 (실제로는 API 호출)
  const handleImageUpload = async (file: File): Promise<string> => {
    // 업로드 시뮬레이션 (2초 딜레이)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 실제로는 서버에서 받은 URL 반환
    // 여기서는 임시로 base64 반환
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="w-[700px]">
      <p className="mb-2 text-sm text-gray-500">
        이미지를 드래그 앤 드롭하거나 붙여넣기 해보세요. (2초 로딩 시뮬레이션)
      </p>
      <TextEditor
        value={textEditor.value}
        onChange={textEditor.onChange}
        placeholder="이미지를 드래그 앤 드롭 해보세요..."
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};

export const ImageUpload: Story = {
  render: () => <ImageUploadEditor />,
};

// 모바일 뷰 (좁은 너비)
const MobileEditor = () => {
  const textEditor = useTextEditor();

  return (
    <div className="w-[360px]">
      <TextEditor
        value={textEditor.value}
        onChange={textEditor.onChange}
        placeholder="모바일에서 작성해보세요..."
        minHeight="150px"
      />
    </div>
  );
};

export const Mobile: Story = {
  render: () => <MobileEditor />,
};

// 읽기 전용 에디터
const ReadOnlyEditor = () => {
  return (
    <div className="w-[700px]">
      <TextEditor
        value={DUMMY_TEXT_EDITOR_VALUE}
        onChange={() => {}}
        readOnly
      />
    </div>
  );
};

export const ReadOnly: Story = {
  render: () => <ReadOnlyEditor />,
};

// 읽기 전용 뷰어 (TextViewer 컴포넌트)
export const Viewer: Story = {
  render: () => {
    return (
      <div className="w-[700px]">
        <TextViewer value={DUMMY_TEXT_EDITOR_VALUE} />
      </div>
    );
  },
};

// 콘텐츠가 있는 에디터
const WithContentEditor = () => {
  const [value, setValue] = useState<TextEditorValue>(DUMMY_TEXT_EDITOR_VALUE);

  return (
    <div className="w-[700px]">
      <TextEditor
        value={value}
        onChange={setValue}
        placeholder="내용을 입력하세요..."
      />
    </div>
  );
};

export const WithContent: Story = {
  render: () => <WithContentEditor />,
};

const DUMMY_TEXT_EDITOR_VALUE: TextEditorValue = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Notion 스타일 에디터' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '이 에디터는 ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Notion' },
        { type: 'text', text: '과 ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Confluence' },
        { type: 'text', text: ' 스타일의 WYSIWYG 에디터입니다.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: '주요 기능' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'code' }], text: '/' },
                { type: 'text', text: ' 슬래시 커맨드로 블록 추가' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '마크다운 단축키 지원 (예: ' },
                { type: 'text', marks: [{ type: 'code' }], text: '## ' },
                { type: 'text', text: '→ 제목 2)' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '이미지 드래그 앤 드롭' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '다크모드 지원' }],
            },
          ],
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: '"좋은 에디터는 글쓰기에 집중하게 해준다."',
            },
          ],
        },
      ],
    },
    {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [
        {
          type: 'text',
          text: 'import { TextEditor, useTextEditor } from "@/shared/components/editor";\n\nconst MyEditor = () => {\n  const editor = useTextEditor();\n  return <TextEditor {...editor} />;\n};',
        },
      ],
    },
  ],
};
