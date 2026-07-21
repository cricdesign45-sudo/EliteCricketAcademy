import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Phone, Mail, MapPin, User, Calendar } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, formatCurrency, getAttendancePercentage } from '@/lib/utils';
import type { Player, Fee, AttendanceRecord } from '@/types';

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/players" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="page-title">{player.name}</h1>
            <p className="text-gray-500 text-sm">{player.registrationNumber}</p>
          </div>
        </div>
        <Link to={`/admin/players/${id}/edit`} className="btn-primary flex items-center gap-2">
          <Pencil size={16} /> Edit Player
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          {player.photo ? (
            <img src={player.photo} alt={player.name} className="w-20 h-20 rounded-full object-cover border-4 border-cricket-green shadow mx-auto mb-4" />
          ) : (
            <div className="w-20 h-20 bg-cricket-green rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              {player.name.charAt(0)}
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{player.name}</h2>
          <p className="text-gray-500 text-sm">{player.position}</p>
          <span className={`mt-2 inline-block ${player.status === 'active' ? 'badge-green' : player.status === 'suspended' ? 'badge-red' : 'badge-yellow'}`}>{player.status}</span>
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center"><p className="text-lg font-bold text-cricket-green">#{player.jerseyNumber}</p><p className="text-xs text-gray-500">Jersey</p></div>
            <div className="text-center"><p className="text-lg font-bold text-blue-600">{attendancePct}%</p><p className="text-xs text-gray-500">Attendance</p></div>
            <div className="text-center"><p className="text-lg font-bold text-amber-600">{fees.filter(f => f.status === 'paid').length}</p><p className="text-xs text-gray-500">Fees Paid</p></div>
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
                  <item.icon size={16} className="text-cricket-green mt-0.5 flex-shrink-0" />
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
                    <th className="table-th">Month/Year</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Due Date</th>
                    <th className="table-th">Paid Date</th>
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
                      <td className="table-td"><span className={fee.status === 'paid' ? 'badge-green' : fee.status === 'overdue' ? 'badge-red' : 'badge-yellow'}>{fee.status}</span></td>
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
