import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { toast } from '../components/shared/Toast';
import AppLayout from '../components/shared/AppLayout';
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  RotateCw,
} from 'lucide-react';

import { PRODUCT_CATEGORIES, UNITS } from '../utils/constants';

const ProductModal = ({ product, onSave, onClose }) => {
  const [form, setForm] = useState({
    name: '', category: '', barcode: '', purchasePrice: '', sellingPrice: '',
    quantity: 0, lowStockAt: 5, expiryDate: '', unit: 'Piece',
    ...(product || {}),
    purchasePrice: product?.purchasePrice || '',
    sellingPrice: product?.sellingPrice || '',
    expiryDate: product?.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(form.sellingPrice) < parseFloat(form.purchasePrice)) {
      toast.error('Selling price must be greater than or equal to purchase price');
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        purchasePrice: parseFloat(form.purchasePrice),
        sellingPrice: parseFloat(form.sellingPrice),
        quantity: parseInt(form.quantity),
        lowStockAt: parseInt(form.lowStockAt),
        expiryDate: form.expiryDate || null,
      };
      if (product?.id) {
        await productAPI.update(product.id, data);
        toast.success('Product updated!');
      } else {
        await productAPI.create(data);
        toast.success('Product added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({ value: form[field], onChange: (e) => setForm({ ...form, [field]: e.target.value }) });

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <span className="modal-title">{product?.id ? 'Edit Product' : 'Add New Product'}</span>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-control" {...f('name')} placeholder="e.g. Parle-G Biscuit" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" {...f('category')}>
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row-3">
              <div className="form-group">
                <label className="form-label">Purchase Price (₹) *</label>
                <input className="form-control" type="number" step="0.01" {...f('purchasePrice')} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <input className="form-control" type="number" step="0.01" {...f('sellingPrice')} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select className="form-control" {...f('unit')}>
                  {UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input className="form-control" type="number" {...f('quantity')} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Alert at</label>
                <input className="form-control" type="number" {...f('lowStockAt')} min="0" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Barcode (optional)</label>
                <input className="form-control" {...f('barcode')} placeholder="Scan or type barcode" />
              </div>
              <div className="form-group">
                <label className="form-label">Expiry Date (optional)</label>
                <input className="form-control" type="date" {...f('expiryDate')} />
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
              ) : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [deleteId, setDeleteId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ search, category: filterCat });
      let data = res.data.data;
      if (filterStock === 'low') data = data.filter((p) => p.quantity <= p.lowStockAt);
      if (filterStock === 'out') data = data.filter((p) => p.quantity === 0);
      setProducts(data);
    } catch (err) {
      console.error('[Inventory] loadProducts error:', err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, [search, filterCat, filterStock]);

  const handleDelete = async () => {
    try {
      await productAPI.delete(deleteId);
      toast.success('Product deleted');
      setDeleteId(null);
      loadProducts();
    } catch (err) {
      console.error('[Inventory] deleteProduct error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const getStockBadge = (p) => {
    if (p.quantity === 0) return <span className="badge badge-danger">Out of Stock</span>;
    if (p.quantity <= p.lowStockAt) return <span className="badge badge-warning">Low Stock</span>;
    return <span className="badge badge-success">In Stock</span>;
  };

  const getExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (days < 0) return <span className="badge badge-danger">Expired</span>;
    if (days <= 7) return <span className="badge badge-warning">Exp: {days}d</span>;
    return null;
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">
          <h1>Inventory</h1>
          <p>Manage your products and stock levels</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => setModal('add')}
        >
          <Plus size={16} />
          Add Product
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
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select className="form-control" style={{ width: 160 }} value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
                <option value="">All Categories</option>
                {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select className="form-control" style={{ width: 140 }} value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
                <option value="">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            <span className="text-muted text-sm">{products.length} products</span>
          </div>

          {loading ? (
            <div className="loading-center"><div className="loading-spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Package size={32} /></div>
              <h3>No products found</h3>
              <p>Add your first product to get started</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product Name</th><th>Category</th><th>Purchase ₹</th><th>Selling ₹</th>
                  <th>Stock</th><th>Status</th><th>Expiry</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.barcode && <div className="text-muted text-sm">#{p.barcode}</div>}
                    </td>
                    <td><span className="text-muted">{p.category || '—'}</span></td>
                    <td>₹{Number(p.purchasePrice || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>₹{Number(p.sellingPrice || 0).toFixed(2)}</td>
                    <td>{p.quantity} {p.unit || ''}</td>
                    <td>{getStockBadge(p)}</td>
                    <td>{getExpiryBadge(p.expiryDate)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setModal(p)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-sm"
                          title="Delete"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' }}
                          onClick={() => setDeleteId(p.id)}
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
        <ProductModal
          product={modal === 'add' ? null : modal}
          onSave={() => { setModal(null); loadProducts(); }}
          onClose={() => setModal(null)}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 32 }}>
              <Trash2 size={44} style={{ color: 'var(--danger)', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ marginBottom: 8 }}>Delete Product?</h3>
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
