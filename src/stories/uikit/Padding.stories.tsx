import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel } from '../../components/uikit/Panel/Panel'

const meta: Meta = {
  title: 'UIkit/Utility/Padding',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export default meta
type Story = StoryObj

export const Usage: Story = {
  render: () => (
    <Panel className="uk-padding">
      <div className="uk-background-muted uk-padding uk-margin">
        Default padding
      </div>
      <div className="uk-background-muted uk-padding-small uk-margin">
        Small padding
      </div>
      <div className="uk-background-muted uk-padding-large uk-margin">
        Large padding
      </div>
    </Panel>
  ),
}

export const RemovePadding: Story = {
  render: () => (
    <Panel className="uk-padding">
       <div className="uk-background-muted uk-padding-remove uk-margin">
         No padding (uk-padding-remove)
       </div>
       <div className="uk-background-muted uk-padding-remove-top uk-margin uk-padding">
         No top padding (uk-padding-remove-top)
       </div>
       <div className="uk-background-muted uk-padding-remove-bottom uk-margin uk-padding">
         No bottom padding (uk-padding-remove-bottom)
       </div>
       <div className="uk-background-muted uk-padding-remove-left uk-margin uk-padding">
         No left padding (uk-padding-remove-left)
       </div>
       <div className="uk-background-muted uk-padding-remove-right uk-margin uk-padding">
         No right padding (uk-padding-remove-right)
       </div>
       <div className="uk-background-muted uk-padding-remove-vertical uk-margin uk-padding">
         No vertical padding (uk-padding-remove-vertical)
       </div>
       <div className="uk-background-muted uk-padding-remove-horizontal uk-margin uk-padding">
         No horizontal padding (uk-padding-remove-horizontal)
       </div>
    </Panel>
  ),
}
