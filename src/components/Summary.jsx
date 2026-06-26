import { formatCurrency, getCurrentMonthKey, CATEGORIES } from '../useExpenses.js';

function getBehavioralInsight(expenses) {
  const cur = getCurrentMonthKey();
  const [year, month] = cur.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prev = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const catTotal = (monthKey, cat) =>
    expenses.filter(e => e.category === cat && e.date?.startsWith(monthKey))
      .reduce((s, e) => s + e.amount, 0);

  const increases = CATEGORIES.map(cat => {
    const c = catTotal(cur, cat);
    const p = catTotal(prev, cat);
    if (!p || c <= p) return null;
    return { cat, c, p, pct: ((c - p) / p) * 100 };
  }).filter(Boolean).sort((a, b) => b.pct - a.pct);

  if (increases.length) {
    const top = increases[0];
    return `📈 You spent ${Math.round(top.pct)}% more on **${top.cat}** vs last month (${formatCurrency(top.c)} vs ${formatCurrency(top.p)}).`;
  }
  const curTotal = expenses.filter(e => e.date?.startsWith(cur)).reduce((s, e) => s + e.amount, 0);
  const prvTotal = expenses.filter(e => e.date?.startsWith(prev)).reduce((s, e) => s + e.amount, 0);
  if (!curTotal) return '🌱 No expenses recorded this month yet. Start tracking to get insights.';
  if (!prvTotal) return '✅ Add last month\'s data to compare your spending trends.';
  const diff = curTotal - prvTotal;
  return diff < 0
    ? `🎉 You're spending **${formatCurrency(Math.abs(diff))} less** this month vs last month. Great job!`
    : '✅ No category is higher than last month so far. Great discipline!';
}

function renderInsight(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{p}</strong> : p
  );
}

export function Summary({ expenses, monthlyBudget, setMonthlyBudget }) {
  const curKey = getCurrentMonthKey();
  const thisMonthSpend = expenses
    .filter(e => e.date?.startsWith(curKey))
    .reduce((s, e) => s + e.amount, 0);

  const budgetNum = Number(monthlyBudget);
  const hasBudget = monthlyBudget !== '' && budgetNum > 0;
  const remaining = budgetNum - thisMonthSpend;
  const overBudget = hasBudget && remaining < 0;
  const pct = hasBudget ? Math.min((thisMonthSpend / budgetNum) * 100, 100) : 0;

  const insight = getBehavioralInsight(expenses);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-header">
        <span className="card-title">Monthly Budget & Insights</span>
        <span style={{ fontSize: '1.1rem' }}>🎯</span>
      </div>
      <div className="card-body">
        {/* Budget input */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: '1 1 180px', maxWidth: 260 }}>
            <label htmlFor="budget">Monthly Budget (₹)</label>
            <input
              id="budget" type="number" min="0" step="100" placeholder="Set a budget…"
              value={monthlyBudget}
              onChange={e => setMonthlyBudget(e.target.value)}
            />
          </div>
          {hasBudget && (
            <div style={{ paddingBottom: 2 }}>
              <span style={{
                fontSize: '0.85rem', fontWeight: 700,
                color: overBudget ? 'var(--red)' : 'var(--green)'
              }}>
                {overBudget
                  ? `⚠️ Over budget by ${formatCurrency(Math.abs(remaining))}`
                  : `✅ ${formatCurrency(remaining)} remaining`}
              </span>
            </div>
          )}
        </div>

        {hasBudget && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Spent: {formatCurrency(thisMonthSpend)}</span>
              <span>Budget: {formatCurrency(budgetNum)}</span>
            </div>
            <div className="budget-bar-wrap">
              <div
                className="budget-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: overBudget ? 'var(--red)' : pct > 80 ? 'var(--amber)' : 'var(--green)'
                }}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {pct.toFixed(0)}% used
            </div>
          </div>
        )}

        {/* Insight */}
        <div className="insight-box">
          <span className="insight-icon">💡</span>
          <p className="insight-text">{renderInsight(insight)}</p>
        </div>
      </div>
    </div>
  );
}
