import { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppLayout from '../components/shared/AppLayout';
import { toast } from '../components/shared/Toast';
import { fmtCurrencyRound as fmt } from '../utils/format';
import {
  RotateCw,
  IndianRupee,
  Banknote,
  FileText,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  AlertTriangle,
  Calendar,
  Bell,
  CheckCircle2,
  Receipt,
  Sparkles,
} from 'lucide-react';

const KPICard = ({ label, value, sub, icon: Icon, variant = '' }) => (
  <div className={`kpi-card ${variant}`}>
    <div className="kpi-icon">{Icon && <Icon size={20} />}</div>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}</div>
    {sub && <div className="kpi-sub">{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          reportAPI.getDashboard(),
          reportAPI.getWeeklySales(),
        ]);
        setData(dashRes.data.data);
        setChartData(chartRes.data.data);
      } catch (err) {
        console.error('[Dashboard] loadData error:', err);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <AppLayout>
      <div className="loading-center"><div className="loading-spinner" /><p>Loading dashboard...</p></div>
    </AppLayout>
  );

  const t = data?.today || {};
  const inv = data?.inventory || {};
  const udh = data?.udhaar || {};

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard</h1>
          <p>Today's overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>
          <RotateCw size={14} style={{ marginRight: 6 }} />
          Refresh
        </button>
      </div>

      <div className="page-content">
        {/* Today's KPIs */}
        <div className="kpi-grid">
          <KPICard label="Today's Sales" value={fmt(t.totalSales)} sub={`${t.billCount || 0} bills`} icon={IndianRupee} variant="primary" />
          <KPICard label="Cash Collected" value={fmt(t.totalPaid)} sub="Cash + UPI" icon={Banknote} variant="success" />
          <KPICard label="Today's Udhaar" value={fmt(t.totalCredit)} sub="Credit given" icon={FileText} variant="warning" />
          <KPICard label="Est. Profit" value={fmt(t.estimatedProfit)} sub="Revenue − Cost" icon={TrendingUp} variant="success" />
          <KPICard label="Items Sold" value={t.itemsSold || 0} sub="units" icon={ShoppingCart} />
          <KPICard label="Total Outstanding" value={fmt(udh.totalOutstanding)} sub={`${udh.totalCustomers || 0} customers`} icon={CreditCard} variant="danger" />
          <KPICard label="Low Stock" value={inv.lowStockCount || 0} sub="products below threshold" icon={AlertTriangle} variant={inv.lowStockCount > 0 ? 'danger' : ''} />
          <KPICard label="Expiring Soon" value={inv.expiringCount || 0} sub="within 7 days" icon={Calendar} variant={inv.expiringCount > 0 ? 'warning' : ''} />
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          {/* Weekly Sales Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Last 7 Days Sales</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Sales']}
                />
                <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alerts Panel */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={18} />
              <span className="card-title">Alerts</span>
            </div>
            {inv.lowStockProducts?.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <p className="text-sm text-muted" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={14} className="text-danger" /> Low Stock
                </p>
                {inv.lowStockProducts.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{p.name}</span>
                    <span className="badge badge-danger">{p.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
            {inv.expiringProducts?.length > 0 && (
              <div>
                <p className="text-sm text-muted" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} className="text-warning" /> Expiring Soon
                </p>
                {inv.expiringProducts.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{p.name}</span>
                    <span className="badge badge-warning">{new Date(p.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
            {inv.lowStockCount === 0 && inv.expiringCount === 0 && (
              <div className="empty-state" style={{ padding: 20 }}>
                <div className="empty-icon">
                  <CheckCircle2 size={32} style={{ color: 'var(--secondary)' }} />
                </div>
                <p>All products are well-stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Bills + Top Debtors */}
        <div className="grid-2" style={{ gap: 20, marginTop: 20 }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Receipt size={18} />
              <span className="card-title">Recent Bills</span>
            </div>
            {data?.recentBills?.length > 0 ? (
              <table>
                <thead><tr><th>Customer</th><th>Amount</th><th>Method</th><th>Time</th></tr></thead>
                <tbody>
                  {data.recentBills.map((b) => (
                    <tr key={b.id}>
                      <td>{b.customer?.name || 'Walk-in'}</td>
                      <td className="font-bold">{fmt(b.netAmount)}</td>
                      <td><span className={`badge badge-${b.paymentMethod === 'CREDIT' ? 'danger' : 'success'}`}>{b.paymentMethod}</span></td>
                      <td className="text-muted">{new Date(b.billDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><Receipt size={32} /></div>
                <p>No bills today</p>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={18} />
              <span className="card-title">Top Udhaar</span>
            </div>
            {udh.topDebtors?.filter(d => d.balance > 0).length > 0 ? (
              <table>
                <thead><tr><th>Customer</th><th>Balance</th></tr></thead>
                <tbody>
                  {udh.topDebtors.filter(d => d.balance > 0).map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td className="text-danger font-bold">{fmt(c.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon"><Sparkles size={32} style={{ color: 'var(--primary)' }} /></div>
                <p>No outstanding udhaar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
