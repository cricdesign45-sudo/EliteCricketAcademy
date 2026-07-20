import { useState, useEffect, useCallback } from 'react';
import { CalendarOff, CheckCircle, Clock, XCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Player, Holiday } from '@/types';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export default function Attendance() {
  const today = getTodayString();
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState<Holiday | null>(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [players, holiday, holidayData, existing] = await Promise.all([
      db.players.getAll(),
      db.holidays.isHoliday(today),
      db.holidays.getForDate(today),
      db.attendance.getByDate(today),
    ]);
    const active = players.filter(p => p.status === 'active');
    setActivePlayers(active);
    setIsHoliday(holiday);
    setHolidayInfo(holidayData);
    setAlreadyMarked(existing.length > 0);
    setSaved(existing.length > 0);
    const map: Record<string, AttendanceStatus> = {};
    active.forEach(p => {
      const rec = existing.find(r => r.playerId === p.id);
      map[p.id] = rec ? rec.status : 'present';
    });
    setAttendanceMap(map);
    setLoading(false);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    activePlayers.forEach(p => { map[p.id] = status; });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    const records = activePlayers.map(p => ({
      playerId: p.id,
      playerName: p.name,
      date: today,
      status: attendanceMap[p.id] || 'absent',
      markedBy: 'Admin',
      notes: notes[p.id] || '',
      time: new Date().toLocaleTimeString(),
    }));
    await db.attendance.markBulk(records);
    setSaved(true);
    toast.success('Attendance saved successfully!');
  };

  const counts = {
    present: Object.values(attendanceMap).filter(s => s === 'present').length,
    absent: Object.values(attendanceMap).filter(s => s === 'absent').length,
    late: Object.values(attendanceMap).filter(s => s === 'late').length,
    leave: Object.values(attendanceMap).filter(s => s === 'leave').length,
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading attendance…</div>;

  if (isHoliday) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="page-title">Daily Attendance</h1>
          <p className="text-gray-500 text-sm">{formatDate(today)}</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-12 text-center">
          <CalendarOff size={64} className="text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-purple-900 mb-2">Today is a Holiday</h2>
          <p className="text-purple-700 text-lg font-medium">{holidayInfo?.name}</p>
          <p className="text-purple-600 mt-2">{holidayInfo?.description}</p>
          <p className="text-purple-500 text-sm mt-4">Attendance is not required on holidays.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Daily Attendance</h1>
          <p className="text-gray-500 text-sm">{formatDate(today)}</p>
        </div>
        {saved && <span className="badge-green text-sm px-3 py-1.5">✓ Attendance Saved</span>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Present', count: counts.present, color: 'bg-green-50 border-green-200 text-green-700', icon: CheckCircle },
          { label: 'Absent', count: counts.absent, color: 'bg-red-50 border-red-200 text-red-700', icon: XCircle },
          { label: 'Late', count: counts.late, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock },
          { label: 'Leave', count: counts.leave, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: CalendarOff },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{s.label}</p>
              <s.icon size={18} />
            </div>
            <p className="text-3xl font-bold mt-1">{s.count}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <button onClick={() => markAll('present')} className="btn-outline text-sm flex items-center gap-1.5">
          <CheckCircle size={14} className="text-green-600" /> Mark All Present
        </button>
        <button onClick={() => markAll('absent')} className="btn-outline text-sm flex items-center gap-1.5">
          <XCircle size={14} className="text-red-600" /> Mark All Absent
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="table-th">Player</th>
                <th className="table-th">Program</th>
                <th className="table-th">Status</th>
                <th className="table-th">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activePlayers.map(player => (
                <tr key={player.id} className="hover:bg-gray-50/50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cricket-green rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{player.name}</p>
                        <p className="text-xs text-gray-400">#{player.jerseyNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td"><span className="badge-blue text-xs">{player.program}</span></td>
                  <td className="table-td">
                    <div className="flex gap-1.5">
                      {(['present', 'absent', 'late', 'leave'] as AttendanceStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => setAttendanceMap({ ...attendanceMap, [player.id]: status })}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize transition-all border ${
                            attendanceMap[player.id] === status
                              ? status === 'present' ? 'bg-green-500 text-white border-green-500'
                                : status === 'absent' ? 'bg-red-500 text-white border-red-500'
                                : status === 'late' ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="table-td">
                    <input
                      type="text"
                      placeholder="Optional note..."
                      value={notes[player.id] || ''}
                      onChange={e => setNotes({ ...notes, [player.id]: e.target.value })}
                      className="text-xs border border-gray-200 rounded px-2 py-1 w-32 focus:outline-none focus:border-cricket-green"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activePlayers.length === 0 && <div className="text-center py-12 text-gray-400">No active players found</div>}
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary px-8 py-3 text-base font-bold">
        {saved ? 'Update Attendance' : 'Save Attendance'}
      </button>
    </div>
  );
}
