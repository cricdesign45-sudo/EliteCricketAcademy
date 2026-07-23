import { useState, useEffect, useCallback } from 'react';
import { Star, Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { PlayerOfMonth as POM, Player } from '@/types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PlayerOfMonthAdmin() {
  const [list, setList] = useState<POM[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({
    playerId: '',
    month: MONTHS[now.getMonth()],
    year: now.getFullYear().toString(),
    reason: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [l, p] = await Promise.all([db.playerOfMonth.getAll(), db.players.getAll()]);
    setList(l); setPlayers(p); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerId) { toast.error('Please select a player'); return; }
    setSaving(true);
    const player = players.find(p => p.id === form.playerId);
    await db.playerOfMonth.set({
      playerId: form.playerId,
      playerName: player!.name,
      month: form.month,
      year: parseInt(form.year),
      reason: form.reason || undefined,
      photo: player!.photo || undefined,
    });
    toast.success('Player of the Month updated!');
    setSaving(false);
    setShowForm(false);
    setForm({ playerId: '', month: MONTHS[new Date().getMonth()], year: new Date().getFullYear().toString(), reason: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this Player of the Month record?')) {
      await db.playerOfMonth.delete(id);
      toast.success('Removed');
      load();
    }
  };

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><Star size={22} className="text-amber-500" /> Player of the Month</h1>
          <p className="text-gray-500 text-sm">Recognize outstanding players — shown as a popup on the public website</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Set Player of Month
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : list.length === 0 ? (
        <div className="text-center py-20">
          <Star size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400 text-sm">No player of the month set yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map(pom => {
            const isCurrentMonth = pom.month === MONTHS[new Date().getMonth()] && pom.year === new Date().getFullYear();
            return (
              <div key={pom.id} className={`rounded-2xl border-2 ${isCurrentMonth ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-white'} shadow-sm p-5 relative overflow-hidden`}>
                {isCurrentMonth && (
                  <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">CURRENT</div>
                )}
                <div className="flex items-center gap-4">
                  {pom.photo ? (
                    <img src={pom.photo} alt={pom.playerName} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">{pom.playerName.charAt(0)}</div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Player of the Month</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{pom.playerName}</h3>
                    <p className="text-sm text-gray-500 font-medium">{pom.month} {pom.year}</p>
                  </div>
                </div>
                {pom.reason && (
                  <p className="text-sm text-gray-600 mt-4 italic leading-relaxed">"{pom.reason}"</p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <button onClick={() => handleDelete(pom.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Star size={18} className="text-amber-500" /> Set Player of the Month</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="form-label">Player *</label>
                <select required value={form.playerId} onChange={e => f('playerId', e.target.value)} className="form-input">
                  <option value="">Select player…</option>
                  {players.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Month</label>
                  <select value={form.month} onChange={e => f('month', e.target.value)} className="form-input">
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Year</label>
                  <input type="number" value={form.year} onChange={e => f('year', e.target.value)} className="form-input" min="2020" max="2030" />
                </div>
              </div>
              <div>
                <label className="form-label">Reason / Achievement</label>
                <textarea rows={3} value={form.reason} onChange={e => f('reason', e.target.value)} className="form-input resize-none" placeholder="Why is this player being recognized this month?" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">{saving ? 'Saving…' : 'Set Player of Month'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
