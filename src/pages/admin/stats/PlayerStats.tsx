import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { getAttendancePercentage, formatCurrency } from '@/lib/utils';

export default function PlayerStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Array<{
    id: string; name: string; program: string; position: string; status: string;
    totalDays: number; present: number; pct: number;
    totalFeesPaid: number; pendingFees: number;
  }>>([]);

  useEffect(() => {
    async function load() {
      const [players, attendance, fees] = await Promise.all([
        db.players.getAll(),
        db.attendance.getAll(),
        db.fees.getAll(),
      ]);
      const computed = players.map(p => {
        const records = attendance.filter(a => a.playerId === p.id);
        const present = records.filter(r => r.status === 'present').length;
        const pct = getAttendancePercentage(present, records.length);
        const totalFeesPaid = fees.filter(f => f.playerId === p.id && f.status === 'paid').reduce((s, f) => s + f.amount, 0);
        const pendingFees = fees.filter(f => f.playerId === p.id && ['pending','overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);
        return { id: p.id, name: p.name, program: p.program, position: p.position, status: p.status, totalDays: records.length, present, pct, totalFeesPaid, pendingFees };
      });
      setStats(computed);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/reports" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Player Statistics</h1>
          <p className="text-gray-500 text-sm">Detailed statistics for all players</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading stats…</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Position</th>
                  <th className="table-th">Attendance</th>
                  <th className="table-th">Present/Total</th>
                  <th className="table-th">Fees Paid</th>
                  <th className="table-th">Pending</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-cricket-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{p.name.charAt(0)}</div>
                        <Link to={`/admin/players/${p.id}`} className="font-medium text-cricket-green hover:underline">{p.name}</Link>
                      </div>
                    </td>
                    <td className="table-td"><span className="badge-blue text-xs">{p.program}</span></td>
                    <td className="table-td text-gray-600">{p.position}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${p.pct >= 75 ? 'bg-green-500' : p.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.pct}%` }} />
                        </div>
                        <span className={`text-xs font-semibold ${p.pct >= 75 ? 'text-green-600' : p.pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{p.pct}%</span>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{p.present}/{p.totalDays}</td>
                    <td className="table-td text-green-600 font-semibold">{formatCurrency(p.totalFeesPaid)}</td>
                    <td className="table-td text-red-500 font-semibold">{formatCurrency(p.pendingFees)}</td>
                    <td className="table-td"><span className={p.status === 'active' ? 'badge-green' : 'badge-red'}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
