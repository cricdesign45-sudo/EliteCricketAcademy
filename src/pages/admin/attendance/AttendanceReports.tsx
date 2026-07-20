import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { getAttendancePercentage } from '@/lib/utils';
import type { Player, AttendanceRecord } from '@/types';

export default function AttendanceReports() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, a] = await Promise.all([db.players.getAll(), db.attendance.getAll()]);
      setPlayers(p.filter(pl => pl.status === 'active'));
      setAllRecords(a);
      setLoading(false);
    }
    load();
  }, []);

  const playerStats = players.map(p => {
    const records = allRecords.filter(r => r.playerId === p.id);
    const present = records.filter(r => r.status === 'present').length;
    const pct = getAttendancePercentage(present, records.length);
    return { ...p, total: records.length, present, absent: records.filter(r => r.status === 'absent').length, late: records.filter(r => r.status === 'late').length, pct };
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/attendance" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="text-gray-500 text-sm">Player attendance statistics overview</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading reports…</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Total Days</th>
                  <th className="table-th">Present</th>
                  <th className="table-th">Absent</th>
                  <th className="table-th">Late</th>
                  <th className="table-th">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {playerStats.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="table-td font-medium">{p.name}</td>
                    <td className="table-td"><span className="badge-blue text-xs">{p.program}</span></td>
                    <td className="table-td">{p.total}</td>
                    <td className="table-td text-green-600 font-semibold">{p.present}</td>
                    <td className="table-td text-red-500 font-semibold">{p.absent}</td>
                    <td className="table-td text-amber-500 font-semibold">{p.late}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${p.pct >= 75 ? 'bg-green-500' : p.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.pct}%` }} />
                        </div>
                        <span className={`text-sm font-semibold ${p.pct >= 75 ? 'text-green-600' : p.pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{p.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {playerStats.length === 0 && <div className="text-center py-12 text-gray-400">No attendance data available</div>}
          </div>
        </div>
      )}
    </div>
  );
}
