import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';
import type { Player, Program } from '@/types';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AddFee() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    playerId: '', playerName: '', amount: '', dueDate: getTodayString(),
    status: 'pending' as const, month: months[new Date().getMonth()],
    year: new Date().getFullYear(), program: '', paymentMethod: '',
    transactionId: '', notes: '', discount: '', lateFee: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await db.fees.add({
      ...form,
      amount: parseFloat(form.amount),
      year: Number(form.year),
      discount: form.discount ? parseFloat(form.discount) : undefined,
      lateFee: form.lateFee ? parseFloat(form.lateFee) : undefined,
    });
    toast.success('Fee record added successfully!');
    navigate('/admin/fees');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/fees" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Add Fee Record</h1>
          <p className="text-gray-500 text-sm">Create a new fee entry for a player</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="form-label">Player *</label>
            <select required value={form.playerId} onChange={handlePlayerChange} className="form-input">
              <option value="">Select player</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name} — {p.program}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="form-label">Month *</label>
              <select required value={form.month} onChange={e => setForm({...form, month: e.target.value})} className="form-input">
                {months.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><label className="form-label">Year *</label>
              <input required type="number" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} className="form-input" min="2020" max="2035" />
            </div>
            <div><label className="form-label">Amount (₹) *</label>
              <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="form-input" placeholder="Enter amount" />
            </div>
            <div><label className="form-label">Due Date *</label>
              <input required type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="form-input" />
            </div>
            <div><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as 'pending'})} className="form-input">
                <option value="pending">Pending</option><option value="paid">Paid</option>
                <option value="overdue">Overdue</option><option value="partial">Partial</option>
              </select>
            </div>
            <div><label className="form-label">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})} className="form-input">
                <option value="">Select method</option>
                <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Cheque</option>
              </select>
            </div>
            <div><label className="form-label">Transaction ID</label>
              <input value={form.transactionId} onChange={e => setForm({...form, transactionId: e.target.value})} className="form-input" placeholder="Transaction reference" />
            </div>
            <div><label className="form-label">Discount (₹)</label>
              <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} className="form-input" placeholder="Discount amount" />
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="form-input resize-none" placeholder="Additional notes..." />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3 text-base">{saving ? 'Adding…' : 'Add Fee Record'}</button>
          <Link to="/admin/fees" className="btn-outline px-8 py-3 text-base">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
