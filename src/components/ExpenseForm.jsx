import { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS, getToday } from '../useExpenses.js';

const emptyForm = { amount: '', category: CATEGORIES[0], date: getToday(), note: '' };

export function ExpenseForm({ onAdd }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

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
    setForm({ ...emptyForm, date: getToday() });
  }

  return (
    <div className="card form-section">
      <div className="card-header">
        <span className="card-title">Add Expense</span>
        <span style={{ fontSize: '1.2rem' }}>➕</span>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="amount">Amount (₹)</label>
              <input
                id="amount" type="number" min="0.01" step="0.01"
                placeholder="0.00"
                value={form.amount} onChange={set('amount')} required
                style={errors.amount ? { borderColor: 'var(--red)' } : {}}
              />
              {errors.amount && <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{errors.amount}</span>}
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" value={form.category} onChange={set('category')} required>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date" type="date"
                value={form.date} onChange={set('date')} required
                max={getToday()}
                style={errors.date ? { borderColor: 'var(--red)' } : {}}
              />
              {errors.date && <span style={{ color: 'var(--red)', fontSize: '0.75rem' }}>{errors.date}</span>}
            </div>

            <div className="field">
              <label htmlFor="note">Note</label>
              <input
                id="note" type="text"
                placeholder="Optional description"
                value={form.note} onChange={set('note')}
                maxLength={120}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn btn-primary">
              ➕ Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
