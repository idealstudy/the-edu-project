import StudentsSectionContent from '@/features/dashboard/components/section-content/student-section-content';
import type { Meta, StoryObj } from '@storybook/react';

const mockStudents = [
  {
    id: '1',
    name: '김학생',
    email: 'kimdedu@dedu.com',
    signedUpAt: '2024-12-12T09:00:00',
    lastStudyroomId: 1,
  },
  {
    id: '2',
    name: '이학생',
    email: 'leestudent@dedu.com',
    signedUpAt: '2024-12-10T14:30:00',
    lastStudyroomId: 1,
  },
  {
    id: '3',
    name: '박학생',
    email: 'park@dedu.com',
    signedUpAt: '2024-12-08T11:00:00',
    lastStudyroomId: 1,
  },
];

const meta = {
  title: 'dashboard/StudentsSectionContent',
  component: StudentsSectionContent,
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
} satisfies Meta<typeof StudentsSectionContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    students: [],
    lastStudyroomId: 0,
  },
};

export const hasStudyroom: Story = {
  args: {
    students: [],
    lastStudyroomId: 1,
  },
};

export const WithStudents: Story = {
  args: {
    students: mockStudents,
    lastStudyroomId: 1,
  },
};
