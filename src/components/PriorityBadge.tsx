import type { Priority } from '../types/question';

const config: Record<Priority, { label: string; className: string }> = {
  essential: {
    label: '🔥 Essential',
    className: 'text-accent-orange bg-accent-orange/10 border-accent-orange/30',
  },
  'good-to-know': {
    label: '⭐ Good to Know',
    className: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30',
  },
  'nice-to-know': {
    label: '💡 Nice to Know',
    className: 'text-text-muted bg-bg-tertiary border-border',
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority];
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  );
}
