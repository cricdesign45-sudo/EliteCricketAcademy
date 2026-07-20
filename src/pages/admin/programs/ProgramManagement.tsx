import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Users, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Program } from '@/types';

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
        <Link to="/admin/programs/add" className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Program</Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading programs…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {programs.map(program => (
            <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{program.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${program.level === 'beginner' ? 'bg-green-100 text-green-700' : program.level === 'intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{program.level}</span>
                </div>
                <span className={program.status === 'active' ? 'badge-green' : 'badge-red'}>{program.status}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">{program.description}</p>
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1.5"><Users size={14} className="text-cricket-green" />{program.ageGroup}</div>
                <div className="flex items-center gap-1.5"><Clock size={14} className="text-cricket-green" />{program.duration}</div>
                <div>Coach: <span className="font-medium">{program.coach}</span></div>
                <div>Players: <span className="font-medium">{program.currentPlayers}/{program.maxPlayers}</span></div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Enrollment</span>
                  <span>{Math.round((program.currentPlayers / program.maxPlayers) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-cricket-green h-1.5 rounded-full" style={{ width: `${(program.currentPlayers / program.maxPlayers) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-2xl font-bold text-cricket-green">{formatCurrency(program.fee)}</span>
                <div className="flex gap-2">
                  <button onClick={() => toggleStatus(program.id, program.status)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${program.status === 'active' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                    {program.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link to={`/admin/programs/${program.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></Link>
                  <button onClick={() => handleDelete(program.id, program.name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
