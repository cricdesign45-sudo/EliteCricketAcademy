import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import type { Player, Program } from '@/types';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const FEE_TYPES = [
  { label: 'Monthly Fee', desc: 'Regular monthly training fee' },
  { label: 'Admission Fee', desc: 'One-time admission / registration fee' },
  { label: 'Quarterly Fee', desc: 'Fee for a 3-month quarter' },
  { label: 'Annual Fee', desc: 'Full year fee at once' },
  { label: 'Late Fee Fine', desc: 'Fine for late payment' },
  { label: 'Custom Fee', desc: 'Custom or miscellaneous fee' },
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online', 'Card'];

export default function AddFee() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    playerId: '', playerName: '',
    feeType: 'Monthly Fee',
    amount: '', dueDate: getTodayString(),
    status: 'pending' as 'pending' | 'paid' | 'overdue' | 'partial',
    month: months[new Date().getMonth()],
    year: new Date().getFullYear(),
    program: '',
    paymentMethod: '',
    transactionId: '',
    notes: '',
    discount: '',
    lateFee: '',
    paidDate: '',
  });

  useEffect(() => {
    Promise.all([db.players.getAll(), db.programs.getAll()]).then(([p, pr]) => {
      setPlayers(p.filter(pl => pl.status === 'active'));
      setPrograms(pr);
    });
  }, []);

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const player = players.find(p => p.id === e.target.value);
    if (player) {
      const prog = programs.find(pr => pr.name === player.program);
      setForm({ ...form, playerId: player.id, playerName: player.name, program: player.program, amount: prog ? String(prog.fee) : '' });
    }
  };

  const handleFeeTypeChange = (type: string) => {
    // Auto-adjust label in month field for non-monthly types
    let month = form.month;
    if (type === 'Admission Fee') month = 'Admission';
    else if (type === 'Annual Fee') month = 'Annual';
    else if (type === 'Quarterly Fee') month = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
    else if (type === 'Late Fee Fine') month = 'Fine';
    else if (type === 'Custom Fee') month = 'Custom';
    else month = months[new Date().getMonth()];
    setForm({ ...form, feeType: type, month });
  };

  const netAmount = () => {
    const base = parseFloat(form.amount) || 0;
    const disc = parseFloat(form.discount) || 0;
    const late = parseFloat(form.lateFee) || 0;
    return base - disc + late;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerId) { toast.error('Please select a player'); return; }
    setSaving(true);
    await db.fees.add({
      playerId: form.playerId,
      playerName: form.playerName,
      amount: netAmount(),
      dueDate: form.dueDate,
      paidDate: form.paidDate || undefined,
      status: form.status,
      month: form.month,
      year: Number(form.year),
      program: form.program,
      paymentMethod: form.paymentMethod || undefined,
      transactionId: form.transactionId || undefined,
      notes: form.notes || undefined,
      discount: form.discount ? parseFloat(form.discount) : undefined,
      lateFee: form.lateFee ? parseFloat(form.lateFee) : undefined,
    });
    toast.success('Fee record added successfully!');
    navigate('/admin/fees');
  };

  const f = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/fees" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Add Fee Record</h1>
          <p className="text-gray-500 text-sm">Create a new fee entry for a player</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {/* Fee Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Fee Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEE_TYPES.map(ft => (
              <button
                key={ft.label}
                type="button"
                onClick={() => handleFeeTypeChange(ft.label)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  form.feeType === ft.label
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-semibold text-sm">{ft.label}</div>
                <div className={`text-xs mt-0.5 ${form.feeType === ft.label ? 'text-gray-300' : 'text-gray-400'}`}>{ft.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Player & Program */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Player Details</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Player *</label>
              <select required value={form.playerId} onChange={handlePlayerChange} className="form-input">
                <option value="">Select player…</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} — {p.registrationNumber}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Program</label>
                <input value={form.program} onChange={e => f('program', e.target.value)} className="form-input" placeholder="Program name" />
              </div>
              <div>
                <label className="form-label">Period Month</label>
                <input value={form.month} onChange={e => f('month', e.target.value)} className="form-input" placeholder="e.g. January, Q1, Admission" />
              </div>
              <div>
                <label className="form-label">Year *</label>
                <input required type="number" value={form.year} onChange={e => f('year', e.target.value)} className="form-input" min="2020" max="2035" />
              </div>
              <div>
                <label className="form-label">Due Date *</label>
                <input required type="date" value={form.dueDate} onChange={e => f('dueDate', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Amount Details</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="form-label">Base Amount (₹) *</label>
              <input required type="number" min="0" value={form.amount} onChange={e => f('amount', e.target.value)} className="form-input" placeholder="0.00" />
            </div>
            <div>
              <label className="form-label">Discount (₹)</label>
              <input type="number" min="0" value={form.discount} onChange={e => f('discount', e.target.value)} className="form-input" placeholder="0.00" />
            </div>
            <div>
              <label className="form-label">Late Fee Fine (₹)</label>
              <input type="number" min="0" value={form.lateFee} onChange={e => f('lateFee', e.target.value)} className="form-input" placeholder="0.00" />
            </div>
          </div>
          {(form.discount || form.lateFee) && (
            <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 text-sm">
              <Info size={14} className="text-blue-500" />
              <span className="text-gray-600">Net Amount: <strong className="text-gray-900">₹{netAmount().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></span>
            </div>
          )}
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Payment Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)} className="form-input">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial Payment</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="form-label">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => f('paymentMethod', e.target.value)} className="form-input">
                <option value="">Select method…</option>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Transaction / Reference ID</label>
              <input value={form.transactionId} onChange={e => f('transactionId', e.target.value)} className="form-input" placeholder="UPI ref / cheque no." />
            </div>
            {(form.status === 'paid' || form.status === 'partial') && (
              <div>
                <label className="form-label">Paid Date</label>
                <input type="date" value={form.paidDate} onChange={e => f('paidDate', e.target.value)} className="form-input" />
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="form-label">Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => f('notes', e.target.value)} className="form-input resize-none" placeholder="Additional notes (advance payment, scholarship, etc.)" />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-base">
            {saving ? 'Adding…' : 'Add Fee Record'}
          </button>
          <Link to="/admin/fees" className="btn-outline px-8 py-3 text-base">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
