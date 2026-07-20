import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Phone, Mail } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Coach } from '@/types';

export default function CoachManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.coaches.getAll();
    setCoaches(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete coach "${name}"?`)) {
      await db.coaches.delete(id);
      toast.success('Coach deleted');
      load();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Coach Management</h1>
          <p className="text-gray-500 text-sm">{coaches.length} coaches registered</p>
        </div>
        <Link to="/admin/coaches/add" className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Coach</Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading coaches…</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map(coach => (
            <div key={coach.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-cricket-green to-cricket-green-dark p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {coach.name.charAt(0)}
                </div>
                <h3 className="font-bold text-lg">{coach.name}</h3>
                <p className="text-green-200 text-sm">{coach.specialization} Coach</p>
                <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${coach.status === 'active' ? 'bg-green-400/30' : 'bg-red-400/30'}`}>{coach.status}</span>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} className="text-cricket-green" /> {coach.email}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-cricket-green" /> {coach.phone}</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{coach.experience}y</span> experience | <span className="font-medium">{formatCurrency(coach.salary)}/mo</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{coach.qualifications}</p>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Link to={`/admin/coaches/${coach.id}/edit`} className="btn-outline flex-1 text-center text-xs py-1.5 flex items-center justify-center gap-1.5">
                    <Pencil size={12} /> Edit
                  </Link>
                  <button onClick={() => handleDelete(coach.id, coach.name)} className="flex-1 btn-danger text-xs py-1.5 flex items-center justify-center gap-1.5">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && coaches.length === 0 && <div className="text-center py-12 text-gray-400">No coaches found</div>}
    </div>
  );
}
