import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Camera } from 'lucide-react';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Player, Program } from '@/types';

export default function EditPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const [p, progs] = await Promise.all([db.players.getById(id!), db.programs.getAll()]);
      setPlayer(p);
      setPrograms(progs.filter(pr => pr.status === 'active'));
      if (p) {
        setForm({
          name: p.name, email: p.email || '', phone: p.phone, age: String(p.age),
          dateOfBirth: p.dateOfBirth, address: p.address, guardianName: p.guardianName,
          guardianPhone: p.guardianPhone, program: p.program, joinDate: p.joinDate,
          status: p.status, position: p.position, battingStyle: p.battingStyle,
          bowlingStyle: p.bowlingStyle, jerseyNumber: p.jerseyNumber,
          emergencyContact: p.emergencyContact, medicalNotes: p.medicalNotes || '',
          badge: p.badge || '',
        });
        if (p.photo) setPhotoPreview(p.photo);
      }
    }
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    let photoUrl: string | undefined = player?.photo;
    if (photoFile) {
      setUploading(true);
      const ext = photoFile.name.split('.').pop();
      const fileName = `player-${id}-${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(fileName, photoFile, { upsert: true });
      setUploading(false);
      if (uploadError) {
        toast.error('Photo upload failed: ' + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('player-photos').getPublicUrl(uploadData.path);
      photoUrl = urlData.publicUrl;
    }
    await db.players.update(id, {
      ...form,
      age: parseInt(form.age) || 0,
      status: form.status as Player['status'],
      photo: photoUrl,
      badge: (form.badge || null) as Player['badge'],
    });
    toast.success('Player updated successfully!');
    navigate(`/admin/players/${id}`);
  };

  if (!player && Object.keys(form).length === 0) {
    return <div className="text-center py-20 text-gray-400">Loading…</div>;
  }

  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Player not found</p>
        <Link to="/admin/players" className="btn-primary">Back to Players</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/admin/players/${id}`} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Edit Player</h1>
          <p className="text-gray-500 text-sm">{player.name} — {player.registrationNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Player Photo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-cricket-green shadow" />
                  <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Camera size={28} className="text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" id="photo-upload-edit" />
              <label htmlFor="photo-upload-edit" className="btn-outline cursor-pointer flex items-center gap-2 text-sm px-4 py-2">
                <Upload size={16} /> {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP · Max 5MB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Personal Information</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div><label className="form-label">Full Name *</label><input name="name" required value={form.name || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Date of Birth</label><input name="dateOfBirth" type="date" value={form.dateOfBirth || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Age</label><input name="age" type="number" value={form.age || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Phone *</label><input name="phone" required value={form.phone || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Email</label><input name="email" type="email" value={form.email || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Status</label>
              <select name="status" value={form.status || 'active'} onChange={handleChange} className="form-input">
                <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="form-label">Address</label><textarea name="address" rows={2} value={form.address || ''} onChange={handleChange} className="form-input resize-none" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Cricket Information</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div><label className="form-label">Position</label>
              <select name="position" value={form.position || ''} onChange={handleChange} className="form-input">
                <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>Wicket-keeper</option>
              </select>
            </div>
            <div><label className="form-label">Batting Style</label>
              <select name="battingStyle" value={form.battingStyle || ''} onChange={handleChange} className="form-input">
                <option>Right-hand</option><option>Left-hand</option>
              </select>
            </div>
            <div><label className="form-label">Bowling Style</label>
              <select name="bowlingStyle" value={form.bowlingStyle || ''} onChange={handleChange} className="form-input">
                <option>Right-arm fast</option><option>Right-arm medium</option><option>Right-arm off-spin</option>
                <option>Left-arm fast</option><option>Left-arm medium</option><option>Left-arm spin</option><option>None</option>
              </select>
            </div>
            <div><label className="form-label">Jersey Number</label><input name="jerseyNumber" value={form.jerseyNumber || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Program</label>
              <select name="program" value={form.program || ''} onChange={handleChange} className="form-input">
                {programs.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Guardian & Medical</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="form-label">Guardian Name</label><input name="guardianName" value={form.guardianName || ''} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Guardian Phone</label><input name="guardianPhone" value={form.guardianPhone || ''} onChange={handleChange} className="form-input" /></div>
            <div className="sm:col-span-2"><label className="form-label">Medical Notes</label><textarea name="medicalNotes" rows={3} value={form.medicalNotes || ''} onChange={handleChange} className="form-input resize-none" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-2 text-lg">Verification Badge</h2>
          <p className="text-sm text-gray-500 mb-4">Assign a special badge to recognize this player's status.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['', 'verified', 'elite', 'champion'] as const).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setForm({ ...form, badge: b })}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  (form.badge || '') === b
                    ? b === '' ? 'border-gray-400 bg-gray-100' : b === 'verified' ? 'border-blue-500 bg-blue-50' : b === 'elite' ? 'border-gray-900 bg-gray-900 text-white' : 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xl mb-1">{b === '' ? '—' : b === 'verified' ? '✓' : b === 'elite' ? '★' : '⚡'}</div>
                <div className="text-xs font-semibold">{b === '' ? 'No Badge' : b === 'verified' ? 'Verified' : b === 'elite' ? 'Elite' : 'Champion'}</div>
                {b !== '' && <div className="text-xs opacity-60 mt-0.5">{b === 'verified' ? 'Blue' : b === 'elite' ? 'Black/Gold' : 'Green'}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-base">{saving ? (uploading ? 'Uploading photo…' : 'Saving…') : 'Save Changes'}</button>
          <Link to={`/admin/players/${id}`} className="btn-outline px-8 py-3 text-base">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
