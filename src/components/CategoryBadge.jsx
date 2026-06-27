import { CATEGORY_COLORS, CATEGORY_ICONS } from '../useExpenses.js';

export function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] ?? '#94a3b8';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: '.75rem', fontWeight: 600,
      background: color + '22', color,
    }}>
      {CATEGORY_ICONS[category] ?? '📦'} {category}
    </span>
  );
}
