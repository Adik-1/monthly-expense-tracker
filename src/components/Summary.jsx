import { Sparkles, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { formatCurrency, getCurrentMonthKey, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../useExpenses.js';

function getBehavioralInsight(expenses) {
  const cur = getCurrentMonthKey();
  const [year, month] = cur.split('-').map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear  = month === 1 ? year - 1 : year;
  const prev = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const catTotal = (mk, cat) =>
    expenses.filter(e => e.category === cat && e.date?.startsWith(mk)).reduce((s, e) => s + e.amount, 0);

  const increases = CATEGORIES.map(cat => {
    const c = catTotal(cur, cat), p = catTotal(prev, cat);
    if (!p || c <= p) return null;
    return { cat, c, p, pct: ((c - p) / p) * 100 };
  }).filter(Boolean).sort((a, b) => b.pct - a.pct);

  if (increases.length) {
    const t = increases[0];
    return `You spent ${Math.round(t.pct)}% more on ${t.cat} this month than last month (${formatCurrency(t.c)} vs ${formatCurrency(t.p)}).`;
  }
  const cT = expenses.filter(e => e.date?.startsWith(cur)).reduce((s, e) => s + e.amount, 0);
  const pT = expenses.filter(e => e.date?.startsWith(prev)).reduce((s, e) => s + e.amount, 0);
  if (!cT) return 'No expenses recorded this month yet. Start tracking to get insights.';
  if (!pT) return "Add last month's data to compare your spending trends.";
  return (cT - pT) < 0
    ? `You're spending ${formatCurrency(Math.abs(cT - pT))} less this month vs last month. Great job!`
    : 'No category is higher than last month so far. Great discipline!';
}

export function Summary({ expenses, monthlyBudget, setMonthlyBudget }) {
  const curKey    = getCurrentMonthKey();
  const spend     = expenses.filter(e => e.date?.startsWith(curKey)).reduce((s, e) => s + e.amount, 0);
  const budgetNum = Number(monthlyBudget);
  const hasBudget = monthlyBudget !== '' && budgetNum > 0;
  const remaining = budgetNum - spend;
  const over      = hasBudget && remaining < 0;
  const pct       = hasBudget ? Math.min((spend / budgetNum) * 100, 100) : 0;
  const insight   = getBehavioralInsight(expenses);

  const catTotals = {};
  expenses.filter(e => e.date?.startsWith(curKey)).forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const topCats = Object.entries(catTotals).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat  = topCats[0]?.[1] || 1;

  const progressBarColor = over
    ? 'linear-gradient(90deg,#ef4444,#dc2626)'
    : pct > 75
      ? 'linear-gradient(90deg,#f59e0b,#d97706)'
      : 'linear-gradient(90deg,#22c55e,#16a34a)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }} className="summary-grid">
      {/* AI Insight + Budget card */}
      <div style={{
        borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg,#0f2918 0%,#0d1f28 100%)',
        border: '1px solid rgba(34,197,94,.2)', boxShadow: '0 0 40px rgba(34,197,94,.06)',
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle,rgba(34,197,94,.15) 0%,transparent 70%)',
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(34,197,94,.2)', boxShadow: '0 0 12px rgba(34,197,94,.3)',
          }}>
            <Sparkles size={14} color="#22c55e" />
          </div>
          <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#22c55e' }}>
            AI Smart Insight
          </span>
        </div>

        <p style={{ fontSize: '.95rem', fontWeight: 500, lineHeight: 1.6, color: '#f1f5f9', marginBottom: 20 }}>
          {insight}
        </p>

        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(34,197,94,.25)',
          background: 'rgba(34,197,94,.15)', color: '#22c55e',
          fontSize: '.75rem', fontWeight: 700, cursor: 'pointer',
        }}>
          View Suggestions <ArrowRight size={12} />
        </button>

        {/* Budget section */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: '#94a3b8' }}>
              <Target size={14} color="#64748b" /> Monthly Budget
            </div>
            {hasBudget && (
              <span style={{ fontSize: '.75rem', fontWeight: 700, color: over ? '#ef4444' : '#22c55e' }}>
                {over ? `⚠️ Over by ${formatCurrency(Math.abs(remaining))}` : `${formatCurrency(remaining)} left`}
              </span>
            )}
          </div>
          <input
            type="number" min="0" step="100" placeholder="Set a monthly budget…"
            value={monthlyBudget} onChange={e => setMonthlyBudget(e.target.value)}
            style={{
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 10, color: '#f1f5f9', fontSize: '.875rem',
              padding: '8px 14px', outline: 'none', maxWidth: 220, width: '100%',
              fontFamily: 'Inter,sans-serif',
            }}
          />
          {hasBudget && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: '#64748b', marginBottom: 4 }}>
                <span>{formatCurrency(spend)} spent</span>
                <span>{Math.round(pct)}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, width: `${pct}%`, background: progressBarColor, transition: 'width .7s ease' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spending Breakdown card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '.9rem', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={15} color="var(--green)" /> Spending Breakdown
        </div>

        {topCats.length === 0 ? (
          <p style={{ fontSize: '.825rem', color: 'var(--tm)' }}>No expenses this month yet.</p>
        ) : (
          topCats.map(([cat, amount]) => {
            const color = CATEGORY_COLORS[cat] ?? '#94a3b8';
            const p = Math.round((amount / maxCat) * 100);
            return (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.82rem', color: 'var(--t2)' }}>
                    <span>{CATEGORY_ICONS[cat]}</span>{cat}
                  </div>
                  <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--t1)' }}>{formatCurrency(amount)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border-h)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99, width: `${p}%`,
                    background: color, boxShadow: `0 0 6px ${color}60`,
                    transition: 'width .7s ease',
                  }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
