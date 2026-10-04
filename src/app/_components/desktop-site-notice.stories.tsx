import type { Meta, StoryObj } from '@storybook/react';

import { DesktopSiteNoticeView } from './desktop-site-notice';

const meta = {
  title: 'App/DesktopSiteNotice',
  component: DesktopSiteNoticeView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof DesktopSiteNoticeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesktopModeOnPhone: Story = {};
