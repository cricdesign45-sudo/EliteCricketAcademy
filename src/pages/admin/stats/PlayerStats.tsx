import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Trophy, Users, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, CartesianGrid,
} from 'recharts';
import { db } from '@/lib/db';
import { getAttendancePercentage, formatCurrency } from '@/lib/utils';

interface PlayerStat {
  id: string; name: string; program: string; position: string; status: string;
  totalDays: number; present: number; pct: number;
  totalFeesPaid: number; pendingFees: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

/* ── Custom Tooltip ────────────────────── */
function AttTooltip({ active, payload }: { active?: boolean; payload?: { payload: PlayerStat }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-900 mb-1">{d.name}</p>
      <p className="text-gray-600">{d.program}</p>
      <p className="text-green-600 font-semibold">{d.pct}% attendance</p>
      <p className="text-gray-500">{d.present}/{d.totalDays} sessions</p>
    </div>
  );
}

function FeeTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-lg rounded-xl px-4 py-3 text-xs">
      <p className="font-bold text-gray-900">{payload[0].name}</p>
      <p className="font-semibold text-gray-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

/* ── Main ──────────────────────────────── */
export default function PlayerStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [programDist, setProgramDist] = useState<{ name: string; value: number }[]>([]);
  const [feeData, setFeeData] = useState<{ name: string; value: number; fill: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'attendance' | 'fees' | 'leaderboard' | 'programs'>('attendance');

  useEffect(() => {
    async function load() {
      const [players, attendance, fees] = await Promise.all([
        db.players.getAll(),
        db.attendance.getAll(),
        db.fees.getAll(),
      ]);

      const computed: PlayerStat[] = players.map(p => {
        const records = attendance.filter(a => a.playerId === p.id);
        const present = records.filter(r => r.status === 'present').length;
        const pct = getAttendancePercentage(present, records.length);
        const totalFeesPaid = fees.filter(f => f.playerId === p.id && f.status === 'paid').reduce((s, f) => s + f.amount, 0);
        const pendingFees = fees.filter(f => f.playerId === p.id && ['pending','overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);
        return { id: p.id, name: p.name, program: p.program, position: p.position, status: p.status, totalDays: records.length, present, pct, totalFeesPaid, pendingFees };
      });
      setStats(computed);

      // Program distribution
      const progMap: Record<string, number> = {};
      players.forEach(p => { progMap[p.program] = (progMap[p.program] || 0) + 1; });
      setProgramDist(Object.entries(progMap).map(([name, value]) => ({ name, value })));

      // Fee breakdown
      const paid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
      const pending = fees.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
      const overdue = fees.filter(f => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);
      const partial = fees.filter(f => f.status === 'partial').reduce((s, f) => s + f.amount, 0);
      setFeeData([
        { name: 'Paid', value: paid, fill: '#10b981' },
        { name: 'Pending', value: pending, fill: '#f59e0b' },
        { name: 'Overdue', value: overdue, fill: '#ef4444' },
        { name: 'Partial', value: partial, fill: '#3b82f6' },
      ].filter(d => d.value > 0));

      setLoading(false);
    }
    load();
  }, []);

  const top10Att = [...stats].sort((a, b) => b.pct - a.pct).slice(0, 10);
  const top10Fees = [...stats].sort((a, b) => b.totalFeesPaid - a.totalFeesPaid).slice(0, 10);
  const leaderboard = [...stats].sort((a, b) => (b.pct * 0.6 + (b.totalFeesPaid / 1000) * 0.4) - (a.pct * 0.6 + (a.totalFeesPaid / 1000) * 0.4)).slice(0, 10);

  const tabs = [
    { id: 'attendance', label: 'Attendance Chart', icon: TrendingUp },
    { id: 'fees', label: 'Fee Collection', icon: DollarSign },
    { id: 'leaderboard', label: 'Top Performers', icon: Trophy },
    { id: 'programs', label: 'Program Enrollment', icon: Users },
  ] as const;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/reports" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Player Statistics</h1>
          <p className="text-gray-500 text-sm">Analytics and insights for all players</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading statistics…</div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Players', value: stats.length, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { label: 'Avg Attendance', value: `${stats.length > 0 ? Math.round(stats.reduce((s, p) => s + p.pct, 0) / stats.length) : 0}%`, icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-100' },
              { label: 'Total Collected', value: formatCurrency(stats.reduce((s, p) => s + p.totalFeesPaid, 0)), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'Total Pending', value: formatCurrency(stats.reduce((s, p) => s + p.pendingFees, 0)), icon: Trophy, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            ].map(s => (
              <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium opacity-70">{s.label}</p>
                  <s.icon size={16} className="opacity-50" />
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                  activeTab === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Attendance Bar Chart */}
          {activeTab === 'attendance' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-5">Attendance Rate per Player (Top 10)</h3>
                {top10Att.length === 0 ? (
                  <p className="text-center py-12 text-gray-400">No attendance data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={top10Att} margin={{ top: 4, right: 20, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<AttTooltip />} />
                      <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {top10Att.map((entry) => (
                          <Cell key={entry.id} fill={entry.pct >= 75 ? '#10b981' : entry.pct >= 50 ? '#f59e0b' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Full table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">All Players — Attendance Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="table-th">Player</th>
                        <th className="table-th">Program</th>
                        <th className="table-th">Attendance %</th>
                        <th className="table-th">Present / Total</th>
                        <th className="table-th">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[...stats].sort((a, b) => b.pct - a.pct).map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{p.name.charAt(0)}</div>
                              <Link to={`/admin/players/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600">{p.name}</Link>
                            </div>
                          </td>
                          <td className="table-td"><span className="badge-blue text-xs">{p.program}</span></td>
                          <td className="table-td">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className={`h-2 rounded-full ${p.pct >= 75 ? 'bg-green-500' : p.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.pct}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${p.pct >= 75 ? 'text-green-600' : p.pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{p.pct}%</span>
                            </div>
                          </td>
                          <td className="table-td text-gray-500">{p.present}/{p.totalDays}</td>
                          <td className="table-td"><span className={p.status === 'active' ? 'badge-green' : 'badge-red'}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Fee Pie Chart */}
          {activeTab === 'fees' && (
            <div className="space-y-5">
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-5">Fee Status Distribution</h3>
                  {feeData.length === 0 ? (
                    <p className="text-center py-12 text-gray-400">No fee data available</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={feeData}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {feeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Pie>
                        <Tooltip content={<FeeTooltip />} />
                        <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-5">Top Fee Payers</h3>
                  {top10Fees.length === 0 ? (
                    <p className="text-center py-12 text-gray-400">No data</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={top10Fees} layout="vertical" margin={{ left: 20, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                        <Tooltip formatter={(v: number) => [formatCurrency(v), 'Paid']} />
                        <Bar dataKey="totalFeesPaid" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Fee detail table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Fee Summary per Player</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="table-th">Player</th>
                        <th className="table-th">Fees Paid</th>
                        <th className="table-th">Pending</th>
                        <th className="table-th">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[...stats].sort((a, b) => b.totalFeesPaid - a.totalFeesPaid).map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/50">
                          <td className="table-td">
                            <Link to={`/admin/players/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600">{p.name}</Link>
                          </td>
                          <td className="table-td text-green-600 font-semibold">{formatCurrency(p.totalFeesPaid)}</td>
                          <td className="table-td text-red-500 font-semibold">{formatCurrency(p.pendingFees)}</td>
                          <td className="table-td">
                            {p.pendingFees > 0 ? (
                              <span className="badge-red">Dues</span>
                            ) : (
                              <span className="badge-green">Clear</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-900 to-gray-800">
                <h3 className="font-bold text-white flex items-center gap-2"><Trophy size={18} className="text-yellow-400" /> Top Performers Leaderboard</h3>
                <p className="text-gray-400 text-xs mt-1">Score based on attendance (60%) + fee compliance (40%)</p>
              </div>
              <div className="p-4 space-y-3">
                {leaderboard.map((p, i) => {
                  const score = Math.round(p.pct * 0.6 + Math.min(100, (p.totalFeesPaid / 5000) * 40));
                  return (
                    <div key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${
                      i === 0 ? 'bg-amber-50 border-amber-200' :
                      i === 1 ? 'bg-gray-50 border-gray-200' :
                      i === 2 ? 'bg-orange-50 border-orange-200' :
                      'bg-white border-gray-100'
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        i === 0 ? 'bg-amber-400 text-white' :
                        i === 1 ? 'bg-gray-400 text-white' :
                        i === 2 ? 'bg-orange-400 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/players/${p.id}`} className="font-bold text-gray-900 hover:text-blue-600 truncate">{p.name}</Link>
                          <span className="badge-blue text-xs flex-shrink-0">{p.program}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className={p.pct >= 75 ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>{p.pct}% attendance</span>
                          <span className="text-green-600">{formatCurrency(p.totalFeesPaid)} paid</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xl font-bold text-gray-900">{score}</div>
                        <div className="text-xs text-gray-400">score</div>
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && <p className="text-center py-12 text-gray-400">No player data available.</p>}
              </div>
            </div>
          )}

          {/* Program Distribution */}
          {activeTab === 'programs' && (
            <div className="space-y-5">
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-5">Program-wise Enrollment</h3>
                  {programDist.length === 0 ? (
                    <p className="text-center py-12 text-gray-400">No programs data</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={programDist} cx="50%" cy="50%" outerRadius={100} dataKey="value" paddingAngle={3}
                          label={({ name, value }) => `${name} (${value})`} labelLine={true}
                        >
                          {programDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend formatter={v => <span className="text-xs text-gray-600">{v}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <h3 className="font-bold text-gray-900 mb-5">Enrollment per Program</h3>
                  {programDist.length === 0 ? (
                    <p className="text-center py-12 text-gray-400">No data</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={programDist} margin={{ top: 4, right: 20, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" name="Players" radius={[6,6,0,0]} maxBarSize={40}>
                          {programDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Program Breakdown</h3>
                </div>
                <div className="p-5 space-y-4">
                  {programDist.map((prog, i) => {
                    const pct = stats.length > 0 ? Math.round((prog.value / stats.length) * 100) : 0;
                    return (
                      <div key={prog.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-gray-700">{prog.name}</span>
                          <span className="text-sm font-bold text-gray-900">{prog.value} players ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                  {programDist.length === 0 && <p className="text-center py-8 text-gray-400">No program data available.</p>}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
