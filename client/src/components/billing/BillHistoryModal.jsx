import { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import { toast } from '../shared/Toast';
import { X, History, Trash2, RotateCw } from 'lucide-react';
import { fmtCurrency as fmt } from '../../utils/format';

export default function BillHistoryModal({ onClose, onBillVoided }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voidConfirmId, setVoidConfirmId] = useState(null);
  const [voiding, setVoiding] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await billAPI.getAll({ limit: 30 });
      setBills(res.data.data || []);
    } catch (err) {
      console.error('[BillHistory] Fetch error:', err);
      toast.error('Failed to load bill history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleVoid = async (id) => {
    setVoiding(true);
    try {
      await billAPI.delete(id);
      toast.success('Bill voided successfully! Stock & customer balance restored.');
      setVoidConfirmId(null);
      await fetchBills();
      if (onBillVoided) onBillVoided();
    } catch (err) {
      console.error('[BillHistory] Void error:', err);
      toast.error(err.response?.data?.message || 'Failed to void bill');
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <History size={18} />
            <span className="modal-title">Recent Bills & History</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="loading-center" style={{ padding: 40 }}>
              <div className="loading-spinner" />
            </div>
          ) : bills.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No bills recorded yet</p>
            </div>
          ) : (
            <table style={{ width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div>{new Date(b.billDate).toLocaleDateString('en-IN')}</div>
                      <div className="text-muted text-sm">
                        {new Date(b.billDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>{b.customer?.name || <span className="text-muted">Walk-in</span>}</td>
                    <td>{b.items?.length || 0}</td>
                    <td className="font-bold">{fmt(b.netAmount)}</td>
                    <td>
                      <span className={`badge badge-${b.paymentMethod === 'CREDIT' ? 'danger' : 'success'}`}>
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none', padding: '4px 8px' }}
                        title="Void Bill"
                        onClick={() => setVoidConfirmId(b.id)}
                      >
                        <Trash2 size={13} style={{ marginRight: 4 }} />
                        Void
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* 2-Step Confirmation Modal for Voiding */}
      {voidConfirmId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 24 }}>
              <Trash2 size={40} style={{ color: 'var(--danger)', margin: '0 auto 12px', display: 'block' }} />
              <h3 style={{ marginBottom: 6 }}>Void this bill?</h3>
              <p className="text-muted" style={{ fontSize: 13 }}>
                This will reverse product stock deductions and remove any added customer udhaar credit. This action cannot be undone.
              </p>
              <div className="flex gap-2 mt-4" style={{ justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setVoidConfirmId(null)} disabled={voiding}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={() => handleVoid(voidConfirmId)} disabled={voiding}>
                  {voiding ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <RotateCw size={14} className="animate-spin" /> Voiding...
                    </span>
                  ) : (
                    'Confirm Void'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
