import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Printer, Phone, Store, ArrowLeft, Calendar, Clock, CreditCard, ShoppingBag } from 'lucide-react';

export default function PublicReceipt() {
  const { billId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReceipt() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/bills/public/${billId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBill(data.data);
        } else {
          setError(data.message || 'Receipt not found');
        }
      } catch (err) {
        setError('Failed to load receipt. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    }
    if (billId) {
      fetchReceipt();
    }
  }, [billId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: 14, color: '#64748b', fontSize: 14, fontWeight: 500 }}>Loading digital receipt...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '32px 24px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShoppingBag size={28} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Receipt Not Found</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>{error || 'This bill does not exist or may have been removed.'}</p>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Back to SmartDukan
          </Link>
        </div>
      </div>
    );
  }

  const shop = bill.shop || {};
  const customer = bill.customer || {};
  const billDate = new Date(bill.billDate || Date.now());
  const dateStr = billDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = billDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '24px 16px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      {/* Styles for print & animations */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @media print {
          body { background: #fff !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .receipt-card { box-shadow: none !important; border: none !important; max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      <div className="receipt-card" style={{ maxWidth: 460, width: '100%', background: '#ffffff', borderRadius: 20, boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {/* Top Header Banner */}
        <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: '#fff', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 10 }}>
            <CheckCircle2 size={13} color="#6ee7b7" /> Verified Digital Bill
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em', color: '#ffffff' }}>
            {shop.name || 'Gullu Super Kirana Store'}
          </h1>
          {shop.address && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: '0 0 2px' }}>{shop.address}</p>
          )}
          {shop.phone && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: 500 }}>
              Phone: +91 {shop.phone}
            </p>
          )}
        </div>

        {/* Bill Metadata Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '14px 20px', background: '#f8fafc', borderBottom: '1px dashed #cbd5e1', fontSize: 12, gap: 8 }}>
          <div>
            <div style={{ color: '#64748b', fontSize: 11 }}>Bill Number</div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: 13 }}>
              #{bill.id.slice(-8).toUpperCase()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#64748b', fontSize: 11 }}>Date & Time</div>
            <div style={{ fontWeight: 600, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>{dateStr}</span>, <span>{timeStr}</span>
            </div>
          </div>
          {customer.name && (
            <div style={{ gridColumn: 'span 2', marginTop: 4, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Billed To: </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{customer.name}</span>
              {customer.phone && <span style={{ color: '#64748b', marginLeft: 4 }}>({customer.phone})</span>}
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 10 }}>
            Purchased Items ({bill.items?.length || 0})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11, textAlign: 'left' }}>
                <th style={{ paddingBottom: 8, fontWeight: 600 }}>Item</th>
                <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'center' }}>Qty</th>
                <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Price</th>
                <th style={{ paddingBottom: 8, fontWeight: 600, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '10px 0', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.product?.name || item.name}</div>
                    {item.product?.unit && (
                      <span style={{ fontSize: 10, color: '#94a3b8' }}>Unit: {item.product.unit}</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: '#64748b' }}>
                    {fmt(item.unitPrice)}
                  </td>
                  <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                    {fmt(item.totalPrice || item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 6 }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{fmt(bill.totalAmount)}</span>
            </div>

            {bill.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981', marginBottom: 6, fontWeight: 600 }}>
                <span>Discount</span>
                <span>-{fmt(bill.discountAmount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#0f172a', padding: '10px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', margin: '8px 0' }}>
              <span>Total Payable</span>
              <span style={{ color: '#047857' }}>{fmt(bill.netAmount)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginTop: 8 }}>
              <span>Payment Mode</span>
              <span style={{ fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                {bill.paymentMethod}
              </span>
            </div>

            {bill.creditAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 700 }}>
                <span>Udhaar Balance Added</span>
                <span>{fmt(bill.creditAmount)}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 14, borderTop: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: '#475569', marginBottom: 2 }}>Thank you for shopping with us!</div>
            <div>Please visit again 🙏</div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="no-print" style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: shop.phone ? '1fr 1fr' : '1fr', gap: 10 }}>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)',
            }}
          >
            <Printer size={16} /> Save / Print PDF
          </button>

          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Phone size={16} color="#047857" /> Call Shop
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
