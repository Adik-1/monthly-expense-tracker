import { categories } from './constants.js';
import { getLocalDate } from './dateUtils.js';
import { createEmptyScanDraft } from './receiptData.js';

const currencyPatterns = [
  { currency: 'INR', patterns: [/₹/, /\bINR\b/i, /\bRs\.?\b/i, /\bRupees?\b/i] },
  { currency: 'USD', patterns: [/\$/, /\bUSD\b/i] },
  { currency: 'EUR', patterns: [/€/, /\bEUR\b/i] },
  { currency: 'GBP', patterns: [/£/, /\bGBP\b/i] },
];

const merchantAliases = [
  { merchant: 'Amazon', aliases: ['amazon', 'amaz0n', 'amazon.in', 'amazon india'] },
  { merchant: 'Starbucks', aliases: ['starbucks', 'starbuks', 'starbuck'] },
  { merchant: 'Uber', aliases: ['uber', 'uber trip', 'uber india'] },
  { merchant: 'Reliance Fresh', aliases: ['reliance fresh', 'reliance smart', 'reliance retail'] },
  { merchant: 'Indian Oil', aliases: ['indian oil', 'iocl', 'indianoil'] },
  { merchant: 'Netflix', aliases: ['netflix', 'netfl1x'] },
  { merchant: 'Swiggy', aliases: ['swiggy', 'sw1ggy'] },
  { merchant: 'Zomato', aliases: ['zomato', 'z0mato'] },
  { merchant: 'BigBasket', aliases: ['bigbasket', 'big basket'] },
  { merchant: 'DMart', aliases: ['dmart', 'd-mart', 'avenue supermarts'] },
  { merchant: 'Flipkart', aliases: ['flipkart', 'flip kart'] },
  { merchant: 'Myntra', aliases: ['myntra'] },
  { merchant: 'BookMyShow', aliases: ['bookmyshow', 'book my show'] },
  { merchant: 'Apollo Pharmacy', aliases: ['apollo pharmacy', 'apollo'] },
  { merchant: 'MakeMyTrip', aliases: ['makemytrip', 'make my trip'] },
  { merchant: 'Coursera', aliases: ['coursera'] },
];

const categoryRules = [
  {
    category: 'Food',
    keywords: ['starbucks', 'swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'pizza', 'burger'],
  },
  {
    category: 'Groceries',
    keywords: ['reliance fresh', 'bigbasket', 'dmart', 'grocery', 'supermarket', 'mart'],
  },
  {
    category: 'Shopping',
    keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'store', 'retail'],
  },
  {
    category: 'Fuel',
    keywords: ['indian oil', 'iocl', 'petrol', 'diesel', 'fuel', 'hp petrol', 'bharat petroleum'],
  },
  {
    category: 'Transport',
    keywords: ['uber', 'ola', 'metro', 'taxi', 'cab', 'train', 'bus'],
  },
  {
    category: 'Bills',
    keywords: ['electricity', 'water bill', 'broadband', 'airtel', 'jio', 'vi postpaid', 'bill'],
  },
  {
    category: 'Entertainment',
    keywords: ['netflix', 'prime video', 'spotify', 'bookmyshow', 'movie', 'cinema'],
  },
  {
    category: 'Medical',
    keywords: ['apollo', 'pharmacy', 'hospital', 'clinic', 'medicine', 'medical'],
  },
  {
    category: 'Travel',
    keywords: ['makemytrip', 'goibibo', 'hotel', 'flight', 'airlines', 'travel'],
  },
  {
    category: 'Education',
    keywords: ['coursera', 'udemy', 'school', 'college', 'course', 'tuition'],
  },
  {
    category: 'Salary',
    keywords: ['salary', 'payroll', 'income'],
  },
];

export function parseReceiptText(text, confidence) {
  const cleanText = normalizeWhitespace(text);
  const merchant = detectMerchant(cleanText);
  const amount = detectTotalAmount(cleanText);
  const date = detectDate(cleanText);
  const currency = detectCurrency(cleanText);
  const tax = detectTax(cleanText);
  const paymentMethod = detectPaymentMethod(cleanText);
  const invoiceNumber = detectInvoiceNumber(cleanText);
  const category = detectCategory(`${merchant} ${cleanText}`);
  const uncertainFields = [];

  if (!amount) uncertainFields.push('amount');
  if (!merchant) uncertainFields.push('merchant');
  if (!date) uncertainFields.push('date');
  if (!paymentMethod) uncertainFields.push('paymentMethod');
  if (confidence < 65) {
    uncertainFields.push('amount', 'merchant', 'date');
  }

  return {
    draft: {
      ...createEmptyScanDraft(),
      amount: amount ? String(amount) : '',
      merchant,
      category,
      date: date || getLocalDate(),
      notes: merchant ? `Receipt from ${merchant}` : 'Scanned receipt',
      paymentMethod,
      currency,
      tax: tax ? String(tax) : '',
      invoiceNumber,
    },
    ocrText: cleanText,
    confidence,
    uncertainFields: [...new Set(uncertainFields)],
    warning:
      confidence < 65
        ? "We couldn't read everything. Please review the highlighted fields before saving."
        : '',
  };
}

