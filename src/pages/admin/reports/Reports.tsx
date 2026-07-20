import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Users, CreditCard, CalendarCheck, TrendingUp } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency, getTodayString } from '@/lib/utils';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPlayers: 0, activePlayers: 0, inactivePlayers: 0, totalCollection: 0, pendingAmount: 0, attendanceDates: 0, avgAttendance: 0 });

  useEffect(() => {
    async function load() {
      const [players, fees, attendance] = await Promise.all([
        db.players.getAll(),
        db.fees.getAll(),
        db.attendance.getAll(),
      ]);
      const totalCollection = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
      const pendingAmount = fees.filter(f => ['pending', 'overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);
      const attendanceDates = Array.from(new Set(attendance.map(a => a.date))).length;
      const avgAttendance = attendanceDates > 0
        ? Math.round(attendance.filter(a => a.status === 'present').length / attendanceDates)
        : 0;
      setStats({
        totalPlayers: players.length,
        activePlayers: players.filter(p => p.status === 'active').length,
        inactivePlayers: players.filter(p => p.status === 'inactive').length,
        totalCollection, pendingAmount, attendanceDates, avgAttendance,
      });
      setLoading(false);
    }
    load();
  }, []);

  const reportCards = [
    { title: 'Player Management', desc: 'View player list, profiles, and statistics', link: '/admin/players', icon: Users, stats: [`${stats.activePlayers} Active`, `${stats.inactivePlayers} Inactive`], color: 'bg-blue-500' },
    { title: 'Fee Reports', desc: 'Financial overview, collections, and pending fees', link: '/admin/fees/reports', icon: CreditCard, stats: [formatCurrency(stats.totalCollection) + ' Collected', formatCurrency(stats.pendingAmount) + ' Pending'], color: 'bg-green-500' },
    { title: 'Attendance Reports', desc: 'Player attendance statistics and history', link: '/admin/attendance/reports', icon: CalendarCheck, stats: [`${stats.attendanceDates} Days Tracked`, `Avg ${stats.avgAttendance} Present/Day`], color: 'bg-amber-500' },
    { title: 'Player Statistics', desc: 'Detailed player performance stats', link: '/admin/player-stats', icon: BarChart3, stats: [`${stats.totalPlayers} Total Players`, 'Per-player metrics'], color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Reports Overview</h1>
        <p className="text-gray-500 text-sm">Academy-wide analytics and reports</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading reports…</div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Total Players', value: stats.totalPlayers, color: 'text-blue-600' },
              { label: 'Fee Collection', value: formatCurrency(stats.totalCollection), color: 'text-green-600' },
              { label: 'Pending Fees', value: formatCurrency(stats.pendingAmount), color: 'text-amber-600' },
              { label: 'Attendance Days', value: stats.attendanceDates, color: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-gray-500 text-sm">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {reportCards.map(card => (
              <Link key={card.title} to={card.link} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <card.icon className="text-white" size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-cricket-green transition-colors">{card.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{card.desc}</p>
                    <div className="flex gap-4 mt-3">
                      {card.stats.map(s => <span key={s} className="badge-blue text-xs">{s}</span>)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
