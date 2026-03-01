import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Navbar,
  NavbarContainer,
  NavbarLeft,
  NavbarRight,
  NavbarCenter,
  NavbarCenterLeft,
  NavbarCenterRight,
  NavbarNav,
  NavbarItem,
  NavbarDropdown,
  NavbarDropdownNav,
  NavbarLogo,
  NavbarParentIcon,
  NavbarToggle,
} from './Navbar'
import { Button } from '../Button/Button'
import { Sticky } from '../Sticky/Sticky'
import { Grid } from '../Grid/Grid'
import { Section } from '../Section/Section'
import { Container } from '../Container/Container'

const meta: Meta<typeof Navbar> = {
  title: 'UIkit/Navbar',
  component: Navbar,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Navbar>

export const Basic: Story = {
  render: (args) => (
    <NavbarContainer>
      <Navbar {...args}>
        <NavbarLeft>
          <NavbarNav>
            <NavbarItem active>
              <a href="#">Active</a>
            </NavbarItem>
            <NavbarItem>
              <a href="#">Item</a>
            </NavbarItem>
            <NavbarItem parent>
              <a href="#">
                Parent <NavbarParentIcon />
              </a>
              <NavbarDropdown>
                <NavbarDropdownNav>
                  <li className="uk-active">
                    <a href="#">Active</a>
                  </li>
                  <li>
                    <a href="#">Item</a>
                  </li>
                  <li className="uk-nav-header">Header</li>
                  <li>
                    <a href="#">Item</a>
                  </li>
                  <li className="uk-nav-divider" />
                  <li>
                    <a href="#">Item</a>
                  </li>
                </NavbarDropdownNav>
              </NavbarDropdown>
            </NavbarItem>
          </NavbarNav>
        </NavbarLeft>
        <NavbarRight>
          <NavbarNav>
            <NavbarItem>
              <a href="#">Right</a>
            </NavbarItem>
          </NavbarNav>
        </NavbarRight>
      </Navbar>
    </NavbarContainer>
  ),
}

export const WithDropbar: Story = {
  render: (args) => (
    <div className="uk-position-relative">
      <NavbarContainer>
        <Navbar {...args} dropbar dropbarAnchor="!.uk-navbar-container">
          <NavbarLeft>
            <NavbarNav>
              <NavbarItem parent>
                <a href="#">
                  Mega <NavbarParentIcon />
                </a>
                <NavbarDropdown className="uk-navbar-dropdown-width-2">
                  <Grid gap="collapse" className="uk-drop-grid uk-child-width-1-2">
                    <div>
                      <NavbarDropdownNav>
                        <li className="uk-active">
                          <a href="#">Active</a>
                        </li>
                        <li>
                          <a href="#">Item</a>
                        </li>
                        <li className="uk-nav-header">Header</li>
                        <li>
                          <a href="#">Item</a>
                        </li>
                      </NavbarDropdownNav>
                    </div>
                    <div>
                      <NavbarDropdownNav>
                        <li>
                          <a href="#">Item</a>
                        </li>
                        <li className="uk-nav-divider" />
                        <li>
                          <a href="#">Item</a>
                        </li>
                      </NavbarDropdownNav>
                    </div>
                  </Grid>
                </NavbarDropdown>
              </NavbarItem>
            </NavbarNav>
          </NavbarLeft>
        </Navbar>
      </NavbarContainer>
      <Section variant="muted">
        <Container>
          <p>Content below dropbar.</p>
        </Container>
      </Section>
    </div>
  ),
}

export const CenteredLogo: Story = {
  args: {
    align: "right",
    dropbarTransparentMode: "behind",
    delayShow: 444,
    animation: "fade"
  },

  render: (args) => (
    <NavbarContainer>
      <Navbar {...args}>
        <NavbarCenter>
          <NavbarCenterLeft>
            <NavbarNav>
              <NavbarItem>
                <a href="#">Left</a>
              </NavbarItem>
              <NavbarItem>
                <a href="#">Docs</a>
              </NavbarItem>
            </NavbarNav>
          </NavbarCenterLeft>
          <NavbarLogo href="#">Logo</NavbarLogo>
          <NavbarCenterRight>
            <NavbarNav>
              <NavbarItem>
                <a href="#">Blog</a>
              </NavbarItem>
              <NavbarItem>
                <a href="#">Right</a>
              </NavbarItem>
            </NavbarNav>
          </NavbarCenterRight>
        </NavbarCenter>
      </Navbar>
    </NavbarContainer>
  )
}

export const TransparentHero: Story = {
  name: 'Transparent over Hero',
  render: (args) => (
    <div className="uk-position-relative uk-light">
      <img
        src="https://getuikit.com/docs/images/light.jpg"
        alt=""
        width="1800"
        height="1200"
      />
      <div className="uk-position-top">
        <NavbarContainer transparent>
          <Navbar {...args} align="center">
            <NavbarLeft>
              <NavbarNav>
                <NavbarItem>
                  <NavbarLogo href="#">Brand</NavbarLogo>
                </NavbarItem>
              </NavbarNav>
            </NavbarLeft>
            <NavbarRight>
              <NavbarNav>
                <NavbarItem>
                  <Button variant="text">Sign in</Button>
                </NavbarItem>
                <NavbarItem>
                  <Button variant="primary">Get started</Button>
                </NavbarItem>
              </NavbarNav>
            </NavbarRight>
          </Navbar>
        </NavbarContainer>
      </div>
    </div>
  ),
}

export const ToggleOnMobile: Story = {
  name: 'Toggle on Mobile',
  render: (args) => (
    <NavbarContainer>
      <Navbar {...args} mode="click">
        <NavbarLeft>
          <NavbarNav>
            <NavbarItem>
              <NavbarToggle href="#">Menu</NavbarToggle>
              <NavbarDropdown>
                <NavbarDropdownNav>
                  <li className="uk-active">
                    <a href="#">Active</a>
                  </li>
                  <li>
                    <a href="#">Item</a>
                  </li>
                  <li>
                    <a href="#">Item</a>
                  </li>
                </NavbarDropdownNav>
              </NavbarDropdown>
            </NavbarItem>
          </NavbarNav>
        </NavbarLeft>
      </Navbar>
    </NavbarContainer>
  ),
}

export const StickyNavbar: Story = {
  render: (args) => (
    <div className="uk-height-large uk-background-muted">
      <Sticky clsActive="uk-navbar-sticky" offset={60}>
        <NavbarContainer>
          <Navbar {...args} align="left">
            <NavbarLeft>
              <NavbarNav>
                <NavbarItem active>
                  <a href="#">Home</a>
                </NavbarItem>
                <NavbarItem>
                  <a href="#">Docs</a>
                </NavbarItem>
                <NavbarItem parent>
                  <a href="#">
                    More <NavbarParentIcon />
                  </a>
                  <NavbarDropdown>
                    <NavbarDropdownNav>
                      <li>
                        <a href="#">Item</a>
                      </li>
                      <li className="uk-nav-divider" />
                      <li>
                        <a href="#">Another</a>
                      </li>
                    </NavbarDropdownNav>
                  </NavbarDropdown>
                </NavbarItem>
              </NavbarNav>
            </NavbarLeft>
            <NavbarRight>
              <NavbarNav>
                <NavbarItem>
                  <a href="#">Contact</a>
                </NavbarItem>
              </NavbarNav>
            </NavbarRight>
          </Navbar>
        </NavbarContainer>
      </Sticky>
      <Section variant="default">
        <Container>
          <p>Scroll to see the navbar stick with a 60px offset.</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vehicula
            nisl vel nisl fermentum, non commodo dui molestie. Donec sed tortor
            hendrerit, commodo ipsum et, tempor nisl. Mauris non urna id odio pretium
            rhoncus. Sed vestibulum cursus enim, pharetra tincidunt felis condimentum
            vitae. Sed dictum ligula nec ante congue, a sollicitudin arcu tempor.
          </p>
          <p>
            Etiam porta massa non mauris cursus, nec dictum arcu fermentum. Sed in dictum
            ex, nec fermentum velit. Etiam porta massa non mauris cursus, nec dictum arcu
            fermentum. Sed in dictum ex, nec fermentum velit.
          </p>
        </Container>
      </Section>
    </div>
  ),
}