export function detectCategory(input) {
  const text = normalizeForMatch(input);
  const matchedRule = categoryRules.find((rule) =>
    rule.keywords.some((keyword) => text.includes(normalizeForMatch(keyword))),
  );

  if (matchedRule && categories.includes(matchedRule.category)) {
    return matchedRule.category;
  }

  return 'Other';
}

function normalizeWhitespace(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function normalizeForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function detectCurrency(text) {
  const matchedCurrency = currencyPatterns.find((currencyPattern) =>
    currencyPattern.patterns.some((pattern) => pattern.test(text)),
  );

  return matchedCurrency?.currency || 'INR';
}

function detectMerchant(text) {
  const normalizedText = normalizeForMatch(text);
  const matchedBrand = merchantAliases.find((brand) =>
    brand.aliases.some((alias) => {
      const normalizedAlias = normalizeForMatch(alias);

      return normalizedText.includes(normalizedAlias) || fuzzyContains(normalizedText, normalizedAlias);
    }),
  );

  if (matchedBrand) {
    return matchedBrand.merchant;
  }

  const firstUsefulLine = text
    .split('\n')
    .find((line) => /[a-zA-Z]{3}/.test(line) && !/invoice|receipt|tax|gst|total|amount/i.test(line));

  return firstUsefulLine ? titleCase(firstUsefulLine.slice(0, 40)) : '';
}

function detectTotalAmount(text) {
  const lines = text.split('\n');
  const candidates = [];

  lines.forEach((line, index) => {
    const amounts = extractAmounts(line);

    amounts.forEach((value) => {
      candidates.push({
        value,
        score: scoreAmountLine(line, index, lines.length),
      });
    });
  });

  if (candidates.length === 0) {
    return '';
  }

  candidates.sort((first, second) => {
    if (second.score !== first.score) {
      return second.score - first.score;
    }

    return second.value - first.value;
  });

  return candidates[0].value;
}

function extractAmounts(line) {
  const matches = [...line.matchAll(/(?:₹|Rs\.?|INR|\$|€|£)?\s*([0-9]+(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?)/gi)];

  return matches
    .map((match) => Number(match[1].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function scoreAmountLine(line, index, totalLines) {
  const lowerLine = line.toLowerCase();
  let score = 0;

  if (/grand\s*total|final\s*total|amount\s*due|net\s*payable|total\s*payable|balance\s*due/.test(lowerLine)) {
    score += 10;
  } else if (/\btotal\b/.test(lowerLine)) {
    score += 6;
  }

  if (/paid|card|upi|cash/.test(lowerLine)) score += 2;
  if (/subtotal|sub total|tax|gst|cgst|sgst|vat|change|saving|discount/.test(lowerLine)) score -= 5;
  if (index > totalLines * 0.55) score += 2;

  return score;
}

function detectTax(text) {
  const taxLine = text
    .split('\n')
    .find((line) => /\btax\b|gst|cgst|sgst|vat/i.test(line) && extractAmounts(line).length > 0);

  return taxLine ? extractAmounts(taxLine).at(-1) : '';
}

function detectPaymentMethod(text) {
  if (/\bupi\b|paytm|phonepe|gpay|google pay/i.test(text)) return 'UPI';
  if (/visa|mastercard|card|debit|credit/i.test(text)) return 'Card';
  if (/\bcash\b/i.test(text)) return 'Cash';
  if (/net banking|bank transfer/i.test(text)) return 'Bank Transfer';

  return '';
}

function detectInvoiceNumber(text) {
  const match = text.match(
    /\b(?:invoice|inv|bill|receipt|order)\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]{2,})/i,
  );

  return match?.[1] || '';
}

function detectDate(text) {
  const numericDate = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);

  if (numericDate) {
    const [, first, second, third] = numericDate;
    const year = normalizeYear(third);
    const dayFirst = Number(first) > 12;
    const day = dayFirst ? first : second;
    const month = dayFirst ? second : first;

    return formatDateParts(year, month, day);
  }

  const isoDate = text.match(/\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/);

  if (isoDate) {
    return formatDateParts(isoDate[1], isoDate[2], isoDate[3]);
  }

  const namedDate = text.match(
    /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})\b/i,
  );

  if (namedDate) {
    return formatDateParts(normalizeYear(namedDate[3]), monthNameToNumber(namedDate[2]), namedDate[1]);
  }

  return '';
}

function normalizeYear(year) {
  return year.length === 2 ? `20${year}` : year;
}

function formatDateParts(year, month, day) {
  const normalizedMonth = String(Number(month)).padStart(2, '0');
  const normalizedDay = String(Number(day)).padStart(2, '0');

  if (Number(normalizedMonth) < 1 || Number(normalizedMonth) > 12) return '';
  if (Number(normalizedDay) < 1 || Number(normalizedDay) > 31) return '';

  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

function monthNameToNumber(month) {
  const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(
    month.slice(0, 3).toLowerCase(),
  );

  return monthIndex + 1;
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

function fuzzyContains(text, target) {
  const words = text.split(' ');

  return words.some((word) => word.length >= 4 && levenshtein(word, target) <= 2);
}

function levenshtein(first, second) {
  const matrix = Array.from({ length: first.length + 1 }, () => []);

  for (let i = 0; i <= first.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= second.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= first.length; i += 1) {
    for (let j = 1; j <= second.length; j += 1) {
      const cost = first[i - 1] === second[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[first.length][second.length];
}
