import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Fee } from '@/types';

export default function FeeManagement() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.fees.getAll();
    setFees(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = fees.filter(f => {
    const matchSearch = f.playerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => ['pending', 'overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this fee record?')) {
      await db.fees.delete(id);
      toast.success('Fee record deleted');
      load();
    }
  };

  const markPaid = async (id: string) => {
    await db.fees.update(id, { status: 'paid', paidDate: new Date().toISOString().split('T')[0] });
    toast.success('Fee marked as paid!');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage player fees and payments</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/fees/reports" className="btn-outline">Reports</Link>
          <Link to="/admin/fees/add" className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Fee</Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Collected', value: formatCurrency(totalPaid), color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Pending Amount', value: formatCurrency(totalPending), color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: 'Overdue Count', value: String(fees.filter(f => f.status === 'overdue').length), color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-5 ${s.color}`}>
            <p className="text-sm font-medium opacity-75">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by player name..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-auto min-w-[140px]">
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading fees…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Month/Year</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Due Date</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(fee => (
                  <tr key={fee.id} className="hover:bg-gray-50/50">
                    <td className="table-td font-medium">{fee.playerName}</td>
                    <td className="table-td"><span className="badge-blue text-xs">{fee.program}</span></td>
                    <td className="table-td text-gray-500">{fee.month} {fee.year}</td>
                    <td className="table-td font-bold text-gray-900">{formatCurrency(fee.amount)}</td>
                    <td className="table-td text-gray-500">{formatDate(fee.dueDate)}</td>
                    <td className="table-td">
                      <span className={fee.status === 'paid' ? 'badge-green' : fee.status === 'overdue' ? 'badge-red' : 'badge-yellow'}>{fee.status}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        {fee.status !== 'paid' && (
                          <button onClick={() => markPaid(fee.id)} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded font-medium transition-colors">Mark Paid</button>
                        )}
                        <button onClick={() => handleDelete(fee.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400">No fee records found</div>}
        </div>
      </div>
    </div>
  );
}
