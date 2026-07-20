import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { WebsiteContent } from '@/types';

type ContactContent = WebsiteContent['contact'];

export default function EditContact() {
  const [form, setForm] = useState<Omit<ContactContent, 'socialLinks'> | null>(null);
  const [social, setSocial] = useState<ContactContent['socialLinks']>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.websiteContent.get().then(content => {
      const c = content.contact || { address: '', phone: '', email: '', mapEmbedUrl: '', workingHours: '', socialLinks: {} };
      const { socialLinks, ...rest } = c;
      setForm(rest);
      setSocial(socialLinks || {});
    });
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    const content = await db.websiteContent.get();
    await db.websiteContent.update({ ...content, contact: { ...form, socialLinks: social } });
    setSaving(false);
    toast.success('Contact info updated!');
  };

  if (!form) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/website-editor" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <h1 className="page-title">Edit Contact Info</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2"><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
      </div>

      <div className="max-w-2xl space-y-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 mb-2">Contact Details</h2>
          <div><label className="form-label">Address</label><textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="form-input resize-none" /></div>
          <div><label className="form-label">Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">Working Hours</label><input value={form.workingHours} onChange={e => setForm({...form, workingHours: e.target.value})} className="form-input" /></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-bold text-gray-900 mb-2">Social Media Links</h2>
          <div><label className="form-label">Facebook URL</label><input value={social.facebook || ''} onChange={e => setSocial({...social, facebook: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">Instagram URL</label><input value={social.instagram || ''} onChange={e => setSocial({...social, instagram: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">Twitter URL</label><input value={social.twitter || ''} onChange={e => setSocial({...social, twitter: e.target.value})} className="form-input" /></div>
          <div><label className="form-label">YouTube URL</label><input value={social.youtube || ''} onChange={e => setSocial({...social, youtube: e.target.value})} className="form-input" /></div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 text-base"><Save size={18} /> {saving ? 'Saving…' : 'Save All'}</button>
      </div>
    </div>
  );
}
