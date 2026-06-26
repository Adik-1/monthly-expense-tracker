import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency } from '../useExpenses.js';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
        {CATEGORY_ICONS[d.name] ?? ''} {d.name}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
        {formatCurrency(d.value)}
      </div>
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
        {CATEGORY_ICONS[label] ?? ''} {label}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

const EmptyChart = ({ label }) => (
  <div className="empty-state" style={{ padding: 32 }}>
    <div className="empty-state-icon" style={{ fontSize: '2rem' }}>📊</div>
    <div className="empty-state-text">{label}</div>
  </div>
);

export function Charts({ catTotals }) {
  const data = Object.entries(catTotals)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="charts-grid">
        <div className="card"><div className="card-header"><span className="card-title">Spending by Category</span></div><EmptyChart label="Add expenses to see your spending breakdown." /></div>
        <div className="card"><div className="card-header"><span className="card-title">Category Totals</span></div><EmptyChart label="Add expenses to see category totals." /></div>
      </div>
    );
  }

  return (
    <div className="charts-grid">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Spending by Category</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pie chart</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {data.map(entry => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={value => (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {CATEGORY_ICONS[value] ?? ''} {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Category Totals</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bar chart</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--bg-secondary)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {data.map(entry => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#94A3B8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
