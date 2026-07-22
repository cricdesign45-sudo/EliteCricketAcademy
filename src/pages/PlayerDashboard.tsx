import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, User, Calendar, CreditCard, Trophy, TrendingUp,
  CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Send, BarChart2
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Player, Fee, AttendanceRecord, PlayerMessage, PlayerStatReport } from '@/types';
import logoImg from '@/assets/academy-logo.jpg';

interface PlayerSession {
  id: string;
  name: string;
  regNumber: string;
}

const BADGE_CONFIG = {
  verified: { label: 'Verified', icon: '✓', color: 'bg-blue-500', text: 'text-white', ring: 'ring-blue-300', title: 'Verified Player' },
  elite:    { label: 'Elite',    icon: '★', color: 'bg-gray-900', text: 'text-yellow-400', ring: 'ring-gray-400', title: 'Elite Player' },
  champion: { label: 'Champion', icon: '⚡', color: 'bg-green-600', text: 'text-white', ring: 'ring-green-300', title: 'Academy Champion' },
};

function BadgeChip({ badge }: { badge: Player['badge'] }) {
  if (!badge || !BADGE_CONFIG[badge]) return null;
  const cfg = BADGE_CONFIG[badge];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ring-2 ${cfg.color} ${cfg.text} ${cfg.ring}`}>
      <span>{cfg.icon}</span> {cfg.title}
    </span>
  );
}

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [messages, setMessages] = useState<PlayerMessage[]>([]);
  const [statReports, setStatReports] = useState<PlayerStatReport[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'messages' | 'stats' | 'profile'>('overview');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('ywcc_player_session');
    if (!stored) { navigate('/player-login'); return; }
    const s: PlayerSession = JSON.parse(stored);
    setSession(s);
    Promise.all([
      db.players.getById(s.id),
      db.fees.getByPlayer(s.id),
      db.attendance.getByPlayer(s.id),
      db.playerMessages.getByPlayer(s.id),
      db.playerStatReports.getByPlayer(s.id),
    ]).then(([p, f, a, m, sr]) => {
      setPlayer(p);
      setFees(f);
      setAttendance(a);
      setMessages(m);
      setStatReports(sr);
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ywcc_player_session');
    navigate('/player-login');
  };

  if (loading || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading your dashboard…</div>
      </div>
    );
  }

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const pendingFees = fees.filter(f => f.status === 'pending');
  const overdueFees = fees.filter(f => f.status === 'overdue');
  const paidFees = fees.filter(f => f.status === 'paid');
  const totalDue = [...pendingFees, ...overdueFees].reduce((s, f) => s + f.amount, 0);
  const totalPaid = paidFees.reduce((s, f) => s + f.amount, 0);

  // Last 30 days attendance
  const recent30 = attendance.slice(0, 30);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'fees', label: 'Fees', icon: CreditCard },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'stats', label: 'My Stats', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !msgBody.trim()) return;
    setSendingMsg(true);
    await db.playerMessages.send({
      senderId: session.id,
      senderName: player!.name,
      senderType: 'player',
      recipientId: 'admin',
      recipientName: 'Admin',
      subject: msgSubject.trim() || undefined,
      message: msgBody.trim(),
      isRead: false,
      status: 'unread',
    });
    const updated = await db.playerMessages.getByPlayer(session.id);
    setMessages(updated);
    setMsgSubject('');
    setMsgBody('');
    setSendingMsg(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoImg} alt="YWCC" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            <span className="font-bold text-gray-900 text-sm hidden sm:block">Young Warriors CC</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-gray-900">{player.name}</p>
              <p className="text-xs text-gray-500">{player.registrationNumber}</p>
            </div>
            {player.photo ? (
              <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">{player.name.charAt(0)}</div>
            )}
            <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Player Hero Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative flex-shrink-0">
              {player.photo ? (
                <img src={player.photo} alt={player.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">{player.name.charAt(0)}</div>
              )}
              <span className={`absolute -bottom-1.5 -right-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${player.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                {player.status === 'active' ? 'Active' : player.status}
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{player.name}</h1>
                {player.badge && <BadgeChip badge={player.badge} />}
              </div>
              <p className="text-gray-500 text-sm mb-3">{player.position} · #{player.jerseyNumber} · {player.program}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm">
                <div className="text-center"><p className="text-2xl font-bold text-gray-900">{attendancePct}%</p><p className="text-xs text-gray-500">Attendance</p></div>
                <div className="w-px bg-gray-200 self-stretch" />
                <div className="text-center"><p className="text-2xl font-bold text-gray-900">{paidFees.length}</p><p className="text-xs text-gray-500">Paid Fees</p></div>
                <div className="w-px bg-gray-200 self-stretch" />
                <div className="text-center"><p className={`text-2xl font-bold ${overdueFees.length > 0 ? 'text-red-500' : 'text-gray-900'}`}>{overdueFees.length + pendingFees.length}</p><p className="text-xs text-gray-500">Pending</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={14} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Present Days', value: presentCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Absent Days', value: absentCount, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Late Arrivals', value: lateCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Fees Due', value: formatCurrency(totalDue), icon: AlertTriangle, color: overdueFees.length > 0 ? 'text-red-500' : 'text-blue-600', bg: overdueFees.length > 0 ? 'bg-red-50' : 'bg-blue-50' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Attendance Progress */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Attendance Rate</h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${attendancePct >= 75 ? 'bg-green-500' : attendancePct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${attendancePct}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900 text-lg w-14 text-right">{attendancePct}%</span>
              </div>
              <p className="text-xs text-gray-500">{presentCount} present out of {attendance.length} sessions — {attendancePct >= 75 ? '✅ Good standing' : attendancePct >= 50 ? '⚠️ Needs improvement' : '❌ Below required threshold'}</p>
            </div>

            {/* Recent Attendance */}
            {recent30.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={16} /> Recent Sessions</h3>
                <div className="flex flex-wrap gap-1.5">
                  {recent30.map(rec => (
                    <div
                      key={rec.id}
                      title={`${formatDate(rec.date)} — ${rec.status}`}
                      className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center cursor-default ${
                        rec.status === 'present' ? 'bg-green-100 text-green-700' :
                        rec.status === 'late' ? 'bg-amber-100 text-amber-700' :
                        rec.status === 'leave' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-500'
                      }`}
                    >
                      {rec.status === 'present' ? '✓' : rec.status === 'late' ? 'L' : rec.status === 'leave' ? 'V' : '✗'}
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-200 rounded inline-block" /> Present</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-200 rounded inline-block" /> Late</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-200 rounded inline-block" /> Absent</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-200 rounded inline-block" /> Leave</span>
                </div>
              </div>
            )}

            {/* Pending Fees Alert */}
            {(overdueFees.length > 0 || pendingFees.length > 0) && (
              <div className={`rounded-xl border p-4 flex gap-3 ${overdueFees.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <AlertTriangle size={18} className={overdueFees.length > 0 ? 'text-red-500 flex-shrink-0 mt-0.5' : 'text-amber-500 flex-shrink-0 mt-0.5'} />
                <div>
                  <p className={`font-semibold text-sm ${overdueFees.length > 0 ? 'text-red-800' : 'text-amber-800'}`}>
                    {overdueFees.length > 0 ? `${overdueFees.length} Overdue Fee(s)` : `${pendingFees.length} Pending Fee(s)`}
                  </p>
                  <p className={`text-xs mt-0.5 ${overdueFees.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    Total outstanding: {formatCurrency(totalDue)} — Please contact the admin office.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Full Attendance History</h3>
              <span className="text-sm text-gray-500">{attendance.length} records</span>
            </div>
            {attendance.length === 0 ? (
              <p className="text-center py-12 text-gray-400 text-sm">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="table-th">Date</th>
                      <th className="table-th">Status</th>
                      <th className="table-th">Time</th>
                      <th className="table-th">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendance.map(rec => (
                      <tr key={rec.id}>
                        <td className="table-td text-gray-700">{formatDate(rec.date)}</td>
                        <td className="table-td">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            rec.status === 'present' ? 'bg-green-100 text-green-700' :
                            rec.status === 'late' ? 'bg-amber-100 text-amber-700' :
                            rec.status === 'leave' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {rec.status === 'present' ? '✓' : rec.status === 'late' ? '⏰' : rec.status === 'leave' ? '📅' : '✗'} {rec.status}
                          </span>
                        </td>
                        <td className="table-td text-gray-500 text-xs">{rec.time || '—'}</td>
                        <td className="table-td text-gray-500 text-xs">{rec.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Total Due</p>
                <p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-500' : 'text-gray-900'}`}>{formatCurrency(totalDue)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500 mb-1">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{fees.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Fee History</h3>
              </div>
              {fees.length === 0 ? (
                <p className="text-center py-12 text-gray-400 text-sm">No fee records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="table-th">Month / Year</th>
                        <th className="table-th">Program</th>
                        <th className="table-th">Amount</th>
                        <th className="table-th">Due Date</th>
                        <th className="table-th">Paid Date</th>
                        <th className="table-th">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {fees.map(fee => (
                        <tr key={fee.id}>
                          <td className="table-td font-medium text-gray-800">{fee.month} {fee.year}</td>
                          <td className="table-td text-gray-500 text-xs">{fee.program}</td>
                          <td className="table-td font-bold text-gray-900">{formatCurrency(fee.amount)}</td>
                          <td className="table-td text-gray-500 text-xs">{formatDate(fee.dueDate)}</td>
                          <td className="table-td text-gray-500 text-xs">{fee.paidDate ? formatDate(fee.paidDate) : '—'}</td>
                          <td className="table-td">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                              fee.status === 'overdue' ? 'bg-red-100 text-red-600' :
                              'bg-amber-100 text-amber-700'
                            }`}>{fee.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-5">
            {statReports.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm text-center py-16">
                <BarChart2 size={40} className="mx-auto mb-3 opacity-30 text-gray-400" />
                <p className="text-gray-500 font-medium">No stat reports yet</p>
                <p className="text-gray-400 text-sm mt-1">Your coach will add skill assessment reports here.</p>
              </div>
            ) : statReports.map(report => {
              const skills = Object.entries(report.stats);
              const ROLE_LABELS: Record<string, string> = {
                batsman: 'Batsman', bowler: 'Bowler',
                wicket_keeper: 'Wicket Keeper', all_rounder: 'All-Rounder',
              };
              return (
                <div key={report.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900">{ROLE_LABELS[report.role] || report.role} Assessment</h3>
                      <p className="text-xs text-gray-500">{report.reportDate} · Marked by {report.markedBy}</p>
                    </div>
                    {report.overallRating !== undefined && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Overall</p>
                        <p className={`text-2xl font-bold ${
                          report.overallRating >= 8 ? 'text-emerald-600' :
                          report.overallRating >= 6 ? 'text-blue-600' :
                          report.overallRating >= 4 ? 'text-amber-600' : 'text-red-500'
                        }`}>{report.overallRating}<span className="text-sm text-gray-400">/10</span></p>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-2.5">
                    {skills.map(([skill, val]) => {
                      const barColor = val >= 8 ? 'bg-emerald-500' : val >= 6 ? 'bg-blue-500' : val >= 4 ? 'bg-amber-500' : 'bg-red-500';
                      const textColor = val >= 8 ? 'text-emerald-600' : val >= 6 ? 'text-blue-600' : val >= 4 ? 'text-amber-600' : 'text-red-500';
                      return (
                        <div key={skill} className="flex items-center gap-3">
                          <span className="text-sm text-gray-700 w-40 flex-shrink-0">{skill}</span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${val * 10}%` }} />
                          </div>
                          <span className={`text-sm font-bold w-7 text-right ${textColor}`}>{val}</span>
                        </div>
                      );
                    })}
                  </div>
                  {report.notes && (
                    <div className="mx-5 mb-5 bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Coach Notes</p>
                      <p className="text-sm text-gray-700">{report.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Send size={16} /> Send Message to Admin</h3>
              <form onSubmit={handleSendMessage} className="space-y-3">
                <input
                  value={msgSubject}
                  onChange={e => setMsgSubject(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="Subject (optional)"
                />
                <textarea
                  required
                  rows={3}
                  value={msgBody}
                  onChange={e => setMsgBody(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                  placeholder="Write your message…"
                />
                <button type="submit" disabled={sendingMsg || !msgBody.trim()} className="flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                  <Send size={14} /> {sendingMsg ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2"><MessageSquare size={16} /> Message History</h3>
              </div>
              {messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No messages yet. Send your first message above.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          {msg.subject && <p className="font-semibold text-gray-900 text-sm">{msg.subject}</p>}
                          <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          msg.status === 'replied' ? 'bg-green-100 text-green-700' :
                          msg.status === 'read' ? 'bg-blue-100 text-blue-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>{msg.status}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-2">{msg.message}</div>
                      {msg.reply && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 text-sm">
                          <p className="text-xs text-blue-500 font-semibold mb-1">Admin Reply · {msg.repliedAt ? new Date(msg.repliedAt).toLocaleString() : ''}</p>
                          <p className="text-gray-700">{msg.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Full Name', value: player.name },
                  { label: 'Registration No.', value: player.registrationNumber },
                  { label: 'Date of Birth', value: formatDate(player.dateOfBirth) },
                  { label: 'Age', value: `${player.age} years` },
                  { label: 'Phone', value: player.phone },
                  { label: 'Email', value: player.email || '—' },
                  { label: 'Address', value: player.address },
                  { label: 'Guardian', value: player.guardianName },
                  { label: 'Guardian Phone', value: player.guardianPhone },
                  { label: 'Join Date', value: formatDate(player.joinDate) },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-medium text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Cricket Profile</h3>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {[
                  { label: 'Position', value: player.position },
                  { label: 'Batting Style', value: player.battingStyle },
                  { label: 'Bowling Style', value: player.bowlingStyle },
                  { label: 'Jersey No.', value: `#${player.jerseyNumber}` },
                  { label: 'Program', value: player.program },
                  { label: 'Status', value: player.status },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-gray-800 capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {player.badge && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Trophy size={16} /> Your Badge</h3>
                <div className="flex items-center gap-4">
                  <BadgeChip badge={player.badge} />
                  <p className="text-sm text-gray-500">
                    {player.badge === 'verified' && 'Your profile has been officially verified by the academy.'}
                    {player.badge === 'elite' && 'You are recognized as an Elite player of the academy.'}
                    {player.badge === 'champion' && 'You are a champion — one of the top performers of the academy.'}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Need to update your details?</p>
              Contact the academy admin to update your personal information, photo, or cricket profile.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
