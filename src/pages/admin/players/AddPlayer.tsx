import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Camera } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Program } from '@/types';

export default function AddPlayer() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', age: '', dateOfBirth: '',
    address: '', guardianName: '', guardianPhone: '', program: '',
    joinDate: getTodayString(), status: 'active' as const,
    position: '', battingStyle: '', bowlingStyle: '', jerseyNumber: '',
    emergencyContact: '', medicalNotes: '',
  });

  useEffect(() => {
    db.programs.getAll().then(data => setPrograms(data.filter(p => p.status === 'active')));
  }, []);

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
    setSaving(true);
    let photoUrl = '';
    if (photoFile) {
      setUploading(true);
      const ext = photoFile.name.split('.').pop();
      const fileName = `player-${Date.now()}.${ext}`;
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
    const count = await db.players.count();
    const regNumber = `YWCC-${String(count + 1).padStart(4, '0')}`;
    await db.players.add({ ...form, age: parseInt(form.age) || 0, photo: photoUrl }, regNumber);
    toast.success('Player added successfully!');
    navigate('/admin/players');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/players" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Add New Player</h1>
          <p className="text-gray-500 text-sm">Register a new player in the academy</p>
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
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="btn-outline cursor-pointer flex items-center gap-2 text-sm px-4 py-2">
                <Upload size={16} /> {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </label>
              <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP · Max 5MB</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Personal Information</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div><label className="form-label">Full Name *</label><input name="name" required value={form.name} onChange={handleChange} className="form-input" placeholder="Player's full name" /></div>
            <div><label className="form-label">Date of Birth *</label><input name="dateOfBirth" required type="date" value={form.dateOfBirth} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Age</label><input name="age" type="number" min="5" max="50" value={form.age} onChange={handleChange} className="form-input" placeholder="Age" /></div>
            <div><label className="form-label">Phone *</label><input name="phone" required value={form.phone} onChange={handleChange} className="form-input" placeholder="10-digit phone" /></div>
            <div><label className="form-label">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="email@example.com" /></div>
            <div><label className="form-label">Emergency Contact</label><input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} className="form-input" placeholder="Emergency phone" /></div>
            <div className="sm:col-span-2 lg:col-span-3"><label className="form-label">Address *</label><textarea name="address" required rows={2} value={form.address} onChange={handleChange} className="form-input resize-none" placeholder="Full address" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Cricket Information</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div><label className="form-label">Position *</label>
              <select name="position" required value={form.position} onChange={handleChange} className="form-input">
                <option value="">Select position</option>
                <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>Wicket-keeper</option>
              </select>
            </div>
            <div><label className="form-label">Batting Style</label>
              <select name="battingStyle" value={form.battingStyle} onChange={handleChange} className="form-input">
                <option value="">Select style</option><option>Right-hand</option><option>Left-hand</option>
              </select>
            </div>
            <div><label className="form-label">Bowling Style</label>
              <select name="bowlingStyle" value={form.bowlingStyle} onChange={handleChange} className="form-input">
                <option value="">Select style</option>
                <option>Right-arm fast</option><option>Right-arm medium</option><option>Right-arm off-spin</option>
                <option>Left-arm fast</option><option>Left-arm medium</option><option>Left-arm spin</option><option>None</option>
              </select>
            </div>
            <div><label className="form-label">Jersey Number</label><input name="jerseyNumber" value={form.jerseyNumber} onChange={handleChange} className="form-input" placeholder="e.g. 10" /></div>
            <div><label className="form-label">Program *</label>
              <select name="program" required value={form.program} onChange={handleChange} className="form-input">
                <option value="">Select program</option>
                {programs.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label className="form-label">Join Date</label><input name="joinDate" type="date" value={form.joinDate} onChange={handleChange} className="form-input" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Guardian Information</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="form-label">Guardian Name *</label><input name="guardianName" required value={form.guardianName} onChange={handleChange} className="form-input" /></div>
            <div><label className="form-label">Guardian Phone *</label><input name="guardianPhone" required value={form.guardianPhone} onChange={handleChange} className="form-input" /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-5 text-lg">Medical Notes</h2>
          <textarea name="medicalNotes" rows={3} value={form.medicalNotes} onChange={handleChange} className="form-input resize-none" placeholder="Any medical conditions, allergies, or special notes..." />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-base">
            {saving ? (uploading ? 'Uploading photo…' : 'Adding…') : 'Add Player'}
          </button>
          <Link to="/admin/players" className="btn-outline px-8 py-3 text-base">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
