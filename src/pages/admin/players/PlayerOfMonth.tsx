import { useState, useEffect, useCallback } from 'react';
import { Trophy, Plus, Trash2, Star, Info } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { Player, PlayerOfMonth as POM } from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PlayerOfMonthManagement() {
  const [records, setRecords] = useState<POM[]>([]);
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
    const [recs, pls] = await Promise.all([
      db.playerOfMonth.getAll(),
      db.players.getAll(),
    ]);
    setRecords(recs);
    setPlayers(pls.filter(p => p.status === 'active'));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerId) { toast.error('Please select a player'); return; }
    const player = players.find(p => p.id === form.playerId);
    if (!player) return;
    setSaving(true);
    await db.playerOfMonth.set({
      playerId: form.playerId,
      playerName: player.name,
      month: form.month,
      year: parseInt(form.year),
      reason: form.reason.trim() || undefined,
      photo: player.photo,
    });
    toast.success('Player of Month updated!');
    setShowForm(false);
    setForm({ playerId: '', month: MONTHS[now.getMonth()], year: now.getFullYear().toString(), reason: '' });
    setSaving(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this record?')) return;
    await db.playerOfMonth.delete(id);
    toast.success('Record removed');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Trophy size={22} className="text-amber-500" /> Player of the Month
          </h1>
          <p className="text-gray-500 text-sm">Manage the featured player popup shown on the home page</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Set Player of Month
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-0.5">How the popup works</p>
          <p>When a Player of the Month is set for the <strong>current month</strong>, a full-screen popup will appear on the home page for every visitor. It auto-dismisses after the user clicks "Continue" and resets at the start of each new month.</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Star size={16} className="text-amber-400" /> Set Player of the Month
          </h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="form-label">Select Player *</label>
              <select
                required
                value={form.playerId}
                onChange={e => setForm(f => ({ ...f, playerId: e.target.value }))}
                className="form-input"
              >
                <option value="">Choose an active player…</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.registrationNumber}) — {p.program}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Month</label>
              <select
                value={form.month}
                onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="form-input"
              >
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <input
                type="number"
                min="2020"
                max="2035"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Reason / Achievement</label>
              <textarea
                rows={2}
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                className="form-input resize-none"
                placeholder="e.g. Best performance in tournaments this month, consistently 95%+ attendance…"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving…' : 'Save Record'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Records */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Trophy size={44} className="mx-auto mb-3 opacity-20" />
          <p className="font-medium">No records yet</p>
          <p className="text-sm mt-1">Set the first Player of the Month!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map(rec => {
            const isCurrent = rec.month === MONTHS[now.getMonth()] && rec.year === now.getFullYear();
            return (
              <div
                key={rec.id}
                className={`bg-white rounded-xl border shadow-sm p-5 flex items-center gap-5 transition-all ${
                  isCurrent ? 'border-amber-300 shadow-amber-100' : 'border-gray-100'
                }`}
              >
                {rec.photo ? (
                  <img
                    src={rec.photo}
                    alt={rec.playerName}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {rec.playerName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="font-bold text-gray-900">{rec.playerName}</h3>
                    {isCurrent && (
                      <span className="text-xs bg-amber-400 text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Star size={9} fill="white" /> Active this month
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium">{rec.month} {rec.year}</p>
                  {rec.reason && (
                    <p className="text-sm text-gray-600 mt-1 italic truncate">"{rec.reason}"</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(rec.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
