import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'expense-tracker-v2';
const BUDGET_KEY = 'expense-tracker-budget';

export const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment',
  'Bills', 'Health', 'Education', 'Other'
];

export const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Bills: '💡', Health: '❤️',
  Education: '📚', Other: '📦'
};

export const CATEGORY_COLORS = {
  Food: '#F59E0B', Transport: '#3B82F6', Shopping: '#8B5CF6',
  Entertainment: '#EC4899', Bills: '#EF4444', Health: '#22C55E',
  Education: '#06B6D4', Other: '#94A3B8'
};

function loadExpenses() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(e => ({ ...e, amount: Number(e.amount) }));
  } catch { return []; }
}

function loadBudget() {
  return localStorage.getItem(BUDGET_KEY) ?? '';
}

export function useExpenses() {
  const [expenses, setExpenses] = useState(loadExpenses);
  const [monthlyBudget, setMonthlyBudget] = useState(loadBudget);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(BUDGET_KEY, monthlyBudget);
  }, [monthlyBudget]);

  const addExpense = useCallback((expense) => {
    setExpenses(prev => [{ ...expense, id: crypto.randomUUID() }, ...prev]);
  }, []);

  const deleteExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const editExpense = useCallback((id, updates) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates, amount: Number(updates.amount) } : e));
  }, []);

  return { expenses, monthlyBudget, setMonthlyBudget, addExpense, deleteExpense, editExpense };
}

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

export function getCurrentMonthKey() {
  return getToday().slice(0, 7);
}

export function computeStats(expenses) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const currentMonth = getCurrentMonthKey();
  const thisMonth = expenses
    .filter(e => e.date?.startsWith(currentMonth))
    .reduce((s, e) => s + e.amount, 0);
  const largest = expenses.length ? Math.max(...expenses.map(e => e.amount)) : 0;

  const catCounts = {};
  expenses.forEach(e => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
  const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const catTotals = {};
  CATEGORIES.forEach(c => { catTotals[c] = 0; });
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });

  return { total, thisMonth, largest, topCategory, catTotals, count: expenses.length };
}

export function exportCSV(expenses) {
  const rows = [
    ['Date', 'Category', 'Amount', 'Note'],
    ...expenses.map(e => [e.date, e.category, e.amount.toFixed(2), `"${(e.note || '').replace(/"/g, '""')}"`])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expenses-${getCurrentMonthKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
