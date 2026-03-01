import type { Meta, StoryObj } from '@storybook/react-vite'
import { Upload } from './Upload'
import { Placeholder } from '../Placeholder/Placeholder'
import { Icon } from '../Icon/Icon'
import { Button } from '../Button/Button'

const meta: Meta<typeof Upload> = {
  title: 'UIkit/Upload',
  component: Upload,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Upload>

export const Basic: Story = {
  render: () => (
    <Upload url="">
      <div uk-form-custom="">
        <input type="file" multiple />
        <Button type="button" tabIndex={-1}>Select</Button>
      </div>
    </Upload>
  ),
}

export const DropArea: Story = {
  render: () => (
    <div>
      <Upload url="" className="js-upload">
        <Placeholder className="uk-text-center">
          <Icon icon="cloud-upload" />
          <span className="uk-text-middle uk-margin-small-left">Attach binaries by dropping them here or</span>
          <div uk-form-custom="" className="uk-margin-small-left">
            <input type="file" multiple />
            <span className="uk-link">selecting one</span>
          </div>
        </Placeholder>
      </Upload>
      <progress id="js-progressbar" className="uk-progress" value="0" max="100" hidden></progress>
    </div>
  ),
}

export const ManualUpload: Story = {
  render: () => (
    <Upload 
      url="" 
      beforeAll={(...args: unknown[]) => {
        const files = args[1] as FileList;
        alert(`Selected ${files.length} files. Prevented default upload.`);
        return false;
      }}
    >
      <Placeholder className="uk-text-center">
        <Icon icon="cloud-upload" />
        <span className="uk-text-middle uk-margin-small-left">Drag and drop files here (manual handling)</span>
      </Placeholder>
    </Upload>
  ),
}
