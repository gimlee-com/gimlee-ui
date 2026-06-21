import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid } from '../Grid/Grid.tsx'
import {
  Form,
  Fieldset,
  Legend,
  Input,
  Select,
  TextArea,
  Checkbox,
  Radio,
  Range,
} from './Form.tsx'

const meta: Meta = {
  title: 'UIkit/Form',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}

export default meta
type Story = StoryObj

export const Basic: Story = {
  render: () => (
    <Form>
      <Fieldset>
        <Legend>Legend</Legend>

        <div className="uk-margin">
          <Input type="text" placeholder="Input" aria-label="Input" />
        </div>

        <div className="uk-margin">
          <Select aria-label="Select">
            <option>Option 01</option>
            <option>Option 02</option>
          </Select>
        </div>

        <div className="uk-margin">
          <TextArea rows={5} placeholder="Textarea" aria-label="Textarea" />
        </div>

        <div className="uk-margin">
          <Grid gap="small" className="uk-child-width-auto">
            <label>
              <Radio name="radio2" defaultChecked /> A
            </label>
            <label>
              <Radio name="radio2" /> B
            </label>
          </Grid>
        </div>

        <div className="uk-margin">
          <Grid gap="small" className="uk-child-width-auto">
            <label>
              <Checkbox defaultChecked /> A
            </label>
            <label>
              <Checkbox /> B
            </label>
          </Grid>
        </div>

        <div className="uk-margin">
          <Range
            defaultValue="2"
            min="0"
            max="10"
            step="0.1"
            aria-label="Range"
          />
        </div>
      </Fieldset>
    </Form>
  ),
}

export const States: Story = {
  render: () => (
    <Form>
      <div className="uk-margin">
        <Input
          status="danger"
          className="uk-form-width-medium"
          type="text"
          placeholder="form-danger"
          aria-label="form-danger"
          defaultValue="form-danger"
        />
      </div>
      <div className="uk-margin">
        <Input
          status="success"
          className="uk-form-width-medium"
          type="text"
          placeholder="form-success"
          aria-label="form-success"
          defaultValue="form-success"
        />
      </div>
      <div className="uk-margin">
        <Input
          className="uk-form-width-medium"
          type="text"
          placeholder="disabled"
          aria-label="disabled"
          defaultValue="disabled"
          disabled
        />
      </div>
    </Form>
  ),
}

export const LiquidCrystal: Story = {
  render: () => (
    <div className="uk-width-1-1" style={{ maxWidth: 560, margin: '0 auto' }}>
      <h3 className="uk-heading-small uk-margin-medium-bottom">
        Crystal Well — Form Controls
      </h3>

      <Form layout="stacked">
        <Fieldset>
          <Legend>Text Inputs</Legend>

          <div className="uk-margin">
            <label className="uk-form-label">Default (hover & focus me)</label>
            <Input
              type="text"
              placeholder="Crystal Well — type here..."
              aria-label="Default input"
            />
          </div>

          <div className="uk-margin">
            <label className="uk-form-label">With value</label>
            <Input
              type="text"
              defaultValue="Filled crystal well"
              aria-label="Filled input"
            />
          </div>

          <div className="uk-margin">
            <label className="uk-form-label">Password</label>
            <Input
              type="password"
              defaultValue="secretpass"
              aria-label="Password input"
            />
          </div>

          <div className="uk-margin">
            <label className="uk-form-label">Disabled</label>
            <Input
              type="text"
              defaultValue="Cannot interact"
              aria-label="Disabled input"
              disabled
            />
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Validation States</Legend>

          <div className="uk-margin">
            <label className="uk-form-label">Success glow</label>
            <Input
              type="text"
              status="success"
              defaultValue="Valid input"
              aria-label="Success input"
            />
          </div>

          <div className="uk-margin">
            <label className="uk-form-label">Danger glow</label>
            <Input
              type="email"
              status="danger"
              defaultValue="invalid@"
              aria-label="Danger input"
            />
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Select (Crystal Well)</Legend>

          <div className="uk-margin">
            <label className="uk-form-label">Default select</label>
            <Select aria-label="Crystal select">
              <option>Choose an option...</option>
              <option>PirateChain (ARRR)</option>
              <option>Monero (XMR)</option>
              <option>Firo (FIRO)</option>
            </Select>
          </div>

          <div className="uk-margin">
            <label className="uk-form-label">Disabled select</label>
            <Select aria-label="Disabled select" disabled>
              <option>Cannot interact</option>
            </Select>
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Textarea (Crystal Well)</Legend>

          <div className="uk-margin">
            <label className="uk-form-label">Description</label>
            <TextArea
              rows={4}
              placeholder="Type your ad description here..."
              aria-label="Crystal textarea"
            />
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Radio — Crystal Gem</Legend>

          <div className="uk-margin">
            <Grid gap="small" className="uk-child-width-auto">
              <label>
                <Radio name="crystal-radio" defaultChecked /> PirateChain
              </label>
              <label>
                <Radio name="crystal-radio" /> Monero
              </label>
              <label>
                <Radio name="crystal-radio" /> Firo
              </label>
              <label>
                <Radio name="crystal-radio" disabled /> Disabled
              </label>
            </Grid>
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Checkbox — Crystal Gem</Legend>

          <div className="uk-margin">
            <Grid gap="small" className="uk-child-width-auto">
              <label>
                <Checkbox defaultChecked /> Checked (gem glow)
              </label>
              <label>
                <Checkbox /> Unchecked (well)
              </label>
              <label>
                <Checkbox disabled /> Disabled
              </label>
            </Grid>
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Range — Crystal Track</Legend>

          <div className="uk-margin">
            <Range
              defaultValue="6"
              min="0"
              max="10"
              step="0.1"
              aria-label="Crystal range"
            />
          </div>
        </Fieldset>

        <Fieldset>
          <Legend>Blank Variant (stripped)</Legend>

          <div className="uk-margin">
            <label className="uk-form-label">Blank input</label>
            <Input
              type="text"
              variant="blank"
              placeholder="No crystal effects — just a line"
              aria-label="Blank input"
            />
          </div>
        </Fieldset>
      </Form>
    </div>
  ),
}
