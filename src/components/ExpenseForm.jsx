import { useState } from 'react';
import { Plus, DollarSign, Tag, Calendar, FileText } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS, getToday } from '../useExpenses.js';

const empty = { amount: '', category: CATEGORIES[0], date: getToday(), note: '' };

function Field({ label, icon: Icon, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.72rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
        <Icon size={12} /> {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '.72rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

const inputStyle = (hasError) => ({
  background: 'rgba(255,255,255,.04)',
  border: `1px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
  borderRadius: 10, color: 'var(--t1)', fontFamily: 'Inter,sans-serif',
  fontSize: '.875rem', padding: '10px 14px', width: '100%', outline: 'none',
  transition: 'border-color .2s, box-shadow .2s',
});

function FocusInput({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...style,
        borderColor: focused ? 'var(--green)' : style.borderColor ?? undefined,
        boxShadow: focused ? '0 0 0 3px var(--green-dim)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function FocusSelect({ style, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...style,
        borderColor: focused ? 'var(--green)' : undefined,
        boxShadow: focused ? '0 0 0 3px var(--green-dim)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

export function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })); }

  function validate() {
    const errs = {};
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Pick a date';
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onAdd({ ...form, amount: Number(form.amount) });
    setForm({ ...empty, date: getToday() });
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
          <Plus size={16} />
        </div>
        <span style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '.9rem' }}>Add Expense</span>
      </div>
      <div style={{ padding: '20px 24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
            <Field label="Amount (₹)" icon={DollarSign} error={errors.amount}>
              <FocusInput type="number" min="0.01" step="0.01" placeholder="0.00"
                value={form.amount} onChange={set('amount')} required
                style={inputStyle(errors.amount)} />
            </Field>
            <Field label="Category" icon={Tag}>
              <FocusSelect value={form.category} onChange={set('category')} required style={inputStyle(false)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
              </FocusSelect>
            </Field>
            <Field label="Date" icon={Calendar} error={errors.date}>
              <FocusInput type="date" value={form.date} onChange={set('date')} required max={getToday()}
                style={{ ...inputStyle(errors.date), colorScheme: 'dark' }} />
            </Field>
            <Field label="Note" icon={FileText}>
              <FocusInput type="text" placeholder="Optional description"
                value={form.note} onChange={set('note')} maxLength={120}
                style={inputStyle(false)} />
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12, border: 'none', fontWeight: 700,
              fontSize: '.875rem', color: '#fff',
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              boxShadow: '0 4px 16px rgba(34,197,94,.3)',
              cursor: 'pointer', transition: 'transform .15s, box-shadow .15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,197,94,.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,.3)'; }}
            >
              <Plus size={16} /> Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
