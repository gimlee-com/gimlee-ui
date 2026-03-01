import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Accordion,
  AccordionItem,
  AccordionTitle,
  AccordionContent,
  AccordionIcon,
} from './Accordion'

const meta: Meta<typeof Accordion> = {
  title: 'UIkit/Accordion',
  component: Accordion,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Accordion>

export const Basic: Story = {
  render: (args) => (
    <Accordion className="uk-accordion-default" {...args}>
      <AccordionItem open>
        <AccordionTitle>Item 1</AccordionTitle>
        <AccordionContent>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTitle>Item 2</AccordionTitle>
        <AccordionContent>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
            reprehenderit.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTitle>Item 3</AccordionTitle>
        <AccordionContent>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat proident.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const WithIcon: Story = {
  render: (args) => (
    <Accordion className="uk-accordion-default" {...args}>
      <AccordionItem open>
        <AccordionTitle>
          Item 1 <AccordionIcon />
        </AccordionTitle>
        <AccordionContent>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTitle>
          Item 2 <AccordionIcon />
        </AccordionTitle>
        <AccordionContent>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
            reprehenderit.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTitle>
          Item 3 <AccordionIcon />
        </AccordionTitle>
        <AccordionContent>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat proident.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const Multiple: Story = {
  args: {
    multiple: true,
  },
  render: (args) => (
    <Accordion className="uk-accordion-default" {...args}>
      <AccordionItem open>
        <AccordionTitle>
          Item 1 <AccordionIcon />
        </AccordionTitle>
        <AccordionContent>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem open>
        <AccordionTitle>
          Item 2 <AccordionIcon />
        </AccordionTitle>
        <AccordionContent>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
            reprehenderit.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem>
        <AccordionTitle>
          Item 3 <AccordionIcon />
        </AccordionTitle>
        <AccordionContent>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat proident.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}
