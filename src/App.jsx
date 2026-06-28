import { useState, useEffect } from 'react';
import { Zap, Lightbulb, ArrowRight } from 'lucide-react';
import { useExpenses, computeStats } from './useExpenses.js';
import { useToast, ToastContainer } from './components/Toast.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Navbar } from './components/Navbar.jsx';
import { DashboardCards } from './components/DashboardCards.jsx';
import { ExpenseForm } from './components/ExpenseForm.jsx';
import { ExpenseList } from './components/ExpenseList.jsx';
import { Charts } from './components/Charts.jsx';
import { Summary } from './components/Summary.jsx';

const responsiveCSS = `
  .mobile-menu-btn { display: none; }
  @media (max-width: 1023px) {
    .main-content    { padding-left: 0 !important; }
    .mobile-menu-btn { display: flex !important; }
    .charts-grid, .summary-grid { grid-template-columns: 1fr !important; }
    .cards-grid  { grid-template-columns: repeat(2,1fr) !important; }
    .form-grid   { grid-template-columns: 1fr !important; }
    .recs-grid   { grid-template-columns: 1fr !important; }
    .quick-grid  { grid-template-columns: repeat(2,1fr) !important; }
  }
  @media (max-width: 600px) {
    .cards-grid { grid-template-columns: 1fr !important; }
  }
`;

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('expense-tracker-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('expense-tracker-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
}

function QuickActions({ onAddExpense }) {
  const actions = [
    { label: 'Add Expense', icon: '➕', color: '#22c55e', bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.25)',  action: onAddExpense },
    { label: 'Add Income',  icon: '💰', color: '#3b82f6', bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.25)', action: null },
    { label: 'Transfer',    icon: '↔️', color: '#a855f7', bg: 'rgba(168,85,247,.12)', border: 'rgba(168,85,247,.25)', action: null },
    { label: 'Set Budget',  icon: '🎯', color: '#f59e0b', bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.25)', action: null },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }} className="quick-grid">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={a.action ?? undefined}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '16px 12px', borderRadius: 16, border: `1px solid ${a.border}`,
            background: a.bg, color: a.color, fontSize: '.8rem', fontWeight: 600,
            cursor: a.action ? 'pointer' : 'default',
            transition: 'transform .2s',
          }}
          onMouseEnter={e => { if (a.action) e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
        >
          <span style={{ fontSize: '1.3rem' }}>{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
}

function Recommendations() {
  const recs = [
    { icon: '💰', title: 'Save ₹5,000 this month', desc: 'Cut discretionary spending by 10% to hit your goal.',    color: '#22c55e' },
    { icon: '🍔', title: 'Reduce food spending',    desc: 'You spent 28% more on food than your 3-month average.', color: '#f59e0b' },
    { icon: '⚡', title: 'Bill due in 3 days',      desc: 'Your electricity bill payment is coming up soon.',       color: '#ef4444' },
  ];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Lightbulb size={15} color="#f59e0b" />
        <h2 style={{ fontWeight: 600, color: 'var(--t1)', fontSize: '.9rem' }}>Smart Recommendations</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="recs-grid">
        {recs.map(r => (
          <div
            key={r.title}
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 16,
              display: 'flex', alignItems: 'flex-start', gap: 12,
              transition: 'transform .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>{r.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.82rem', fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: '.75rem', lineHeight: 1.5, color: 'var(--tm)' }}>{r.desc}</div>
            </div>
            <ArrowRight size={14} color="var(--tm)" style={{ flexShrink: 0, marginTop: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ view, onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 16, padding: 60, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 32px rgba(34,197,94,.15)' }}>
        <Zap size={28} color="var(--green)" />
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--t1)' }}>
        {view.charAt(0).toUpperCase() + view.slice(1)} coming soon
      </div>
      <div style={{ fontSize: '.825rem', color: 'var(--tm)' }}>This feature is under development.</div>
      <button onClick={onBack} style={{
        padding: '9px 18px', borderRadius: 12, cursor: 'pointer',
        border: '1px solid rgba(34,197,94,.2)',
        background: 'var(--green-dim)', color: 'var(--green)',
        fontWeight: 700, fontSize: '.825rem',
      }}>
        ← Back to Dashboard
      </button>
    </div>
  );
}

const OTHER_VIEWS = ['budgets', 'categories', 'goals', 'settings', 'help'];

export default function App() {
  const { expenses, monthlyBudget, setMonthlyBudget, addExpense, deleteExpense, editExpense } = useExpenses();
  const { toasts, addToast }              = useToast();
  const [darkMode, setDarkMode]           = useDarkMode();
  const [activeView, setActiveView]       = useState('dashboard');
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const stats = computeStats(expenses);

  function handleAdd(expense) {
    addExpense(expense);
    addToast(`Added ₹${Number(expense.amount).toFixed(2)} · ${expense.category}`, 'success');
    setShowForm(false);
  }
  function handleDelete(id) { deleteExpense(id); addToast('Expense deleted', 'info'); }
  function handleEdit(id, u) { editExpense(id, u); addToast('Expense updated', 'success'); }

  return (
    <>
      <style>{responsiveCSS}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'clip', background: 'var(--bg)' }}>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div
          className="main-content"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingLeft: 'var(--sidebar-w)' }}
        >
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} onMenuToggle={() => setSidebarOpen(o => !o)} />

          <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {activeView === 'dashboard' && <>
              <DashboardCards stats={stats} expenses={expenses} />
              <QuickActions onAddExpense={() => setShowForm(v => !v)} />
              {showForm && <ExpenseForm onAdd={handleAdd} />}
              <Summary expenses={expenses} monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget} />
              <ExpenseList expenses={expenses} onDelete={handleDelete} onEdit={handleEdit} limit={8} />
              <Recommendations />
              <div style={{ height: 24 }} />
            </>}

            {activeView === 'expenses' && <>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--t1)' }}>Expenses</h1>
                <p style={{ fontSize: '.8rem', color: 'var(--tm)', marginTop: 4 }}>Manage, search, filter and export all your records.</p>
              </div>
              <ExpenseForm onAdd={handleAdd} />
              <ExpenseList expenses={expenses} onDelete={handleDelete} onEdit={handleEdit} />
              <div style={{ height: 24 }} />
            </>}

            {activeView === 'charts' && <>
              <div>
                <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--t1)' }}>Analytics</h1>
                <p style={{ fontSize: '.8rem', color: 'var(--tm)', marginTop: 4 }}>Visualize where your money is going.</p>
              </div>
              <DashboardCards stats={stats} expenses={expenses} />
              <Charts catTotals={stats.catTotals} />
              <div style={{ height: 24 }} />
            </>}

            {OTHER_VIEWS.includes(activeView) && (
              <ComingSoon view={activeView} onBack={() => setActiveView('dashboard')} />
            )}

          </main>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
