import type { Meta, StoryObj } from '@storybook/react-vite'
import { Panel } from '../../components/uikit/Panel/Panel'

const meta: Meta = {
  title: 'UIkit/Base',
  parameters: {
    controls: { hideNoControlsWarning: true },
  },
}
export default meta

type Story = StoryObj

export const TextSemantics: Story = {
  name: 'Text semantics & links',
  render: () => (
    <Panel className="uk-padding">
      <p>
        This is a paragraph with <a href="#">a link</a>, <strong>strong</strong>,{' '}
        <em>emphasis</em>, <code>code</code>, <del>deleted</del>, <ins>inserted</ins>,{' '}
        <mark>highlighted</mark>, and <small>small</small> text.
      </p>
      <p>
        Inline elements: <abbr title="World Health Organization">WHO</abbr>,{' '}
        <cite>Citation</cite>, <dfn title="Definition">definition</dfn>,{' '}
        <kbd>Ctrl+C</kbd>, <samp>output</samp>, <sub>sub</sub>, <sup>sup</sup>,{' '}
        <var>x</var>.
      </p>
      <p className="uk-text-muted">Muted text with the default link style.</p>
      <p className="uk-text-meta">Meta text example.</p>
      <p className="uk-text-lead">Lead text example.</p>
      <p>
        <a className="uk-link-muted" href="#">
          Muted link
        </a>{' '}
        ·{' '}
        <a className="uk-link-text" href="#">
          Text link
        </a>{' '}
        ·{' '}
        <a className="uk-link-heading" href="#">
          Heading link
        </a>{' '}
        ·{' '}
        <a className="uk-link-reset" href="#">
          Reset link
        </a>
      </p>
    </Panel>
  ),
}

export const Headings: Story = {
  render: () => (
    <Panel className="uk-padding">
      <h1>h1 Heading 1</h1>
      <h2>h2 Heading 2</h2>
      <h3>h3 Heading 3</h3>
      <h4>h4 Heading 4</h4>
      <h5>h5 Heading 5</h5>
      <h6>h6 Heading 6</h6>
      <h3 className="uk-heading-divider">Heading Divider</h3>
      <h3 className="uk-heading-bullet">Heading Bullet</h3>
      <h3 className="uk-heading-line">
        <span>Heading Line</span>
      </h3>
    </Panel>
  ),
}

export const Lists: Story = {
  render: () => (
    <Panel className="uk-padding uk-child-width-1-2@s" uk-grid="">
      <div>
        <h4>Unordered</h4>
        <ul>
          <li>Item 1</li>
          <li>
            Item 2
            <ul>
              <li>Sub 1</li>
              <li>Sub 2</li>
            </ul>
          </li>
          <li>Item 3</li>
        </ul>
        <h4>Ordered</h4>
        <ol>
          <li>First</li>
          <li>Second</li>
        </ol>
      </div>
      <div>
        <h4>Description list</h4>
        <dl>
          <dt>Description term</dt>
          <dd>Lorem ipsum dolor sit amet.</dd>
          <dt>Another term</dt>
          <dd>Sed do eiusmod tempor.</dd>
        </dl>
      </div>
    </Panel>
  ),
}

export const BlockquoteAndCode: Story = {
  name: 'Blockquote & code',
  render: () => (
    <Panel className="uk-padding uk-child-width-1-2@m" uk-grid="">
      <div>
        <h4>Blockquote</h4>
        <blockquote cite="#">
          <p className="uk-margin-remove">
            The blockquote element represents content that is quoted from another source.
          </p>
          <footer>
            Someone famous in <cite><a href="#">Source Title</a></cite>
          </footer>
        </blockquote>
      </div>
      <div>
        <h4>Preformatted code</h4>
        <pre>
          {`// Code example
<div id="myid" class="myclass" hidden>
    Lorem ipsum <strong>dolor</strong> sit amet.
</div>`}
        </pre>
      </div>
    </Panel>
  ),
}

export const ResponsiveMedia: Story = {
  name: 'Responsive media',
  render: () => (
    <Panel className="uk-padding uk-width-large@s">
      <p>Images are responsive by default in UIkit.</p>
      <img
        src="https://getuikit.com/docs/images/photo.jpg"
        width="1800"
        height="1200"
        alt="Example"
      />
      <p className="uk-margin-top">
        Add <code>uk-preserve-width</code> if you want to prevent shrinking:
      </p>
      <img
        className="uk-preserve-width"
        src="https://getuikit.com/docs/images/photo.jpg"
        width="300"
        height="200"
        alt="Preserve width"
      />
    </Panel>
  ),
}