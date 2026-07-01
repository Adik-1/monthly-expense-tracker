import { useEffect, useState } from 'react';
import { budgetStorageKey, categories, storageKey } from './constants.js';
import { getLocalDate } from './dateUtils.js';
import ReceiptScanner from './ReceiptScanner.jsx';

function getToday() {
  return getLocalDate();
}

function formatAmount(value) {
  return value.toFixed(2);
}

function loadSavedExpenses() {
  try {
    const savedExpenses = localStorage.getItem(storageKey);

    if (!savedExpenses) {
      return [];
    }

    const parsedExpenses = JSON.parse(savedExpenses);

    if (!Array.isArray(parsedExpenses)) {
      return [];
    }

    return parsedExpenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }));
  } catch {
    return [];
  }
}

function loadSavedBudget() {
  return localStorage.getItem(budgetStorageKey) ?? '';
}

function isCurrentMonth(date) {
  if (!date) {
    return false;
  }

  const today = getToday();
  return date.slice(0, 7) === today.slice(0, 7);
}

function getCurrentMonthKey() {
  return getToday().slice(0, 7);
}

function getPreviousMonthKey() {
  const [year, month] = getCurrentMonthKey().split('-').map(Number);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  return `${previousYear}-${String(previousMonth).padStart(2, '0')}`;
}

function getCategoryTotalForMonth(expenses, category, monthKey) {
  return expenses
    .filter((expense) => expense.category === category && expense.date?.slice(0, 7) === monthKey)
    .reduce((total, expense) => total + expense.amount, 0);
}

function getBehavioralInsight(expenses) {
  const currentMonthKey = getCurrentMonthKey();
  const previousMonthKey = getPreviousMonthKey();
  const increases = categories
    .map((category) => {
      const currentTotal = getCategoryTotalForMonth(expenses, category, currentMonthKey);
      const previousTotal = getCategoryTotalForMonth(expenses, category, previousMonthKey);

      if (previousTotal === 0 || currentTotal <= previousTotal) {
        return null;
      }

      return {
        category,
        currentTotal,
        previousTotal,
        increasePercent: ((currentTotal - previousTotal) / previousTotal) * 100,
      };
    })
    .filter(Boolean)
    .sort((first, second) => second.increasePercent - first.increasePercent);

  if (increases.length > 0) {
    const biggestIncrease = increases[0];

    return `You spent ${Math.round(biggestIncrease.increasePercent)}% more on ${biggestIncrease.category} this month than last month (${formatAmount(biggestIncrease.currentTotal)} vs ${formatAmount(biggestIncrease.previousTotal)}).`;
  }

  const currentMonthTotal = expenses
    .filter((expense) => expense.date?.slice(0, 7) === currentMonthKey)
    .reduce((total, expense) => total + expense.amount, 0);
  const previousMonthTotal = expenses
    .filter((expense) => expense.date?.slice(0, 7) === previousMonthKey)
    .reduce((total, expense) => total + expense.amount, 0);

  if (currentMonthTotal === 0 || previousMonthTotal === 0) {
    return 'Add expenses from this month and last month to see a spending insight.';
  }

  return 'No category is higher than last month so far.';
}

