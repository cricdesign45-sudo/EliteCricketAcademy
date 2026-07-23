import { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Trash2, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { ActivityLog } from '@/types';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.activityLogs.getAll();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = logs.filter(l => {
    const matchSearch = l.userName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || l.userType === typeFilter;
    return matchSearch && matchType;
  });

  const handleClear = async () => {
    if (confirm('Clear all activity logs? This cannot be undone.')) {
      await db.activityLogs.clear();
      toast.success('Activity logs cleared');
      load();
    }
  };

  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('login')) return 'bg-blue-100 text-blue-700';
    if (action.toLowerCase().includes('logout')) return 'bg-gray-100 text-gray-600';
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) return 'bg-red-100 text-red-700';
    if (action.toLowerCase().includes('add') || action.toLowerCase().includes('create')) return 'bg-green-100 text-green-700';
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><Shield size={22} /> Activity Logs</h1>
          <p className="text-gray-500 text-sm">Track all admin and player actions in the system</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 btn-outline text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleClear} className="flex items-center gap-2 text-sm px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Logs</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 mb-1">Admin Actions</p>
          <p className="text-2xl font-bold text-blue-800">{logs.filter(l => l.userType === 'admin').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs text-green-600 mb-1">Player Actions</p>
          <p className="text-2xl font-bold text-green-800">{logs.filter(l => l.userType === 'player').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search logs…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input w-auto">
          <option value="all">All Users</option>
          <option value="admin">Admin Only</option>
          <option value="player">Players Only</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Shield size={48} className="mx-auto mb-3 opacity-30" />
          <p>No activity logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Timestamp</th>
                  <th className="table-th">User</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Action</th>
                  <th className="table-th">Details</th>
                  <th className="table-th">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="table-td text-gray-500 text-xs whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="table-td font-medium text-gray-900 text-sm">{log.userName}</td>
                    <td className="table-td">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${log.userType === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {log.userType}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getActionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="table-td text-gray-500 text-xs max-w-xs truncate">{log.details || '—'}</td>
                    <td className="table-td text-gray-400 text-xs font-mono">{log.ipAddress || '—'}</td>
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
