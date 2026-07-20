import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, CalendarCheck, TrendingUp, AlertCircle, Trophy, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, getTodayString } from '@/lib/utils';
import type { Fee, Notification, Holiday } from '@/types';

export default function Dashboard() {
  const today = getTodayString();
  const [loading, setLoading] = useState(true);
  const [activePlayers, setActivePlayers] = useState(0);
  const [allFees, setAllFees] = useState<Fee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isHolidayToday, setIsHolidayToday] = useState(false);
  const [holidayInfo, setHolidayInfo] = useState<Holiday | null>(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [presentToday, setPresentToday] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [players, fees, notifs, holiday, holidayData, marked] = await Promise.all([
        db.players.getAll(),
        db.fees.getAll(),
        db.notifications.getAll(),
        db.holidays.isHoliday(today),
        db.holidays.getForDate(today),
        db.attendance.isMarkedForDate(today),
      ]);
      setActivePlayers(players.filter(p => p.status === 'active').length);
      setAllFees(fees);
      setNotifications(notifs.filter(n => !n.isRead));
      setIsHolidayToday(holiday);
      setHolidayInfo(holidayData);
      setAttendanceMarked(marked);
      if (marked) {
        const records = await db.attendance.getByDate(today);
        setPresentToday(records.filter(r => r.status === 'present').length);
      }
      setLoading(false);
    }
    load();
  }, [today]);

  const totalCollection = allFees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const pendingFees = allFees.filter(f => f.status === 'pending').length;
  const overdueFees = allFees.filter(f => f.status === 'overdue').length;
  const pendingAmount = allFees.filter(f => ['pending', 'overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);
  const recentFees = [...allFees].sort((a, b) => b.dueDate.localeCompare(a.dueDate)).slice(0, 5);

  const stats = [
    { label: 'Active Players', value: loading ? '…' : String(activePlayers), icon: Users, color: 'bg-blue-500', link: '/admin/players', change: 'Registered players' },
    { label: 'Total Collection', value: loading ? '…' : formatCurrency(totalCollection), icon: TrendingUp, color: 'bg-green-500', link: '/admin/fees', change: 'This year' },
    { label: 'Pending Fees', value: loading ? '…' : String(pendingFees + overdueFees), icon: CreditCard, color: 'bg-amber-500', link: '/admin/fees', change: loading ? '' : `${formatCurrency(pendingAmount)} pending` },
    {
      label: "Today's Attendance",
      value: loading ? '…' : isHolidayToday ? 'Holiday' : attendanceMarked ? `${presentToday}/${activePlayers}` : 'Not Marked',
      icon: CalendarCheck,
      color: isHolidayToday ? 'bg-purple-500' : attendanceMarked ? 'bg-cricket-green' : 'bg-red-500',
      link: '/admin/attendance',
      change: isHolidayToday ? holidayInfo?.name || 'Holiday' : attendanceMarked ? 'Marked today' : 'Mark now',
    },
  ];

  return (
    <div>
      <div className="page-header mb-6">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening at Elite Cricket Academy.</p>
      </div>

      {isHolidayToday && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Trophy className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="font-semibold text-purple-900">Today is a Holiday: {holidayInfo?.name}</p>
            <p className="text-purple-600 text-sm">Attendance is not required today. {holidayInfo?.description}</p>
          </div>
        </div>
      )}

      {!loading && !isHolidayToday && !attendanceMarked && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-amber-600" size={24} />
            <div>
              <p className="font-semibold text-amber-900">Attendance Not Marked Today</p>
              <p className="text-amber-600 text-sm">Please mark today's attendance for all players.</p>
            </div>
          </div>
          <Link to="/admin/attendance" className="btn-secondary text-sm px-4 py-2 whitespace-nowrap">Mark Now</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} to={stat.link} className="stat-card group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <stat.icon className="text-white" size={22} />
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-cricket-green transition-colors mt-1" />
            </div>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Fee Transactions</h2>
            <Link to="/admin/fees" className="text-cricket-green text-sm hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-th">Player</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Month</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentFees.map(fee => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium">{fee.playerName}</td>
                    <td className="table-td font-semibold">{formatCurrency(fee.amount)}</td>
                    <td className="table-td text-gray-500">{fee.month} {fee.year}</td>
                    <td className="table-td">
                      <span className={fee.status === 'paid' ? 'badge-green' : fee.status === 'overdue' ? 'badge-red' : 'badge-yellow'}>{fee.status}</span>
                    </td>
                  </tr>
                ))}
                {recentFees.length === 0 && !loading && (
                  <tr><td colSpan={4} className="table-td text-center text-gray-400">No fee records yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Player', link: '/admin/players/add', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: 'Mark Attendance', link: '/admin/attendance', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
                { label: 'Add Fee', link: '/admin/fees/add', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
                { label: 'Add Holiday', link: '/admin/holidays', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { label: 'Add News', link: '/admin/news/add', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
                { label: 'Reports', link: '/admin/reports', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
              ].map(action => (
                <Link key={action.label} to={action.link} className={`${action.color} rounded-lg py-3 px-3 text-center text-xs font-semibold transition-colors`}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Notifications</h2>
              <span className="badge-red">{notifications.length} new</span>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'warning' ? 'bg-amber-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-gray-400 text-sm text-center py-3">All caught up!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
