import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users, Clock, ImageIcon } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Program } from '@/types';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

export default function ProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.programs.getAll();
    setPrograms(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete program "${name}"?`)) {
      await db.programs.delete(id);
      toast.success('Program deleted');
      load();
    }
  };

  const toggleStatus = async (id: string, current: string) => {
    await db.programs.update(id, { status: current === 'active' ? 'inactive' : 'active' });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Program Management</h1>
          <p className="text-gray-500 text-sm">{programs.length} programs configured</p>
        </div>
        <Link to="/admin/programs/add" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Program
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading programs…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {programs.map(program => (
            <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Cover Photo */}
              <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                {program.photo ? (
                  <img src={program.photo} alt={program.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight">{program.name}</h3>
                    <span className="text-white/80 text-xs">{program.schedule}</span>
                  </div>
                  <span className={`${program.status === 'active' ? 'bg-green-500/80' : 'bg-red-500/80'} text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm`}>
                    {program.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${levelColors[program.level] || 'bg-gray-100 text-gray-700'}`}>
                    {program.level}
                  </span>
                  {program.ageGroup && (
                    <span className="text-xs text-gray-500">{program.ageGroup}</span>
                  )}
                </div>

                {program.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{program.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-blue-500" />
                    <span>{program.currentPlayers}/{program.maxPlayers} players</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-500" />
                    <span className="truncate">{program.duration}</span>
                  </div>
                </div>

                {program.coach && (
                  <p className="text-xs text-gray-500 mb-3">Coach: <span className="font-medium text-gray-700">{program.coach}</span></p>
                )}

                {/* Enrollment progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Enrollment</span>
                    <span className="font-medium">{Math.round((program.currentPlayers / program.maxPlayers) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((program.currentPlayers / program.maxPlayers) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(program.fee)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(program.id, program.status)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${program.status === 'active' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {program.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link to={`/admin/programs/${program.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <button onClick={() => handleDelete(program.id, program.name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && programs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No programs found</p>
          <p className="text-sm mt-1">Add your first training program to get started</p>
        </div>
      )}
    </div>
  );
}
