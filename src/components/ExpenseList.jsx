import { useState } from 'react';
import { CATEGORIES, formatCurrency, formatDate, exportCSV } from '../useExpenses.js';
import { CategoryBadge } from './CategoryBadge.jsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.jsx';

export function ExpenseList({ expenses, onDelete, onEdit }) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  /* ── months for filter dropdown ── */
  const months = [...new Set(expenses.map(e => e.date?.slice(0, 7)).filter(Boolean))].sort().reverse();

  /* ── filter + sort ── */
  let filtered = expenses.filter(e => {
    const txt = `${e.amount} ${e.category} ${e.date} ${e.note}`.toLowerCase();
    const matchSearch = !search || txt.includes(search.toLowerCase());
    const matchCat = filterCat === 'All' || e.category === filterCat;
    const matchMonth = !filterMonth || e.date?.startsWith(filterMonth);
    return matchSearch && matchCat && matchMonth;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date?.localeCompare(a.date);
    if (sortBy === 'date-asc') return a.date?.localeCompare(b.date);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  function startEdit(expense) {
    setEditId(expense.id);
    setEditForm({ amount: expense.amount, category: expense.category, date: expense.date, note: expense.note || '' });
  }

  function saveEdit() {
    onEdit(editId, editForm);
    setEditId(null);
  }

  function confirmDelete(id) { setDeleteId(id); }
  function handleDeleteConfirm() { onDelete(deleteId); setDeleteId(null); }

  const hasFilters = search || filterCat !== 'All' || filterMonth;

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Expenses</span>
        <button className="btn btn-secondary btn-sm" onClick={() => exportCSV(expenses)} title="Export CSV">
          ⬇ Export CSV
        </button>
      </div>
      <div className="card-body">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          <input
            type="search" placeholder="🔍  Search expenses…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: '1 1 180px', minWidth: 140 }}
          />
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ flex: '0 1 140px' }}>
            <option value="All">All categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ flex: '0 1 150px' }}>
            <option value="">All months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ flex: '0 1 160px' }}>
            <option value="date-desc">Date (newest)</option>
            <option value="date-asc">Date (oldest)</option>
            <option value="amount-desc">Amount (high→low)</option>
            <option value="amount-asc">Amount (low→high)</option>
          </select>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterCat('All'); setFilterMonth(''); }}>
              ✕ Clear
            </button>
          )}
        </div>

        {/* Count */}
        {(hasFilters || true) && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> of {expenses.length} expenses
          </p>
        )}

        {/* Empty state */}
        {expenses.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <div className="empty-state-title">No expenses yet</div>
            <div className="empty-state-text">Add your first expense using the form above.</div>
          </div>
        )}

        {expenses.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No results found</div>
            <div className="empty-state-text">Try adjusting your filters or search term.</div>
          </div>
        )}

        {/* Desktop Table */}
        {filtered.length > 0 && (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(expense => (
                <tr key={expense.id}>
                  {editId === expense.id ? (
                    <>
                      <td><input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={{ width: 140 }} /></td>
                      <td>
                        <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td><input type="number" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))} style={{ width: 100 }} /></td>
                      <td><input type="text" value={editForm.note} onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><span className="expense-date">{formatDate(expense.date)}</span></td>
                      <td><CategoryBadge category={expense.category} /></td>
                      <td><span className="expense-amount">{formatCurrency(expense.amount)}</span></td>
                      <td><span className="expense-note" title={expense.note}>{expense.note || <span style={{ color: 'var(--text-muted)' }}>—</span>}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(expense)} title="Edit">✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" onClick={() => confirmDelete(expense.id)} title="Delete">🗑️</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Mobile Cards */}
        {filtered.length > 0 && (
          <div className="expense-cards">
            {filtered.map(expense => (
              <div className="expense-card-mobile" key={expense.id}>
                <div className="expense-card-left">
                  <div className="expense-card-top">
                    <span className="expense-card-amount">{formatCurrency(expense.amount)}</span>
                    <CategoryBadge category={expense.category} />
                  </div>
                  <div className="expense-card-meta">
                    {formatDate(expense.date)}{expense.note ? ` · ${expense.note}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEdit(expense)}>✏️</button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => confirmDelete(expense.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
