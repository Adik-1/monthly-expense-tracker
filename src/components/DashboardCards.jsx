import { formatCurrency, CATEGORY_ICONS } from '../useExpenses.js';

function StatCard({ label, value, meta, icon, accent, color }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">
        <div className="stat-card-icon" style={{ background: color + '22' }}>
          {icon}
        </div>
        {label}
      </div>
      <div className="stat-card-value" style={{ color }}>{value}</div>
      {meta && <div className="stat-card-meta">{meta}</div>}
      <div className="stat-card-accent">{accent}</div>
    </div>
  );
}

export function DashboardCards({ stats, expenses }) {
  const thisMonthCount = expenses.filter(e =>
    e.date?.startsWith(new Date().toISOString().slice(0, 7))
  ).length;

  return (
    <div className="stats-grid">
      <StatCard
        label="Total Spent"
        value={formatCurrency(stats.total)}
        meta={`${stats.count} expense${stats.count !== 1 ? 's' : ''} total`}
        icon="💸"
        accent="💳"
        color="#2563EB"
      />
      <StatCard
        label="This Month"
        value={formatCurrency(stats.thisMonth)}
        meta={`${thisMonthCount} expense${thisMonthCount !== 1 ? 's' : ''} this month`}
        icon="📅"
        accent="📆"
        color="#22C55E"
      />
      <StatCard
        label="Largest Expense"
        value={formatCurrency(stats.largest)}
        meta="Single transaction"
        icon="📈"
        accent="🏷️"
        color="#F59E0B"
      />
      <StatCard
        label="Top Category"
        value={stats.topCategory === '—' ? '—' : stats.topCategory}
        meta={stats.topCategory !== '—' ? `${CATEGORY_ICONS[stats.topCategory] ?? ''} Most frequent` : 'No data yet'}
        icon="🏆"
        accent="🎯"
        color="#8B5CF6"
      />
    </div>
  );
}
