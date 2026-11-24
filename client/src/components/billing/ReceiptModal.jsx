import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { X, Printer, Share2, Copy, Check, MessageSquare } from 'lucide-react';

export const Receipt = ({ bill, shop }) => (
  <div id="receipt" style={{ fontFamily: 'Courier New, monospace', fontSize: 13, padding: 16, width: 300, background: '#fff', color: '#000' }}>
    <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 8, marginBottom: 8 }}>
      <div style={{ fontSize: 16, fontWeight: 'bold' }}>{shop?.name || 'Smart Dukaan'}</div>
      <div style={{ fontSize: 11 }}>{shop?.address || 'Retail Kirana Store'}</div>
      <div style={{ fontSize: 11 }}>Phone: {shop?.phone || shop?.ownerName || '9876543210'}</div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11 }}>
      <span>Date: {new Date(bill.billDate || Date.now()).toLocaleDateString('en-IN')}</span>
      <span>Time: {new Date(bill.billDate || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    {bill.customer && (
      <div style={{ marginBottom: 6, fontSize: 11 }}>
        Customer: <b>{bill.customer.name}</b> {bill.customer.phone && `(${bill.customer.phone})`}
      </div>
    )}
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, margin: '6px 0' }}>
      <thead>
        <tr style={{ borderBottom: '1px dashed #000' }}>
          <th style={{ textAlign: 'left', padding: '3px 0' }}>Item</th>
          <th style={{ textAlign: 'center', padding: '3px 0' }}>Qty</th>
          <th style={{ textAlign: 'right', padding: '3px 0' }}>Amt</th>
        </tr>
      </thead>
      <tbody>
        {bill.items?.map((item, i) => (
          <tr key={i}>
            <td style={{ padding: '3px 0', maxWidth: 150 }}>{item.product?.name || item.name}</td>
            <td style={{ textAlign: 'center', padding: '3px 0' }}>{item.quantity}</td>
            <td style={{ textAlign: 'right', padding: '3px 0' }}>₹{((item.unitPrice || 0) * item.quantity).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ borderTop: '1px dashed #000', marginTop: 8, paddingTop: 8, fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Subtotal</span>
        <span>₹{(bill.totalAmount || 0).toFixed(2)}</span>
      </div>
      {bill.discountAmount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
          <span>Discount</span>
          <span>-₹{(bill.discountAmount || 0).toFixed(2)}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 14, margin: '4px 0' }}>
        <span>Net Total</span>
        <span>₹{(bill.netAmount || 0).toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Payment ({bill.paymentMethod})</span>
        <span>₹{(bill.paidAmount || bill.netAmount || 0).toFixed(2)}</span>
      </div>
      {bill.creditAmount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 'bold' }}>
          <span>Udhaar Balance</span>
          <span>₹{(bill.creditAmount || 0).toFixed(2)}</span>
        </div>
      )}
    </div>
    <div style={{ textAlign: 'center', marginTop: 14, borderTop: '1px dashed #000', paddingTop: 8, fontSize: 11 }}>
      Thank you for shopping! Visit Again
    </div>
  </div>
);

export default function ReceiptModal({ bill, shop, onClose }) {
  const receiptRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef: receiptRef });
  const [copied, setCopied] = useState(false);

  const publicUrl = `${window.location.origin}/r/${bill.id}`;

  const handleShareWhatsApp = () => {
    const shopTitle = shop?.name || 'Gullu Super Kirana Store';
    const customerGreeting = bill.customer?.name ? `${bill.customer.name} ji` : 'Grahak ji';
    const totalAmt = Number(bill.netAmount || 0).toFixed(2);
    const billNo = bill.id ? `#${bill.id.slice(-6).toUpperCase()}` : '';

    const text =
      `Namaste ${customerGreeting}! 🙏\n\n` +
      `*${shopTitle}* se aapka bill taiyar hai:\n` +
      `• Bill No: ${billNo}\n` +
      `• Total Amount: ₹${totalAmt}\n` +
      `• Payment Mode: ${bill.paymentMethod || 'CASH'}\n\n` +
      `Apna digital bill dekhne ya download karne ke liye link par click karein:\n` +
      `${publicUrl}\n\n` +
      `Dhanyawad! Phir zaroor padharein.`;

    const phoneStr = bill.customer?.phone ? String(bill.customer.phone).replace(/\D/g, '') : '';
    const waUrl = phoneStr.length === 10
      ? `https://wa.me/91${phoneStr}?text=${encodeURIComponent(text)}`
      : phoneStr.length > 10
      ? `https://wa.me/${phoneStr}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">Bill Generated Successfully</span>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Action Banner: WhatsApp 100% Free Share */}
        <div style={{ padding: '12px 16px', background: '#ecfdf5', borderBottom: '1px solid #a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>
              Free Digital Receipt Sharing
            </span>
            <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 999, fontWeight: 700 }}>
              100% FREE
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#25D366',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 211, 102, 0.25)',
              }}
            >
              <MessageSquare size={16} /> Share on WhatsApp
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy receipt link"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '9px 12px',
                fontSize: 12,
                fontWeight: 600,
                color: copied ? '#10b981' : '#334155',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ display: 'flex', justifyContent: 'center', maxHeight: 360, overflowY: 'auto' }}>
          <div ref={receiptRef}>
            <Receipt bill={bill} shop={shop} />
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>
            Done (New Bill)
          </button>
          <button className="btn btn-primary" onClick={handlePrint} style={{ flex: 1.2 }}>
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
