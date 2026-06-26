import { useState, useEffect } from 'react';
import { useExpenses, computeStats } from './useExpenses.js';
import { useToast, ToastContainer } from './components/Toast.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Navbar } from './components/Navbar.jsx';
import { DashboardCards } from './components/DashboardCards.jsx';
import { ExpenseForm } from './components/ExpenseForm.jsx';
import { ExpenseList } from './components/ExpenseList.jsx';
import { Charts } from './components/Charts.jsx';
import { Summary } from './components/Summary.jsx';

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

export default function App() {
  const { expenses, monthlyBudget, setMonthlyBudget, addExpense, deleteExpense, editExpense } = useExpenses();
  const { toasts, addToast } = useToast();
  const [darkMode, setDarkMode] = useDarkMode();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = computeStats(expenses);

  function handleAdd(expense) {
    addExpense(expense);
    addToast(`Added ₹${Number(expense.amount).toFixed(2)} · ${expense.category}`, 'success');
  }

  function handleDelete(id) {
    deleteExpense(id);
    addToast('Expense deleted', 'info');
  }

  function handleEdit(id, updates) {
    editExpense(id, updates);
    addToast('Expense updated', 'success');
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <Navbar
          activeView={activeView}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />

        <main className="page-content">
          {/* ── Dashboard View ── */}
          {activeView === 'dashboard' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Good {getGreeting()} 👋</h1>
                <p className="page-subtitle">Here's your financial overview for today.</p>
              </div>

              <DashboardCards stats={stats} expenses={expenses} />
              <Summary
                expenses={expenses}
                monthlyBudget={monthlyBudget}
                setMonthlyBudget={setMonthlyBudget}
              />
              <ExpenseForm onAdd={handleAdd} />
            </>
          )}

          {/* ── Expenses View ── */}
          {activeView === 'expenses' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Expenses</h1>
                <p className="page-subtitle">Manage, search, filter and export your expense records.</p>
              </div>

              <ExpenseForm onAdd={handleAdd} />
              <div style={{ marginTop: 20 }}>
                <ExpenseList
                  expenses={expenses}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </div>
            </>
          )}

          {/* ── Charts View ── */}
          {activeView === 'charts' && (
            <>
              <div className="page-header">
                <h1 className="page-title">Analytics</h1>
                <p className="page-subtitle">Visualize where your money is going.</p>
              </div>

              <DashboardCards stats={stats} expenses={expenses} />
              <Charts catTotals={stats.catTotals} />
            </>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
