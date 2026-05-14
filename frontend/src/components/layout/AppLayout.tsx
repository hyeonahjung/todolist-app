import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export function AppLayout() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearAuth();
    navigate('/auth', { replace: true });
  }

  const headerStyle: React.CSSProperties = {
    background: 'var(--color-primary)',
    color: 'var(--color-text-on-primary)',
    padding: '0 var(--space-6)',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'var(--shadow-sm)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const logoStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-bold)' as React.CSSProperties['fontWeight'],
    fontSize: 'var(--font-size-lg)',
    color: 'var(--color-text-on-primary)',
    letterSpacing: '-0.3px',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
  };

  const navLinkStyle: React.CSSProperties = {
    color: 'var(--color-text-on-primary)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
    opacity: 0.9,
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-sm)',
    transition: 'opacity var(--duration-fast)',
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-sm)',
    opacity: 0.85,
  };

  const logoutBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.2)',
    color: 'var(--color-text-on-primary)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 'var(--radius-sm)',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)' as React.CSSProperties['fontWeight'],
  };

  const hamburgerBtnStyle: React.CSSProperties = {
    background: 'none',
    color: 'var(--color-text-on-primary)',
    display: 'none',
    padding: 'var(--space-1)',
  };

  const mobileNavStyle: React.CSSProperties = {
    display: menuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    background: 'var(--color-primary-dark)',
    padding: 'var(--space-4) var(--space-6)',
    gap: 'var(--space-3)',
  };

  return (
    <div>
      <style>{`
        @media (max-width: 640px) {
          .app-nav { display: none !important; }
          .app-hamburger { display: flex !important; }
        }
      `}</style>
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>TodoListApp</Link>
        <nav className="app-nav" style={navStyle}>
          <Link to="/" style={navLinkStyle}>할일 목록</Link>
          <Link to="/categories" style={navLinkStyle}>카테고리</Link>
          <Link to="/profile" style={userNameStyle}>{user?.name ?? ''}</Link>
          <button style={logoutBtnStyle} onClick={handleLogout}>로그아웃</button>
        </nav>
        <button
          className="app-hamburger"
          style={hamburgerBtnStyle}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
      <div style={mobileNavStyle}>
        <Link to="/" style={navLinkStyle} onClick={() => setMenuOpen(false)}>할일 목록</Link>
        <Link to="/categories" style={navLinkStyle} onClick={() => setMenuOpen(false)}>카테고리</Link>
        <Link to="/profile" style={navLinkStyle} onClick={() => setMenuOpen(false)}>{user?.name ?? ''}</Link>
        <button style={{ ...logoutBtnStyle, alignSelf: 'flex-start' }} onClick={handleLogout}>로그아웃</button>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
