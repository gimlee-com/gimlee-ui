import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CitySelector } from './CitySelector';
import type { CityDetailsDto } from '../../../types/api';

const meta: Meta<typeof CitySelector> = {
  title: 'Ads/CitySelector',
  component: CitySelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 400, padding: 20 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'City search with debounced API suggestions. On mobile (< 960px), opens in a full-screen modal. Resize the browser below 960px to preview the mobile variant.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof CitySelector>;

export const Default: Story = {
  render: () => {
    const [city, setCity] = useState<CityDetailsDto | null>(null);
    return (
      <CitySelector
        initialValue={city}
        onSelect={(c) => setCity(c)}
      />
    );
  },
};

export const WithPreselectedCity: Story = {
  name: 'With Pre-selected City',
  render: () => {
    const [city, setCity] = useState<CityDetailsDto | null>({
      id: '1',
      name: 'Warsaw',
      countryCode: 'PL',
      region: 'Masovian',
      district: undefined,
    });
    return (
      <CitySelector
        initialValue={city}
        onSelect={(c) => setCity(c)}
      />
    );
  },
};

export const CustomPlaceholder: Story = {
  name: 'Custom Placeholder',
  render: () => {
    const [city, setCity] = useState<CityDetailsDto | null>(null);
    return (
      <CitySelector
        initialValue={city}
        onSelect={(c) => setCity(c)}
        placeholder="Where are you?"
      />
    );
  },
};
