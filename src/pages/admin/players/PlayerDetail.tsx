import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Phone, Mail, MapPin, User, Calendar, Printer, QrCode, CreditCard } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, formatCurrency, getAttendancePercentage } from '@/lib/utils';
import type { Player, Fee, AttendanceRecord } from '@/types';
import logoImg from '@/assets/academy-logo.jpg';

/* ── Badge config ─────────────────────────── */
const BADGE = {
  verified: { label: 'Verified Player', icon: '✓', bg: '#3B82F6', color: '#fff' },
  elite:    { label: 'Elite Player',    icon: '★', bg: '#111827', color: '#FBBF24' },
  champion: { label: 'Champion',        icon: '⚡', bg: '#16A34A', color: '#fff' },
} as const;

/* ── Printable Player ID Card ─────────────── */
function PlayerIDCard({ player }: { player: Player }) {
  const badge = player.badge ? BADGE[player.badge] : null;
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = cardRef.current?.innerHTML;
    if (!content) return;
    const w = window.open('', '_blank', 'width=700,height=500');
    if (!w) return;
    w.document.write(`
      <!DOCTYPE html><html><head>
        <title>Player ID Card — ${player.name}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
          body{font-family:'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3f4f6}
          @media print{body{background:white}}
        </style>
      </head><body>${content}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 400);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><CreditCard size={16} /> Player ID Card</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Printer size={14} /> Print ID Card
        </button>
      </div>

      {/* Card Preview */}
      <div ref={cardRef}>
        <div style={{
          width: '640px', maxWidth: '100%', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          borderRadius: '16px', padding: '28px', color: 'white', fontFamily: "'Segoe UI', sans-serif",
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden',
        }}>
          {/* BG pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          {/* Top strip */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #10B981)' }} />

          <div style={{ position: 'relative', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Left: Logo + Academy */}
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <img src={logoImg} alt="YWCC" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)' }} />
              <div style={{ marginTop: '8px', fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.4 }}>Young Warriors<br />Cricket Club</div>
            </div>

            {/* Middle: Player info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Official Player ID</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                {player.photo ? (
                  <img src={player.photo} alt={player.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
                ) : (
                  <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                    {player.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '700', lineHeight: 1.1 }}>{player.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{player.position}</div>
                  {badge && (
                    <div style={{ marginTop: '5px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '20px', background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: '700' }}>
                      <span>{badge.icon}</span><span>{badge.label}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: 'REG. NO.', value: player.registrationNumber },
                  { label: 'JERSEY', value: `#${player.jerseyNumber}` },
                  { label: 'PROGRAM', value: player.program },
                  { label: 'BATTING', value: player.battingStyle },
                  { label: 'BOWLING', value: player.bowlingStyle },
                  { label: 'JOIN DATE', value: formatDate(player.joinDate) },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '6px 8px' }}>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '2px' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'white' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: QR placeholder */}
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ width: '72px', height: '72px', background: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px' }}>
                {/* Simulated QR pattern */}
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '2px' }}>
                  {[1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1].map((v, i) => (
                    <div key={i} style={{ aspectRatio: '1', background: v ? '#111827' : 'white', borderRadius: '1px' }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase' }}>Scan ID</div>
              <div style={{ marginTop: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px', fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>
                {player.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)' }}>This card is the property of Young Warriors Cricket Club. If found, please return.</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>{player.registrationNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────── */
export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIDCard, setShowIDCard] = useState(false);

  useEffect(() => {
    async function load() {
      const [p, f, a] = await Promise.all([
        db.players.getById(id!),
        db.fees.getByPlayer(id!),
        db.attendance.getByPlayer(id!),
      ]);
      setPlayer(p);
      setFees(f);
      setAttendance(a);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  if (!player) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Player not found</p>
        <Link to="/admin/players" className="btn-primary">Back to Players</Link>
      </div>
    );
  }

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const attendancePct = getAttendancePercentage(presentCount, attendance.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/players" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="page-title">{player.name}</h1>
            <p className="text-gray-500 text-sm">{player.registrationNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowIDCard(!showIDCard)}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <QrCode size={14} /> {showIDCard ? 'Hide' : 'ID Card'}
          </button>
          <Link to={`/admin/players/${id}/edit`} className="btn-primary flex items-center gap-2">
            <Pencil size={16} /> Edit Player
          </Link>
        </div>
      </div>

      {/* Printable ID Card */}
      {showIDCard && <div className="mb-6"><PlayerIDCard player={player} /></div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          {player.photo ? (
            <img src={player.photo} alt={player.name} className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow mx-auto mb-4" />
          ) : (
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {player.name.charAt(0)}
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
          <p className="text-gray-500 text-sm">{player.position}</p>
          <span className={`mt-2 inline-block ${player.status === 'active' ? 'badge-green' : player.status === 'suspended' ? 'badge-red' : 'badge-yellow'}`}>{player.status}</span>
          {player.badge && (
            <div className="mt-3">
              {player.badge === 'verified' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white ring-2 ring-blue-300">✓ Verified Player</span>}
              {player.badge === 'elite' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-900 text-yellow-400 ring-2 ring-gray-400">★ Elite Player</span>}
              {player.badge === 'champion' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white ring-2 ring-green-300">⚡ Academy Champion</span>}
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div><p className="text-lg font-bold text-gray-900">#{player.jerseyNumber}</p><p className="text-xs text-gray-500">Jersey</p></div>
            <div><p className="text-lg font-bold text-blue-600">{attendancePct}%</p><p className="text-xs text-gray-500">Attendance</p></div>
            <div><p className="text-lg font-bold text-amber-600">{fees.filter(f => f.status === 'paid').length}</p><p className="text-xs text-gray-500">Fees Paid</p></div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { icon: Phone, label: 'Phone', value: player.phone },
                { icon: Mail, label: 'Email', value: player.email || 'N/A' },
                { icon: Calendar, label: 'Date of Birth', value: formatDate(player.dateOfBirth) },
                { icon: Calendar, label: 'Join Date', value: formatDate(player.joinDate) },
                { icon: User, label: 'Guardian', value: player.guardianName },
                { icon: Phone, label: 'Guardian Phone', value: player.guardianPhone },
                { icon: MapPin, label: 'Address', value: player.address },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">{item.label}</p>
                    <p className="text-gray-700 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Cricket Profile</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Program', value: player.program },
                { label: 'Batting Style', value: player.battingStyle },
                { label: 'Bowling Style', value: player.bowlingStyle },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                  <p className="text-gray-700 font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee History */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Fee History</h3>
            <Link to="/admin/fees/add" className="btn-primary text-xs px-3 py-1.5">Add Fee</Link>
          </div>
          {fees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-th">Type / Month</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Due Date</th>
                    <th className="table-th">Paid Date</th>
                    <th className="table-th">Method</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fees.map(fee => (
                    <tr key={fee.id}>
                      <td className="table-td">{fee.month} {fee.year}</td>
                      <td className="table-td font-semibold">{formatCurrency(fee.amount)}</td>
                      <td className="table-td text-gray-500">{formatDate(fee.dueDate)}</td>
                      <td className="table-td text-gray-500">{fee.paidDate ? formatDate(fee.paidDate) : '-'}</td>
                      <td className="table-td text-gray-500 text-xs">{fee.paymentMethod || '-'}</td>
                      <td className="table-td">
                        <span className={fee.status === 'paid' ? 'badge-green' : fee.status === 'overdue' ? 'badge-red' : 'badge-yellow'}>{fee.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-400">No fee records found</p>
          )}
        </div>
      </div>
    </div>
  );
}
