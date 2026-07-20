import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';

export default function AddCoach() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', specialization: '', experience: '',
    qualifications: '', status: 'active' as 'active' | 'inactive',
    bio: '', joinDate: getTodayString(), salary: '',
  });

  useEffect(() => {
    if (id) {
      db.coaches.getById(id).then(coach => {
        if (coach) {
          setForm({
            name: coach.name, email: coach.email || '', phone: coach.phone || '',
            specialization: coach.specialization || '', experience: String(coach.experience || ''),
            qualifications: coach.qualifications || '', status: coach.status,
            bio: coach.bio || '', joinDate: coach.joinDate || getTodayString(),
            salary: String(coach.salary || ''),
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, experience: parseInt(form.experience) || 0, salary: parseFloat(form.salary) || 0 };
    if (id) {
      await db.coaches.update(id, data);
      toast.success('Coach updated!');
    } else {
      await db.coaches.add(data);
      toast.success('Coach added!');
    }
    navigate('/admin/coaches');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/coaches" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <h1 className="page-title">{id ? 'Edit Coach' : 'Add New Coach'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="form-label">Full Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Email *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Phone *</label><input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Specialization *</label>
              <select required value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="form-input">
                <option value="">Select</option>
                <option>Batting</option><option>Bowling</option><option>Fielding & Fitness</option><option>Wicket-keeping</option><option>All-round</option>
              </select>
            </div>
            <div><label className="form-label">Experience (years)</label><input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Monthly Salary (₹)</label><input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Join Date</label><input type="date" value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as 'active' | 'inactive'})} className="form-input">
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className="form-label">Qualifications</label><input value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})} className="form-input" placeholder="e.g. NCA Level 3, BCCI Certified" /></div>
            <div className="sm:col-span-2"><label className="form-label">Bio</label><textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="form-input resize-none" /></div>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3">{saving ? 'Saving…' : id ? 'Save Changes' : 'Add Coach'}</button>
          <Link to="/admin/coaches" className="btn-outline px-8 py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
