import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import { toast } from '../components/shared/Toast';
import AppLayout from '../components/shared/AppLayout';
import {
  Plus,
  TrendingDown,
  Pencil,
  Trash2,
  RotateCw,
  X,
} from 'lucide-react';

import { EXPENSE_CATEGORIES } from '../utils/constants';
import { fmtCurrency as fmt } from '../utils/format';

const ExpenseModal = ({ expense, onSave, onClose }) => {
  const [form, setForm] = useState({
    category: expense?.category || '',
    description: expense?.description || '',
    amount: expense?.amount || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, amount: parseFloat(form.amount) };
      if (expense?.id) {
        await expenseAPI.update(expense.id, data);
        toast.success('Expense updated!');
      } else {
        await expenseAPI.create(data);
        toast.success('Expense added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{expense?.id ? 'Edit Expense' : 'Add Expense'}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-control" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-control" type="number" step="0.01" value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-control" type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
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

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await expenseAPI.getAll({ startDate, endDate });
      setExpenses(res.data.data);
    } catch (err) {
      console.error('[Expenses] loadExpenses error:', err);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExpenses(); }, [startDate, endDate]);

  const handleDelete = async () => {
    try {
      await expenseAPI.delete(deleteId);
      toast.success('Expense deleted');
      setDeleteId(null);
      loadExpenses();
    } catch (err) {
      console.error('[Expenses] deleteExpense error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // Category totals
  const byCategory = EXPENSE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0);
    return acc;
  }, {});

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">
          <h1>Expenses</h1>
          <p>Total: <span className="text-danger font-bold">{fmt(total)}</span></p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => setModal('add')}
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      <div className="page-content">
        {/* Category Summary */}
        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          {EXPENSE_CATEGORIES.filter((c) => byCategory[c] > 0).map((cat) => (
            <div key={cat} className="kpi-card warning">
              <div className="kpi-label">{cat}</div>
              <div className="kpi-value" style={{ fontSize: 22 }}>{fmt(byCategory[cat])}</div>
            </div>
          ))}
        </div>

        <div className="table-container">
          <div className="table-header-row">
            <div className="flex gap-2 items-center">
              <span className="text-muted text-sm">From:</span>
              <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: 160 }} />
              <span className="text-muted text-sm">To:</span>
              <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: 160 }} />
              {(startDate || endDate) && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => { setStartDate(''); setEndDate(''); }}
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
            <span className="text-muted text-sm">{expenses.length} records</span>
          </div>

          {loading ? (
            <div className="loading-center"><div className="loading-spinner" /></div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><TrendingDown size={32} /></div>
              <h3>No expenses recorded</h3>
            </div>
          ) : (
            <table>
              <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="text-muted">{new Date(e.date).toLocaleDateString('en-IN')}</td>
                    <td><span className="badge badge-warning">{e.category}</span></td>
                    <td>{e.description || '—'}</td>
                    <td className="text-danger font-bold">{fmt(e.amount)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(e)} title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                          onClick={() => setDeleteId(e.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
        <ExpenseModal expense={modal === 'add' ? null : modal}
          onSave={() => { setModal(null); loadExpenses(); }} onClose={() => setModal(null)} />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <Trash2 size={44} style={{ color: 'var(--danger)', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ marginBottom: 8 }}>Delete Expense?</h3>
              <p className="text-muted">This action cannot be undone.</p>
              <div className="flex gap-3 mt-4" style={{ justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
