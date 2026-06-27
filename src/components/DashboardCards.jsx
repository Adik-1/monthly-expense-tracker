import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { formatCurrency, CATEGORY_ICONS } from '../useExpenses.js';

function StatCard({ label, value, meta, Icon, iconBg, valueColor, trend, trendUp }) {
  return (
    <div
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
        boxShadow: 'var(--shadow-md)', cursor: 'default',
        transition: 'transform .2s, box-shadow .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--tm)' }}>
          {label}
        </span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={valueColor} />
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-.02em', color: valueColor }}>
        {value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {trend && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 99, fontSize: '.7rem', fontWeight: 600,
            background: trendUp ? 'var(--green-dim)' : 'var(--red-dim)',
            color: trendUp ? 'var(--green)' : 'var(--red)',
          }}>
            {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {trend}
          </span>
        )}
        {meta && <span style={{ fontSize: '.72rem', color: 'var(--tm)' }}>{meta}</span>}
      </div>
    </div>
  );
}

export function DashboardCards({ stats, expenses }) {
  const tmCount = expenses.filter(e => e.date?.startsWith(new Date().toISOString().slice(0, 7))).length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}
      className="cards-grid">
      <StatCard label="Total Spent"      value={formatCurrency(stats.total)}     meta={`${stats.count} transactions`} Icon={Wallet}       iconBg="rgba(59,130,246,.15)"  valueColor="#3b82f6" trend="+2.4%" trendUp={true} />
      <StatCard label="This Month"       value={formatCurrency(stats.thisMonth)} meta={`${tmCount} expenses`}         Icon={TrendingUp}   iconBg="rgba(34,197,94,.12)"   valueColor="#22c55e" trend="+12%"  trendUp={true} />
      <StatCard label="Largest Expense"  value={formatCurrency(stats.largest)}   meta="Single transaction"            Icon={TrendingDown} iconBg="rgba(239,68,68,.12)"   valueColor="#ef4444" trend="-5%"   trendUp={false} />
      <StatCard label="Top Category"
        value={stats.topCategory === '—' ? '—' : `${CATEGORY_ICONS[stats.topCategory] ?? ''} ${stats.topCategory}`}
        meta={stats.topCategory !== '—' ? 'Most frequent' : 'No data yet'}
        Icon={PiggyBank} iconBg="rgba(168,85,247,.12)" valueColor="#a855f7" />
    </div>
  );
}
