import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid } from '../../components/uikit/Grid/Grid'
import { Panel } from '../../components/uikit/Panel/Panel'

const meta: Meta = {
  title: 'UIkit/Text Utilities',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}
export default meta
type Story = StoryObj

export const SizesAndWeights: Story = {
  name: 'Sizes & weights',
  render: () => (
    <Panel className="uk-padding">
      <Grid className="uk-child-width-1-2@m">
        <div>
          <h4>Sizes</h4>
          <p className="uk-text-small">uk-text-small</p>
          <p className="uk-text-default">uk-text-default</p>
          <p className="uk-text-large">uk-text-large</p>
        </div>
        <div>
          <h4>Weights</h4>
          <p className="uk-text-light">uk-text-light (300)</p>
          <p className="uk-text-normal">uk-text-normal (400)</p>
          <p className="uk-text-bold">uk-text-bold (700)</p>
          <p className="uk-text-lighter">uk-text-lighter</p>
          <p className="uk-text-bolder">uk-text-bolder</p>
        </div>
      </Grid>
    </Panel>
  ),
}

export const StylesTransformsDecoration: Story = {
  name: 'Style, transform, decoration',
  render: () => (
    <Panel className="uk-padding">
      <Grid className="uk-child-width-1-2@m">
        <div>
          <h4>Style</h4>
          <p className="uk-text-italic">uk-text-italic</p>
        </div>
        <div>
          <h4>Transform</h4>
          <p className="uk-text-capitalize">uk-text-capitalize</p>
          <p className="uk-text-uppercase">uk-text-uppercase</p>
          <p className="uk-text-lowercase">uk-text-lowercase</p>
        </div>
        <div>
          <h4>Decoration</h4>
          <p className="uk-text-decoration-none">
            uk-text-decoration-none on a <a href="#">link</a>
          </p>
        </div>
      </Grid>
    </Panel>
  ),
}

export const Colors: Story = {
  render: () => (
    <Panel className="uk-padding">
      <Grid gap="small" className="uk-child-width-1-2@m">
        <div>
          <p className="uk-text-muted">uk-text-muted</p>
          <p className="uk-text-emphasis">uk-text-emphasis</p>
          <p className="uk-text-primary">uk-text-primary</p>
          <p className="uk-text-secondary">uk-text-secondary</p>
        </div>
        <div>
          <p className="uk-text-success">uk-text-success</p>
          <p className="uk-text-warning">uk-text-warning</p>
          <p className="uk-text-danger">uk-text-danger</p>
        </div>
      </Grid>
    </Panel>
  ),
}

export const LeadAndMeta: Story = {
  name: 'Lead & meta',
  render: () => (
    <Panel className="uk-padding">
      <p className="uk-text-lead">Lead text: draws attention for introductions.</p>
      <p className="uk-text-meta">Meta text: subdued supplementary info.</p>
    </Panel>
  ),
}

export const AlignmentResponsive: Story = {
  name: 'Alignment (incl. responsive)',
  render: () => (
    <Panel className="uk-padding">
      <Grid className="uk-child-width-1-2@m">
        <div>
          <p className="uk-text-left">uk-text-left</p>
          <p className="uk-text-center">uk-text-center</p>
          <p className="uk-text-right">uk-text-right</p>
          <p className="uk-text-justify">uk-text-justify (full width justified)</p>
        </div>
        <div>
          <p className="uk-text-left@s uk-text-center@m uk-text-right@l">
            Responsive: left @s, center @m, right @l
          </p>
        </div>
      </Grid>
    </Panel>
  ),
}

export const Wrapping: Story = {
  name: 'Wrapping & overflow',
  render: () => (
    <Panel className="uk-padding">
      <Grid className="uk-child-width-1-2@m">
        <div>
          <h4>Truncate</h4>
          <div className="uk-text-truncate uk-width-medium">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </div>
        </div>
        <div>
          <h4>Break / No-wrap</h4>
          <div className="uk-text-break uk-width-medium">
            Supercalifragilisticexpialidocious_and_another_really_long_token_without_spaces
          </div>
          <div className="uk-text-nowrap uk-width-medium uk-margin-small-top">
            uk-text-nowrap keeps this on one line unless forced.
          </div>
        </div>
      </Grid>
    </Panel>
  ),
}

export const TextBackgroundAndStroke: Story = {
  name: 'Background & stroke',
  render: () => (
    <Panel className="uk-padding">
      <Grid className="uk-child-width-1-2@m">
        <div>
          <h3>
            <span className="uk-text-background">Text background</span>
          </h3>
          <p className="uk-text-muted uk-text-small">
            Apply a gradient/primary background to text via uk-text-background.
          </p>
        </div>
        <div>
          <h3 className="uk-text-stroke uk-heading-medium">Stroke</h3>
          <p className="uk-text-muted uk-text-small">
            Outline effect using uk-text-stroke (best on headings).
          </p>
        </div>
      </Grid>
    </Panel>
  ),
}