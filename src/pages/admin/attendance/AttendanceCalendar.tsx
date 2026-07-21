import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, CalendarOff, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { AttendanceRecord, Holiday } from '@/types';

/* ── Types ─────────────────────────────── */
type DayStatus = 'all-present' | 'partial' | 'absent' | 'holiday' | 'no-session' | 'future';

interface DayData {
  date: string;
  status: DayStatus;
  present: number;
  absent: number;
  late: number;
  total: number;
  holidayName?: string;
}

/* ── Helpers ────────────────────────────── */
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/* ── Day Cell Config ─────────────────────── */
const STATUS_CONFIG: Record<DayStatus, { bg: string; text: string; ring: string; label: string }> = {
  'all-present': { bg: 'bg-green-500',  text: 'text-white',     ring: 'ring-green-300',  label: 'All Present' },
  'partial':     { bg: 'bg-amber-400',  text: 'text-white',     ring: 'ring-amber-300',  label: 'Partial' },
  'absent':      { bg: 'bg-red-500',    text: 'text-white',     ring: 'ring-red-300',    label: 'Absences' },
  'holiday':     { bg: 'bg-purple-500', text: 'text-white',     ring: 'ring-purple-300', label: 'Holiday' },
  'no-session':  { bg: 'bg-gray-100',   text: 'text-gray-400',  ring: 'ring-gray-200',   label: 'No Session' },
  'future':      { bg: 'bg-gray-50',    text: 'text-gray-300',  ring: 'ring-gray-100',   label: 'Future' },
};

