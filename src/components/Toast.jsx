import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, removing: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220);
    }, 2800);
  }, []);

  return { toasts, addToast };
}

const ICONS = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast${t.removing ? ' removing' : ''}`}>
          <span className="toast-icon">{ICONS[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
