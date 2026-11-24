import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Menu, Receipt, Store } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // For billing page, Billing.jsx can handle its custom full-screen GoBill POS header
  const isBilling = location.pathname === '/billing';

  if (isBilling) {
    return (
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {typeof children === 'function' ? children({ toggleSidebar: () => setSidebarOpen(prev => !prev), timeStr }) : children}
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content">
        {/* Global GoBill Top Header Bar */}
        <header className="gobill-header">
          <div className="gobill-header-left">
            <button
              className="gobill-menu-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="gobill-brand">
              <Store size={18} style={{ color: '#38bdf8' }} />
              <span>Smart Dukaan</span>
            </div>
            <span className="gobill-time-badge">{timeStr}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle variant="icon" />
            <Link
              to="/billing"
              className="btn btn-sm btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Receipt size={14} />
              Open Billing POS
            </Link>
            {user?.shop && (
              <span style={{ fontSize: 12, color: 'var(--pos-header-muted)', fontWeight: 500 }}>
                {user.shop.name}
              </span>
            )}
          </div>
        </header>

        <div className="fade-in" style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