/* ── Drill-down Modal ──────────────────────── */
function DrillDown({ dayData, records, onClose }: { dayData: DayData; records: AttendanceRecord[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">{formatDate(dayData.date)}</h3>
            {dayData.status === 'holiday' ? (
              <p className="text-purple-600 text-sm">{dayData.holidayName} (Holiday)</p>
            ) : (
              <p className="text-gray-500 text-sm">{dayData.total} records — {dayData.present}P · {dayData.absent}A · {dayData.late}L</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg text-lg font-bold">✕</button>
        </div>
        {dayData.status === 'holiday' ? (
          <div className="p-10 text-center">
            <CalendarOff size={40} className="text-purple-400 mx-auto mb-3" />
            <p className="text-gray-500">No attendance on this holiday</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No session recorded for this day.</div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Player</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Time</th>
                  <th className="table-th">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="table-td font-medium text-gray-800">{r.playerName}</td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'present' ? 'bg-green-100 text-green-700' :
                        r.status === 'absent'  ? 'bg-red-100 text-red-600' :
                        r.status === 'late'    ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {r.status === 'present' ? <CheckCircle size={10} /> : r.status === 'absent' ? <XCircle size={10} /> : <Clock size={10} />}
                        {r.status}
                      </span>
                    </td>
                    <td className="table-td text-gray-500 text-xs">{r.time || '—'}</td>
                    <td className="table-td text-gray-500 text-xs">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────── */
export default function AttendanceCalendar() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [calData, setCalData] = useState<Record<string, DayData>>({});
  const [recordsMap, setRecordsMap] = useState<Record<string, AttendanceRecord[]>>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DayData | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [attendance, hols, players] = await Promise.all([
        db.attendance.getAll(),
        db.holidays.getAll(),
        db.players.getAll(),
      ]);
      setHolidays(hols);
      setTotalPlayers(players.filter(p => p.status === 'active').length);
      // Group attendance by date
      const grouped: Record<string, AttendanceRecord[]> = {};
      attendance.forEach(r => {
        if (!grouped[r.date]) grouped[r.date] = [];
        grouped[r.date].push(r);
      });
      setRecordsMap(grouped);
      setLoading(false);
    }
    loadAll();
  }, []);

  useEffect(() => {
    const days = daysInMonth(viewYear, viewMonth);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const data: Record<string, DayData> = {};

    for (let d = 1; d <= days; d++) {
      const dateStr = toDateStr(viewYear, viewMonth, d);
      const isFuture = dateStr > todayStr;
      const holiday = holidays.find(h => h.date === dateStr);
      const recs = recordsMap[dateStr] || [];

      let status: DayStatus;
      if (isFuture) {
        status = 'future';
      } else if (holiday) {
        status = 'holiday';
      } else if (recs.length === 0) {
        status = 'no-session';
      } else {
        const present = recs.filter(r => r.status === 'present' || r.status === 'late').length;
        const absent = recs.filter(r => r.status === 'absent').length;
        if (absent === 0) status = 'all-present';
        else if (present === 0) status = 'absent';
        else status = 'partial';
      }

      data[dateStr] = {
        date: dateStr,
        status,
        present: recs.filter(r => r.status === 'present').length,
        absent: recs.filter(r => r.status === 'absent').length,
        late: recs.filter(r => r.status === 'late').length,
        total: recs.length,
        holidayName: holiday?.name,
      };
    }
    setCalData(data);
  }, [viewYear, viewMonth, recordsMap, holidays]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const weekDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);

  // Monthly summary
  const allDaysData = Object.values(calData);
  const sessionsHeld = allDaysData.filter(d => d.status !== 'holiday' && d.status !== 'no-session' && d.status !== 'future').length;
  const fullPresent = allDaysData.filter(d => d.status === 'all-present').length;
  const partialDays = allDaysData.filter(d => d.status === 'partial').length;
  const holidayCount = allDaysData.filter(d => d.status === 'holiday').length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/attendance" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Attendance Calendar</h1>
          <p className="text-gray-500 text-sm">Monthly heatmap — click any day for details</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sessions Held', value: sessionsHeld, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Full Attendance', value: fullPresent, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-100' },
          { label: 'Partial Days', value: partialDays, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { label: 'Holidays', value: holidayCount, icon: CalendarOff, color: 'text-purple-600 bg-purple-50 border-purple-100' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium opacity-75">{s.label}</p>
              <s.icon size={16} className="opacity-60" />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Month Nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-900">{monthNames[viewMonth]} {viewYear}</h2>
          <button onClick={nextMonth} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading calendar…</div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}

              {/* Day cells */}
              {Array.from({ length: days }).map((_, i) => {
                const d = i + 1;
                const dateStr = toDateStr(viewYear, viewMonth, d);
                const dayData = calData[dateStr];
                if (!dayData) return <div key={d} />;
                const cfg = STATUS_CONFIG[dayData.status];
                const isToday = dateStr === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const isClickable = dayData.status !== 'future' && dayData.status !== 'no-session';

                return (
                  <button
                    key={d}
                    onClick={() => isClickable && setSelected(dayData)}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold
                      ${cfg.bg} ${cfg.text}
                      ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-md active:scale-95' : 'cursor-default'}
                      ${isToday ? `ring-2 ${cfg.ring} ring-offset-1` : ''}
                    `}
                    title={dayData.status === 'holiday' ? dayData.holidayName : dayData.status === 'future' ? 'Future date' : dayData.total > 0 ? `${dayData.present}P ${dayData.absent}A ${dayData.late}L` : 'No session'}
                  >
                    <span className="text-[13px] leading-none">{d}</span>
                    {dayData.total > 0 && dayData.status !== 'holiday' && (
                      <span className="text-[9px] opacity-75 leading-none mt-0.5">{dayData.present}/{dayData.total}</span>
                    )}
                    {dayData.status === 'holiday' && (
                      <CalendarOff size={8} className="mt-0.5 opacity-75" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="px-6 pb-5 flex flex-wrap gap-4">
          {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'future').map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`w-3 h-3 rounded-sm ${cfg.bg}`} />
              {cfg.label}
            </div>
          ))}
        </div>
      </div>

      {/* Drill-down Modal */}
      {selected && (
        <DrillDown
          dayData={selected}
          records={recordsMap[selected.date] || []}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
