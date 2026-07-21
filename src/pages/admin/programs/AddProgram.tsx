import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, ImageIcon } from 'lucide-react';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AddProgram() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coachList, setCoachList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [form, setForm] = useState({
    name: '', description: '', duration: '', fee: '', ageGroup: '',
    schedule: '', maxPlayers: '20', currentPlayers: '0', coach: '',
    status: 'active' as 'active' | 'inactive', level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    photo: '',
  });

  useEffect(() => {
    async function load() {
      const coaches = await db.coaches.getAll();
      setCoachList(coaches.filter(c => c.status === 'active').map(c => c.name));
      if (id) {
        const prog = await db.programs.getById(id);
        if (prog) {
          setForm({
            name: prog.name, description: prog.description || '', duration: prog.duration || '',
            fee: String(prog.fee), ageGroup: prog.ageGroup || '', schedule: prog.schedule || '',
            maxPlayers: String(prog.maxPlayers), currentPlayers: String(prog.currentPlayers),
            coach: prog.coach || '', status: prog.status, level: prog.level,
            photo: prog.photo || '',
          });
          if (prog.photo) setPhotoPreview(prog.photo);
        }
      }
    }
    load();
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `programs/${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('academy-media').upload(path, file, { upsert: true });
    if (error) {
      toast.error('Photo upload failed');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('academy-media').getPublicUrl(data.path);
    setForm(f => ({ ...f, photo: urlData.publicUrl }));
    setUploading(false);
    toast.success('Photo uploaded');
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setForm(f => ({ ...f, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      fee: parseFloat(form.fee),
      maxPlayers: parseInt(form.maxPlayers),
      currentPlayers: parseInt(form.currentPlayers),
    };
    if (id) {
      await db.programs.update(id, data);
      toast.success('Program updated!');
    } else {
      await db.programs.add(data);
      toast.success('Program added!');
    }
    navigate('/admin/programs');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/programs" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="page-title">{id ? 'Edit Program' : 'Add New Program'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Photo Upload */}
          <div>
            <label className="form-label">Program Cover Photo</label>
            <div className="mt-1">
              {photoPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={photoPreview} alt="Program" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-2 right-2 bg-white/90 text-gray-700 p-1.5 rounded-lg shadow hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <ImageIcon size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload cover photo</span>
                  <span className="text-xs text-gray-400">JPG, PNG or WebP · Max 5MB</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              {!photoPreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 btn-outline flex items-center gap-2 text-xs px-3 py-2"
                >
                  <Upload size={14} />
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                </button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="form-label">Program Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input resize-none" />
            </div>
            <div>
              <label className="form-label">Level</label>
              <select value={form.level} onChange={e => setForm({...form, level: e.target.value as 'beginner' | 'intermediate' | 'advanced'})} className="form-input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as 'active' | 'inactive'})} className="form-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="form-label">Age Group</label>
              <input value={form.ageGroup} onChange={e => setForm({...form, ageGroup: e.target.value})} className="form-input" placeholder="e.g. 12-16 years" />
            </div>
            <div>
              <label className="form-label">Duration</label>
              <input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="form-input" placeholder="e.g. 6 months" />
            </div>
            <div>
              <label className="form-label">Fee (₹) *</label>
              <input required type="number" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="form-label">Max Players</label>
              <input type="number" value={form.maxPlayers} onChange={e => setForm({...form, maxPlayers: e.target.value})} className="form-input" />
            </div>
            <div>
              <label className="form-label">Assigned Coach</label>
              <select value={form.coach} onChange={e => setForm({...form, coach: e.target.value})} className="form-input">
                <option value="">Select coach</option>
                {coachList.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Schedule</label>
              <input value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} className="form-input" placeholder="e.g. Mon, Wed, Fri - 6:00 AM to 8:00 AM" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button type="submit" disabled={saving || uploading} className="btn-primary px-8 py-3">
            {saving ? 'Saving…' : id ? 'Save Changes' : 'Add Program'}
          </button>
          <Link to="/admin/programs" className="btn-outline px-8 py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
