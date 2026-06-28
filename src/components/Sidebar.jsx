import { LayoutDashboard, CreditCard, BarChart3, Wallet, Tag, Target, Settings, HelpCircle, X, TrendingUp, Zap } from 'lucide-react';

const NAV = [
  { section: 'MAIN', items: [
    { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
    { id: 'expenses',   label: 'Expenses',   icon: CreditCard },
    { id: 'charts',     label: 'Analytics',  icon: BarChart3 },
  ]},
  { section: 'MANAGE', items: [
    { id: 'budgets',    label: 'Budgets',    icon: Wallet },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'goals',      label: 'Goals',      icon: Target },
  ]},
  { section: 'OTHER', items: [
    { id: 'settings',   label: 'Settings',   icon: Settings },
    { id: 'help',       label: 'Help',       icon: HelpCircle },
  ]},
];

export function Sidebar({ activeView, setActiveView, isOpen, onClose }) {
  function navigate(id) { setActiveView(id); onClose(); }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100%', width: 'var(--sidebar-w)',
        display: 'flex', flexDirection: 'column', zIndex: 40,
        background: 'var(--sidebar-bg, var(--surface))',
        borderRight: '1px solid var(--border)',
        transition: 'transform .3s ease',
        transform: isOpen ? 'translateX(0)' : undefined,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 20px 20px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            boxShadow: '0 4px 12px rgba(34,197,94,.35)',
          }}>
            <Zap size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--t1)', lineHeight: 1.2 }}>ExpenseTracker</div>
            <div style={{ fontSize: '.7rem', color: 'var(--tm)' }}>Personal Finance</div>
          </div>
          {isOpen && (
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--tm)', cursor: 'pointer', display: 'flex', padding: 4 }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {NAV.map(({ section, items }) => (
            <div key={section}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--tm)', padding: '0 12px', margin: '16px 0 6px' }}>
                {section}
              </div>
              {items.map(({ id, label, icon: Icon }) => {
                const active = activeView === id;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12, border: 'none', textAlign: 'left',
                      fontSize: '.825rem', fontWeight: 500, marginBottom: 2, cursor: 'pointer',
                      transition: 'all .15s',
                      background: active ? 'var(--green-dim)' : 'transparent',
                      color: active ? 'var(--green)' : 'var(--t2)',
                      boxShadow: active ? 'inset 0 0 0 1px rgba(34,197,94,.2)' : 'none',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--border)'; e.currentTarget.style.color = 'var(--t1)'; } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)'; } }}
                  >
                    <Icon size={16} />
                    {label}
                    {active && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User card */}
        <div style={{ padding: '12px 12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, background: 'var(--border)', border: '1px solid var(--border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.875rem', color: '#fff', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '.825rem', fontWeight: 600, color: 'var(--t1)' }}>Aditya</div>
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
