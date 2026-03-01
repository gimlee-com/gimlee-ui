import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Modal,
  ModalDialog,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalCloseDefault,
  ModalCloseOutside,
  ModalCloseFull,
} from './Modal'
import { Button } from '../Button/Button'
import { Grid } from '../Grid/Grid'

const meta: Meta<typeof Modal> = {
  title: 'UIkit/Modal',
  component: Modal,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Modal>

export const Basic: Story = {
  render: (args) => (
    <div>
      <Button uk-toggle="target: #modal-example">Open</Button>

      <Modal id="modal-example" {...args}>
        <ModalDialog>
          <ModalBody>
            <ModalTitle>Headline</ModalTitle>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p className="uk-text-right">
              <Button className="uk-modal-close" type="button" variant="default">
                Cancel
              </Button>
              <Button className="uk-margin-small-left" type="button" variant="primary">
                Save
              </Button>
            </p>
          </ModalBody>
        </ModalDialog>
      </Modal>
    </div>
  ),
}

export const CloseButtons: Story = {
  render: (args) => (
    <div uk-margin="">
      <Button uk-toggle="target: #modal-close-default">Default</Button>
      <Button uk-toggle="target: #modal-close-outside">Outside</Button>

      <Modal id="modal-close-default" {...args}>
        <ModalDialog>
          <ModalBody>
            <ModalCloseDefault />
            <ModalTitle>Default</ModalTitle>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </ModalBody>
        </ModalDialog>
      </Modal>

      <Modal id="modal-close-outside" {...args}>
        <ModalDialog>
          <ModalBody>
            <ModalCloseOutside />
            <ModalTitle>Outside</ModalTitle>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </ModalBody>
        </ModalDialog>
      </Modal>
    </div>
  ),
}

export const Sections: Story = {
  render: (args) => (
    <div>
      <Button uk-toggle="target: #modal-sections">Open</Button>

      <Modal id="modal-sections" {...args}>
        <ModalDialog>
          <ModalCloseDefault />
          <ModalHeader>
            <ModalTitle>Modal Title</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </ModalBody>
          <ModalFooter className="uk-text-right">
            <Button className="uk-modal-close" variant="default">
              Cancel
            </Button>
            <Button className="uk-margin-small-left" variant="primary">
              Save
            </Button>
          </ModalFooter>
        </ModalDialog>
      </Modal>
    </div>
  ),
}

export const Full: Story = {
  render: (args) => (
    <div>
      <Button uk-toggle="target: #modal-full">Full</Button>

      <Modal id="modal-full" className="uk-modal-full" {...args}>
        <ModalDialog>
          <ModalCloseFull large />
          <Grid
            gap="collapse"
            className="uk-child-width-1-2@s uk-flex-middle"
          >
            <div
              className="uk-background-cover"
              style={{
                backgroundImage: "url('https://getuikit.com/docs/images/photo.jpg')",
              }}
              uk-height-viewport=""
            />
            <div className="uk-padding-large">
              <h1>Headline</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
          </Grid>
        </ModalDialog>
      </Modal>
    </div>
  ),
}
