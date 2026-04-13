import type { Transition } from 'motion/react';

/** Standard spring — critically damped, used for most page/item transitions. */
export const spring = { type: 'spring', stiffness: 400, damping: 40 } satisfies Transition;

/** Snappy spring — slightly faster response, used for small card-internal elements. */
export const springSnappy = { type: 'spring', stiffness: 500, damping: 35 } satisfies Transition;
