import { getLocalDate } from './dateUtils.js';

export function createEmptyScanDraft() {
  return {
    amount: '',
    merchant: '',
    category: 'Other',
    date: getLocalDate(),
    notes: '',
    paymentMethod: '',
    currency: 'INR',
    tax: '',
    invoiceNumber: '',
  };
}

export function isDuplicateReceipt(draft, expenses) {
  const normalizedMerchant = normalizeForMatch(draft.merchant);
  const amount = Number(draft.amount);

  if (!normalizedMerchant || !amount || !draft.date) {
    return false;
  }

  return expenses.some((expense) => {
    const sameMerchant = normalizeForMatch(expense.merchant || expense.note || '').includes(normalizedMerchant);
    const sameAmount = Math.abs(Number(expense.amount) - amount) < 0.01;
    const sameDate = expense.date === draft.date;
    const sameInvoice =
      draft.invoiceNumber &&
      expense.invoiceNumber &&
      normalizeForMatch(expense.invoiceNumber) === normalizeForMatch(draft.invoiceNumber);

    return sameInvoice || (sameMerchant && sameAmount && sameDate);
  });
}

function normalizeForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
