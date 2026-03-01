import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardBody } from '../../components/uikit/Card/Card'

const meta: Meta = {
  title: 'UIkit/Layout/Flex',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}
export default meta
type Story = StoryObj

export const Usage: Story = {
  render: () => (
    <div className="uk-flex uk-padding">
      <Card>
        <CardBody>Item 1</CardBody>
      </Card>
      <Card className="uk-margin-left">
        <CardBody>Item 2</CardBody>
      </Card>
      <Card className="uk-margin-left">
        <CardBody>Item 3</CardBody>
      </Card>
    </div>
  ),
}

export const HorizontalAlignment: Story = {
  render: () => (
    <div className="uk-padding" uk-margin="">
      <h4>Center</h4>
      <div className="uk-flex uk-flex-center">
        <Card>
          <CardBody>Item 1</CardBody>
        </Card>
        <Card className="uk-margin-left">
          <CardBody>Item 2</CardBody>
        </Card>
        <Card className="uk-margin-left">
          <CardBody>Item 3</CardBody>
        </Card>
      </div>
      <h4>Between</h4>
      <div className="uk-flex uk-flex-between">
        <Card>
          <CardBody>Item 1</CardBody>
        </Card>
        <Card>
          <CardBody>Item 2</CardBody>
        </Card>
        <Card>
          <CardBody>Item 3</CardBody>
        </Card>
      </div>
    </div>
  ),
}

export const VerticalAlignment: Story = {
  render: () => (
    <div className="uk-flex uk-flex-middle uk-text-center uk-padding">
      <Card>
        <CardBody>Item 1</CardBody>
      </Card>
      <Card className="uk-margin-left">
        <CardBody>
          Item 2<br />...
        </CardBody>
      </Card>
      <Card className="uk-margin-left">
        <CardBody>
          Item 3<br />...<br />...
        </CardBody>
      </Card>
    </div>
  ),
}

export const Direction: Story = {
  render: () => (
    <div className="uk-flex uk-flex-column uk-width-1-3 uk-padding">
      <Card>
        <CardBody>Item 1</CardBody>
      </Card>
      <Card className="uk-margin-top">
        <CardBody>Item 2</CardBody>
      </Card>
      <Card className="uk-margin-top">
        <CardBody>Item 3</CardBody>
      </Card>
    </div>
  ),
}

export const Wrap: Story = {
  render: () => (
    <div className="uk-flex uk-flex-wrap uk-flex-wrap-around uk-background-muted uk-height-medium uk-padding">
      <Card size="small" className="uk-width-1-3">
        <CardBody>Item 1</CardBody>
      </Card>
      <Card size="small" className="uk-width-1-2 uk-margin-left">
        <CardBody>Item 2</CardBody>
      </Card>
      <Card size="small" className="uk-width-1-3">
        <CardBody>Item 3</CardBody>
      </Card>
      <Card size="small" className="uk-width-1-3 uk-margin-left">
        <CardBody>Item 4</CardBody>
      </Card>
      <Card size="small" className="uk-width-1-2">
        <CardBody>Item 5</CardBody>
      </Card>
      <Card size="small" className="uk-width-1-3 uk-margin-left">
        <CardBody>Item 6</CardBody>
      </Card>
    </div>
  ),
}
