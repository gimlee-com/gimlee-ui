import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { motion, AnimatePresence } from 'motion/react';
import {
  spring,
  springSnappy,
  createPageContainerVariants,
  pageItemVariants,
  cardItemVariants,
  scaleItemVariants,
  expandCollapseProps,
  bannerProps,
  createCardContainerVariants,
  timelineItemVariants,
} from './index';

/* ------------------------------------------------------------------ */
/*  Helper: replay button                                             */
/* ------------------------------------------------------------------ */
const ReplayWrapper: React.FC<{ children: (key: number) => React.ReactNode }> = ({ children }) => {
  const [key, setKey] = useState(0);
  return (
    <div>
      <button className="uk-button uk-button-default uk-button-small uk-margin-bottom" onClick={() => setKey(k => k + 1)}>
        ↻ Replay animation
      </button>
      {children(key)}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Placeholder card used in demos                                    */
/* ------------------------------------------------------------------ */
const DemoCard: React.FC<{ title: string; height?: number }> = ({ title, height = 80 }) => (
  <div
    className="uk-card uk-card-default uk-card-body uk-card-small"
    style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    {title}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Meta                                                              */
/* ------------------------------------------------------------------ */
const meta: Meta = {
  title: 'Animations/Presets',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
## Animation Framework

Centralised Framer Motion presets used throughout Gimlee UI.
Import from \`src/animations\`.

### Spring Configs

| Name | Stiffness | Damping | Usage |
|------|-----------|---------|-------|
| \`spring\` | 400 | 40 | Standard transitions (pages, items, expand/collapse) |
| \`springSnappy\` | 500 | 35 | Subtle card-internal micro-interactions |

### Stagger Tiers

| Tier | Default | Usage |
|------|---------|-------|
| Page-level | 0.08 | \`createPageContainerVariants()\` |
| Grid-level | 0.06 | \`createPageContainerVariants(0.06)\` for dense grids |
| Card-internal | 0.05 | \`createCardContainerVariants()\` |

### Naming Convention

- **Variant objects**: \`pageItemVariants\`, \`cardItemVariants\`, \`scaleItemVariants\`, \`timelineItemVariants\`
- **Variant factories**: \`createPageContainerVariants()\`, \`createCardContainerVariants()\` — call with optional stagger override
- **Motion props**: \`expandCollapseProps\`, \`bannerProps\` — spread directly onto \`motion.div\`
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/* ------------------------------------------------------------------ */
/*  Page Container + Page Item                                        */
/* ------------------------------------------------------------------ */
export const PageContainerAndItems: Story = {
  name: 'Page Container + Items',
  render: () => (
    <ReplayWrapper>
      {(key) => (
        <motion.div
          key={key}
          initial="hidden"
          animate="visible"
          variants={createPageContainerVariants()}
        >
          {['Regional Settings', 'Avatar', 'Change Password', 'Delivery Addresses', 'Payments'].map(
            (title) => (
              <motion.div key={title} variants={pageItemVariants} className="uk-margin-small-bottom">
                <DemoCard title={title} />
              </motion.div>
            ),
          )}
        </motion.div>
      )}
    </ReplayWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: `
**\`createPageContainerVariants(stagger?)\`** + **\`pageItemVariants\`**

The standard page entrance pattern. The container fades in and staggers its children.
Each child fades in and slides up 20 px with \`spring(400, 40)\`.

\`\`\`tsx
import { createPageContainerVariants, pageItemVariants } from '../animations';

<motion.div initial="hidden" animate="visible" variants={createPageContainerVariants()}>
  <motion.div variants={pageItemVariants}><Card>...</Card></motion.div>
  <motion.div variants={pageItemVariants}><Card>...</Card></motion.div>
</motion.div>
\`\`\`
        `,
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Card Container + Card Items                                       */
/* ------------------------------------------------------------------ */
export const CardContainerAndItems: Story = {
  name: 'Card Container + Card Items',
  render: () => (
    <ReplayWrapper>
      {(key) => (
        <motion.div
          key={key}
          initial="hidden"
          animate="visible"
          variants={createCardContainerVariants()}
        >
          <div className="uk-card uk-card-default uk-card-body">
            {['Heading', 'Field 1', 'Field 2', 'Submit Button'].map((label) => (
              <motion.div key={label} variants={cardItemVariants} className="uk-margin-small-bottom">
                <div className="uk-placeholder uk-text-center" style={{ padding: '12px' }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </ReplayWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: `
**\`createCardContainerVariants(stagger?)\`** + **\`cardItemVariants\`**

For cards whose inner elements should animate one-by-one after the card itself appears.
The card uses \`beforeChildren\` orchestration + 50 ms stagger. Children use \`springSnappy(500, 35)\` for a subtle 8 px slide-up.

\`\`\`tsx
<motion.div variants={createCardContainerVariants()}>
  <Card>
    <CardBody>
      <motion.div variants={cardItemVariants}>Heading</motion.div>
      <motion.div variants={cardItemVariants}>Field 1</motion.div>
    </CardBody>
  </Card>
</motion.div>
\`\`\`
        `,
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Scale Item                                                        */
/* ------------------------------------------------------------------ */
export const ScaleItems: Story = {
  name: 'Scale Items (Grid Cards)',
  render: () => (
    <ReplayWrapper>
      {(key) => (
        <motion.div
          key={key}
          initial="hidden"
          animate="visible"
          variants={createPageContainerVariants(0.06)}
          className="uk-grid uk-child-width-1-3@s"
          uk-grid=""
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <motion.div key={n} variants={scaleItemVariants}>
              <DemoCard title={`Card ${n}`} height={120} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </ReplayWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: `
**\`scaleItemVariants\`**

Fade + scale from 0.95 → 1. Used for grid cards (AdCard, SalesAdCard, order items).

\`\`\`tsx
<motion.div variants={scaleItemVariants}>
  <AdCard ad={ad} />
</motion.div>
\`\`\`
        `,
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Expand / Collapse                                                 */
/* ------------------------------------------------------------------ */
export const ExpandCollapse: Story = {
  name: 'Expand / Collapse',
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <button className="uk-button uk-button-default uk-button-small uk-margin-bottom" onClick={() => setOpen(o => !o)}>
          {open ? 'Collapse' : 'Expand'}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div {...expandCollapseProps}>
              <div className="uk-card uk-card-default uk-card-body">
                Expandable content — height animates from 0 to auto.
                Overflow is clipped automatically.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**\`expandCollapseProps\`**

Spread onto a \`motion.div\` inside \`AnimatePresence\`. Animates height 0 ↔ auto with fade.
Includes \`overflow: hidden\` automatically.

\`\`\`tsx
<AnimatePresence>
  {open && (
    <motion.div {...expandCollapseProps}>
      <Content />
    </motion.div>
  )}
</AnimatePresence>
\`\`\`
        `,
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Banner                                                            */
/* ------------------------------------------------------------------ */
export const Banner: Story = {
  name: 'Banner Enter / Exit',
  render: () => {
    const [show, setShow] = useState(true);
    return (
      <div>
        <button className="uk-button uk-button-default uk-button-small uk-margin-bottom" onClick={() => setShow(s => !s)}>
          Toggle banner
        </button>
        <AnimatePresence>
          {show && (
            <motion.div {...bannerProps}>
              <div className="uk-alert uk-alert-warning uk-margin-remove">
                ⚠️ This is a banner notification that slides in from the top.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `
**\`bannerProps\`**

Slide in from top (y: −20) with fade. Used for notification banners.

\`\`\`tsx
<AnimatePresence>
  {show && (
    <motion.div {...bannerProps}>
      <Alert>...</Alert>
    </motion.div>
  )}
</AnimatePresence>
\`\`\`
        `,
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Timeline Item                                                     */
/* ------------------------------------------------------------------ */
export const TimelineItems: Story = {
  name: 'Timeline Items (Horizontal Slide)',
  render: () => (
    <ReplayWrapper>
      {(key) => (
        <motion.div
          key={key}
          initial="hidden"
          animate="visible"
          variants={createPageContainerVariants(0.08)}
        >
          {['Report created', 'Under review', 'Action taken', 'Resolved'].map((label) => (
            <motion.div key={label} variants={timelineItemVariants} className="uk-margin-small-bottom">
              <div className="uk-flex uk-flex-middle" style={{ gap: 8 }}>
                <span className="uk-label">{label}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </ReplayWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: `
**\`timelineItemVariants\`**

Horizontal slide from left (x: −12). Used for chronological entries.

\`\`\`tsx
<motion.div variants={timelineItemVariants}>
  <TimelineEntry />
</motion.div>
\`\`\`
        `,
      },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Spring Comparison                                                 */
/* ------------------------------------------------------------------ */
export const SpringComparison: Story = {
  name: 'Spring Configs Comparison',
  render: () => (
    <ReplayWrapper>
      {(key) => (
        <div className="uk-grid uk-child-width-1-2@s" uk-grid="">
          <div>
            <p className="uk-text-bold uk-text-small">spring (400 / 40)</p>
            <motion.div
              key={`a-${key}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
            >
              <DemoCard title="Standard" />
            </motion.div>
          </div>
          <div>
            <p className="uk-text-bold uk-text-small">springSnappy (500 / 35)</p>
            <motion.div
              key={`b-${key}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springSnappy}
            >
              <DemoCard title="Snappy" />
            </motion.div>
          </div>
        </div>
      )}
    </ReplayWrapper>
  ),
  parameters: {
    docs: {
      description: {
        story: `
Side-by-side comparison of the two spring configs.

| | \`spring\` | \`springSnappy\` |
|---|---|---|
| Stiffness | 400 | 500 |
| Damping | 40 | 35 |
| Use case | Page items, expand/collapse, banners | Card-internal micro-interactions |
        `,
      },
    },
  },
};
