import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import type { Fee, Player } from '@/types';

export default function FeeReports() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([db.fees.getAll(), db.players.getAll()]).then(([f, p]) => {
      setFees(f); setPlayers(p); setLoading(false);
    });
  }, []);

  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0);
  const totalOverdue = fees.filter(f => f.status === 'overdue').reduce((s, f) => s + f.amount, 0);

  const byProgram = fees.reduce((acc, fee) => {
    const prog = fee.program || 'Unknown';
    if (!acc[prog]) acc[prog] = { paid: 0, pending: 0, count: 0 };
    acc[prog].count++;
    if (fee.status === 'paid') acc[prog].paid += fee.amount;
    else acc[prog].pending += fee.amount;
    return acc;
  }, {} as Record<string, { paid: number; pending: number; count: number }>);

  const playerSummary = players.map(p => {
    const playerFees = fees.filter(f => f.playerId === p.id);
    return {
      name: p.name, program: p.program,
      paid: playerFees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0),
      pending: playerFees.filter(f => ['pending', 'overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0),
      hasOverdue: playerFees.some(f => f.status === 'overdue'),
    };
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/fees" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Fee Reports</h1>
          <p className="text-gray-500 text-sm">Financial overview and fee analytics</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading reports…</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Collected', value: formatCurrency(totalPaid), icon: TrendingUp, color: 'text-green-600 bg-green-100' },
              { label: 'Total Pending', value: formatCurrency(totalPending), icon: DollarSign, color: 'text-amber-600 bg-amber-100' },
              { label: 'Total Overdue', value: formatCurrency(totalOverdue), icon: TrendingDown, color: 'text-red-600 bg-red-100' },
              { label: 'Total Records', value: String(fees.length), icon: AlertCircle, color: 'text-blue-600 bg-blue-100' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}><s.icon size={20} /></div>
                <p className="text-gray-500 text-sm">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900">Collection by Program</h2></div>
              <div className="p-6 space-y-4">
                {Object.entries(byProgram).map(([program, data]) => (
                  <div key={program}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium text-gray-800">{program}</span>
                      <span className="text-gray-500">{formatCurrency(data.paid)} collected</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-cricket-green h-2 rounded-full" style={{ width: `${data.paid + data.pending > 0 ? (data.paid / (data.paid + data.pending)) * 100 : 0}%` }} />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span className="text-green-600">{formatCurrency(data.paid)} paid</span>
                      <span className="text-red-500">{formatCurrency(data.pending)} pending</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-900">Player Fee Summary</h2></div>
              <div className="overflow-y-auto max-h-80">
                <table className="w-full">
                  <thead><tr className="bg-gray-50"><th className="table-th">Player</th><th className="table-th">Paid</th><th className="table-th">Pending</th><th className="table-th">Status</th></tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {playerSummary.map(p => (
                      <tr key={p.name}>
                        <td className="table-td"><div><p className="font-medium">{p.name}</p><p className="text-xs text-gray-400">{p.program}</p></div></td>
                        <td className="table-td text-green-600 font-semibold">{formatCurrency(p.paid)}</td>
                        <td className="table-td text-red-500 font-semibold">{formatCurrency(p.pending)}</td>
                        <td className="table-td">
                          {p.hasOverdue ? <span className="badge-red">Overdue</span> : p.pending > 0 ? <span className="badge-yellow">Pending</span> : <span className="badge-green">Clear</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
