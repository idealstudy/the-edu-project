import { NotificationPopover } from '@/features/notifications/components/notification-popover';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Notifications/NotificationPopover',
  component: NotificationPopover,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NotificationPopover>;

export default meta;
type Story = StoryObj<typeof NotificationPopover>;

export const Opened: Story = {
  args: {
    defaultOpen: true,
  },
};
