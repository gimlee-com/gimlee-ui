import type { ReportTargetType } from '../types/adminReport';

/** Maps each report target type to a UIkit icon name for visual differentiation. */
export const reportTargetTypeIcon: Record<ReportTargetType, string> = {
  AD: 'cart',
  USER: 'user',
  MESSAGE: 'comment',
  QUESTION: 'question',
  ANSWER: 'info',
};
