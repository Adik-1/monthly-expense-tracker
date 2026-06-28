import { Trash2 } from 'lucide-react';

export function ConfirmDeleteModal({ onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, padding: 28, maxWidth: 380, width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, textAlign: 'center', boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trash2 size={22} color="var(--red)" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--t1)' }}>Delete expense?</div>
          <div style={{ fontSize: '.825rem', color: 'var(--tm)', marginTop: 4 }}>This action cannot be undone.</div>
        </div>
        <div style={{ display: 'flex', gap: 12, width: '100%' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--surface2)', color: 'var(--t2)',
            fontWeight: 600, fontSize: '.85rem', cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px 0', borderRadius: 12, border: 'none',
            background: 'var(--red)', color: '#fff',
            fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(239,68,68,.35)',
          }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
