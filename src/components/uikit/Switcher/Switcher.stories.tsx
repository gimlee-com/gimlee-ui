import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switcher, SwitcherContainer } from './Switcher'
import { Grid } from '../Grid/Grid'

const meta: Meta<typeof Switcher> = {
  title: 'UIkit/Switcher',
  component: Switcher,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Switcher>

export const Basic: Story = {
  render: (args) => (
    <div>
      <Switcher {...args} className="uk-subnav uk-subnav-pill">
        <li>
          <a href="#">Item</a>
        </li>
        <li>
          <a href="#">Item</a>
        </li>
        <li>
          <a href="#">Item</a>
        </li>
      </Switcher>

      <SwitcherContainer className="uk-margin">
        <div>Hello!</div>
        <div>Hello again!</div>
        <div>Bazinga!</div>
      </SwitcherContainer>
    </div>
  ),
}

export const NavigationControls: Story = {
  render: (args) => (
    <div>
      <Switcher {...args} className="uk-subnav uk-subnav-pill">
        <li>
          <a href="#">Item</a>
        </li>
        <li>
          <a href="#">Item</a>
        </li>
        <li>
          <a href="#">Item</a>
        </li>
      </Switcher>

      <SwitcherContainer className="uk-margin">
        <div>
          Hello! <a href="#" uk-switcher-item="2">Switch to item 3</a>
        </div>
        <div>
          Hello again! <a href="#" uk-switcher-item="next">Next item</a>
        </div>
        <div>
          Bazinga! <a href="#" uk-switcher-item="previous">Previous item</a>
        </div>
      </SwitcherContainer>
    </div>
  ),
}

export const Animations: Story = {
  args: {
    animation: 'uk-animation-fade',
  },
  render: (args) => (
    <div>
      <Switcher {...args} className="uk-subnav uk-subnav-pill">
        <li>
          <a href="#">Item</a>
        </li>
        <li>
          <a href="#">Item</a>
        </li>
        <li>
          <a href="#">Item</a>
        </li>
      </Switcher>

      <SwitcherContainer className="uk-margin">
        <div>Hello!</div>
        <div>Hello again!</div>
        <div>Bazinga!</div>
      </SwitcherContainer>
    </div>
  ),
}

export const VerticalTabs: Story = {
  render: () => (
    <Grid className="uk-child-width-1-2@s">
      <div>
        <Grid>
          <div className="uk-width-auto@m">
            <Switcher
              className="uk-tab-left"
              connect="#component-tab-left"
              animation="uk-animation-fade"
            >
              <li>
                <a href="#">Active</a>
              </li>
              <li>
                <a href="#">Item</a>
              </li>
              <li>
                <a href="#">Item</a>
              </li>
            </Switcher>
          </div>
          <div className="uk-width-expand@m">
            <SwitcherContainer id="component-tab-left">
              <div>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </div>
              <div>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </div>
              <div>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur, sed do eiusmod.
              </div>
            </SwitcherContainer>
          </div>
        </Grid>
      </div>
    </Grid>
  ),
}
