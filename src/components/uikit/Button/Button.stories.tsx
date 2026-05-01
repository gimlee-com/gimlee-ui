import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Panel } from '../Panel/Panel'

const meta: Meta<typeof Button> = {
  title: 'UIkit/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'danger', 'text', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'large', undefined],
    },
    children: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    children: 'Button',
    disabled: false,
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    variant: 'default',
  },
}

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Danger: Story = {
  args: {
    variant: 'danger',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
  },
}

export const Large: Story = {
  args: {
    size: 'large',
    variant: 'primary',
  },
}

export const Small: Story = {
  args: {
    size: 'small',
    variant: 'primary',
  },
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
  },
}

export const LiquidCrystalShowcase: Story = {
  name: '✨ Liquid Crystal — All Variants',
  render: () => (
    <div
      style={{
        padding: '48px',
        background: 'linear-gradient(to bottom, #faf8ff, #f3eeff, #f8f5ff)',
        borderRadius: '16px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      <p style={{ color: '#6b5899', fontSize: '13px', margin: 0 }}>
        Hover and click the buttons to see the spring physics, shimmer sweep,
        and depth changes.
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="default">Default</Button>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="primary" size="small">Small Primary</Button>
        <Button variant="primary">Regular Primary</Button>
        <Button variant="primary" size="large">Large Primary</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Button variant="primary" disabled>Disabled</Button>
        <Button variant="text">Text Variant</Button>
        <Button variant="link">Link Variant</Button>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export const GlassOnCard: Story = {
  name: '✨ Glass Buttons on Card Surface',
  render: () => (
    <div
      style={{
        padding: '48px',
        background: 'linear-gradient(to bottom, #faf8ff, #f3eeff)',
        borderRadius: '16px',
      }}
    >
      <div
        className="uk-card uk-card-default uk-card-body"
        style={{ maxWidth: '420px' }}
      >
        <h3 className="uk-card-title">Complete Purchase</h3>
        <p className="uk-text-muted">
          The milky glass buttons float above the frosted card — notice the
          subtle depth difference.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <Button variant="primary">Confirm Payment</Button>
          <Button variant="default">Cancel</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export const InteractionStates: Story = {
  name: '✨ Interaction Physics',
  render: () => (
    <div
      style={{
        padding: '48px',
        background: 'linear-gradient(to bottom, #faf8ff, #f3eeff)',
        borderRadius: '16px',
      }}
    >
      <p style={{ color: '#6b5899', fontSize: '13px', marginBottom: '24px' }}>
        <strong>Hover:</strong> Spring lift (-2px) + shadow expansion + shimmer sweep
        <br />
        <strong>Click:</strong> Instant press (+1px, scale 0.982) + inset shadow
        <br />
        <strong>Release:</strong> Slow drift back (300ms gravity easing)
      </p>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Button variant="primary" size="large">
          Try Hovering Me
        </Button>
        <Button variant="danger" size="large">
          Press & Hold
        </Button>
        <Button variant="default" size="large">
          Glass Default
        </Button>
      </div>
    </div>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export const GroupedWithMargin: Story = {
  render: () => (
    <Panel className="uk-padding uk-background-muted">
      <p>
        Resize the container or view on a smaller screen to see the `uk-margin`
        attribute in action. It adds a top margin to buttons that wrap to the
        next line.
      </p>
      <div uk-margin="">
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
        <Button variant="primary">Button</Button>
      </div>
    </Panel>
  ),
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export const Grouped: Story = {
  render: () => (
    <div className="uk-button-group">
      <Button>Button</Button>
      <Button>Button</Button>
      <Button>Button</Button>
    </div>
  ),
}