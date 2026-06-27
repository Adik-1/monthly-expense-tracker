import { LayoutDashboard, CreditCard, BarChart3, Wallet, Tag, Target, Settings, HelpCircle, X, TrendingUp, Zap } from 'lucide-react';

const NAV = [
  { section: 'MAIN', items: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'charts',   label: 'Analytics', icon: BarChart3 },
  ]},
  { section: 'MANAGE', items: [
    { id: 'budgets',    label: 'Budgets',    icon: Wallet },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'goals',      label: 'Goals',      icon: Target },
  ]},
  { section: 'OTHER', items: [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help',     label: 'Help',     icon: HelpCircle },
  ]},
];

const S = {
  aside: {
    position: 'fixed', top: 0, left: 0, height: '100%', width: 'var(--sidebar-w)',
    background: 'linear-gradient(180deg,#0f1623 0%,#0b0f1a 100%)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', zIndex: 40,
    transition: 'transform .3s ease',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '24px 20px 20px',
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#22c55e,#16a34a)',
    boxShadow: '0 4px 12px rgba(34,197,94,.35)',
  },
  logoText: { fontWeight: 700, fontSize: '.875rem', color: '#fff', lineHeight: 1.2 },
  logoSub: { fontSize: '.7rem', color: 'var(--tm)' },
  nav: { flex: 1, overflowY: 'auto', padding: '0 12px' },
  section: {
    fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em',
    textTransform: 'uppercase', color: 'var(--tm)',
    padding: '0 12px', margin: '16px 0 6px',
  },
  footer: { padding: '12px 12px 20px' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10, padding: 12,
    borderRadius: 14, background: 'rgba(255,255,255,.04)',
    border: '1px solid var(--border)',
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '.875rem',
    background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  },
};

export function Sidebar({ activeView, setActiveView, isOpen, onClose }) {
  function navigate(id) { setActiveView(id); onClose(); }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            display: 'block', position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)', zIndex: 30,
          }}
        />
      )}
      <aside style={{ ...S.aside, transform: isOpen ? 'translateX(0)' : undefined }}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}><Zap size={18} color="#fff" /></div>
          <div>
            <div style={S.logoText}>ExpenseTracker</div>
            <div style={S.logoSub}>Personal Finance</div>
          </div>
          {isOpen && (
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--tm)', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={S.nav}>
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div style={S.section}>{section}</div>
              {items.map(({ id, label, icon: Icon }) => {
                const active = activeView === id;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12, border: 'none',
                      background: active ? 'rgba(34,197,94,.1)' : 'transparent',
                      color: active ? 'var(--green)' : 'var(--t2)',
                      fontSize: '.825rem', fontWeight: 500, textAlign: 'left',
                      marginBottom: 2, cursor: 'pointer',
                      boxShadow: active ? 'inset 0 0 0 1px rgba(34,197,94,.2)' : 'none',
                      transition: 'all .15s',
                    }}
                  >
                    <Icon size={16} />
                    {label}
                    {active && (
                      <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={S.footer}>
          <div style={S.userCard}>
            <div style={S.avatar}>A</div>
            <div>
              <div style={{ fontSize: '.825rem', fontWeight: 600, color: '#fff' }}>Aditya</div>
              <div style={{ fontSize: '.7rem', color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={10} /> Pro Plan
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
