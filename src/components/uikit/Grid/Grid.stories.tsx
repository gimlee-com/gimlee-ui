import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid } from './Grid'
import { Card, CardBody, CardTitle } from '../Card/Card'
import { Section } from '../Section/Section'

const meta: Meta<typeof Grid> = {
  title: 'UIkit/Layout/Grid',
  component: Grid,
  argTypes: {
    gap: {
      control: 'select',
      options: [undefined, 'small', 'medium', 'large', 'collapse'],
    },
    divider: { control: 'boolean' },
    match: { control: 'boolean' },
    masonry: { control: 'select', options: [false, true, 'pack', 'next'] },
    parallax: { control: 'number' },
  },
  args: {
    divider: false,
    match: false,
    masonry: false,
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Grid>

const renderGridWithCards = (args: Story['args']) => (
  <Grid {...args} className="uk-child-width-1-3@m">
    <div>
      <Card variant="primary">
        <CardBody>
          <CardTitle>Card 1</CardTitle>
          <p>Lorem ipsum dolor sit amet.</p>
        </CardBody>
      </Card>
    </div>
    <div>
      <Card variant="secondary">
        <CardBody>
          <CardTitle>Card 2</CardTitle>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor.
          </p>
        </CardBody>
      </Card>
    </div>
    <div>
      <Card>
        <CardBody>
          <CardTitle>Card 3</CardTitle>
          <p>Lorem ipsum dolor sit amet.</p>
        </CardBody>
      </Card>
    </div>
  </Grid>
)

export const Default: Story = {
  render: renderGridWithCards,
}

export const WithGap: Story = {
  render: renderGridWithCards,
  args: {
    gap: 'large',
    match: true
  },
}

export const WithMatchHeight: Story = {
  render: renderGridWithCards,
  args: {
    match: true,
    masonry: false,
    gap: "medium",
  },
}

export const WithMasonry: Story = {
  render: (args) => (
    <Grid {...args} className="uk-child-width-1-3@m">
      <div>
        <Card variant="primary" style={{ height: 120 }}>
          <CardBody>
            <CardTitle>Card 1</CardTitle>
            <p>Lorem ipsum dolor sit amet.</p>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card variant="secondary" style={{ height: 180 }}>
          <CardBody>
            <CardTitle>Card 2</CardTitle>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor.
            </p>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card style={{ height: 150 }}>
          <CardBody>
            <CardTitle>Card 3</CardTitle>
            <p>Lorem ipsum dolor sit amet.</p>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card variant="primary" style={{ height: 160 }}>
          <CardBody>
            <CardTitle>Card 4</CardTitle>
            <p>Lorem ipsum dolor sit amet.</p>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card variant="secondary" style={{ height: 130 }}>
          <CardBody>
            <CardTitle>Card 5</CardTitle>
            <p>Lorem ipsum dolor sit amet.</p>
          </CardBody>
        </Card>
      </div>
      <div>
        <Card style={{ height: 190 }}>
          <CardBody>
            <CardTitle>Card 6</CardTitle>
            <p>Lorem ipsum dolor sit amet.</p>
          </CardBody>
        </Card>
      </div>
    </Grid>
  ),
  args: {
    masonry: true,
    gap: 'medium',
    match: false
  },
}

export const WithParallax: Story = {
  render: (args) => (
    <div>
      <Section size="large">
        <p>Scroll down to see the parallax effect on the grid below...</p>
      </Section>
      <Grid {...args} className="uk-child-width-1-3@m">
        <div>
          <Card variant="primary">
            <CardBody>
              <CardTitle>Card 1</CardTitle>
              <p>This card will move slower.</p>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card variant="secondary">
            <CardBody>
              <CardTitle>Card 2</CardTitle>
              <p>This one will move at a normal speed.</p>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardBody>
              <CardTitle>Card 3</CardTitle>
              <p>And this one will move faster.</p>
            </CardBody>
          </Card>
        </div>
      </Grid>
      <Section size="large">
        <p>...Scroll up to see it again.</p>
      </Section>
    </div>
  ),
  args: {
    parallax: 150,
  },
}