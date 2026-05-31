import {
  ChatIcon,
  CoiledBookIcon,
  HomeIcon,
  ListIcon,
  PenIcon,
  PlusIcon,
  RoomIcon,
  SettingIcon,
  TextIcon,
  UserPlusIcon,
} from '@/shared/components/icons';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'shared/Icons',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const ICONS = [
  { name: 'HomeIcon', component: HomeIcon },
  { name: 'ListIcon', component: ListIcon },
  { name: 'PlusIcon', component: PlusIcon },
  { name: 'SettingIcon', component: SettingIcon },
  { name: 'TextIcon', component: TextIcon },
  { name: 'RoomIcon', component: RoomIcon },
  { name: 'CoiledBookIcon', component: CoiledBookIcon },
  { name: 'UserPlusIcon', component: UserPlusIcon },
  { name: 'ChatIcon', component: ChatIcon },
  { name: 'PenIcon', component: PenIcon },
] as const;

export const All: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '24px',
        padding: '24px',
        maxWidth: '600px',
      }}
    >
      {ICONS.map(({ name, component: Icon }) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
            }}
          >
            <Icon />
          </div>
          <span
            style={{
              fontSize: '12px',
              color: '#6b7280',
              fontFamily: 'monospace',
            }}
          >
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Home: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <HomeIcon />
    </div>
  ),
};

export const List: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <ListIcon />
    </div>
  ),
};

export const Plus: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <PlusIcon />
    </div>
  ),
};

export const Setting: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <SettingIcon />
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <TextIcon />
    </div>
  ),
};

export const Room: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <RoomIcon />
    </div>
  ),
};

export const CoiledBook: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <CoiledBookIcon />
    </div>
  ),
};

export const UserPlus: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <UserPlusIcon />
    </div>
  ),
};

export const Chat: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <ChatIcon />
    </div>
  ),
};

export const Pen: Story = {
  render: () => (
    <div style={{ padding: '16px' }}>
      <PenIcon />
    </div>
  ),
};
