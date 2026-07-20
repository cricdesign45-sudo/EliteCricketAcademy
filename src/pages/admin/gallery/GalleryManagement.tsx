import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import type { GalleryItem } from '@/types';

export default function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', imageUrl: '', category: 'Training', date: getTodayString(), description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.gallery.getAll();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await db.gallery.add(form);
    setForm({ title: '', imageUrl: '', category: 'Training', date: getTodayString(), description: '' });
    setShowAdd(false);
    setSaving(false);
    toast.success('Gallery item added!');
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this gallery item?')) {
      await db.gallery.delete(id);
      toast.success('Item deleted');
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title">Gallery Management</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Item</button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-900">Add Gallery Item</h2>
            <button onClick={() => setShowAdd(false)}><X size={20} className="text-gray-500" /></button>
          </div>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div><label className="form-label">Title *</label><input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="form-input">
                <option>Training</option><option>Match</option><option>Event</option><option>Facility</option><option>Achievement</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className="form-label">Image URL *</label><input required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="form-input" placeholder="https://..." /></div>
            <div><label className="form-label">Date</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input" /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding…' : 'Add to Gallery'}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading gallery…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-xl overflow-hidden shadow-md aspect-square">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=400&fit=crop'; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
                <div className="p-3 w-full translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-300">{item.category}</span>
                    <button onClick={() => handleDelete(item.id)} className="p-1 bg-red-500 rounded text-white hover:bg-red-600"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && items.length === 0 && <div className="text-center py-20 text-gray-400">No gallery items yet</div>}
    </div>
  );
}
