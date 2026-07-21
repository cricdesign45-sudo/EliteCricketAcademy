import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Phone, Mail, User } from 'lucide-react';
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
        <Link to="/admin/coaches/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Coach
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading coaches…</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {coaches.map(coach => (
            <div key={coach.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Photo / Avatar Header */}
              <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-900 flex items-end p-4">
                {coach.photo ? (
                  <img src={coach.photo} alt={coach.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : null}
                <div className="relative flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border-2 border-white/30 overflow-hidden flex-shrink-0 bg-gray-600">
                    {coach.photo ? (
                      <img src={coach.photo} alt={coach.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User size={24} className="text-white/60" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{coach.name}</h3>
                    <p className="text-gray-300 text-xs">{coach.specialization} Coach</p>
                    <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${coach.status === 'active' ? 'bg-green-500/30 text-green-200' : 'bg-red-500/30 text-red-200'}`}>
                      {coach.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={13} className="text-blue-500 flex-shrink-0" />
                  <span className="truncate">{coach.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={13} className="text-blue-500 flex-shrink-0" />
                  {coach.phone}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span><span className="font-semibold text-gray-900">{coach.experience}y</span> experience</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(coach.salary)}<span className="text-gray-400 font-normal">/mo</span></span>
                </div>
                {coach.qualifications && (
                  <p className="text-xs text-gray-400 line-clamp-1 border-t border-gray-50 pt-2">{coach.qualifications}</p>
                )}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/admin/coaches/${coach.id}/edit`}
                    className="btn-outline flex-1 text-center text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(coach.id, coach.name)}
                    className="flex-1 btn-danger text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && coaches.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <User size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No coaches found</p>
          <p className="text-sm mt-1">Add your first coach to get started</p>
        </div>
      )}
    </div>
  );
}
