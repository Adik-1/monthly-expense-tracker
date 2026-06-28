import { useState } from 'react';
import { Search, Filter, Download, Pencil, Trash2, Check, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, formatCurrency, formatDate, exportCSV } from '../useExpenses.js';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.jsx';

const fInput = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 10, color: 'var(--t1)', fontFamily: 'Inter,sans-serif',
  fontSize: '.8rem', padding: '7px 12px', outline: 'none',
};
const editInput = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--t1)', fontFamily: 'Inter,sans-serif',
  fontSize: '.8rem', padding: '5px 9px', outline: 'none',
};

export function ExpenseList({ expenses, onDelete, onEdit, limit }) {
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('All');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy]           = useState('date-desc');
  const [deleteId, setDeleteId]       = useState(null);
  const [editId, setEditId]           = useState(null);
  const [editForm, setEditForm]       = useState({});

  const months = [...new Set(expenses.map(e => e.date?.slice(0, 7)).filter(Boolean))].sort().reverse();

  let filtered = expenses.filter(e => {
    const txt = `${e.amount} ${e.category} ${e.date} ${e.note}`.toLowerCase();
    return (
      (!search || txt.includes(search.toLowerCase())) &&
      (filterCat === 'All' || e.category === filterCat) &&
      (!filterMonth || e.date?.startsWith(filterMonth))
    );
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc')   return (b.date ?? '').localeCompare(a.date ?? '');
    if (sortBy === 'date-asc')    return (a.date ?? '').localeCompare(b.date ?? '');
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc')  return a.amount - b.amount;
    return 0;
  });

  if (limit) filtered = filtered.slice(0, limit);

  function startEdit(exp) {
    setEditId(exp.id);
    setEditForm({ amount: exp.amount, category: exp.category, date: exp.date, note: exp.note || '' });
  }
  function saveEdit() { onEdit(editId, editForm); setEditId(null); }

  const hasF = search || filterCat !== 'All' || filterMonth;

  return (
    <>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, boxShadow: 'var(--shadow-md)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '.9rem' }}>Recent Transactions</div>
            <div style={{ fontSize: '.72rem', color: 'var(--tm)', marginTop: 3 }}>{filtered.length} of {expenses.length} shown</div>
          </div>
          <button onClick={() => exportCSV(expenses)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 8, border: '1px solid rgba(34,197,94,.2)',
            background: 'var(--green-dim)', color: 'var(--green)',
            fontSize: '.75rem', fontWeight: 700, cursor: 'pointer',
          }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', padding: '14px 24px',
          borderBottom: '1px solid var(--border)', background: 'var(--surface2)',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 120 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--tm)', pointerEvents: 'none' }} />
            <input type="search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ ...fInput, paddingLeft: 30, width: '100%' }} />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...fInput, width: 140 }}>
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ ...fInput, width: 130 }}>
            <option value="">All months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...fInput, width: 150 }}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
          {hasF && (
            <button onClick={() => { setSearch(''); setFilterCat('All'); setFilterMonth(''); }}
              style={{ ...fInput, background: 'var(--red-dim)', color: 'var(--red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* List */}
        {expenses.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 10 }}>
            <span style={{ fontSize: '2.5rem' }}>💰</span>
            <div style={{ fontWeight: 700, color: 'var(--t1)' }}>No expenses yet</div>
            <div style={{ fontSize: '.825rem', color: 'var(--tm)' }}>Add your first expense using the form above.</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 8 }}>
            <Filter size={28} color="var(--tm)" />
            <div style={{ fontSize: '.825rem', color: 'var(--tm)' }}>No expenses match your filters.</div>
          </div>
        ) : (
          filtered.map((exp, i) => {
            const isEdit = editId === exp.id;
            const color  = CATEGORY_COLORS[exp.category] ?? '#94a3b8';
            return (
              <div key={exp.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; }}
              >
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {CATEGORY_ICONS[exp.category] ?? '📦'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isEdit ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      <input type="number" value={editForm.amount} min="0.01" step="0.01"
                        style={{ ...editInput, width: 80 }}
                        onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} />
                      <select value={editForm.category} style={{ ...editInput, width: 120 }}
                        onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <input type="date" value={editForm.date}
                        style={{ ...editInput, width: 135 }}
                        onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                      <input type="text" value={editForm.note} placeholder="Note…"
                        style={{ ...editInput, width: 150 }}
                        onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))} />
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.note || exp.category}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 99, fontSize: '.68rem', fontWeight: 600, background: color + '22', color }}>
                          {exp.category}
                        </span>
                        <span style={{ fontSize: '.7rem', color: 'var(--tm)' }}>{formatDate(exp.date)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Amount */}
                <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--red)', flexShrink: 0 }}>
                  -{formatCurrency(exp.amount)}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {isEdit ? (
                    <>
                      <button onClick={saveEdit} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--green)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditId(null)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--tm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(exp)}
                        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--tm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--t1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--tm)'; }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteId(exp.id)}
                        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--tm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--tm)'; }}>
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {deleteId && (
        <ConfirmDeleteModal
          onConfirm={() => { onDelete(deleteId); setDeleteId(null); }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
