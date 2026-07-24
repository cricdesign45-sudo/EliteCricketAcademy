import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Users, CreditCard, CalendarCheck, ShoppingBag, Package } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ players: 0, active: 0, collected: 0, pending: 0, avgAtt: 0, orders: 0, revenue: 0, products: 0 });
  const [monthlyFees, setMonthlyFees] = useState<{ month: string; fees: number }[]>([]);
  const [programDist, setProgramDist] = useState<{ name: string; value: number }[]>([]);
  const [feeBreakdown, setFeeBreakdown] = useState<{ name: string; value: number; fill: string }[]>([]);

  useEffect(() => {
    async function load() {
      const [players, fees, attendance, orders, products] = await Promise.all([
        db.players.getAll(), db.fees.getAll(), db.attendance.getAll(),
        db.storeOrders.getAll(), db.storeProducts.getAll(),
      ]);

      const active = players.filter(p => p.status === 'active').length;
      const collected = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
      const pending = fees.filter(f => ['pending','overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);
      const perPlayer = players.map(p => {
        const recs = attendance.filter(a => a.playerId === p.id);
        return recs.length > 0 ? (recs.filter(r => r.status === 'present').length / recs.length) * 100 : 0;
      });
      const avgAtt = perPlayer.length > 0 ? Math.round(perPlayer.reduce((s, v) => s + v, 0) / perPlayer.length) : 0;
      const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);

      setKpis({ players: players.length, active, collected, pending, avgAtt, orders: orders.length, revenue, products: products.length });

      // Program distribution
      const pm: Record<string, number> = {};
      players.forEach(p => { if (p.program) pm[p.program] = (pm[p.program] || 0) + 1; });
      setProgramDist(Object.entries(pm).map(([name, value]) => ({ name, value })));

      // Monthly fees (last 6 months)
      const now = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
        const total = fees
          .filter(f => f.status === 'paid' && f.year === d.getFullYear() && f.month === d.toLocaleString('default', { month: 'long' }))
          .reduce((s, f) => s + f.amount, 0);
        months.push({ month: label, fees: total });
      }
      setMonthlyFees(months);

      // Fee breakdown
      const paid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
      const pend = fees.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
      const over = fees.filter(f => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);
      setFeeBreakdown([
        { name: 'Paid', value: paid, fill: '#10b981' },
        { name: 'Pending', value: pend, fill: '#f59e0b' },
        { name: 'Overdue', value: over, fill: '#ef4444' },
      ].filter(d => d.value > 0));

      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Total Players', value: kpis.players, sub: `${kpis.active} active`, icon: Users, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Fees Collected', value: formatCurrency(kpis.collected), sub: `${formatCurrency(kpis.pending)} pending`, icon: CreditCard, color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Avg Attendance', value: `${kpis.avgAtt}%`, sub: 'across all players', icon: CalendarCheck, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Store Revenue', value: formatCurrency(kpis.revenue), sub: `${kpis.orders} orders`, icon: ShoppingBag, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Products', value: kpis.products, sub: 'in store', icon: Package, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { label: 'Collection Rate', value: (kpis.collected + kpis.pending) > 0 ? `${Math.round((kpis.collected / (kpis.collected + kpis.pending)) * 100)}%` : '0%', sub: 'fee collection rate', icon: TrendingUp, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><TrendingUp size={20} /> Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm">Internal academy statistics and insights</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading analytics…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statCards.map(k => (
              <div key={k.label} className={`border rounded-xl p-4 ${k.color}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium opacity-70">{k.label}</p>
                  <k.icon size={15} className="opacity-50" />
                </div>
                <p className="text-xl font-bold">{k.value}</p>
                <p className="text-xs opacity-60 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Monthly Fee Collection</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyFees}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Collected']} />
                  <Bar dataKey="fees" fill="#10b981" radius={[6,6,0,0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm">Fee Status Breakdown</h3>
              {feeBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={feeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}
                    >
                      {feeBreakdown.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v)]} />
                    <Legend formatter={v => <span className="text-xs">{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center py-16 text-gray-400 text-sm">No fee data yet</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">Program Enrollment</h3>
            {programDist.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={programDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" name="Players" radius={[0,4,4,0]} maxBarSize={18}>
                    {programDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center py-8 text-gray-400 text-sm">No program data yet</p>}
          </div>
        </>
      )}
    </div>
  );
}
