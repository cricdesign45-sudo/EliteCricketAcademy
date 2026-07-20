import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarOff } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, getTodayString } from '@/lib/utils';
import type { AttendanceRecord, Holiday } from '@/types';

export default function AttendanceHistory() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState<Holiday | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [recs, holiday, holidayData] = await Promise.all([
        db.attendance.getByDate(selectedDate),
        db.holidays.isHoliday(selectedDate),
        db.holidays.getForDate(selectedDate),
      ]);
      setRecords(recs);
      setIsHoliday(holiday);
      setHolidayInfo(holidayData);
      setLoading(false);
    }
    load();
  }, [selectedDate]);

  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/attendance" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="text-gray-500 text-sm">View attendance records by date</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex items-center gap-4">
        <label className="form-label mb-0">Select Date:</label>
        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="form-input w-auto" />
        {isHoliday && <span className="badge-yellow flex items-center gap-1"><CalendarOff size={12} /> Holiday: {holidayInfo?.name}</span>}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : isHoliday ? (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-8 text-center">
          <CalendarOff size={48} className="text-purple-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-purple-900">{holidayInfo?.name}</h3>
          <p className="text-purple-600 mt-1">No attendance on this holiday</p>
        </div>
      ) : records.length > 0 ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Present', value: present, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Absent', value: absent, color: 'bg-red-50 text-red-700 border-red-200' },
              { label: 'Late', value: records.filter(r => r.status === 'late').length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'Leave', value: records.filter(r => r.status === 'leave').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
            ].map(s => (
              <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="table-th">Player</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Time</th>
                    <th className="table-th">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {records.map(r => (
                    <tr key={r.id}>
                      <td className="table-td font-medium">{r.playerName}</td>
                      <td className="table-td">
                        <span className={r.status === 'present' ? 'badge-green' : r.status === 'absent' ? 'badge-red' : r.status === 'late' ? 'badge-yellow' : 'badge-blue'}>{r.status}</span>
                      </td>
                      <td className="table-td text-gray-500 text-xs">{r.time || '-'}</td>
                      <td className="table-td text-gray-500 text-xs">{r.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400 text-lg">No attendance records for {formatDate(selectedDate)}</p>
          <Link to="/admin/attendance" className="btn-primary mt-4 inline-block">Mark Today's Attendance</Link>
        </div>
      )}
    </div>
  );
}
