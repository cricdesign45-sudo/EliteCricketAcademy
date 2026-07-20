import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import type { Achievement } from '@/types';

export default function AchievementsAdmin() {
  const [items, setItems] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: getTodayString(), category: 'Team Achievement', playerName: '', level: 'state' as Achievement['level'] });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.achievements.getAll();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const levelColors: Record<string, string> = { district: 'badge-green', state: 'badge-blue', national: 'badge-yellow', international: 'badge-red' };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await db.achievements.add(form);
    setForm({ title: '', description: '', date: getTodayString(), category: 'Team Achievement', playerName: '', level: 'state' });
    setShowAdd(false);
    setSaving(false);
    toast.success('Achievement added!');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Achievements Management</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Achievement</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-bold mb-4">Add Achievement</h2>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="form-label">Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Level</label>
              <select value={form.level} onChange={e => setForm({...form, level: e.target.value as Achievement['level']})} className="form-input">
                <option value="district">District</option><option value="state">State</option><option value="national">National</option><option value="international">International</option>
              </select>
            </div>
            <div><label className="form-label">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="form-input">
                <option>Team Achievement</option><option>Individual Achievement</option><option>Tournament</option><option>Award</option>
              </select>
            </div>
            <div><label className="form-label">Player/Team Name</label><input value={form.playerName} onChange={e => setForm({...form, playerName: e.target.value})} className="form-input" placeholder="Player or Academy Team" /></div>
            <div><label className="form-label">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="form-input" /></div>
            <div className="sm:col-span-2"><label className="form-label">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input resize-none" /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding…' : 'Add Achievement'}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading achievements…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {items.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex gap-4">
              <div className="w-12 h-12 bg-cricket-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="text-cricket-green" size={22} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{a.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{a.playerName} • {formatDate(a.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={levelColors[a.level] || 'badge-blue'}>{a.level}</span>
                    <button onClick={async () => { await db.achievements.delete(a.id); toast.success('Deleted'); load(); }} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mt-2">{a.description}</p>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400">No achievements yet</div>}
        </div>
      )}
    </div>
  );
}
