import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Printer, Download, FileText, ChevronDown } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { Fee } from '@/types';
import logoImg from '@/assets/academy-logo.jpg';

/* ── Fee Types ───────────────────────────────── */
const FEE_TYPES = ['All Types', 'Admission Fee', 'Monthly Fee', 'Quarterly Fee', 'Annual Fee', 'Late Fee Fine', 'Custom Fee'];

/* ── Print Receipt ───────────────────────────── */
function printReceipt(fee: Fee) {
  const w = window.open('', '_blank', 'width=520,height=700');
  if (!w) return;
  const logoSrc = logoImg;
  w.document.write(`
    <!DOCTYPE html><html><head>
      <title>Fee Receipt — ${fee.playerName}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',sans-serif;background:#f9fafb;display:flex;align-items:center;justify-content:center;min-height:100vh}
        .card{background:white;width:420px;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.12)}
        .header{background:#111827;color:white;padding:24px;text-align:center}
        .logo{width:56px;height:56px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.3);margin:0 auto 10px}
        .academy{font-size:14px;font-weight:700;letter-spacing:.5px}
        .sub{font-size:11px;color:rgba(255,255,255,.6);margin-top:2px}
        .receipt-badge{display:inline-block;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.8);font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-top:10px}
        .body{padding:24px}
        .amount-box{background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;padding:16px;text-align:center;margin-bottom:20px}
        .amount-label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
        .amount-value{font-size:32px;font-weight:800;color:#111827;margin-top:4px}
        .row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f1f5f9}
        .row:last-child{border-bottom:none}
        .row-label{font-size:12px;color:#64748b}
        .row-value{font-size:12px;font-weight:600;color:#1e293b;text-align:right;max-width:60%}
        .status-paid{display:inline-block;background:#dcfce7;color:#15803d;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700}
        .footer{background:#f8fafc;padding:16px 24px;text-align:center;border-top:1px solid #e2e8f0}
        .footer-text{font-size:10px;color:#94a3b8;line-height:1.6}
        .divider{border:none;border-top:2px dashed #e2e8f0;margin:16px 0}
        @media print{body{background:white}.card{box-shadow:none}}
      </style>
    </head><body>
    <div class="card">
      <div class="header">
        <img class="logo" src="${logoSrc}" alt="YWCC" />
        <div class="academy">Young Warriors Cricket Club</div>
        <div class="sub">Official Fee Receipt</div>
        <div class="receipt-badge">Receipt</div>
      </div>
      <div class="body">
        <div class="amount-box">
          <div class="amount-label">Amount Paid</div>
          <div class="amount-value">₹${fee.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          ${fee.discount ? `<div style="font-size:12px;color:#16a34a;margin-top:4px">Discount Applied: ₹${fee.discount}</div>` : ''}
        </div>
        <div class="row"><span class="row-label">Player Name</span><span class="row-value">${fee.playerName}</span></div>
        <div class="row"><span class="row-label">Program</span><span class="row-value">${fee.program || '—'}</span></div>
        <div class="row"><span class="row-label">Fee Period</span><span class="row-value">${fee.month} ${fee.year}</span></div>
        <div class="row"><span class="row-label">Payment Method</span><span class="row-value">${fee.paymentMethod || 'Cash'}</span></div>
        ${fee.transactionId ? `<div class="row"><span class="row-label">Transaction ID</span><span class="row-value">${fee.transactionId}</span></div>` : ''}
        <div class="row"><span class="row-label">Paid On</span><span class="row-value">${fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}</span></div>
        <div class="row"><span class="row-label">Due Date</span><span class="row-value">${new Date(fee.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span></div>
        <div class="row"><span class="row-label">Status</span><span class="row-value"><span class="status-paid">PAID</span></span></div>
        ${fee.notes ? `<hr class="divider" /><div style="font-size:12px;color:#64748b">Notes: ${fee.notes}</div>` : ''}
      </div>
      <div class="footer">
        <div class="footer-text">Thank you for your payment.<br/>This is an official receipt. Please retain for your records.<br/>Young Warriors Cricket Club · Academy Management System</div>
      </div>
    </div>
    </body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

/* ── CSV Export ──────────────────────────────── */
function exportCSV(fees: Fee[]) {
  const headers = ['Player Name','Program','Month','Year','Amount','Discount','Late Fee','Due Date','Paid Date','Status','Payment Method','Transaction ID','Notes'];
  const rows = fees.map(f => [
    f.playerName, f.program, f.month, f.year, f.amount,
    f.discount || '', f.lateFee || '', f.dueDate, f.paidDate || '',
    f.status, f.paymentMethod || '', f.transactionId || '', f.notes || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `fees-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

/* ── Main Component ───────────────────────────── */
export default function FeeManagement() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [methodFilter, setMethodFilter] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.fees.getAll();
    setFees(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = fees.filter(f => {
    const matchSearch = f.playerName.toLowerCase().includes(search.toLowerCase()) ||
      (f.transactionId || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchMethod = methodFilter === 'all' || (f.paymentMethod || '') === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPaid = fees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter(f => ['pending', 'overdue'].includes(f.status)).reduce((s, f) => s + f.amount, 0);
  const totalDiscount = fees.reduce((s, f) => s + (f.discount || 0), 0);
  const totalLateFee = fees.reduce((s, f) => s + (f.lateFee || 0), 0);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this fee record?')) {
      await db.fees.delete(id);
      toast.success('Fee record deleted');
      load();
    }
  };

  const markPaid = async (fee: Fee) => {
    await db.fees.update(fee.id, { status: 'paid', paidDate: new Date().toISOString().split('T')[0] });
    toast.success('Fee marked as paid!');
    load();
  };

  const handleMarkOverdue = async (id: string) => {
    await db.fees.update(id, { status: 'overdue' });
    toast.success('Fee marked as overdue');
    load();
  };

  const paymentMethods = ['all', ...Array.from(new Set(fees.map(f => f.paymentMethod).filter(Boolean) as string[]))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Fee Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage player fees and payments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={14} /> Export <ChevronDown size={12} />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
                <button onClick={() => { exportCSV(filtered); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <FileText size={14} /> CSV Export
                </button>
              </div>
            )}
          </div>
          <Link to="/admin/fees/reports" className="btn-outline text-sm">Reports</Link>
          <Link to="/admin/fees/add" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Fee</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Collected', value: formatCurrency(totalPaid), sub: `${fees.filter(f => f.status === 'paid').length} payments`, color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Pending / Overdue', value: formatCurrency(totalPending), sub: `${fees.filter(f => f.status === 'pending').length}P · ${fees.filter(f => f.status === 'overdue').length}O`, color: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'Total Discounts', value: formatCurrency(totalDiscount), sub: 'Applied discounts', color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Late Fee Fines', value: formatCurrency(totalLateFee), sub: 'Collected late fees', color: 'bg-red-50 border-red-200 text-red-800' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search player, transaction ID…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-auto min-w-[140px]">
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="form-input w-auto min-w-[140px]">
            {paymentMethods.map(m => <option key={m} value={m}>{m === 'all' ? 'All Methods' : m}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-500">{filtered.length} record(s)</p>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading fees…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Period</th>
                  <th className="table-th">Amount</th>
                  <th className="table-th">Discount</th>
                  <th className="table-th">Due Date</th>
                  <th className="table-th">Method</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(fee => (
                  <tr key={fee.id} className="hover:bg-gray-50/50">
                    <td className="table-td font-medium text-gray-900">{fee.playerName}</td>
                    <td className="table-td"><span className="badge-blue text-xs">{fee.program}</span></td>
                    <td className="table-td text-gray-500 text-sm">{fee.month} {fee.year}</td>
                    <td className="table-td">
                      <div>
                        <span className="font-bold text-gray-900">{formatCurrency(fee.amount)}</span>
                        {fee.lateFee ? <span className="text-xs text-red-500 ml-1">+{formatCurrency(fee.lateFee)}</span> : null}
                      </div>
                    </td>
                    <td className="table-td text-green-600 text-sm">{fee.discount ? formatCurrency(fee.discount) : '—'}</td>
                    <td className="table-td text-gray-500 text-sm">{formatDate(fee.dueDate)}</td>
                    <td className="table-td text-gray-500 text-xs">{fee.paymentMethod || '—'}</td>
                    <td className="table-td">
                      <span className={
                        fee.status === 'paid' ? 'badge-green' :
                        fee.status === 'overdue' ? 'badge-red' :
                        fee.status === 'partial' ? 'badge-blue' : 'badge-yellow'
                      }>{fee.status}</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1 flex-wrap">
                        {fee.status === 'paid' && (
                          <button
                            onClick={() => printReceipt(fee)}
                            className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded font-medium transition-colors"
                            title="Print Receipt"
                          >
                            <Printer size={11} /> Receipt
                          </button>
                        )}
                        {fee.status !== 'paid' && (
                          <button onClick={() => markPaid(fee)} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded font-medium transition-colors">Paid</button>
                        )}
                        {fee.status === 'pending' && (
                          <button onClick={() => handleMarkOverdue(fee.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded font-medium transition-colors">Overdue</button>
                        )}
                        <button onClick={() => handleDelete(fee.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && <div className="text-center py-16 text-gray-400">No fee records found</div>}
        </div>
      </div>
    </div>
  );
}
