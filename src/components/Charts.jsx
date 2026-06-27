import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency } from '../useExpenses.js';

function PieTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: '.8rem', marginBottom: 2 }}>{CATEGORY_ICONS[d.name] ?? ''} {d.name}</div>
      <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '.875rem' }}>{formatCurrency(d.value)}</div>
    </div>
  );
}

function BarTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px' }}>
      <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: '.8rem', marginBottom: 2 }}>{CATEGORY_ICONS[label] ?? ''} {label}</div>
      <div style={{ color: 'var(--green)', fontWeight: 600, fontSize: '.875rem' }}>{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

const card = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 20, boxShadow: 'var(--shadow-md)', overflow: 'hidden',
};
const cardHead = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '20px 24px', borderBottom: '1px solid var(--border)',
};

export function Charts({ catTotals }) {
  const data = Object.entries(catTotals)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const Empty = ({ label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 8 }}>
      <span style={{ fontSize: '2rem' }}>📊</span>
      <p style={{ fontSize: '.8rem', color: 'var(--tm)' }}>{label}</p>
    </div>
  );

  const tag = (color, bg) => ({
    fontSize: '.72rem', fontWeight: 700, padding: '3px 10px',
    borderRadius: 99, background: bg, color,
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="charts-grid">
      {/* Donut */}
      <div style={card}>
        <div style={cardHead}>
          <span style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '.9rem' }}>Spending by Category</span>
          <span style={tag('var(--green)', 'var(--green-dim)')}>Donut</span>
        </div>
        {data.length === 0 ? <Empty label="Add expenses to see your spending breakdown." /> : (
          <div style={{ padding: '16px 24px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={100}
                  paddingAngle={3} dataKey="value" nameKey="name"
                  animationBegin={0} animationDuration={800}>
                  {data.map(e => <Cell key={e.name} fill={CATEGORY_COLORS[e.name] ?? '#94A3B8'} />)}
                </Pie>
                <Tooltip content={<PieTip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span style={{ fontSize: '.75rem', color: 'var(--t2)' }}>{CATEGORY_ICONS[v] ?? ''} {v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bar */}
      <div style={card}>
        <div style={cardHead}>
          <span style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '.9rem' }}>Category Totals</span>
          <span style={tag('#3b82f6', 'rgba(59,130,246,.12)')}>Bar</span>
        </div>
        {data.length === 0 ? <Empty label="Add expenses to see category totals." /> : (
          <div style={{ padding: '16px 24px' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--tm)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} tick={{ fontSize: 10, fill: 'var(--tm)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={<BarTip />} cursor={{ fill: 'rgba(255,255,255,.03)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={800}>
                  {data.map(e => <Cell key={e.name} fill={CATEGORY_COLORS[e.name] ?? '#94A3B8'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
