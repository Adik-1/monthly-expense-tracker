import { CATEGORY_ICONS } from '../useExpenses.js';

export function CategoryBadge({ category }) {
  const icon = CATEGORY_ICONS[category] ?? '📦';
  return (
    <span className={`badge badge-${category}`}>
      {icon} {category}
    </span>
  );
}
