import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { createWorker } from 'tesseract.js';
import { createEmptyScanDraft } from './receiptData.js';
import { parseReceiptText } from './receiptParser.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const scannerMessages = [
  'Reading receipt...',
  'Detecting merchant...',
  'Finding total...',
  'Almost done...',
];

export async function prepareReceiptFile(file) {
  if (file.type === 'application/pdf') {
    const dataUrl = await renderFirstPdfPage(file);

    return {
      dataUrl,
      fileName: `${removeExtension(file.name)}-page-1.png`,
      originalFileName: file.name,
      mimeType: 'image/png',
      originalMimeType: file.type,
    };
  }

  return {
    dataUrl: await fileToDataUrl(file),
    fileName: file.name,
    originalFileName: file.name,
    mimeType: file.type || 'image/*',
    originalMimeType: file.type || 'image/*',
  };
}

export async function scanReceiptFile(file, onProgress) {
  const preparedFile = await prepareReceiptFile(file);

  if (!navigator.onLine) {
    return {
      draft: {
        ...createEmptyScanDraft(),
        notes: 'Saved while offline. Re-scan when internet is available if OCR assets are not cached.',
      },
      receipt: {
        ...preparedFile,
        pendingScan: true,
        scannedAt: new Date().toISOString(),
      },
      ocrText: '',
      confidence: 0,
      uncertainFields: ['amount', 'merchant', 'date', 'paymentMethod'],
      warning: 'You appear to be offline. The receipt image was kept so you can save manually or re-scan later.',
    };
  }

  onProgress?.({ message: scannerMessages[0], progress: 0.1 });

  const worker = await createWorker('eng', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.({
          message: pickScannerMessage(message.progress),
          progress: Math.max(0.15, message.progress),
        });
      }
    },
  });

  try {
    const result = await worker.recognize(preparedFile.dataUrl);
    const parsed = parseReceiptText(result.data.text, result.data.confidence ?? 0);

    return {
      ...parsed,
      receipt: {
        ...preparedFile,
        pendingScan: false,
        scannedAt: new Date().toISOString(),
      },
    };
  } finally {
    await worker.terminate();
  }
}

export async function rescanSavedReceipt(receipt, onProgress) {
  onProgress?.({ message: scannerMessages[0], progress: 0.1 });

  const worker = await createWorker('eng', 1, {
    logger: (message) => {
      if (message.status === 'recognizing text') {
        onProgress?.({
          message: pickScannerMessage(message.progress),
          progress: Math.max(0.15, message.progress),
        });
      }
    },
  });

  try {
    const result = await worker.recognize(receipt.dataUrl);
    const parsed = parseReceiptText(result.data.text, result.data.confidence ?? 0);

    return {
      ...parsed,
      receipt: {
        ...receipt,
        pendingScan: false,
        rescannedAt: new Date().toISOString(),
      },
    };
  } finally {
    await worker.terminate();
  }
}

function pickScannerMessage(progress) {
  if (progress < 0.3) return scannerMessages[0];
  if (progress < 0.55) return scannerMessages[1];
  if (progress < 0.82) return scannerMessages[2];
  return scannerMessages[3];
}

async function renderFirstPdfPage(file) {
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return canvas.toDataURL('image/png');
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function removeExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, '');
}
