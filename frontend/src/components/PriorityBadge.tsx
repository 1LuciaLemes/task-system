import { TaskPriority } from '../types/task.js';
import {
  PRIORITY_BADGE_CLASSES,
  PRIORITY_DOT_CLASSES,
  PRIORITY_LABELS,
} from '../utils/labels.js';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_BADGE_CLASSES[priority]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT_CLASSES[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}