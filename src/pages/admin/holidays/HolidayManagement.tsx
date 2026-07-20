import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, CalendarOff } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import type { Holiday } from '@/types';

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: '', name: '', type: 'national' as Holiday['type'], description: '', isRecurring: false });
  const today = getTodayString();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.holidays.getAll();
    setHolidays(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const todayHoliday = holidays.find(h => h.date === today);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await db.holidays.add(form);
    setForm({ date: '', name: '', type: 'national', description: '', isRecurring: false });
    setShowAdd(false);
    setSaving(false);
    toast.success('Holiday added successfully!');
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete holiday "${name}"?`)) {
      await db.holidays.delete(id);
      toast.success('Holiday deleted');
      load();
    }
  };

  const typeColors: Record<string, string> = {
    national: 'badge-red', state: 'badge-blue', academy: 'badge-green', sports: 'badge-yellow',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Holiday Management</h1>
          <p className="text-gray-500 text-sm">Attendance is automatically disabled on holidays</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Holiday</button>
      </div>

      {todayHoliday && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <CalendarOff className="text-purple-600" size={24} />
          <div>
            <p className="font-semibold text-purple-900">Today is a Holiday: {todayHoliday.name}</p>
            <p className="text-purple-600 text-sm">Attendance is not required today</p>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-4">Add New Holiday</h2>
          <form onSubmit={handleAdd} className="grid sm:grid-cols-2 gap-4">
            <div><label className="form-label">Holiday Name *</label><input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" placeholder="e.g. Diwali" /></div>
            <div><label className="form-label">Date *</label><input required type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as Holiday['type']})} className="form-input">
                <option value="national">National Holiday</option>
                <option value="state">State Holiday</option>
                <option value="academy">Academy Holiday</option>
                <option value="sports">Sports Event</option>
              </select>
            </div>
            <div><label className="form-label">Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input" placeholder="Optional description" /></div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={e => setForm({...form, isRecurring: e.target.checked})} className="w-4 h-4 accent-cricket-green" />
              <label htmlFor="recurring" className="text-sm text-gray-700">Recurring (yearly)</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Holiday'}</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading holidays…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Holiday Name</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Recurring</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {holidays.map(h => (
                  <tr key={h.id} className={`hover:bg-gray-50/50 ${h.date === today ? 'bg-purple-50/50' : ''}`}>
                    <td className="table-td font-semibold">
                      {h.date === today && <span className="mr-2 text-purple-600">📅</span>}
                      {h.name}
                    </td>
                    <td className="table-td text-gray-600">{formatDate(h.date)}</td>
                    <td className="table-td"><span className={typeColors[h.type] || 'badge-blue'}>{h.type}</span></td>
                    <td className="table-td">{h.isRecurring ? <span className="badge-green">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                    <td className="table-td text-gray-500 text-xs max-w-xs truncate">{h.description || '-'}</td>
                    <td className="table-td">
                      <button onClick={() => handleDelete(h.id, h.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && holidays.length === 0 && <div className="text-center py-12 text-gray-400">No holidays configured</div>}
        </div>
      </div>
    </div>
  );
}
