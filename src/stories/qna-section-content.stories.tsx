import QnASectionContent from '@/features/dashboard/components/section-content/qna-section-content';
import type { QnAListItem } from '@/features/qna/types';
import type { Meta, StoryObj } from '@storybook/react';

/** 답변 완료 + 답변 전 혼합 (학생 뷰용) */
const mockQuestionsMixed: QnAListItem[] = [
  {
    id: 1,
    title:
      '질문질문질문질문질문질문질문질문질문 질문질문질문질문질문질문질문질문질...',
    content: '',
    status: 'COMPLETED',
    authorName: '박서연',
    regDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: [],
  },
  {
    id: 2,
    title: '제목제목제목제목제목제목제목제목제목제목 제목제목제목제목제목...',
    content: '',
    status: 'PENDING',
    authorName: '박서연',
    regDate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    messages: [],
  },
];

/** 답변 전만 (선생님 뷰용) */
const mockQuestionsPending: QnAListItem[] = [
  {
    id: 1,
    title:
      '질문질문질문질문질문질문질문질문질문 질문질문질문질문질문질문질문질문질...',
    content: '',
    status: 'PENDING',
    authorName: '박서연',
    regDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    messages: [],
  },
  {
    id: 2,
    title: '이차방정식 근의 공식 관련 질문이 있어요',
    content: '',
    status: 'PENDING',
    authorName: '김민수',
    regDate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    messages: [],
  },
];

const meta = {
  title: 'dashboard/QnASectionContent',
  component: QnASectionContent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof QnASectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 학생 뷰: 답변 완료 + 답변 전 혼합 */
export const StudentView: Story = {
  args: {
    isTeacher: false,
    questions: mockQuestionsMixed,
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
  },
};

/** 선생님 뷰: 답변 전만 (작성자 아바타·이름 표시) */
export const TeacherView: Story = {
  args: {
    isTeacher: true,
    questions: mockQuestionsPending,
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
  },
};

/** 스터디룸 없음 */
export const EmptyNoStudyRoom: Story = {
  args: {
    isTeacher: false,
    questions: [],
    studyRoomId: 0,
    studyRoomName: '',
  },
};

/** 질문 없음 (학생) */
export const EmptyNoQuestionsStudent: Story = {
  args: {
    isTeacher: false,
    questions: [],
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
  },
};

/** 질문 없음 (선생님) */
export const EmptyNoQuestionsTeacher: Story = {
  args: {
    isTeacher: true,
    questions: [],
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
  },
};
