import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';

export function Navbar({ darkMode, setDarkMode, onMenuToggle }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const iconBtn = {
    width: 34, height: 34, borderRadius: 10, border: 'none',
    background: 'transparent', color: 'var(--t2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background .15s',
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={onMenuToggle} style={{ ...iconBtn, display: 'flex' }}
          className="mobile-menu-btn">
          <Menu size={20} />
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', lineHeight: 1.2 }}>
            {greeting}, Aditya 👋
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--tm)', marginTop: 2 }}>
            Here's your financial overview for today.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={iconBtn}><Search size={17} /></button>
        <button style={{ ...iconBtn, position: 'relative' }}>
          <Bell size={17} />
          <span style={{
            position: 'absolute', top: 7, right: 7,
            width: 6, height: 6, borderRadius: '50%', background: 'var(--green)',
          }} />
        </button>
        <button style={iconBtn} onClick={() => setDarkMode(d => !d)}>
          {darkMode ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', marginLeft: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '.8rem', flexShrink: 0,
          background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
        }}>A</div>
      </div>
    </header>
  );
}
