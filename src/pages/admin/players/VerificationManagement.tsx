import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, X } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { Player } from '@/types';

const BADGES = [
  { value: 'verified' as const, label: 'Verified', icon: '✓', bg: 'bg-blue-500', text: 'text-white', desc: 'Official verified player' },
  { value: 'elite' as const, label: 'Elite', icon: '★', bg: 'bg-gray-900', text: 'text-yellow-400', desc: 'Elite academy player' },
  { value: 'champion' as const, label: 'Champion', icon: '⚡', bg: 'bg-green-600', text: 'text-white', desc: 'Academy champion' },
];

export default function VerificationManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setPlayers(await db.players.getAll());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setBadge = async (playerId: string, badge: Player['badge']) => {
    setUpdating(playerId);
    await db.players.update(playerId, { badge });
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, badge } : p));
    toast.success(badge ? `${badge} badge assigned` : 'Badge removed');
    setUpdating(null);
  };

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.registrationNumber.toLowerCase().includes(search.toLowerCase());
    const matchBadge = badgeFilter === 'all' ? true : badgeFilter === 'none' ? !p.badge : p.badge === badgeFilter;
    return matchSearch && matchBadge;
  });

  const counts = { verified: players.filter(p => p.badge === 'verified').length, elite: players.filter(p => p.badge === 'elite').length, champion: players.filter(p => p.badge === 'champion').length, none: players.filter(p => !p.badge).length };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title flex items-center gap-2"><Shield size={20} /> Verification Management</h1>
        <p className="text-gray-500 text-sm">Assign and manage player verification badges</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Verified', count: counts.verified, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: '✓' },
          { label: 'Elite', count: counts.elite, color: 'bg-gray-50 border-gray-200 text-gray-700', icon: '★' },
          { label: 'Champion', count: counts.champion, color: 'bg-green-50 border-green-200 text-green-700', icon: '⚡' },
          { label: 'No Badge', count: counts.none, color: 'bg-gray-50 border-gray-100 text-gray-400', icon: '—' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <p className="text-xl font-bold">{s.count}</p>
            <p className="text-xs mt-0.5">{s.icon} {s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search players…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select value={badgeFilter} onChange={e => setBadgeFilter(e.target.value)} className="form-input w-auto">
            <option value="all">All Players</option>
            <option value="verified">Verified</option>
            <option value="elite">Elite</option>
            <option value="champion">Champion</option>
            <option value="none">No Badge</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Current Badge</th>
                  <th className="table-th">Assign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(player => (
                  <tr key={player.id} className="hover:bg-gray-50/50">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        {player.photo ? (
                          <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{player.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{player.name}</p>
                          <p className="text-xs text-gray-400">{player.registrationNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td"><span className="badge-blue text-xs">{player.program || '—'}</span></td>
                    <td className="table-td">
                      {player.badge ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          player.badge === 'verified' ? 'bg-blue-100 text-blue-700' :
                          player.badge === 'elite' ? 'bg-gray-100 text-yellow-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {player.badge === 'verified' ? '✓' : player.badge === 'elite' ? '★' : '⚡'} {player.badge}
                        </span>
                      ) : <span className="text-gray-400 text-xs">None</span>}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1.5">
                        {BADGES.map(b => (
                          <button key={b.value} onClick={() => setBadge(player.id, b.value)} disabled={updating === player.id}
                            title={b.desc}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${player.badge === b.value ? `${b.bg} ${b.text} ring-2 ring-offset-1` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                          >{b.icon}</button>
                        ))}
                        {player.badge && (
                          <button onClick={() => setBadge(player.id, null)} disabled={updating === player.id}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Remove badge">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No players found</p>}
          </div>
        </div>
      )}
    </div>
  );
}
