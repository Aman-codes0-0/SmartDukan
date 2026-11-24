import { useState, useEffect, useCallback } from 'react';
import { reportAPI } from '../services/api';
import { toast } from '../components/shared/Toast';
import AppLayout from '../components/shared/AppLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';
import {
  Calendar,
  Receipt,
  Award,
} from 'lucide-react';

import { fmtCurrencyRound as fmt } from '../utils/format';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

export default function Reports() {
  const [tab, setTab] = useState('daily');
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  const loadDaily = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getDaily(selectedDate);
      setDailyData(res.data.data);
    } catch (err) {
      console.error('[Reports] loadDaily error:', err);
      toast.error('Failed to load daily report');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const loadMonthly = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, bsRes, wsRes] = await Promise.all([
        reportAPI.getMonthly(selectedYear, selectedMonth),
        reportAPI.getBestSellers(30),
        reportAPI.getWeeklySales(),
      ]);
      setMonthlyData(mRes.data.data);
      setBestSellers(bsRes.data.data);
      setWeeklySales(wsRes.data.data);
    } catch (err) {
      console.error('[Reports] loadMonthly error:', err);
      toast.error('Failed to load monthly report');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (tab === 'daily') loadDaily();
    else loadMonthly();
  }, [tab, loadDaily, loadMonthly]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <AppLayout>
      <div className="page-header">
        <div className="page-title">
          <h1>Reports</h1>
          <p>Sales analytics and business insights</p>
        </div>
        <div className="flex gap-2">
          {['daily', 'monthly'].map((t) => (
            <button
              key={t}
              className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textTransform: 'capitalize' }}
              onClick={() => setTab(t)}
            >
              <Calendar size={14} />
              {t} Report
            </button>
          ))}
        </div>
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
            {tab === 'daily' ? (
              <>
                <label className="form-label" style={{ margin: 0 }}>Date:</label>
                <input className="form-control" type="date" value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)} style={{ width: 180 }} />
              </>
            ) : (
              <>
                <label className="form-label" style={{ margin: 0 }}>Year:</label>
                <select className="form-control" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} style={{ width: 100 }}>
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    return [currentYear - 1, currentYear, currentYear + 1].map((y) => <option key={y} value={y}>{y}</option>);
                  })()}
                </select>
                <label className="form-label" style={{ margin: 0 }}>Month:</label>
                <select className="form-control" value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={{ width: 140 }}>
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </>
            )}
            {loading && <div className="loading-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />}
          </div>
        </div>

        {/* Daily Report */}
        {tab === 'daily' && dailyData && (
          <>
            <div className="kpi-grid" style={{ marginBottom: 20 }}>
              <div className="kpi-card primary">
                <div className="kpi-label">Total Revenue</div>
                <div className="kpi-value">{fmt(dailyData.summary.totalRevenue)}</div>
              </div>
              <div className="kpi-card success">
                <div className="kpi-label">Cash Collected</div>
                <div className="kpi-value">{fmt(dailyData.summary.cashCollected)}</div>
              </div>
              <div className="kpi-card warning">
                <div className="kpi-label">Credit Given</div>
                <div className="kpi-value">{fmt(dailyData.summary.creditGiven)}</div>
              </div>
              <div className="kpi-card danger">
                <div className="kpi-label">Expenses</div>
                <div className="kpi-value">{fmt(dailyData.summary.totalExpenses)}</div>
              </div>
              <div className="kpi-card success">
                <div className="kpi-label">Est. Profit</div>
                <div className="kpi-value">{fmt(dailyData.summary.estimatedProfit)}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Bills Count</div>
                <div className="kpi-value">{dailyData.summary.billCount}</div>
              </div>
            </div>

            {/* Bills Table */}
            <div className="table-container">
              <div className="table-header-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={18} />
                <span className="card-title">Bills — {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {dailyData.bills?.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Receipt size={32} /></div>
                  <p>No bills on this date</p>
                </div>
              ) : (
                <table>
                  <thead><tr><th>Time</th><th>Customer</th><th>Items</th><th>Net Amount</th><th>Payment</th><th>Udhaar</th></tr></thead>
                  <tbody>
                    {dailyData.bills.map((b) => (
                      <tr key={b.id}>
                        <td className="text-muted">{new Date(b.billDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{b.customer?.name || <span className="text-muted">Walk-in</span>}</td>
                        <td>{b.items?.length || 0} items</td>
                        <td className="font-bold">{fmt(b.netAmount)}</td>
                        <td><span className={`badge badge-${b.paymentMethod === 'CREDIT' ? 'danger' : 'success'}`}>{b.paymentMethod}</span></td>
                        <td className={b.creditAmount > 0 ? 'text-danger' : 'text-muted'}>{b.creditAmount > 0 ? fmt(b.creditAmount) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* Monthly Report */}
        {tab === 'monthly' && monthlyData && (
          <>
            <div className="kpi-grid" style={{ marginBottom: 20 }}>
              <div className="kpi-card primary">
                <div className="kpi-label">Monthly Revenue</div>
                <div className="kpi-value">{fmt(monthlyData.summary.totalRevenue)}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Total Bills</div>
                <div className="kpi-value">{monthlyData.summary.totalBills}</div>
              </div>
              <div className="kpi-card danger">
                <div className="kpi-label">Total Expenses</div>
                <div className="kpi-value">{fmt(monthlyData.summary.totalExpenses)}</div>
              </div>
            </div>

            <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
              {/* Monthly Line Chart */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={18} />
                  <span className="card-title">Daily Revenue — {months[selectedMonth - 1]}</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData.dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                      tickFormatter={(d) => new Date(d).getDate()} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                      formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Best Sellers */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={18} />
                  <span className="card-title">Best Sellers (30 days)</span>
                </div>
                {bestSellers.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={bestSellers.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 20, left: 60, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={55} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        formatter={(v) => [v, 'Qty Sold']} />
                      <Bar dataKey="quantitySold" fill="#10b981" radius={[0, 4, 4, 0]}>
                        {bestSellers.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="empty-state" style={{ padding: 30 }}><p>No sales data</p></div>}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
