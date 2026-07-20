import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Star, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import type { Testimonial } from '@/types';

export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5, date: getTodayString(), status: 'approved' as Testimonial['status'] });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.testimonials.getAll();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await db.testimonials.add(form);
    setForm({ name: '', role: '', content: '', rating: 5, date: getTodayString(), status: 'approved' });
    setShowAdd(false);
    setSaving(false);
    toast.success('Testimonial added!');
    load();
  };

  const toggleApprove = async (id: string, current: string) => {
    await db.testimonials.update(id, { status: current === 'approved' ? 'pending' : 'approved' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Testimonials</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Testimonial</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-bold mb-4">Add Testimonial</h2>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div><label className="form-label">Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Role/Designation *</label><input required value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="form-input" placeholder="e.g. Parent, Player" /></div>
            <div><label className="form-label">Rating</label>
              <select value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} className="form-input">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            <div><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as Testimonial['status']})} className="form-input">
                <option value="approved">Approved</option><option value="pending">Pending</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className="form-label">Testimonial *</label><textarea required rows={3} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="form-input resize-none" /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding…' : 'Add'}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading testimonials…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {items.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}</div>
                <div className="flex items-center gap-2">
                  <span className={t.status === 'approved' ? 'badge-green' : 'badge-yellow'}>{t.status}</span>
                  <button onClick={() => toggleApprove(t.id, t.status)} className="p-1 text-gray-400 hover:text-green-600" title="Toggle approval"><CheckCircle size={14} /></button>
                  <button onClick={async () => { await db.testimonials.delete(t.id); toast.success('Deleted'); load(); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-gray-700 text-sm italic mb-3">"{t.content}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cricket-green rounded-full flex items-center justify-center text-white text-sm font-bold">{t.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="col-span-2 text-center py-12 text-gray-400">No testimonials yet</div>}
        </div>
      )}
    </div>
  );
}
