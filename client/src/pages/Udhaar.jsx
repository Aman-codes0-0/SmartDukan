import { useState, useEffect } from 'react';
import { customerAPI } from '../services/api';
import { toast } from '../components/shared/Toast';
import AppLayout from '../components/shared/AppLayout';
import { fmtCurrency as fmt } from '../utils/format';
import {
  Plus,
  Search,
  CreditCard,
  Pencil,
  RotateCw,
  MessageSquare,
  ClipboardList,
  IndianRupee,
  Check,
} from 'lucide-react';

const CustomerModal = ({ customer, onSave, onClose }) => {
  const [form, setForm] = useState({ name: customer?.name || '', phone: customer?.phone || '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer?.id) {
        await customerAPI.update(customer.id, form);
        toast.success('Customer updated!');
      } else {
        await customerAPI.create(form);
        toast.success('Customer added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{customer?.id ? 'Edit Customer' : 'Add Customer'}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RotateCw size={14} className="animate-spin" /> Saving...
                </span>
              ) : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ customer, onSave, onClose }) => {
  const [form, setForm] = useState({ amount: '', paymentMethod: 'CASH', note: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(form.amount) > customer.balance) {
      return toast.error(`Amount exceeds balance (${fmt(customer.balance)})`);
    }
    setLoading(true);
    try {
      await customerAPI.recordPayment(customer.id, { ...form, amount: parseFloat(form.amount) });
      toast.success('Payment recorded!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Record Payment — {customer.name}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="alert alert-warning" style={{ marginBottom: 16 }}>
              Outstanding Balance: <b>{fmt(customer.balance)}</b>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Received (₹) *</label>
              <input className="form-control" type="number" step="0.01" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-control" value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <input className="form-control" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Full payment received" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RotateCw size={14} className="animate-spin" /> Recording...
                </span>
              ) : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerDetailModal = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerAPI.getOne(customerId)
      .then((res) => {
        setCustomer(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[Udhaar] Failed to load customer:', err);
        toast.error('Failed to load customer details');
        onClose();
      });
  }, [customerId]);

  if (loading) return <div className="modal-overlay"><div className="modal"><div className="loading-center"><div className="loading-spinner" /></div></div></div>;
  if (!customer) return null;

  // Merge bills and payments into timeline
  const timeline = [
    ...(customer.bills || []).map((b) => ({ ...b, type: 'bill', date: b.billDate })),
    ...(customer.payments || []).map((p) => ({ ...p, type: 'payment', date: p.paidAt })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxHeight: '85vh' }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">{customer.name}</span>
            {customer.phone && <span className="text-muted text-sm" style={{ marginLeft: 8 }}>{customer.phone}</span>}
          </div>
          <div className="flex gap-2 items-center">
            <span className="badge badge-danger" style={{ fontSize: 14 }}>Balance: {fmt(customer.balance)}</span>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="modal-body">
          <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>Transaction History</h4>
          {timeline.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><ClipboardList size={32} /></div>
              <p>No transactions yet</p>
            </div>
          ) : timeline.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 14px', marginBottom: 8, borderRadius: 10,
              background: item.type === 'payment' ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.06)',
              border: `1px solid ${item.type === 'payment' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.1)'}`,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {item.type === 'payment' ? 'Payment Received' : `Bill (${item.paymentMethod})`}
                </div>
                <div className="text-muted text-sm">{new Date(item.date).toLocaleString('en-IN')}</div>
                {item.note && <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.note}</div>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`font-bold ${item.type === 'payment' ? 'text-success' : 'text-danger'}`} style={{ fontSize: 16 }}>
                  {item.type === 'payment' ? '+' : ''}{fmt(item.type === 'payment' ? item.amount : item.creditAmount || item.netAmount)}
                </div>
                {item.type === 'bill' && item.netAmount && (
                  <div className="text-muted text-sm">Total: {fmt(item.netAmount)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Udhaar() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({ search });
      setCustomers(res.data.data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, [search]);

  const totalOutstanding = customers.reduce((s, c) => s + c.balance, 0);

  const sendWhatsApp = (customer) => {
    if (!customer.phone) return toast.error('Customer has no phone number');
    const msg = encodeURIComponent(`Namaskar ${customer.name} ji,\n\nAapka hamare dukan mein ₹${customer.balance} ka udhaar baaki hai.\nKripya jald payment karein.\n\nDhanyavaad!`);
    window.open(`https://wa.me/91${customer.phone}?text=${msg}`, '_blank');
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">
          <h1>Udhaar (Credit Ledger)</h1>
          <p>Total Outstanding: <span className="text-danger font-bold">{fmt(totalOutstanding)}</span></p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => setModal('add')}
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      <div className="page-content">
        <div className="table-container">
          <div className="table-header-row">
            <div className="search-input-wrapper" style={{ position: 'relative' }}>
              <Search size={16} className="search-icon" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="search-input"
                style={{ paddingLeft: 34 }}
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-muted text-sm">{customers.filter(c => c.balance > 0).length} customers with balance</span>
          </div>

          {loading ? (
            <div className="loading-center"><div className="loading-spinner" /></div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CreditCard size={32} /></div>
              <h3>No customers yet</h3>
              <p>Add customers to track udhaar</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr><th>Customer</th><th>Phone</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '2px 0' }} onClick={() => setDetailId(c.id)}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </button>
                    </td>
                    <td className="text-muted">{c.phone || '—'}</td>
                    <td className={c.balance > 0 ? 'text-danger font-bold' : 'text-success'}>{fmt(c.balance)}</td>
                    <td>
                      {c.balance > 0
                        ? <span className="badge badge-danger">Pending</span>
                        : <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Cleared</span>}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {c.balance > 0 && (
                          <button
                            className="btn btn-success btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            onClick={() => setPayModal(c)}
                          >
                            <IndianRupee size={12} /> Pay
                          </button>
                        )}
                        {c.phone && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => sendWhatsApp(c)}
                            title="Send WhatsApp reminder"
                            style={{ display: 'inline-flex', alignItems: 'center' }}
                          >
                            <MessageSquare size={14} />
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)} title="Edit">
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <CustomerModal customer={modal === 'add' ? null : modal}
          onSave={() => { setModal(null); loadCustomers(); }} onClose={() => setModal(null)} />
      )}
      {payModal && (
        <PaymentModal customer={payModal}
          onSave={() => { setPayModal(null); loadCustomers(); }} onClose={() => setPayModal(null)} />
      )}
      {detailId && (
        <CustomerDetailModal customerId={detailId} onClose={() => setDetailId(null)} />
      )}
    </AppLayout>
  );
}
