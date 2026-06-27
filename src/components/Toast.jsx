import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID();
    setToasts(p => [...p, { id, message, type, out: false }]);
    setTimeout(() => {
      setToasts(p => p.map(t => t.id === id ? { ...t, out: true } : t));
      setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 300);
    }, 3000);
  }, []);
  return { toasts, addToast };
}

const ICONS = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
const COLORS = {
  success: { bg: 'rgba(34,197,94,.12)',  border: 'rgba(34,197,94,.25)',  color: '#22c55e' },
  error:   { bg: 'rgba(239,68,68,.12)',  border: 'rgba(239,68,68,.25)',  color: '#ef4444' },
  info:    { bg: 'rgba(59,130,246,.12)', border: 'rgba(59,130,246,.25)', color: '#3b82f6' },
  warning: { bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.25)', color: '#f59e0b' },
};

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      {toasts.map(t => {
        const Icon = ICONS[t.type] ?? Info;
        const c = COLORS[t.type] ?? COLORS.info;
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
            borderRadius: 14, fontSize: '.825rem', fontWeight: 500,
            background: c.bg, border: `1px solid ${c.border}`, color: 'var(--t1)',
            backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-lg)',
            minWidth: 220,
            opacity: t.out ? 0 : 1, transform: t.out ? 'translateX(20px)' : 'translateX(0)',
            transition: 'opacity .3s, transform .3s',
          }}>
            <Icon size={16} color={c.color} style={{ flexShrink: 0 }} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
