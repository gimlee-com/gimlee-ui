import type { Meta, StoryObj } from '@storybook/react-vite'
import { Section } from './Section'
import { Container } from '../Container/Container'
import { Grid } from '../Grid/Grid'
import { Card, CardBody } from '../Card/Card'
import { Panel } from '../Panel/Panel'

const meta: Meta<typeof Section> = {
  title: 'UIkit/Section',
  component: Section,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Section>

const SectionContent = ({ title }: { title: string }) => (
  <Container>
    <h3>{title}</h3>
    <Grid match className="uk-child-width-1-3@m">
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor.
        </p>
      </div>
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor.
        </p>
      </div>
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor.
        </p>
      </div>
    </Grid>
  </Container>
)

export const Default: Story = {
  args: {
    variant: 'default',
  },
  render: (args) => (
    <Section {...args}>
      <SectionContent title="Section Default" />
    </Section>
  ),
}

export const Muted: Story = {
  args: {
    variant: 'muted',
  },
  render: (args) => (
    <Section {...args}>
      <SectionContent title="Section Muted" />
    </Section>
  ),
}

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
  render: (args) => (
    <Section {...args} className="uk-light">
      <SectionContent title="Section Primary" />
    </Section>
  ),
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
  render: (args) => (
    <Section {...args} className="uk-light">
      <SectionContent title="Section Secondary" />
    </Section>
  ),
}

export const PreserveColor: Story = {
  args: {
    variant: 'primary',
    preserveColor: true,
  },
  render: (args) => (
    <Section {...args}>
      <Container>
        <Panel className="uk-light uk-margin-medium">
          <h3>Section Primary with cards</h3>
        </Panel>
        <Grid match className="uk-child-width-expand@m">
          <div>
            <Card>
              <CardBody>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </CardBody>
            </Card>
          </div>
          <div>
            <Card>
              <CardBody>
                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
              </CardBody>
            </Card>
          </div>
        </Grid>
      </Container>
    </Section>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div>
      <Section size="xsmall" variant="muted">
        <Container>
          <h4>X-Small</h4>
        </Container>
      </Section>
      <Section size="small" variant="default">
        <Container>
          <h4>Small</h4>
        </Container>
      </Section>
      <Section size="large" variant="muted">
        <Container>
          <h4>Large</h4>
        </Container>
      </Section>
      <Section size="xlarge" variant="default">
        <Container>
          <h4>X-Large</h4>
        </Container>
      </Section>
    </div>
  ),
}
