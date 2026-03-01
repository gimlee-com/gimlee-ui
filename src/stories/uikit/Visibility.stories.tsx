import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel } from '../../components/uikit/Panel/Panel'

const meta: Meta = {
  title: 'UIkit/Utility/Visibility',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export default meta
type Story = StoryObj

export const Usage: Story = {
  render: () => (
    <Panel className="uk-padding">
      <div className="uk-alert uk-alert-danger">
        <div hidden>This is hidden using the <code>hidden</code> attribute.</div>
        <div className="uk-invisible">This is invisible but still takes up space in the document flow.</div>
        <div>This is visible.</div>
      </div>
    </Panel>
  ),
}

export const ResponsiveHidden: Story = {
  render: () => (
    <Panel className="uk-padding">
      <p>The green elements are hidden on screens that are larger than the defined breakpoint. Resize your browser window to see the effect.</p>
      <div className="uk-grid-small uk-child-width-1-2 uk-child-width-1-4@s uk-text-center" uk-grid="">
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove uk-alert-success">✔ Small</div>
            <div className="uk-alert uk-position-cover uk-margin-remove uk-hidden@s">Small</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove uk-alert-success">✔ Medium</div>
            <div className="uk-alert uk-position-cover uk-margin-remove uk-hidden@m">Medium</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove uk-alert-success">✔ Large</div>
            <div className="uk-alert uk-position-cover uk-margin-remove uk-hidden@l">Large</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove uk-alert-success">✔ X-Large</div>
            <div className="uk-alert uk-position-cover uk-margin-remove uk-hidden@xl">X-Large</div>
          </div>
        </div>
      </div>
    </Panel>
  ),
}

export const ResponsiveVisible: Story = {
  render: () => (
    <Panel className="uk-padding">
      <p>The green elements are displayed on screens that are larger than the defined breakpoint. Resize your browser window to see the effect.</p>
      <div className="uk-grid-small uk-child-width-1-2 uk-child-width-1-4@s uk-text-center" uk-grid="">
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove">Small</div>
            <div className="uk-alert uk-alert-success uk-position-cover uk-margin-remove uk-visible@s">✔ Small</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove">Medium</div>
            <div className="uk-alert uk-alert-success uk-position-cover uk-margin-remove uk-visible@m">✔ Medium</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove">Large</div>
            <div className="uk-alert uk-alert-success uk-position-cover uk-margin-remove uk-visible@l">✔ Large</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove">X-Large</div>
            <div className="uk-alert uk-alert-success uk-position-cover uk-margin-remove uk-visible@xl">✔ X-Large</div>
          </div>
        </div>
      </div>
    </Panel>
  ),
}

export const Toggle: Story = {
  render: () => (
    <Panel className="uk-padding">
      <div className="uk-child-width-1-2@s" uk-grid="">
        <div className="uk-visible-toggle" tabIndex={-1}>
          <h4>Hidden when not hovered</h4>
          <div uk-grid="">
            <div className="uk-width-expand">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
            <div className="uk-width-auto">
              <ul className="uk-hidden-hover uk-iconnav">
                <li><a href="#" uk-icon="icon: pencil"></a></li>
                <li><a href="#" uk-icon="icon: copy"></a></li>
                <li><a href="#" uk-icon="icon: trash"></a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="uk-visible-toggle" tabIndex={-1}>
          <h4>Invisible when not hovered</h4>
          <div uk-grid="">
            <div className="uk-width-expand">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
            <div className="uk-width-auto">
              <ul className="uk-invisible-hover uk-iconnav">
                <li><a href="#" uk-icon="icon: pencil"></a></li>
                <li><a href="#" uk-icon="icon: copy"></a></li>
                <li><a href="#" uk-icon="icon: trash"></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  ),
}

export const Touch: Story = {
  render: () => (
    <Panel className="uk-padding">
      <div className="uk-grid-small uk-child-width-1-2 uk-child-width-auto@s uk-text-center" uk-grid="">
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove uk-alert-success">✔ Hidden Touch</div>
            <div className="uk-alert uk-position-cover uk-margin-remove uk-hidden-touch">Hidden Touch</div>
          </div>
        </div>
        <div>
          <div className="uk-panel">
            <div className="uk-alert uk-margin-remove uk-alert-success">✔ Hidden No-Touch</div>
            <div className="uk-alert uk-position-cover uk-margin-remove uk-hidden-notouch">Hidden No-Touch</div>
          </div>
        </div>
      </div>
    </Panel>
  ),
}
