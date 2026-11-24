import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  Receipt,
  Package,
  CreditCard,
  TrendingDown,
  BarChart3,
  Store,
  User,
  LogOut,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/billing', icon: Receipt, label: 'Billing / POS', end: false },
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/udhaar', icon: CreditCard, label: 'Udhaar (Credit)' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? '' : 'drawer-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">
              <Store size={20} />
            </div>
            <div className="logo-text">
              <h2>Smart Dukaan</h2>
              <span>Retail POS System</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="shop-info">
              <div className="shop-name">
                <Store size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                {user.shop?.name || 'My Kirana Store'}
              </div>
              <div className="shop-owner">
                <User size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
                {user.name}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mode</span>
            <ThemeToggle variant="pill" />
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <span className="nav-icon">
              <LogOut size={18} />
            </span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
