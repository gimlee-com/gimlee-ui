import type { Meta, StoryObj } from '@storybook/react-vite'
import { Subnav } from './Subnav'
import { Icon } from '../Icon/Icon'
import { Dropdown } from '../Dropdown/Dropdown'
import { Nav, NavItem, NavHeader } from '../Nav/Nav'

const meta: Meta<typeof Subnav> = {
  title: 'UIkit/Nav/Subnav',
  component: Subnav,
  argTypes: {
    variant: {
      control: 'select',
      options: [undefined, 'divider', 'pill'],
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Subnav>

const renderSubNav = (args: Story['args']) => (
  <Subnav {...args}>
    <li className="uk-active">
      <a href="#">Active</a>
    </li>
    <li>
      <a href="#">Item</a>
    </li>
    <li className="uk-disabled">
      <span>Disabled</span>
    </li>
  </Subnav>
)

export const Default: Story = {
  render: renderSubNav,
}

export const Pill: Story = {
  render: renderSubNav,
  args: {
    variant: 'pill',
  },
}

export const WithDropdown: Story = {
  render: (args) => (
    <Subnav {...args}>
      <li className="uk-active">
        <a href="#">Active</a>
      </li>
      <li>
        <a href="#">Item</a>
      </li>
      <li>
        <a href="#">
          More <Icon icon="triangle-down" />
        </a>
        <Dropdown mode="click">
          <Nav variant="dropdown">
            <NavItem active>
              <a href="#">Active</a>
            </NavItem>
            <NavItem>
              <a href="#">Item</a>
            </NavItem>
            <NavHeader>Header</NavHeader>
            <NavItem>
              <a href="#">Item</a>
            </NavItem>
          </Nav>
        </Dropdown>
      </li>
    </Subnav>
  ),
  args: {
    variant: 'pill',
  },
}