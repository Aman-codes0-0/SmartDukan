import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/shared/ThemeToggle';
import { toast } from '../components/shared/Toast';
import { Store, RotateCw, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login({ initialMode = 'login' }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isRegister =
    location.pathname === '/register' ||
    searchParams.get('mode') === 'register' ||
    initialMode === 'register';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(isRegister ? 'register' : 'login'); // 'login' | 'register'
  const [formData, setFormData] = useState({ shopName: '', ownerName: '', address: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/register' || searchParams.get('mode') === 'register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname, location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        shopName: formData.shopName.trim(),
        ownerName: formData.ownerName.trim(),
        name: formData.ownerName.trim(), // ensures compatibility with any backend schema expecting 'name' or 'ownerName'
        phone: phone.trim(),
        password: password.trim(),
        address: formData.address.trim(),
      });
      navigate('/');
      toast.success('Shop registered successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('registered') || msg.toLowerCase().includes('sign in')) {
        setMode('login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link to="/" className="auth-back-link" style={{ marginBottom: 0 }}>
            <ArrowLeft size={14} /> Back to Homepage
          </Link>
          <ThemeToggle variant="icon" style={{ width: 32, height: 32 }} />
        </div>

        <div className="auth-logo">
          <div className="logo-icon">
            <Store size={26} />
          </div>
          <h1>Smart Dukaan</h1>
          <p>Digital Kirana Management & Billing</p>
        </div>

        {/* Wispr Flow Segmented Pill Tab Switcher */}
        <div className="auth-segmented-pill-bar">
          <button
            type="button"
            className={`auth-segmented-pill ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-segmented-pill ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register Dukaan
          </button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RotateCw size={16} className="animate-spin" /> Verifying...
                </>
              ) : (
                'Sign In to Dukaan'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input
                className="form-control"
                placeholder="e.g. Sharma Kirana & General Store"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input
                className="form-control"
                placeholder="Dukaan Malik ka naam"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-control"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                title="Enter a valid 10-digit Indian mobile number"
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Shop Address (Optional)</label>
              <input
                className="form-control"
                placeholder="Market, Ward, City"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RotateCw size={16} className="animate-spin" /> Registering...
                </>
              ) : (
                'Register Shop'
              )}
            </button>
          </form>
        )}

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              Nayi dukaan hai?{' '}
              <a onClick={() => setMode('register')}>Apni dukaan register karein →</a>
            </>
          ) : (
            <>
              Pehle se registered hain?{' '}
              <a onClick={() => setMode('login')}>Sign in karein →</a>
            </>
          )}
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            fontSize: 11,
            color: '#64748b',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ShieldCheck size={13} style={{ color: '#22c55e' }} /> Encrypted & Secure
          </span>
          <span>•</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Sparkles size={13} style={{ color: '#38bdf8' }} /> Cloud Sync
          </span>
        </div>
      </div>
    </div>
  );
}
