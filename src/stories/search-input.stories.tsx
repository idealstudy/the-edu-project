import { useState } from 'react';

import { SearchInput } from '@/shared/components/ui/search-input';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'ui/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return <SearchInput />;
  },
};

export const Disabled: Story = {
  render: () => {
    return <SearchInput disabled />;
  },
};

export const Uncontrolled: Story = {
  render: () => {
    return <SearchInput onSearch={(value) => alert(value)} />;
  },
};

const ControlledSearchInputStory = () => {
  const [value, setValue] = useState('');

  return (
    <SearchInput
      value={value}
      onChange={setValue}
    />
  );
};

export const Controlled: Story = {
  render: () => <ControlledSearchInputStory />,
};
