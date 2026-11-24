import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/shared/ThemeToggle';
import { QRCodeSVG } from 'qrcode.react';
import {
  Store,
  Receipt,
  CreditCard,
  Package,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Plus,
  ChevronRight,
  BarChart3,
  Check,
} from 'lucide-react';

const DEMO_ITEMS = [
  { id: 1, name: 'Aashirvaad Shudh Chakki Atta', size: '5 kg', price: 235 },
  { id: 2, name: 'Fortune Sunlite Refined Oil', size: '1 L', price: 135 },
  { id: 3, name: 'Amul Butter Pasteurised', size: '100 g', price: 58 },
  { id: 4, name: 'Tata Salt Vacuum Evaporated', size: '1 kg', price: 28 },
];

export default function Home() {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [activeModule, setActiveModule] = useState('billing'); // 'billing' | 'udhaar' | 'reports'

  // Interactive Live POS Simulator State
  const [simCart, setSimCart] = useState([
    { id: 1, name: 'Aashirvaad Shudh Chakki Atta', price: 235, qty: 1 },
    { id: 3, name: 'Amul Butter Pasteurised', price: 58, qty: 2 },
  ]);
  const [simPayment, setSimPayment] = useState('UPI'); // 'UPI' | 'CASH' | 'UDHAAR'

  const addToSimCart = (item) => {
    setSimCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };

  const updateSimQty = (id, delta) => {
    setSimCart((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const simSubtotal = simCart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const simDiscount = simSubtotal > 200 ? 20 : 0;
  const simTotal = Math.max(0, simSubtotal - simDiscount);

  // Dynamic Theme Tokens
  const t = {
    canvas: isDark ? '#090a0f' : '#f8fafc',
    textHead: isDark ? '#ffffff' : '#0f172a',
    textBody: isDark ? '#94a3b8' : '#475569',
    textMuted: isDark ? '#64748b' : '#64748b',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.035)' : '#ffffff',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    cardShadow: isDark ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
    pillBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9',
    pillText: isDark ? '#cbd5e1' : '#334155',
    navBg: isDark ? 'rgba(14, 17, 23, 0.85)' : 'rgba(255, 255, 255, 0.92)',
    navBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    navShadow: isDark ? '0 10px 30px -10px rgba(0, 0, 0, 0.5)' : '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
    simBg: isDark ? 'rgba(15, 20, 30, 0.85)' : '#ffffff',
    simBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
    simCardBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
    simCardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    ctaPrimaryBg: isDark ? '#ffffff' : '#090a0f',
    ctaPrimaryText: isDark ? '#090a0f' : '#ffffff',
    ctaSecondaryBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    ctaSecondaryBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
    ctaSecondaryText: isDark ? '#ffffff' : '#0f172a',
    footerBg: isDark ? '#07080b' : '#f1f5f9',
    footerBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
  };

  return (
    <div
      style={{
        background: t.canvas,
        color: t.textBody,
        minHeight: '100vh',
        fontFamily: "var(--font-sans, 'Figtree', sans-serif)",
        overflowX: 'hidden',
        position: 'relative',
        transition: 'background 0.25s ease, color 0.25s ease',
      }}
    >
      {/* ── AMBIENT BACKGROUND GLOWS ───────────────────────────── */}
      <div
        style={{
          position: 'fixed',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '550px',
          background: isDark
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.08) 45%, rgba(9, 10, 15, 0) 70%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(99, 102, 241, 0.04) 45%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '40%',
          right: '-200px',
          width: '600px',
          height: '600px',
          background: isDark
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, rgba(9, 10, 15, 0) 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.04) 0%, rgba(248, 250, 252, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── TOP ANNOUNCEMENT BANNER ────────────────────────────── */}
      <div
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          borderBottom: `1px solid ${t.cardBorder}`,
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '12.5px',
          color: t.textBody,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          position: 'relative',
          zIndex: 60,
        }}
      >
        <span
          style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#0284c7',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '11px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          New
        </span>
        <span>Smart Dukaan 2.0 with Real UPI QR Codes & Thermal Receipt Printing is live!</span>
        <Link to="/register" style={{ color: t.textHead, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Try it free <ChevronRight size={13} />
        </Link>
      </div>

      {/* ── FLOATING ISLAND GLASS NAVBAR ───────────────────────── */}
      <div style={{ position: 'sticky', top: 16, zIndex: 100, padding: '0 20px', marginTop: 12 }}>
        <header
          style={{
            maxWidth: 1060,
            margin: '0 auto',
            background: t.navBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${t.navBorder}`,
            borderRadius: '9999px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: t.navShadow,
            transition: 'all 0.25s ease',
          }}
        >
          {/* Left: Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: t.textHead, paddingLeft: 6 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(56, 189, 248, 0.35)',
              }}
            >
              <Store size={17} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: t.textHead }}>Smart Dukaan</span>
          </Link>

          {/* Middle: Wispr-style Segmented Pill Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
              border: `1px solid ${t.cardBorder}`,
              borderRadius: '9999px',
              padding: '3px 4px',
              gap: 2,
            }}
            className="nav-links-desktop"
          >
            {[
              { id: 'billing', label: 'POS Billing' },
              { id: 'udhaar', label: 'Udhaar Khata' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'reports', label: 'Daily Profit' },
            ].map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                onClick={() => setActiveModule(tab.id)}
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: activeModule === tab.id ? t.textHead : t.textBody,
                  background: activeModule === tab.id ? (isDark ? 'rgba(255, 255, 255, 0.09)' : '#ffffff') : 'transparent',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  boxShadow: activeModule === tab.id && !isDark ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </a>
            ))}
          </div>

          {/* Right: Theme Toggle & Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle variant="icon" />
            {user ? (
              <Link
                to="/dashboard"
                style={{
                  background: t.ctaPrimaryBg,
                  color: t.ctaPrimaryText,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '8px 18px',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: isDark ? '0 4px 14px rgba(255, 255, 255, 0.18)' : '0 4px 14px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.15s',
                }}
              >
                <span>Dashboard</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    color: t.textBody,
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    transition: 'color 0.15s',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    background: t.ctaPrimaryBg,
                    color: t.ctaPrimaryText,
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: isDark ? '0 4px 14px rgba(255, 255, 255, 0.18)' : '0 4px 14px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>Register Free</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <section style={{ maxWidth: 940, margin: '0 auto', textAlign: 'center', padding: '70px 24px 60px', position: 'relative', zIndex: 10 }}>
        {/* Editorial Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            borderRadius: '9999px',
            background: t.pillBg,
            border: `1px solid ${t.cardBorder}`,
            color: t.textBody,
            fontSize: '12.5px',
            fontWeight: 500,
            marginBottom: 28,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>Made specifically for Indian Kirana & Retail Shopkeepers</span>
        </div>

        {/* Wispr Headline: Bold Sans + Editorial Garamond Italic Accent */}
        <h1
          style={{
            fontSize: 'clamp(38px, 6vw, 68px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            lineHeight: 1.1,
            color: t.textHead,
            marginBottom: 22,
          }}
        >
          Apni Dukaan ko do ek{' '}
          <span
            style={{
              fontFamily: "var(--font-serif, 'EB Garamond', Georgia, serif)",
              fontStyle: 'italic',
              fontWeight: 500,
              color: '#38bdf8',
              letterSpacing: '-0.01em',
            }}
          >
            smart
          </span>{' '}
          pehchaan.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            color: t.textBody,
            lineHeight: 1.55,
            maxWidth: 680,
            margin: '0 auto 36px',
            fontWeight: 400,
          }}
        >
          Replace torn paper notebooks and lost credits. Enjoy 10-second POS billing, instant customer WhatsApp reminders, and real-time daily profit analytics.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/register"
            style={{
              background: t.ctaPrimaryBg,
              color: t.ctaPrimaryText,
              padding: '14px 30px',
              borderRadius: '9999px',
              fontSize: '15.5px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isDark ? '0 6px 25px rgba(255, 255, 255, 0.22)' : '0 6px 25px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <span>Start Free — Register Dukaan</span>
            <ArrowRight size={17} />
          </Link>
          <a
            href="#demo"
            style={{
              background: t.ctaSecondaryBg,
              color: t.ctaSecondaryText,
              border: `1px solid ${t.ctaSecondaryBorder}`,
              padding: '14px 28px',
              borderRadius: '9999px',
              fontSize: '15.5px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Try POS Simulator ↓</span>
          </a>
        </div>

        {/* Micro Trust Indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            marginTop: 36,
            fontSize: '13px',
            color: t.textMuted,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10b981" /> No Credit Card Required
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10b981" /> Instant Setup in 30 Seconds
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={15} color="#10b981" /> Works on Mobile, Laptop & Tablet
          </span>
        </div>
      </section>

      {/* ── LIVE INTERACTIVE POS SIMULATOR ─────────────────────── */}
      <section id="demo" style={{ maxWidth: 1040, margin: '0 auto 90px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: t.simBg,
            border: `1px solid ${t.simBorder}`,
            borderRadius: 24,
            padding: '24px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: t.cardShadow,
            transition: 'all 0.25s ease',
          }}
        >
          {/* Header Bar of the Simulator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: `1px solid ${t.cardBorder}`,
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 13, color: t.textBody, fontWeight: 600, marginLeft: 8 }}>
                Live POS Simulator — Click items below to test billing
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#0284c7' }}>
              <Sparkles size={14} /> Interactive Preview
            </div>
          </div>

          {/* 2-Column Split: Item Picker (Left) + Live Thermal Bill & QR (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Left: Quick Items Grid */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                1. Tap items to add to bill
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {DEMO_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addToSimCart(item)}
                    style={{
                      background: t.simCardBg,
                      border: `1px solid ${t.simCardBorder}`,
                      borderRadius: 14,
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.textHead, minHeight: 36, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: t.textMuted }}>{item.size}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0284c7' }}>₹{item.price}</span>
                    </div>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: '5px',
                        background: 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        borderRadius: 8,
                        color: '#0284c7',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>

              {/* Payment selector */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  2. Payment Method
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {['UPI', 'CASH', 'UDHAAR'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSimPayment(m)}
                      style={{
                        padding: '8px',
                        borderRadius: 10,
                        background: simPayment === m ? 'rgba(56, 189, 248, 0.18)' : t.simCardBg,
                        border: `1px solid ${simPayment === m ? '#38bdf8' : t.simCardBorder}`,
                        color: simPayment === m ? '#0284c7' : t.textBody,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Calculated Thermal Receipt & QR */}
            <div
              style={{
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '20px',
                fontFamily: "'Courier New', Courier, monospace",
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ textAlign: 'center', borderBottom: '1px dashed #0f172a', paddingBottom: 10, marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.04em' }}>SHARMA GENERAL STORE</div>
                  <div style={{ fontSize: 11, color: '#475569' }}>Main Bazar, Ward No. 4 • Phone: 98765-43210</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                    Bill #: SIM-{Math.floor(simSubtotal * 7)} • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ borderBottom: '1px dashed #0f172a', paddingBottom: 8, marginBottom: 8 }}>
                  {simCart.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, marginBottom: 6 }}>
                      <div style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => updateSimQty(item.id, -1)}
                          style={{ width: 18, height: 18, border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: 3, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: 11, fontWeight: 700 }}>{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateSimQty(item.id, 1)}
                          style={{ width: 18, height: 18, border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: 3, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          +
                        </button>
                        <span style={{ fontWeight: 700, width: 44, textAlign: 'right' }}>₹{item.price * item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>₹{simSubtotal}</span>
                  </div>
                  {simDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                      <span>Discount (Offer):</span>
                      <span>-₹{simDiscount}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 15, borderTop: '1px dashed #0f172a', paddingTop: 6, marginTop: 4 }}>
                    <span>NET TOTAL:</span>
                    <span>₹{simTotal}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic QR or Payment Status box */}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed #0f172a', textAlign: 'center' }}>
                {simPayment === 'UPI' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ background: '#ffffff', padding: 6, borderRadius: 8, border: '1px solid #e2e8f0', display: 'inline-block' }}>
                      <QRCodeSVG
                        value={`upi://pay?pa=smartdukaan@upi&pn=SharmaKirana&am=${simTotal}&cu=INR`}
                        size={84}
                      />
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0f172a' }}>
                      Scan & Pay ₹{simTotal} with any UPI App
                    </div>
                  </div>
                )}
                {simPayment === 'UDHAAR' && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px', fontSize: 11, color: '#dc2626' }}>
                    <b>Udhaar Khata Selected</b>
                    <div>Added to Customer Credit Balance</div>
                  </div>
                )}
                {simPayment === 'CASH' && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px', fontSize: 11, color: '#059669' }}>
                    <b>Cash Payment Selected</b>
                    <div>Tendered: ₹{simTotal} • Change: ₹0.00</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ─────────────────────────────────── */}
      <section id="features" style={{ maxWidth: 1060, margin: '0 auto 100px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#0284c7',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Built for everyday retail
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: t.textHead, letterSpacing: '-0.025em' }}>
            Everything your Dukaan needs, perfectly integrated.
          </h2>
        </div>

        {/* Bento Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 18,
          }}
        >
          {/* Bento Card 1: 7 Columns Wide (POS) */}
          <div
            id="billing"
            style={{
              gridColumn: 'span 7',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 20,
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: t.cardShadow,
            }}
            className="bento-card"
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(37,99,235,0.18)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Receipt size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.textHead, marginBottom: 8 }}>10-Second Thermal POS Billing</h3>
            <p style={{ color: t.textBody, fontSize: 14, lineHeight: 1.5, maxWidth: 440 }}>
              Barcode scanner support, multiple counter holding (Counter 1 & 2), automatic weekend discount rules, and instant thermal receipt printing.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, background: t.pillBg, padding: '4px 10px', borderRadius: '9999px', color: t.pillText }}>Barcode Ready</span>
              <span style={{ fontSize: 12, background: t.pillBg, padding: '4px 10px', borderRadius: '9999px', color: t.pillText }}>Thermal 80mm/58mm</span>
              <span style={{ fontSize: 12, background: t.pillBg, padding: '4px 10px', borderRadius: '9999px', color: t.pillText }}>Void & Re-stock</span>
            </div>
          </div>

          {/* Bento Card 2: 5 Columns Wide (Udhaar) */}
          <div
            id="udhaar"
            style={{
              gridColumn: 'span 5',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 20,
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: t.cardShadow,
            }}
            className="bento-card"
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(239,68,68,0.18)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CreditCard size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.textHead, marginBottom: 8 }}>Digital Khata Book</h3>
            <p style={{ color: t.textBody, fontSize: 14, lineHeight: 1.5 }}>
              Zero paper errors. Track customer debts, partial payments, and trigger 1-click WhatsApp payment reminders with polite automated Hindi messages.
            </p>
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '9999px', fontWeight: 600 }}>
                1-Click WhatsApp Reminders
              </span>
            </div>
          </div>

          {/* Bento Card 3: 5 Columns Wide (Smart Inventory) */}
          <div
            id="inventory"
            style={{
              gridColumn: 'span 5',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 20,
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: t.cardShadow,
            }}
            className="bento-card"
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(245,158,11,0.18)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Package size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.textHead, marginBottom: 8 }}>Stock & Expiry Guard</h3>
            <p style={{ color: t.textBody, fontSize: 14, lineHeight: 1.5 }}>
              Automatic alert flags for products dropping below minimum thresholds and expiry warnings 7 days in advance to protect your margins.
            </p>
          </div>

          {/* Bento Card 4: 7 Columns Wide (Analytics) */}
          <div
            id="reports"
            style={{
              gridColumn: 'span 7',
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 20,
              padding: '28px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: t.cardShadow,
            }}
            className="bento-card"
          >
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(16,185,129,0.18)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.textHead, marginBottom: 8 }}>Real Profit & Cost Tracking</h3>
            <p style={{ color: t.textBody, fontSize: 14, lineHeight: 1.5, maxWidth: 440 }}>
              Know exactly how much money your store made today: (Net Sales − Cost of Goods − Store Expenses). See top-selling products and weekly trends.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '4px 10px', borderRadius: '9999px', fontWeight: 600 }}>
                Live Net Margin Calculation
              </span>
              <span style={{ fontSize: 12, background: t.pillBg, color: t.pillText, padding: '4px 10px', borderRadius: '9999px' }}>
                Daily & Monthly Reports
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BEFORE & AFTER ─────────────────────────────────────── */}
      <section style={{ maxWidth: 960, margin: '0 auto 100px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 800, color: t.textHead }}>
            Purana Tarika vs. Smart Dukaan
          </h2>
          <p style={{ color: t.textBody, fontSize: 15, marginTop: 8 }}>
            Dukaan chalane ka naya, aasan aur munafedar tarika.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {/* Old Notebook */}
          <div style={{ background: isDark ? 'rgba(239, 68, 68, 0.05)' : '#fef2f2', border: isDark ? '1px solid rgba(239, 68, 68, 0.18)' : '1px solid #fecaca', borderRadius: 18, padding: 24 }}>
            <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', marginBottom: 12 }}>
              ✕ Purana Paper Notebook
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: t.textBody }}>
              <li style={{ display: 'flex', gap: 8 }}>• Panna fatne ya khone par udhaar ka paisa doob jata hai</li>
              <li style={{ display: 'flex', gap: 8 }}>• Hath se total calculation me galtiyaan aur customer behes</li>
              <li style={{ display: 'flex', gap: 8 }}>• Expiry samaan ka pata nahi chalta aur nuksan hota hai</li>
              <li style={{ display: 'flex', gap: 8 }}>• Din bhar me kitna munafa hua kisi ko nahi pata</li>
            </ul>
          </div>

          {/* Smart Dukaan */}
          <div style={{ background: isDark ? 'rgba(16, 185, 129, 0.05)' : '#f0fdf4', border: isDark ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #bbf7d0', borderRadius: 18, padding: 24 }}>
            <div style={{ color: '#059669', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', marginBottom: 12 }}>
              ✓ Smart Dukaan Digital OS
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5, color: t.textHead }}>
              <li style={{ display: 'flex', gap: 8 }}>• Safe cloud backup — mobile badalne par bhi ek rupya nahi khota</li>
              <li style={{ display: 'flex', gap: 8 }}>• 100% accurate billing with instant thermal receipt & UPI QR</li>
              <li style={{ display: 'flex', gap: 8 }}>• 7 din pehle stock expiry alert taaki nuksan na ho</li>
              <li style={{ display: 'flex', gap: 8 }}>• Raat ko dukan band karte waqt live daily profit report</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ──────────────────────────────────── */}
      <section style={{ maxWidth: 860, margin: '0 auto 80px', padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div
          style={{
            background: isDark
              ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'linear-gradient(180deg, #eff6ff 0%, #e0f2fe 100%)',
            border: `1px solid ${t.cardBorder}`,
            borderRadius: 26,
            padding: '50px 30px',
            boxShadow: t.cardShadow,
          }}
        >
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: t.textHead, marginBottom: 14 }}>
            Ready to upgrade your store?
          </h2>
          <p style={{ color: t.textBody, fontSize: 16, maxWidth: 540, margin: '0 auto 28px' }}>
            Start billing in under 1 minute. Free forever for small Indian shopkeepers.
          </p>

          <Link
            to="/register"
            style={{
              background: t.ctaPrimaryBg,
              color: t.ctaPrimaryText,
              padding: '14px 34px',
              borderRadius: '9999px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isDark ? '0 6px 25px rgba(255, 255, 255, 0.25)' : '0 6px 25px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.15s',
            }}
          >
            <span>Register Dukaan Free</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: `1px solid ${t.footerBorder}`,
          background: t.footerBg,
          padding: '30px 24px',
          fontSize: '13px',
          color: t.textMuted,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1060,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Store size={18} color="#0284c7" />
            <span style={{ fontWeight: 700, color: t.textHead }}>Smart Dukaan</span>
            <span>— The Modern Operating System for Retail Stores</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: t.pillBg, border: `1px solid ${t.cardBorder}`, padding: '5px 12px', borderRadius: '9999px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ color: t.pillText, fontSize: 12, fontWeight: 500 }}>All Systems Operational • Encrypted Cloud DB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
