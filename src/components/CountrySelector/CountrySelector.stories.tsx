import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CountrySelector } from './CountrySelector';

const meta: Meta<typeof CountrySelector> = {
  title: 'Components/CountrySelector',
  component: CountrySelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CountrySelector>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <CountrySelector
        value={value}
        onChange={(code) => setValue(code)}
      />
    );
  },
};

export const WithPreselectedValue: Story = {
  name: 'With Pre-selected Value',
  render: () => {
    const [value, setValue] = useState<string | null>('PL');
    return (
      <CountrySelector
        value={value}
        onChange={(code) => setValue(code)}
      />
    );
  },
};

export const Compact: Story = {
  name: 'Compact (Navbar)',
  render: () => {
    const [value, setValue] = useState<string | null>('US');
    return (
      <CountrySelector
        value={value}
        onChange={(code) => setValue(code)}
        compact
      />
    );
  },
};

export const CompactNoValue: Story = {
  name: 'Compact (No Selection)',
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <CountrySelector
        value={value}
        onChange={(code) => setValue(code)}
        compact
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <CountrySelector
      value="DE"
      onChange={() => {}}
      disabled
    />
  ),
};
