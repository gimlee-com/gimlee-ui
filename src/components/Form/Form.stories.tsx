import type { Meta, StoryObj } from '@storybook/react-vite'
import { Grid } from '../uikit/Grid/Grid.tsx'
import { Button } from '../uikit/Button/Button.tsx'
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
  FormLabel,
  FormControls,
  FormMessage,
  FormCustom,
  FormIcon,
  FormInputContainer,
  AnimatePresence,
  motion,
} from './Form.tsx'
import { useState } from 'react'

const meta: Meta = {
  title: 'Components/Form',
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

export const Messages: Story = {
  render: () => (
    <Form layout="stacked">
      <div className="uk-margin">
        <FormLabel>Error Message</FormLabel>
        <FormControls>
          <Input status="danger" defaultValue="Invalid value" />
          <FormMessage type="error">This is an error message.</FormMessage>
        </FormControls>
      </div>
      <div className="uk-margin">
        <FormLabel>Info Message</FormLabel>
        <FormControls>
          <Input defaultValue="Valid value" />
          <FormMessage type="info">This is an informational message.</FormMessage>
        </FormControls>
      </div>
    </Form>
  ),
}

export const LayoutStacked: Story = {
  render: () => (
    <Form layout="stacked">
      <div className="uk-margin">
        <FormLabel htmlFor="form-stacked-text">Text</FormLabel>
        <FormControls>
          <Input id="form-stacked-text" type="text" placeholder="Some text..." />
        </FormControls>
      </div>
      <div className="uk-margin">
        <FormLabel htmlFor="form-stacked-select">Select</FormLabel>
        <FormControls>
          <Select id="form-stacked-select">
            <option>Option 01</option>
            <option>Option 02</option>
          </Select>
        </FormControls>
      </div>
    </Form>
  ),
}

export const LayoutHorizontal: Story = {
  render: () => (
    <Form layout="horizontal" className="uk-margin-large">
      <div className="uk-margin">
        <FormLabel htmlFor="form-horizontal-text">Text</FormLabel>
        <FormControls>
          <Input
            id="form-horizontal-text"
            type="text"
            placeholder="Some text..."
          />
        </FormControls>
      </div>
      <div className="uk-margin">
        <FormLabel htmlFor="form-horizontal-select">Select</FormLabel>
        <FormControls>
          <Select id="form-horizontal-select">
            <option>Option 01</option>
            <option>Option 02</option>
          </Select>
        </FormControls>
      </div>
    </Form>
  ),
}

export const Icons: Story = {
  render: () => (
    <Form>
      <div className="uk-margin">
        <FormInputContainer>
          <FormIcon icon="user" />
          <Input type="text" aria-label="Not clickable icon" />
        </FormInputContainer>
      </div>
      <div className="uk-margin">
        <FormInputContainer>
          <FormIcon flip icon="link" tag="a" href="#" />
          <Input type="text" aria-label="Clickable icon" />
        </FormInputContainer>
      </div>
    </Form>
  ),
}

export const CustomControls: Story = {
  render: () => (
    <Form>
      <div className="uk-margin">
        <FormCustom>
          <input type="file" aria-label="Custom controls" />
          <Button type="button" tabIndex={-1}>
            Select
          </Button>
        </FormCustom>
      </div>
      <div className="uk-margin">
        <FormCustom target={true}>
          <Select aria-label="Custom controls">
            <option value="1">Option 01</option>
            <option value="2">Option 02</option>
            <option value="3">Option 03</option>
          </Select>
          <span></span>
        </FormCustom>
      </div>
    </Form>
  ),
}

export const ValidationAnimated: Story = {
  name: 'Validation (Animated)',
  render: () => {
    const [showErrors, setShowErrors] = useState(false)
    return (
      <div>
        <Button
          onClick={() => setShowErrors(!showErrors)}
          className="uk-margin-bottom"
        >
          Toggle Errors
        </Button>
        <Form layout="stacked">
          <motion.div layout className="uk-margin">
            <FormLabel htmlFor="email-anim">Email</FormLabel>
            <FormControls>
              <Input
                id="email-anim"
                type="email"
                placeholder="email@example.com"
                status={showErrors ? 'danger' : undefined}
                defaultValue="invalid-email"
              />
              <AnimatePresence>
                {showErrors && (
                  <FormMessage>Please enter a valid email address.</FormMessage>
                )}
              </AnimatePresence>
            </FormControls>
          </motion.div>

          <motion.div layout className="uk-margin">
            <FormLabel htmlFor="password-anim">Password</FormLabel>
            <FormControls>
              <Input
                id="password-anim"
                type="password"
                status={showErrors ? 'danger' : undefined}
                defaultValue="12345"
              />
              <AnimatePresence>
                {showErrors && <FormMessage>Password is too short.</FormMessage>}
              </AnimatePresence>
            </FormControls>
          </motion.div>

          <Button variant="primary" type="button">
            Register
          </Button>
        </Form>
      </div>
    )
  },
}

export const ValidationFocus: Story = {
  name: 'Validation (Focus-aware)',
  render: () => {
    const [passwordFocused, setPasswordFocused] = useState(false)
    const [confirmFocused, setConfirmFocused] = useState(false)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    const passwordError =
      password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,64}$/.test(password)
        ? 'Password must be 8-64 characters and include at least one uppercase letter, one lowercase letter, and one digit.'
        : null

    const confirmError =
      confirm && confirm !== password ? 'Passwords do not match.' : null

    // Simulate "required" error if touched and empty (simple toggle for demo)
    const [touched, setTouched] = useState(false)
    const requiredError = touched && !confirm ? 'Confirm password is required.' : null

    return (
      <Form layout="stacked">
        <p className="uk-text-muted">
          Notice how the danger status only appears after blur, and specific
          errors are hidden during focus.
        </p>
        <motion.div layout className="uk-margin">
          <FormLabel htmlFor="pw-focus">Password</FormLabel>
          <FormControls>
            <Input
              id="pw-focus"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              status={passwordError && !passwordFocused ? 'danger' : undefined}
              placeholder="Type to see requirements..."
            />
            <AnimatePresence>
              {(passwordFocused || passwordError) && (
                <FormMessage type={passwordFocused ? 'info' : 'error'}>
                  {passwordFocused
                    ? 'Password must be 8-64 characters and include at least one uppercase letter, one lowercase letter, and one digit.'
                    : passwordError}
                </FormMessage>
              )}
            </AnimatePresence>
          </FormControls>
        </motion.div>

        <motion.div layout className="uk-margin">
          <FormLabel htmlFor="confirm-focus">Confirm Password</FormLabel>
          <FormControls>
            <Input
              id="confirm-focus"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onFocus={() => setConfirmFocused(true)}
              onBlur={() => {
                setConfirmFocused(false)
                setTouched(true)
              }}
              status={(confirmError || requiredError) && !confirmFocused ? 'danger' : undefined}
              placeholder="Confirm your password..."
            />
            <AnimatePresence>
              {confirmFocused ? (
                confirmError && (
                  <FormMessage type="info">{confirmError}</FormMessage>
                )
              ) : (
                (confirmError || requiredError) && (
                  <FormMessage type="error">
                    {confirmError || requiredError}
                  </FormMessage>
                )
              )}
            </AnimatePresence>
          </FormControls>
        </motion.div>
      </Form>
    )
  },
}
