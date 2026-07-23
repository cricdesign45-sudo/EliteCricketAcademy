import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, User, Calendar, CreditCard, Trophy, TrendingUp,
  CheckCircle, XCircle, Clock, AlertTriangle, MessageSquare, Send,
  Award, ShoppingBag, Menu, X, Home, Bell, Shield, ChevronRight,
  Star, Printer, Settings
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Player, Fee, AttendanceRecord, PlayerMessage, Certificate } from '@/types';
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

type Section = 'overview' | 'attendance' | 'fees' | 'messages' | 'certificates' | 'store' | 'profile' | 'settings';

const NAV_ITEMS: { id: Section; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'overview',      label: 'Overview',      icon: Home },
  { id: 'attendance',    label: 'Attendance',     icon: Calendar },
  { id: 'fees',          label: 'Fees',           icon: CreditCard },
  { id: 'messages',      label: 'Messages',       icon: MessageSquare },
  { id: 'certificates',  label: 'Certificates',   icon: Award },
  { id: 'store',         label: 'Store',          icon: ShoppingBag },
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'settings',      label: 'Settings',       icon: Settings },
];

/* ── Certificate Printer ────────────────────────────────────────── */
function CertPrint({ cert, playerName, photo }: { cert: Certificate; playerName: string; photo?: string }) {
  const print = () => {
    const w = window.open('', '_blank', 'width=900,height=650');
    if (!w) return;
    const typeColors: Record<string, string> = {
      participation: '#3B82F6', achievement: '#F59E0B', completion: '#10B981', excellence: '#8B5CF6',
    };
    const color = typeColors[cert.certificateType] || '#3B82F6';
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Certificate — ${cert.title}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:'Georgia',serif;background:#f5f5f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
      @media print{body{background:white}}</style>
    </head><body>
    <div style="width:780px;background:white;border:3px solid ${color};border-radius:12px;padding:0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15)">
      <div style="background:${color};padding:24px 40px;text-align:center">
        <div style="color:rgba(255,255,255,0.8);font-size:11px;letter-spacing:4px;text-transform:uppercase;margin-bottom:6px">Young Warriors Cricket Club</div>
        <div style="color:white;font-size:28px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Certificate of ${cert.certificateType.charAt(0).toUpperCase() + cert.certificateType.slice(1)}</div>
      </div>
      <div style="padding:40px;text-align:center">
        <div style="color:#6b7280;font-size:14px;margin-bottom:16px">This is to certify that</div>
        <div style="font-size:36px;font-weight:bold;color:#111827;border-bottom:2px solid ${color};display:inline-block;padding-bottom:8px;margin-bottom:20px">${playerName}</div>
        <div style="color:#374151;font-size:16px;line-height:1.7;max-width:560px;margin:0 auto 24px">${cert.description || 'has successfully demonstrated outstanding commitment and dedication to cricket.'}</div>
        <div style="display:inline-block;background:${color}18;border:2px solid ${color}40;border-radius:8px;padding:12px 28px;margin-bottom:28px">
          <div style="color:${color};font-weight:bold;font-size:18px">${cert.title}</div>
          ${cert.program ? `<div style="color:#6b7280;font-size:13px;margin-top:4px">${cert.program}${cert.level ? ` · ${cert.level}` : ''}</div>` : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:32px;text-align:center">
          <div><div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Issued Date</div><div style="color:#111827;font-weight:600">${cert.issuedDate}</div></div>
          <div><div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Issued By</div><div style="color:#111827;font-weight:600">${cert.issuedBy}</div></div>
          <div><div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Certificate ID</div><div style="color:#111827;font-weight:600;font-family:monospace;font-size:11px">${cert.id.slice(0, 12).toUpperCase()}</div></div>
        </div>
        <div style="border-top:1px solid #e5e7eb;padding-top:20px;display:flex;justify-content:space-between;align-items:center">
          <div style="color:#9ca3af;font-size:11px">Verify at: academy.ywcc.in/verify/${cert.id}</div>
          <div style="width:60px;height:60px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af;text-align:center">QR<br/>Code</div>
        </div>
      </div>
    </div></body></html>`);
    w.document.close();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };
  return (
    <button onClick={print} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
      <Printer size={12} /> Print
    </button>
  );
}

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [messages, setMessages] = useState<PlayerMessage[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [loading, setLoading] = useState(true);

  // Security: session timeout (30 min)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localStorage.removeItem('ywcc_player_session');
      navigate('/player-login');
    }, 30 * 60 * 1000);
  }, [navigate]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimeout));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetTimeout]);

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
      db.certificates.getByPlayer(s.id),
    ]).then(([p, f, a, m, c]) => {
      setPlayer(p);
      setFees(f);
      setAttendance(a);
      setMessages(m);
      setCertificates(c);
      setLoading(false);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ywcc_player_session');
    navigate('/player-login');
  };

  const navigateTo = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  if (loading || !player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-400 text-sm">Loading your dashboard…</div>
        </div>
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
  const unreadMessages = messages.filter(m => m.status !== 'replied').length;

  const SidebarContent = () => (
    <aside className="h-full bg-gray-900 flex flex-col w-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="YWCC" className="w-8 h-8 rounded-full object-cover border border-white/20" />
          <div>
            <div className="text-white font-bold text-xs leading-tight">Young Warriors</div>
            <div className="text-blue-400 text-[10px]">Player Portal</div>
          </div>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1 rounded">
          <X size={18} />
        </button>
      </div>

      {/* Player mini profile */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {player.photo ? (
            <img src={player.photo} alt={player.name} className="w-10 h-10 rounded-full object-cover border-2 border-white/20 flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{player.name.charAt(0)}</div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{player.name}</p>
            <p className="text-gray-400 text-xs truncate">#{player.jerseyNumber} · {player.program}</p>
          </div>
        </div>
        {player.badge && (
          <div className="mt-2.5">
            <BadgeChip badge={player.badge} />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={16} />
              <span>{item.label}</span>
            </div>
            {item.id === 'messages' && unreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{unreadMessages}</span>
            )}
            {item.id === 'fees' && overdueFees.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">!</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-full">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-bold text-gray-900 text-sm leading-tight capitalize">{activeSection}</h2>
              <p className="text-gray-400 text-xs hidden sm:block">Welcome back, {player.name.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`hidden sm:inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
              attendancePct >= 75 ? 'bg-green-100 text-green-700' : attendancePct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'
            }`}>
              <TrendingUp size={11} /> {attendancePct}%
            </span>
            {player.photo ? (
              <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs">{player.name.charAt(0)}</div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {activeSection === 'overview' && (
            <div className="space-y-5 max-w-4xl">
              {/* Hero card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative flex-shrink-0">
                    {player.photo ? (
                      <img src={player.photo} alt={player.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold">{player.name.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold">{player.name}</h1>
                      {player.badge && <BadgeChip badge={player.badge} />}
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{player.position} · #{player.jerseyNumber} · {player.program}</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                      <div className="text-center"><p className="text-2xl font-bold">{attendancePct}%</p><p className="text-xs text-gray-400">Attendance</p></div>
                      <div className="w-px bg-white/20 self-stretch hidden sm:block" />
                      <div className="text-center"><p className="text-2xl font-bold text-green-400">{paidFees.length}</p><p className="text-xs text-gray-400">Paid Fees</p></div>
                      <div className="w-px bg-white/20 self-stretch hidden sm:block" />
                      <div className="text-center"><p className={`text-2xl font-bold ${overdueFees.length > 0 ? 'text-red-400' : 'text-white'}`}>{overdueFees.length + pendingFees.length}</p><p className="text-xs text-gray-400">Due Fees</p></div>
                      <div className="w-px bg-white/20 self-stretch hidden sm:block" />
                      <div className="text-center"><p className="text-2xl font-bold text-blue-400">{certificates.length}</p><p className="text-xs text-gray-400">Certificates</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Present', value: presentCount, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', action: () => navigateTo('attendance') },
                  { label: 'Absent', value: absentCount, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', action: () => navigateTo('attendance') },
                  { label: 'Late', value: lateCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', action: () => navigateTo('attendance') },
                  { label: 'Fees Due', value: formatCurrency(totalDue), icon: AlertTriangle, color: overdueFees.length > 0 ? 'text-red-500' : 'text-blue-600', bg: overdueFees.length > 0 ? 'bg-red-50' : 'bg-blue-50', action: () => navigateTo('fees') },
                ].map(stat => (
                  <button key={stat.label} onClick={stat.action} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md transition-shadow group">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">{stat.label} <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" /></p>
                  </button>
                ))}
              </div>

              {/* Attendance bar */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Attendance Rate</h3>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${attendancePct >= 75 ? 'bg-green-500' : attendancePct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${attendancePct}%` }} />
                  </div>
                  <span className="font-bold text-gray-900 text-lg w-14 text-right">{attendancePct}%</span>
                </div>
                <p className="text-xs text-gray-500">{presentCount} present out of {attendance.length} sessions</p>
              </div>

              {/* Recent sessions */}
              {attendance.slice(0, 30).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Calendar size={16} /> Recent Sessions</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {attendance.slice(0, 30).map(rec => (
                      <div key={rec.id} title={`${formatDate(rec.date)} — ${rec.status}`}
                        className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${
                          rec.status === 'present' ? 'bg-green-100 text-green-700' :
                          rec.status === 'late' ? 'bg-amber-100 text-amber-700' :
                          rec.status === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-500'
                        }`}>
                        {rec.status === 'present' ? '✓' : rec.status === 'late' ? 'L' : rec.status === 'leave' ? 'V' : '✗'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overdue alert */}
              {(overdueFees.length > 0 || pendingFees.length > 0) && (
                <div className={`rounded-xl border p-4 flex gap-3 cursor-pointer hover:opacity-90 transition-opacity ${overdueFees.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`} onClick={() => navigateTo('fees')}>
                  <AlertTriangle size={18} className={overdueFees.length > 0 ? 'text-red-500 flex-shrink-0 mt-0.5' : 'text-amber-500 flex-shrink-0 mt-0.5'} />
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${overdueFees.length > 0 ? 'text-red-800' : 'text-amber-800'}`}>
                      {overdueFees.length > 0 ? `${overdueFees.length} Overdue Fee(s)` : `${pendingFees.length} Pending Fee(s)`}
                    </p>
                    <p className={`text-xs mt-0.5 ${overdueFees.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>Total outstanding: {formatCurrency(totalDue)}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 self-center" />
                </div>
              )}

              {/* Quick actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'View Fees', section: 'fees' as Section, icon: CreditCard, color: 'bg-blue-600' },
                  { label: 'Messages', section: 'messages' as Section, icon: MessageSquare, color: 'bg-gray-800' },
                  { label: 'Certificates', section: 'certificates' as Section, icon: Award, color: 'bg-purple-600' },
                  { label: 'Store', section: 'store' as Section, icon: ShoppingBag, color: 'bg-green-600' },
                ].map(a => (
                  <button key={a.label} onClick={() => navigateTo(a.section)} className={`${a.color} text-white rounded-xl p-4 text-center hover:opacity-90 transition-opacity`}>
                    <a.icon size={22} className="mx-auto mb-2" />
                    <p className="text-sm font-semibold">{a.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── ATTENDANCE ───────────────────────────────────── */}
          {activeSection === 'attendance' && (
            <div className="max-w-4xl space-y-4">
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Sessions', value: attendance.length, color: 'text-gray-900' },
                  { label: 'Present', value: presentCount, color: 'text-green-600' },
                  { label: 'Absent', value: absentCount, color: 'text-red-500' },
                  { label: 'Attendance Rate', value: `${attendancePct}%`, color: attendancePct >= 75 ? 'text-green-600' : 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Full Attendance History</h3>
                  <span className="text-sm text-gray-400">{attendance.length} records</span>
                </div>
                {attendance.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-sm">No attendance records yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 text-left">
                        <th className="table-th">Date</th><th className="table-th">Status</th><th className="table-th">Time</th><th className="table-th">Notes</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {attendance.map(rec => (
                          <tr key={rec.id}>
                            <td className="table-td text-gray-700">{formatDate(rec.date)}</td>
                            <td className="table-td">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                rec.status === 'present' ? 'bg-green-100 text-green-700' :
                                rec.status === 'late' ? 'bg-amber-100 text-amber-700' :
                                rec.status === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                              }`}>{rec.status}</span>
                            </td>
                            <td className="table-td text-gray-400 text-xs">{rec.time || '—'}</td>
                            <td className="table-td text-gray-400 text-xs">{rec.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FEES ─────────────────────────────────────────── */}
          {activeSection === 'fees' && (
            <div className="max-w-4xl space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p className="text-xs text-gray-500 mb-1">Total Paid</p><p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p></div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p className="text-xs text-gray-500 mb-1">Total Due</p><p className={`text-2xl font-bold ${totalDue > 0 ? 'text-red-500' : 'text-gray-900'}`}>{formatCurrency(totalDue)}</p></div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"><p className="text-xs text-gray-500 mb-1">Total Records</p><p className="text-2xl font-bold text-gray-900">{fees.length}</p></div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Fee History</h3></div>
                {fees.length === 0 ? (
                  <p className="text-center py-12 text-gray-400 text-sm">No fee records found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 text-left">
                        <th className="table-th">Month / Year</th><th className="table-th">Amount</th><th className="table-th">Due Date</th><th className="table-th">Paid Date</th><th className="table-th">Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {fees.map(fee => (
                          <tr key={fee.id}>
                            <td className="table-td font-medium text-gray-800">{fee.month} {fee.year}</td>
                            <td className="table-td font-bold text-gray-900">{formatCurrency(fee.amount)}</td>
                            <td className="table-td text-gray-500 text-xs">{formatDate(fee.dueDate)}</td>
                            <td className="table-td text-gray-500 text-xs">{fee.paidDate ? formatDate(fee.paidDate) : '—'}</td>
                            <td className="table-td">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                fee.status === 'paid' ? 'bg-green-100 text-green-700' :
                                fee.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
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

          {/* ── MESSAGES ─────────────────────────────────────── */}
          {activeSection === 'messages' && (
            <div className="max-w-3xl space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Send size={16} /> Send Message to Admin</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!session || !msgBody.trim()) return;
                  setSendingMsg(true);
                  await db.playerMessages.send({
                    senderId: session.id, senderName: player!.name, senderType: 'player',
                    recipientId: 'admin', recipientName: 'Admin',
                    subject: msgSubject.trim() || undefined, message: msgBody.trim(),
                    isRead: false, status: 'unread',
                  });
                  const updated = await db.playerMessages.getByPlayer(session.id);
                  setMessages(updated); setMsgSubject(''); setMsgBody(''); setSendingMsg(false);
                }} className="space-y-3">
                  <input value={msgSubject} onChange={e => setMsgSubject(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400" placeholder="Subject (optional)" />
                  <textarea required rows={3} value={msgBody} onChange={e => setMsgBody(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none" placeholder="Write your message…" />
                  <button type="submit" disabled={sendingMsg || !msgBody.trim()} className="flex items-center gap-2 bg-gray-900 text-white text-sm px-5 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                    <Send size={14} /> {sendingMsg ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><MessageSquare size={16} /> Inbox</h3></div>
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400"><MessageSquare size={36} className="mx-auto mb-3 opacity-40" /><p className="text-sm">No messages yet.</p></div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {messages.map(msg => (
                      <div key={msg.id} className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            {msg.subject && <p className="font-semibold text-gray-900 text-sm">{msg.subject}</p>}
                            <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${msg.status === 'replied' ? 'bg-green-100 text-green-700' : msg.status === 'read' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'}`}>{msg.status}</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-2">{msg.message}</div>
                        {msg.reply && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3 text-sm">
                            <p className="text-xs text-blue-500 font-semibold mb-1">Admin Reply</p>
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

          {/* ── CERTIFICATES ─────────────────────────────────── */}
          {activeSection === 'certificates' && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><Award size={20} /> My Certificates</h2>
                <span className="text-sm text-gray-400">{certificates.length} total</span>
              </div>
              {certificates.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                  <Award size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-semibold text-gray-600 mb-1">No certificates yet</p>
                  <p className="text-sm text-gray-400">Certificates awarded by the academy will appear here.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {certificates.map(cert => {
                    const typeColors: Record<string, { bg: string; text: string; border: string }> = {
                      participation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
                      achievement: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                      completion: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
                      excellence: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
                    };
                    const tc = typeColors[cert.certificateType] || typeColors.participation;
                    return (
                      <div key={cert.id} className={`rounded-xl border-2 ${tc.border} ${tc.bg} p-5`}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className={`text-xs font-bold uppercase tracking-wide ${tc.text} mb-1 block`}>{cert.certificateType}</span>
                            <h3 className="font-bold text-gray-900 text-base leading-tight">{cert.title}</h3>
                          </div>
                          <Star size={20} className={`${tc.text} flex-shrink-0 mt-0.5`} />
                        </div>
                        {cert.description && <p className="text-sm text-gray-600 mb-3">{cert.description}</p>}
                        {cert.program && <p className="text-xs text-gray-500 mb-3">{cert.program}{cert.level ? ` · ${cert.level}` : ''}</p>}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-400">Issued {formatDate(cert.issuedDate)}</p>
                            <p className="text-xs text-gray-400">by {cert.issuedBy}</p>
                          </div>
                          <CertPrint cert={cert} playerName={player.name} photo={player.photo} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STORE ────────────────────────────────────────── */}
          {activeSection === 'store' && (
            <div className="max-w-3xl">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="font-bold text-gray-900 mb-2">Academy Store</h3>
                <p className="text-sm text-gray-500 mb-4">Browse and purchase academy merchandise, cricket equipment, and branded items.</p>
                <Link to="/store" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors">
                  <ShoppingBag size={16} /> Visit Store
                </Link>
              </div>
            </div>
          )}

          {/* ── PROFILE ──────────────────────────────────────── */}
          {activeSection === 'profile' && (
            <div className="max-w-3xl space-y-5">
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
              <p className="text-xs text-gray-400 text-center">To update your details, contact the academy office.</p>
            </div>
          )}

          {/* ── SETTINGS ─────────────────────────────────────── */}
          {activeSection === 'settings' && (
            <div className="max-w-2xl space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Shield size={16} /> Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Session Timeout</p>
                      <p className="text-xs text-gray-400">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Login ID</p>
                      <p className="text-xs text-gray-400">Your registration number is your login ID</p>
                    </div>
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">{player.registrationNumber}</code>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Password</p>
                      <p className="text-xs text-gray-400">Your password is your date of birth (YYYY-MM-DD)</p>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Contact Admin</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Bell size={16} /> Notifications</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Fee Reminders', desc: 'Get notified before fee due dates', enabled: true },
                    { label: 'Attendance Alerts', desc: 'Alerts when attendance drops below 75%', enabled: true },
                    { label: 'New Messages', desc: 'Notify when admin replies to your message', enabled: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.enabled ? 'On' : 'Off'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-red-800 text-sm">Sign Out</p>
                  <p className="text-xs text-red-500">You will be redirected to the login page</p>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
