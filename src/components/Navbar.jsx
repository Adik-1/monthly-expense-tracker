const VIEW_TITLES = {
  dashboard: 'Dashboard',
  expenses: 'Expenses',
  charts: 'Analytics',
};

export function Navbar({ activeView, darkMode, setDarkMode, onMenuToggle }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-btn" onClick={onMenuToggle} aria-label="Open menu">
          ☰
        </button>
        <div>
          <div className="topbar-title">{VIEW_TITLES[activeView]}</div>
          <div className="breadcrumb">Expense Tracker / {VIEW_TITLES[activeView]}</div>
        </div>
      </div>
      <div className="topbar-right">
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </span>
        <button
          className={`theme-toggle${darkMode ? ' active' : ''}`}
          onClick={() => setDarkMode(d => !d)}
          aria-label="Toggle dark mode"
        />
      </div>
    </header>
  );
}
