import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';

export default function AddProgram() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [coachList, setCoachList] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', duration: '', fee: '', ageGroup: '',
    schedule: '', maxPlayers: '20', currentPlayers: '0', coach: '',
    status: 'active' as 'active' | 'inactive', level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
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
          });
        }
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, fee: parseFloat(form.fee), maxPlayers: parseInt(form.maxPlayers), currentPlayers: parseInt(form.currentPlayers) };
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
        <Link to="/admin/programs" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <h1 className="page-title">{id ? 'Edit Program' : 'Add New Program'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2"><label className="form-label">Program Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" /></div>
            <div className="sm:col-span-2"><label className="form-label">Description</label><textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input resize-none" /></div>
            <div><label className="form-label">Level</label>
              <select value={form.level} onChange={e => setForm({...form, level: e.target.value as 'beginner' | 'intermediate' | 'advanced'})} className="form-input">
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
            <div><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as 'active' | 'inactive'})} className="form-input">
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div><label className="form-label">Age Group</label><input value={form.ageGroup} onChange={e => setForm({...form, ageGroup: e.target.value})} className="form-input" placeholder="e.g. 12-16 years" /></div>
            <div><label className="form-label">Duration</label><input value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="form-input" placeholder="e.g. 6 months" /></div>
            <div><label className="form-label">Fee (₹) *</label><input required type="number" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Max Players</label><input type="number" value={form.maxPlayers} onChange={e => setForm({...form, maxPlayers: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Assigned Coach</label>
              <select value={form.coach} onChange={e => setForm({...form, coach: e.target.value})} className="form-input">
                <option value="">Select coach</option>
                {coachList.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2"><label className="form-label">Schedule</label><input value={form.schedule} onChange={e => setForm({...form, schedule: e.target.value})} className="form-input" placeholder="e.g. Mon, Wed, Fri - 6:00 AM to 8:00 AM" /></div>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3">{saving ? 'Saving…' : id ? 'Save Changes' : 'Add Program'}</button>
          <Link to="/admin/programs" className="btn-outline px-8 py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
