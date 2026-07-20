import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { WebsiteContent } from '@/types';

type AboutContent = WebsiteContent['about'];

export default function EditAbout() {
  const [form, setForm] = useState<AboutContent | null>(null);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.websiteContent.get().then(content => setForm(content.about || {
      title: 'About Us', content: '', vision: '', mission: '',
      values: [], foundedYear: '2010', founderName: '',
    }));
  }, []);

  const addValue = () => {
    if (!form || !newValue.trim()) return;
    setForm({ ...form, values: [...form.values, newValue.trim()] });
    setNewValue('');
  };

  const removeValue = (idx: number) => {
    if (!form) return;
    setForm({ ...form, values: form.values.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const content = await db.websiteContent.get();
    await db.websiteContent.update({ ...content, about: form });
    setSaving(false);
    toast.success('About page updated!');
  };

  if (!form) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/website-editor" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <h1 className="page-title">Edit About Page</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2"><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div className="max-w-2xl space-y-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div><label className="form-label">Page Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">Introduction Content</label><textarea rows={3} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="form-input resize-none" /></div>
          <div><label className="form-label">Vision Statement</label><textarea rows={2} value={form.vision} onChange={e => setForm({...form, vision: e.target.value})} className="form-input resize-none" /></div>
          <div><label className="form-label">Mission Statement</label><textarea rows={2} value={form.mission} onChange={e => setForm({...form, mission: e.target.value})} className="form-input resize-none" /></div>
          <div><label className="form-label">Founded Year</label><input value={form.foundedYear} onChange={e => setForm({...form, foundedYear: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">Founder Name</label><input value={form.founderName} onChange={e => setForm({...form, founderName: e.target.value})} className="form-input" /></div>
          <div>
            <label className="form-label">Core Values</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.values.map((v, i) => (
                <span key={i} className="badge-green flex items-center gap-1 px-3 py-1">
                  {v}
                  <button onClick={() => removeValue(i)} className="hover:text-red-600 ml-1"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newValue} onChange={e => setNewValue(e.target.value)} className="form-input flex-1" placeholder="Add a value..." onKeyDown={e => e.key === 'Enter' && addValue()} />
              <button onClick={addValue} className="btn-outline"><Plus size={16} /></button>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 text-base"><Save size={18} /> {saving ? 'Saving…' : 'Save All'}</button>
      </div>
    </div>
  );
}
