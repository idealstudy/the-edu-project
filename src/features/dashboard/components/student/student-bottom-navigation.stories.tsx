import type { Meta, StoryObj } from '@storybook/react';

import { StudentBottomNavigationView } from './student-bottom-navigation';

const meta = {
  title: 'Student/Layout/StudentBottomNavigation',
  component: StudentBottomNavigationView,
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    pathname: '/dashboard/student',
    primaryRoomId: 31,
  },
} satisfies Meta<typeof StudentBottomNavigationView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SixTabs: Story = {};

export const StudyRoomActive: Story = {
  args: { pathname: '/study-rooms/31/note' },
};

export const WithoutStudyRoom: Story = {
  args: { primaryRoomId: undefined },
};
