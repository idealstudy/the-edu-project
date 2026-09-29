import type { Meta, StoryObj } from '@storybook/react';

import AppInfo from './app-info';

const meta = {
  title: 'Settings/UI/AppInfo',
  component: AppInfo,
  args: {
    versionInfo: {
      version: '1.0.0',
      commit: 'abc1234',
      builtAt: '2026-09-29T14:50:00.000Z',
      env: 'preview',
    },
  },
} satisfies Meta<typeof AppInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
