import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import type { WebsiteContent } from '@/types';

type Banner = WebsiteContent['banners'][number];

export default function EditBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    db.websiteContent.get().then(content => {
      setBanners(content.banners || []);
      setLoaded(true);
    });
  }, []);

  const addBanner = () => {
    setBanners([...banners, { id: generateId(), title: 'New Banner', subtitle: 'Subtitle text here', imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&h=600&fit=crop', ctaText: 'Learn More', ctaLink: '/', isActive: true }]);
  };

  const updateBanner = (id: string, field: string, value: string | boolean) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const deleteBanner = (id: string) => setBanners(banners.filter(b => b.id !== id));

  const handleSave = async () => {
    setSaving(true);
    const content = await db.websiteContent.get();
    await db.websiteContent.update({ ...content, banners });
    setSaving(false);
    toast.success('Banners updated!');
  };

  if (!loaded) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/website-editor" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <h1 className="page-title">Edit Banners & Sliders</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={addBanner} className="btn-outline flex items-center gap-2"><Plus size={16} /> Add Banner</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2"><Save size={16} /> {saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>

      <div className="space-y-5">
        {banners.map((banner, idx) => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Banner {idx + 1}</h3>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={banner.isActive} onChange={e => updateBanner(banner.id, 'isActive', e.target.checked)} className="w-4 h-4 accent-cricket-green" />
                  Active
                </label>
                <button onClick={() => deleteBanner(banner.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="form-label">Title</label><input value={banner.title} onChange={e => updateBanner(banner.id, 'title', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">Subtitle</label><input value={banner.subtitle} onChange={e => updateBanner(banner.id, 'subtitle', e.target.value)} className="form-input" /></div>
              <div className="sm:col-span-2"><label className="form-label">Image URL</label><input value={banner.imageUrl} onChange={e => updateBanner(banner.id, 'imageUrl', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">CTA Button Text</label><input value={banner.ctaText} onChange={e => updateBanner(banner.id, 'ctaText', e.target.value)} className="form-input" /></div>
              <div><label className="form-label">CTA Link</label><input value={banner.ctaLink} onChange={e => updateBanner(banner.id, 'ctaLink', e.target.value)} className="form-input" /></div>
            </div>
            {banner.imageUrl && (
              <div className="mt-4">
                <label className="form-label">Preview</label>
                <img src={banner.imageUrl} alt="preview" className="w-full h-32 object-cover rounded-lg" onError={e => { e.currentTarget.style.display = 'none'; }} />
              </div>
            )}
          </div>
        ))}
        {banners.length === 0 && <div className="text-center py-12 text-gray-400">No banners added yet</div>}
      </div>
    </div>
  );
}
