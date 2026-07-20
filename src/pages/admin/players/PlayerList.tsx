import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Player } from '@/types';

export default function PlayerList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.players.getAll();
    setPlayers(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const programs = Array.from(new Set(players.map(p => p.program)));

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchProgram = programFilter === 'all' || p.program === programFilter;
    return matchSearch && matchStatus && matchProgram;
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete player "${name}"?`)) {
      await db.players.delete(id);
      toast.success(`Player "${name}" deleted successfully`);
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Player Management</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} player(s) found</p>
        </div>
        <Link to="/admin/players/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Player
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name, reg. number or phone..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-auto min-w-[140px]">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select value={programFilter} onChange={e => setProgramFilter(e.target.value)} className="form-input w-auto min-w-[160px]">
            <option value="all">All Programs</option>
            {programs.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading players…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Reg. No.</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Position</th>
                  <th className="table-th">Join Date</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(player => (
                  <tr key={player.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-cricket-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {player.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{player.name}</p>
                          <p className="text-xs text-gray-500">{player.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500 font-mono text-xs">{player.registrationNumber}</td>
                    <td className="table-td"><span className="badge-blue">{player.program}</span></td>
                    <td className="table-td text-gray-600">{player.position}</td>
                    <td className="table-td text-gray-500">{formatDate(player.joinDate)}</td>
                    <td className="table-td">
                      <span className={player.status === 'active' ? 'badge-green' : player.status === 'suspended' ? 'badge-red' : 'badge-yellow'}>{player.status}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/players/${player.id}`} className="p-1.5 text-gray-500 hover:text-cricket-green hover:bg-cricket-green/5 rounded-lg transition-colors" title="View"><Eye size={16} /></Link>
                        <Link to={`/admin/players/${player.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil size={16} /></Link>
                        <button onClick={() => handleDelete(player.id, player.name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No players found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
