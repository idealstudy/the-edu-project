import HomeworkSectionContent from '@/features/dashboard/components/section-content/homework-section-content';
import type { Meta, StoryObj } from '@storybook/react';

/** 스토리북에서 항상 미래 마감일이 되도록 동적 날짜 생성 (로컬 시간 기준) */
const getFutureDeadline = (daysFromNow: number, hour = 23, minute = 59) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(date.getHours() + hour, date.getMinutes() + minute, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const mockHomeworks = [
  {
    id: 1,
    title: '제목제목제목제목제목제 제목제목제목 제목제목제',
    modDate: '2025-02-19',
    deadline: getFutureDeadline(7),
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
    description:
      '제목제목제목제목제목제목제목제목제목제 목제목제목제목제목제목제목',
  },
  {
    id: 2,
    title: '1차 수업 정리 - 이차방정식',
    modDate: '2025-02-18',
    deadline: getFutureDeadline(14),
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
    description: '이차방정식의 근의 공식과 판별식에 대해 학습했습니다.',
  },
  {
    id: 3,
    title: 'Unit 3 - Present Perfect',
    modDate: '2025-02-19',
    deadline: getFutureDeadline(0, 2, 0),
    studyRoomId: 2,
    studyRoomName: '영어 회화 스터디룸',
    description: '현재완료 시제의 용법과 예문 정리',
  },
  {
    id: 4,
    title: '2차 수업 정리 - 인수분해',
    modDate: '2025-02-17',
    deadline: getFutureDeadline(0, 0, 30),
    studyRoomId: 1,
    studyRoomName: '에듀중학교 내신반',
    description: '인수분해 공식과 활용 문제를 풀었습니다.',
  },
];

const meta = {
  title: 'dashboard/HomeworkSectionContent',
  component: HomeworkSectionContent,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="tablet:w-[768px] w-[360px]">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof HomeworkSectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    homeworks: [],
  },
};

export const TwoItems: Story = {
  args: {
    homeworks: mockHomeworks.slice(0, 2),
  },
};

export const FourItems: Story = {
  args: {
    homeworks: mockHomeworks,
  },
};
