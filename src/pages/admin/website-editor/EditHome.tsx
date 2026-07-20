import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { WebsiteContent } from '@/types';

type HomeContent = WebsiteContent['home'];

export default function EditHome() {
  const [form, setForm] = useState<HomeContent | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.websiteContent.get().then(content => setForm(content.home || {
      heroTitle: 'Train Like a Champion',
      heroSubtitle: 'Elite Cricket Academy — where future champions are forged.',
      heroCTA: 'Enroll Now',
      statsSection: [],
      aboutTitle: 'About Us',
      aboutContent: '',
      missionTitle: 'Our Mission',
      missionContent: '',
    }));
  }, []);

  const updateStat = (idx: number, field: 'label' | 'value', val: string) => {
    if (!form) return;
    const stats = [...form.statsSection];
    stats[idx] = { ...stats[idx], [field]: val };
    setForm({ ...form, statsSection: stats });
  };

  const addStat = () => {
    if (!form) return;
    setForm({ ...form, statsSection: [...form.statsSection, { label: 'New Stat', value: '0' }] });
  };

  const removeStat = (idx: number) => {
    if (!form) return;
    setForm({ ...form, statsSection: form.statsSection.filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const content = await db.websiteContent.get();
    await db.websiteContent.update({ ...content, home: form });
    setSaving(false);
    toast.success('Home page updated!');
  };

  if (!form) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/website-editor" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <h1 className="page-title">Edit Home Page</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2"><Save size={16} /> {saving ? 'Saving…' : 'Save Changes'}</button>
      </div>

      <div className="space-y-5 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div><label className="form-label">Hero Title</label><input value={form.heroTitle} onChange={e => setForm({...form, heroTitle: e.target.value})} className="form-input text-lg font-medium" /></div>
            <div><label className="form-label">Hero Subtitle</label><textarea rows={2} value={form.heroSubtitle} onChange={e => setForm({...form, heroSubtitle: e.target.value})} className="form-input resize-none" /></div>
            <div><label className="form-label">CTA Button Text</label><input value={form.heroCTA} onChange={e => setForm({...form, heroCTA: e.target.value})} className="form-input" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Stats Section</h2>
            <button onClick={addStat} className="btn-outline text-xs flex items-center gap-1"><Plus size={12} /> Add Stat</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {form.statsSection.map((stat, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1"><label className="form-label">Value</label><input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} className="form-input" /></div>
                <div className="flex-1"><label className="form-label">Label</label><input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} className="form-input" /></div>
                <button onClick={() => removeStat(i)} className="p-2 text-red-400 hover:text-red-600 mb-0.5"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">About Section</h2>
          <div className="space-y-4">
            <div><label className="form-label">About Title</label><input value={form.aboutTitle} onChange={e => setForm({...form, aboutTitle: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">About Content</label><textarea rows={4} value={form.aboutContent} onChange={e => setForm({...form, aboutContent: e.target.value})} className="form-input resize-none" /></div>
            <div><label className="form-label">Mission Title</label><input value={form.missionTitle} onChange={e => setForm({...form, missionTitle: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Mission Content</label><textarea rows={3} value={form.missionContent} onChange={e => setForm({...form, missionContent: e.target.value})} className="form-input resize-none" /></div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 text-base"><Save size={18} /> {saving ? 'Saving…' : 'Save All Changes'}</button>
      </div>
    </div>
  );
}
