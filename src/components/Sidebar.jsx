export function Sidebar({ activeView, setActiveView, isOpen, onClose }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '📋' },
    { id: 'charts', label: 'Analytics', icon: '📈' },
  ];

  return (
    <>
      <aside className={`sidebar${isOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💸</div>
          <div className="sidebar-logo-text">
            Expense Tracker
            <span>Personal Finance</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item${activeView === item.id ? ' active' : ''}`}
              onClick={() => { setActiveView(item.id); onClose(); }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Data saved locally<br />in your browser.
          </div>
        </div>
      </aside>
      {/* overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
