import { useRef, useState } from 'react';
import { createEmptyScanDraft, isDuplicateReceipt } from './receiptData.js';

const fieldLabels = {
  amount: 'Amount',
  merchant: 'Merchant',
  category: 'Category',
  date: 'Date',
  notes: 'Notes',
  paymentMethod: 'Payment method',
  currency: 'Currency',
  tax: 'Tax',
  invoiceNumber: 'Invoice number',
};

export default function ReceiptScanner({ categories, expenses, isOpen, onClose, onSaveExpense }) {
  const cameraInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [draft, setDraft] = useState(createEmptyScanDraft);
  const [receipt, setReceipt] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [warning, setWarning] = useState('');
  const [uncertainFields, setUncertainFields] = useState([]);
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const scannedExpenses = expenses.filter((expense) => expense.receipt?.dataUrl);
  const hasDuplicate = isDuplicateReceipt(draft, expenses);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    await runScan(file);
  }

  async function runScan(file) {
    setStatus('scanning');
    setScanMessage('Reading receipt...');
    setScanProgress(0.08);
    setError('');
    setWarning('');
    setUncertainFields([]);

    try {
      const { scanReceiptFile } = await loadScannerEngine();
      const scanResult = await scanReceiptFile(file, ({ message, progress }) => {
        setScanMessage(message);
        setScanProgress(progress);
      });

      setDraft(scanResult.draft);
      setReceipt({
        ...scanResult.receipt,
        ocrText: scanResult.ocrText,
        confidence: scanResult.confidence,
      });
      setOcrText(scanResult.ocrText);
      setConfidence(scanResult.confidence);
      setWarning(scanResult.warning);
      setUncertainFields(scanResult.uncertainFields);
      setStatus('preview');
      setScanProgress(1);
    } catch (scanError) {
      try {
        const { prepareReceiptFile } = await loadScannerEngine();
        const preparedReceipt = await prepareReceiptFile(file);

        setDraft({
          ...createEmptyScanDraft(),
          notes: 'Receipt saved for manual entry. OCR could not read everything.',
        });
        setReceipt({
          ...preparedReceipt,
          pendingScan: true,
          scannedAt: new Date().toISOString(),
          ocrText: '',
          confidence: 0,
        });
        setOcrText('');
        setConfidence(0);
        setWarning("We couldn't read everything. Please enter the highlighted fields manually.");
        setUncertainFields(['amount', 'merchant', 'date', 'paymentMethod']);
        setStatus('preview');
      } catch {
        setStatus('idle');
        setError(
          scanError instanceof Error
            ? scanError.message
            : "We couldn't scan this receipt. You can still upload a clearer image and try again.",
        );
      }
    }
  }

  async function handleRescan(savedReceipt) {
    if (!navigator.onLine) {
      setWarning('You are offline. Re-scan when you are back online.');
      return;
    }

    setStatus('scanning');
    setScanMessage('Reading receipt...');
    setScanProgress(0.08);
    setError('');

    try {
      const { rescanSavedReceipt } = await loadScannerEngine();
      const scanResult = await rescanSavedReceipt(savedReceipt, ({ message, progress }) => {
        setScanMessage(message);
        setScanProgress(progress);
      });

      setDraft(scanResult.draft);
      setReceipt({
        ...scanResult.receipt,
        ocrText: scanResult.ocrText,
        confidence: scanResult.confidence,
      });
      setOcrText(scanResult.ocrText);
      setConfidence(scanResult.confidence);
      setWarning(scanResult.warning);
      setUncertainFields(scanResult.uncertainFields);
      setStatus('preview');
      setScanProgress(1);
    } catch (scanError) {
      setStatus('idle');
      setError(scanError instanceof Error ? scanError.message : 'Re-scan failed. Try again with a clearer image.');
    }
  }

  function updateDraft(field, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  async function loadScannerEngine() {
    return import('./receiptScanner.js');
  }

  function handleSaveScannedExpense() {
    if (hasDuplicate || !receipt) {
      return;
    }

    onSaveExpense({
      id: crypto.randomUUID(),
      amount: Number(draft.amount),
      category: draft.category,
      date: draft.date,
      note: draft.notes.trim(),
      merchant: draft.merchant.trim(),
      paymentMethod: draft.paymentMethod.trim(),
      currency: draft.currency.trim(),
      tax: draft.tax === '' ? '' : Number(draft.tax),
      invoiceNumber: draft.invoiceNumber.trim(),
      source: 'receipt-scan',
      receipt: {
        ...receipt,
        ocrText,
        confidence,
      },
    });

    handleReset();
    onClose();
  }

  function handleReset() {
    setStatus('idle');
    setScanMessage('');
    setScanProgress(0);
    setDraft(createEmptyScanDraft());
    setReceipt(null);
    setOcrText('');
    setConfidence(null);
    setWarning('');
    setUncertainFields([]);
    setError('');
  }

  function fieldClassName(fieldName) {
    return uncertainFields.includes(fieldName) ? 'field field--uncertain' : 'field';
  }

  return (
    <div className="scanner-overlay" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
      <div className="scanner-modal">
        <div className="scanner-header">
          <div>
            <p className="eyebrow">AI receipt scanner</p>
            <h2 id="scanner-title">Scan Receipt</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close scanner">
            x
          </button>
        </div>

        <div className="scanner-options">
          <button className="secondary-button" type="button" onClick={() => cameraInputRef.current?.click()}>
            Camera
          </button>
          <button className="secondary-button" type="button" onClick={() => imageInputRef.current?.click()}>
            Upload Image
          </button>
          <button className="secondary-button" type="button" onClick={() => pdfInputRef.current?.click()}>
            Upload PDF
          </button>
        </div>

        <input
          ref={cameraInputRef}
          className="hidden-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />
        <input
          ref={imageInputRef}
          className="hidden-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <input
          ref={pdfInputRef}
          className="hidden-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {status === 'scanning' && (
          <div className="scanner-loading">
            <div className="receipt-scan-visual">
              <span />
            </div>
            <p>{scanMessage}</p>
            <div className="progress-track" aria-label="OCR progress">
              <div style={{ width: `${Math.round(scanProgress * 100)}%` }} />
            </div>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        {warning && <p className="budget-message budget-message--warning">{warning}</p>}

        {status === 'preview' && (
          <div className="scanner-preview">
            <div className="receipt-preview">
              {receipt?.dataUrl ? (
                <img src={receipt.dataUrl} alt="Scanned receipt preview" />
              ) : (
                <p className="empty-state">No receipt image available.</p>
              )}
            </div>

            <form className="scanner-form" onSubmit={(event) => event.preventDefault()}>
              <div className={fieldClassName('amount')}>
                <label htmlFor="scan-amount">{fieldLabels.amount}</label>
                <input
                  id="scan-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.amount}
                  onChange={(event) => updateDraft('amount', event.target.value)}
                  required
                />
              </div>

              <div className={fieldClassName('merchant')}>
                <label htmlFor="scan-merchant">{fieldLabels.merchant}</label>
                <input
                  id="scan-merchant"
                  type="text"
                  value={draft.merchant}
                  onChange={(event) => updateDraft('merchant', event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="scan-category">{fieldLabels.category}</label>
                <select
                  id="scan-category"
                  value={draft.category}
                  onChange={(event) => updateDraft('category', event.target.value)}
                  required
                >
                  {categories.map((categoryName) => (
                    <option key={categoryName} value={categoryName}>
                      {categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={fieldClassName('date')}>
                <label htmlFor="scan-date">{fieldLabels.date}</label>
                <input
                  id="scan-date"
                  type="date"
                  value={draft.date}
                  onChange={(event) => updateDraft('date', event.target.value)}
                  required
                />
              </div>

              <div className={fieldClassName('paymentMethod')}>
                <label htmlFor="scan-payment-method">{fieldLabels.paymentMethod}</label>
                <input
                  id="scan-payment-method"
                  type="text"
                  value={draft.paymentMethod}
                  onChange={(event) => updateDraft('paymentMethod', event.target.value)}
                  placeholder="Cash, Card, UPI..."
                />
              </div>

              <div className="field">
                <label htmlFor="scan-currency">{fieldLabels.currency}</label>
                <input
                  id="scan-currency"
                  type="text"
                  value={draft.currency}
                  onChange={(event) => updateDraft('currency', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="scan-tax">{fieldLabels.tax}</label>
                <input
                  id="scan-tax"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.tax}
                  onChange={(event) => updateDraft('tax', event.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="field">
                <label htmlFor="scan-invoice">{fieldLabels.invoiceNumber}</label>
                <input
                  id="scan-invoice"
                  type="text"
                  value={draft.invoiceNumber}
                  onChange={(event) => updateDraft('invoiceNumber', event.target.value)}
                  placeholder="Optional"
                />
              </div>

              <div className="field field--full">
                <label htmlFor="scan-notes">{fieldLabels.notes}</label>
                <textarea
                  id="scan-notes"
                  value={draft.notes}
                  onChange={(event) => updateDraft('notes', event.target.value)}
                  rows="3"
                />
              </div>
            </form>

            {confidence !== null && (
              <p className="confidence-note">OCR confidence: {Math.round(confidence)}%</p>
            )}

            {hasDuplicate && (
              <p className="duplicate-warning">
                This looks like a receipt you already scanned. Saving is disabled to avoid a duplicate expense.
              </p>
            )}

            <div className="scanner-actions">
              <button className="secondary-button" type="button" onClick={handleReset}>
                Scan another
              </button>
              <button
                className="primary-button"
                type="button"
                disabled={hasDuplicate || !draft.amount || !draft.merchant || !draft.date}
                onClick={handleSaveScannedExpense}
              >
                Save expense
              </button>
            </div>
          </div>
        )}

        <div className="receipt-history">
          <h3>Scanned receipt history</h3>
          {scannedExpenses.length === 0 ? (
            <p className="empty-state">No scanned receipts yet.</p>
          ) : (
            <ul>
              {scannedExpenses.map((expense) => (
                <li key={expense.id}>
                  <span>
                    {expense.merchant || expense.category} - {expense.currency || ''} {Number(expense.amount).toFixed(2)}
                  </span>
                  <div>
                    <a href={expense.receipt.dataUrl} download={expense.receipt.fileName || 'receipt.png'}>
                      Download
                    </a>
                    <button type="button" onClick={() => handleRescan(expense.receipt)}>
                      Re-scan
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