function CategoryBarChart({ data }) {
  if (data.length === 0) {
    return <p>No chart data yet.</p>;
  }

  const labelWidth = 110;
  const chartWidth = 520;
  const valueWidth = 80;
  const barHeight = 24;
  const gap = 12;
  const maxBarWidth = chartWidth - labelWidth - valueWidth;
  const chartHeight = data.length * (barHeight + gap) - gap;
  const maxTotal = Math.max(...data.map((categoryTotal) => categoryTotal.total));

  return (
    <svg
      className="category-chart"
      role="img"
      aria-label="Bar chart showing spending per category"
      width={chartWidth}
      height={chartHeight}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
    >
      {data.map((categoryTotal, index) => {
        const y = index * (barHeight + gap);
        const barWidth = (categoryTotal.total / maxTotal) * maxBarWidth;

        return (
          <g key={categoryTotal.category}>
            <text x="0" y={y + 17}>
              {categoryTotal.category}
            </text>
            <rect
              className="category-chart__bar"
              x={labelWidth}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
            />
            <text x={labelWidth + barWidth + 8} y={y + 17}>
              {formatAmount(categoryTotal.total)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function App() {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState('');
  const [expenses, setExpenses] = useState(loadSavedExpenses);
  const [monthlyBudget, setMonthlyBudget] = useState(loadSavedBudget);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(budgetStorageKey, monthlyBudget);
  }, [monthlyBudget]);

  const totalSpending = expenses.reduce((total, expense) => total + expense.amount, 0);
  const currentMonthSpending = expenses
    .filter((expense) => isCurrentMonth(expense.date))
    .reduce((total, expense) => total + expense.amount, 0);
  const monthlyBudgetAmount = Number(monthlyBudget);
  const hasMonthlyBudget = monthlyBudget !== '' && monthlyBudgetAmount > 0;
  const remainingBudget = monthlyBudgetAmount - currentMonthSpending;
  const isOverBudget = hasMonthlyBudget && remainingBudget < 0;
  const behavioralInsight = getBehavioralInsight(expenses);
  const categoryBreakdown = categories
    .map((categoryName) => {
      const total = expenses
        .filter((expense) => expense.category === categoryName)
        .reduce((categoryTotal, expense) => categoryTotal + expense.amount, 0);

      return {
        category: categoryName,
        total,
      };
    })
    .filter((categoryTotal) => categoryTotal.total > 0);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const hasFilters = filterStartDate !== '' || filterEndDate !== '' || normalizedSearchTerm !== '';
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = expense.date ?? '';
    const matchesStartDate = filterStartDate === '' || expenseDate >= filterStartDate;
    const matchesEndDate = filterEndDate === '' || expenseDate <= filterEndDate;
    const searchText = [
      formatAmount(expense.amount),
      expense.merchant,
      expense.category,
      expenseDate,
      expense.note,
      expense.paymentMethod,
      expense.currency,
      expense.invoiceNumber,
    ]
      .join(' ')
      .toLowerCase();
    const matchesSearch = normalizedSearchTerm === '' || searchText.includes(normalizedSearchTerm);

    return matchesStartDate && matchesEndDate && matchesSearch;
  });

  function handleSubmit(event) {
    event.preventDefault();

    const expense = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      category,
      date,
      note: note.trim(),
    };

    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
    setAmount('');
    setCategory(categories[0]);
    setDate(getToday());
    setNote('');
  }

  function handleDeleteExpense(id) {
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id),
    );
  }

  function handleAddScannedExpense(expense) {
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
  }

  function handleDeleteReceipt(id) {
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) => {
        if (expense.id !== id) {
          return expense;
        }

        const { receipt, ...expenseWithoutReceipt } = expense;
        return expenseWithoutReceipt;
      }),
    );
  }

  function handleClearFilters() {
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Personal finance</p>
          <h1>Expense Tracker</h1>
        </div>
        <div className="header-actions">
          <p className="header-summary">
            Track daily spending, watch your monthly budget, and spot category changes.
          </p>
          <button className="primary-button" type="button" onClick={() => setIsScannerOpen(true)}>
            Scan Receipt
          </button>
        </div>
      </header>

      <ReceiptScanner
        categories={categories}
        expenses={expenses}
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveExpense={handleAddScannedExpense}
      />

      <form className="panel expense-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <h2>Add expense</h2>
          <p>Record a new purchase or payment.</p>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            >
              {categories.map((categoryName) => (
                <option key={categoryName} value={categoryName}>
                  {categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="note">Note</label>
            <input
              id="note"
              name="note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <button className="primary-button" type="submit">
          Add expense
        </button>
      </form>

      <section className="panel">
        <div className="section-heading">
          <h2>Summary</h2>
          <p>Your spending picture across all saved entries.</p>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span>Total spending</span>
            <strong>{formatAmount(totalSpending)}</strong>
          </div>
          <div className="stat">
            <span>This month</span>
            <strong>{formatAmount(currentMonthSpending)}</strong>
          </div>
        </div>

        <div className="budget-row">
          <div className="field">
            <label htmlFor="monthly-budget">Monthly budget</label>
            <input
              id="monthly-budget"
              name="monthly-budget"
              type="number"
              min="0"
              step="0.01"
              value={monthlyBudget}
              onChange={(event) => setMonthlyBudget(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {hasMonthlyBudget && (
          <p className={isOverBudget ? 'budget-message budget-message--warning' : 'budget-message'}>
            {isOverBudget
              ? `Warning: you are over budget by ${formatAmount(Math.abs(remainingBudget))}.`
              : `Remaining budget: ${formatAmount(remainingBudget)}.`}
          </p>
        )}

        <div className="insight-box">
          <h3>Insight</h3>
          <p>{behavioralInsight}</p>
        </div>

        <div className="summary-grid">
          <div>
            <h3>By category</h3>
            {categoryBreakdown.length === 0 ? (
              <p className="empty-state">No category spending yet.</p>
            ) : (
              <ul className="category-list">
                {categoryBreakdown.map((categoryTotal) => (
                  <li key={categoryTotal.category}>
                    <span>{categoryTotal.category}</span>
                    <strong>{formatAmount(categoryTotal.total)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="chart-panel">
            <h3>Chart</h3>
            <CategoryBarChart data={categoryBreakdown} />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Filters</h2>
          <p>Narrow the entries by date range or text search.</p>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="filter-start-date">Start date</label>
            <input
              id="filter-start-date"
              name="filter-start-date"
              type="date"
              value={filterStartDate}
              onChange={(event) => setFilterStartDate(event.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="filter-end-date">End date</label>
            <input
              id="filter-end-date"
              name="filter-end-date"
              type="date"
              value={filterEndDate}
              onChange={(event) => setFilterEndDate(event.target.value)}
            />
          </div>

          <div className="field field--wide">
            <label htmlFor="expense-search">Search</label>
            <input
              id="expense-search"
              name="expense-search"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search category, note, date, or amount"
            />
          </div>
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={handleClearFilters}
          disabled={!hasFilters}
        >
          Clear filters
        </button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>Entries</h2>
          <p>Your saved expenses.</p>
        </div>

        {hasFilters && (
          <p className="filter-count">
            Showing {filteredExpenses.length} of {expenses.length} expenses.
          </p>
        )}

        {expenses.length === 0 ? (
          <p className="empty-state">No expenses yet.</p>
        ) : filteredExpenses.length === 0 ? (
          <p className="empty-state">No expenses match your filters.</p>
        ) : (
          <ul className="entries-list">
            {filteredExpenses.map((expense) => (
              <li className="expense-row" key={expense.id}>
                <div>
                  <strong>
                    {expense.currency ? `${expense.currency} ` : ''}
                    {formatAmount(expense.amount)}
                  </strong>
                  <span>
                    {expense.merchant ? `${expense.merchant} - ` : ''}
                    {expense.category} - {expense.date}
                  </span>
                  {expense.paymentMethod ? <p>Paid by {expense.paymentMethod}</p> : null}
                  {expense.note ? <p>{expense.note}</p> : null}
                </div>
                <div className="row-actions">
                  {expense.receipt?.dataUrl && (
                    <>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setActiveReceipt(expense.receipt)}
                      >
                        View Receipt
                      </button>
                      <a
                        className="secondary-link"
                        href={expense.receipt.dataUrl}
                        download={expense.receipt.fileName || 'receipt.png'}
                      >
                        Download Receipt
                      </a>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleDeleteReceipt(expense.id)}
                      >
                        Delete Receipt
                      </button>
                    </>
                  )}
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {activeReceipt && (
        <div className="scanner-overlay" role="dialog" aria-modal="true" aria-label="Receipt preview">
          <div className="receipt-viewer">
            <div className="scanner-header">
              <div>
                <p className="eyebrow">Receipt image</p>
                <h2>{activeReceipt.originalFileName || activeReceipt.fileName || 'Receipt'}</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveReceipt(null)}>
                x
              </button>
            </div>
            <img src={activeReceipt.dataUrl} alt="Receipt" />
            <a className="primary-button download-button" href={activeReceipt.dataUrl} download={activeReceipt.fileName || 'receipt.png'}>
              Download Receipt
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
