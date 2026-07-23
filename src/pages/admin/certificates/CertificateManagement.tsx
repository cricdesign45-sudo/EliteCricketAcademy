import { useState, useEffect, useCallback } from 'react';
import { Award, Plus, Trash2, Search, Printer, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { Certificate, Player } from '@/types';
import logoImg from '@/assets/academy-logo.jpg';

const CERT_TYPES: Certificate['certificateType'][] = ['participation', 'achievement', 'completion', 'excellence'];
const TYPE_COLORS: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  participation: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   hex: '#3B82F6' },
  achievement:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  hex: '#F59E0B' },
  completion:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  hex: '#10B981' },
  excellence:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hex: '#8B5CF6' },
};

function printCertificate(cert: Certificate, playerName: string) {
  const w = window.open('', '_blank', 'width=950,height=680');
  if (!w) return;
  const color = TYPE_COLORS[cert.certificateType]?.hex || '#3B82F6';
  w.document.write(`<!DOCTYPE html><html><head>
    <title>Certificate — ${cert.title}</title>
    <style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    body{font-family:'Georgia',serif;background:#f5f5f0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    @media print{body{background:white;padding:0}}</style>
  </head><body>
  <div style="width:820px;background:white;border:3px solid ${color};border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.15)">
    <div style="background:${color};padding:28px 48px;text-align:center">
      <div style="color:rgba(255,255,255,0.75);font-size:11px;letter-spacing:5px;text-transform:uppercase;margin-bottom:8px">Young Warriors Cricket Club</div>
      <div style="color:white;font-size:30px;font-weight:bold;letter-spacing:3px;text-transform:uppercase">Certificate of ${cert.certificateType.charAt(0).toUpperCase() + cert.certificateType.slice(1)}</div>
    </div>
    <div style="padding:48px;text-align:center">
      <div style="color:#9ca3af;font-size:15px;margin-bottom:18px;font-style:italic">This is to proudly certify that</div>
      <div style="font-size:40px;font-weight:bold;color:#111827;border-bottom:3px solid ${color};display:inline-block;padding-bottom:10px;margin-bottom:24px;min-width:300px">${playerName}</div>
      <div style="color:#374151;font-size:17px;line-height:1.8;max-width:580px;margin:0 auto 28px">${cert.description || 'has successfully demonstrated outstanding commitment and dedication to the sport of cricket.'}</div>
      <div style="display:inline-block;background:${color}18;border:2px solid ${color}50;border-radius:10px;padding:14px 32px;margin-bottom:32px">
        <div style="color:${color};font-weight:bold;font-size:22px">${cert.title}</div>
        ${cert.program ? `<div style="color:#6b7280;font-size:14px;margin-top:6px">${cert.program}${cert.level ? ` &middot; ${cert.level}` : ''}</div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:36px;text-align:center">
        <div><div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Issued Date</div><div style="color:#111827;font-weight:700;font-size:15px">${cert.issuedDate}</div></div>
        <div><div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Issued By</div><div style="color:#111827;font-weight:700;font-size:15px">${cert.issuedBy}</div></div>
        <div><div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Certificate ID</div><div style="color:#111827;font-weight:700;font-family:monospace;font-size:12px">${cert.id.slice(0,14).toUpperCase()}</div></div>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding-top:22px;display:flex;justify-content:space-between;align-items:center">
        <div style="text-align:left">
          <div style="border-top:2px solid #111827;padding-top:6px;width:180px;font-weight:bold;color:#111827;font-size:13px">${cert.issuedBy}</div>
          <div style="color:#9ca3af;font-size:11px">Authorized Signatory</div>
        </div>
        <div style="text-align:center">
          <div style="width:64px;height:64px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:9px;color:#9ca3af;margin:0 auto 4px">QR Code</div>
          <div style="color:#9ca3af;font-size:10px">Verify Online</div>
        </div>
        <div style="text-align:right">
          <div style="color:#9ca3af;font-size:10px">Young Warriors Cricket Club</div>
          <div style="color:#9ca3af;font-size:10px">Official Academy Document</div>
        </div>
      </div>
    </div>
  </div></body></html>`);
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
}

export default function CertificateManagement() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    playerId: '', title: '', description: '', issuedBy: 'Admin',
    issuedDate: new Date().toISOString().split('T')[0],
    certificateType: 'participation' as Certificate['certificateType'],
    program: '', level: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [c, p] = await Promise.all([db.certificates.getAll(), db.players.getAll()]);
    setCerts(c); setPlayers(p); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = certs.filter(c => {
    const matchSearch = c.playerName.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || c.certificateType === typeFilter;
    return matchSearch && matchType;
  });

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerId) { toast.error('Please select a player'); return; }
    setSaving(true);
    const player = players.find(p => p.id === form.playerId);
    await db.certificates.add({
      playerId: form.playerId,
      playerName: player!.name,
      title: form.title,
      description: form.description || undefined,
      issuedBy: form.issuedBy,
      issuedDate: form.issuedDate,
      certificateType: form.certificateType,
      program: form.program || undefined,
      level: form.level || undefined,
      isActive: true,
    });
    toast.success('Certificate issued!');
    setSaving(false);
    setShowForm(false);
    setForm({ playerId: '', title: '', description: '', issuedBy: 'Admin', issuedDate: new Date().toISOString().split('T')[0], certificateType: 'participation', program: '', level: '' });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Revoke this certificate?')) {
      await db.certificates.delete(id);
      toast.success('Certificate revoked');
      load();
    }
  };

  const f = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><Award size={22} /> Certificates</h1>
          <p className="text-gray-500 text-sm">Issue and manage player certificates with QR verification</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Issue Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {CERT_TYPES.map(type => {
          const tc = TYPE_COLORS[type];
          const count = certs.filter(c => c.certificateType === type).length;
          return (
            <div key={type} className={`border-2 ${tc.border} ${tc.bg} rounded-xl p-4`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${tc.text} mb-1`}>{type}</p>
              <p className={`text-2xl font-bold ${tc.text}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by player or title…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="form-input w-auto">
          <option value="all">All Types</option>
          {CERT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Award size={48} className="mx-auto mb-3 opacity-30" />
          <p>No certificates found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Player</th>
                  <th className="table-th">Title</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Program</th>
                  <th className="table-th">Issued Date</th>
                  <th className="table-th">Issued By</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(cert => {
                  const tc = TYPE_COLORS[cert.certificateType];
                  return (
                    <tr key={cert.id} className="hover:bg-gray-50/50">
                      <td className="table-td font-medium text-gray-900">{cert.playerName}</td>
                      <td className="table-td text-gray-700">{cert.title}</td>
                      <td className="table-td">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text}`}>{cert.certificateType}</span>
                      </td>
                      <td className="table-td text-gray-500 text-xs">{cert.program || '—'}</td>
                      <td className="table-td text-gray-500 text-xs">{formatDate(cert.issuedDate)}</td>
                      <td className="table-td text-gray-500 text-xs">{cert.issuedBy}</td>
                      <td className="table-td">
                        {cert.isActive ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle size={12} /> Active</span>
                        ) : (
                          <span className="text-xs text-gray-400">Revoked</span>
                        )}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => printCertificate(cert, cert.playerName)} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">
                            <Printer size={12} /> Print
                          </button>
                          <button onClick={() => handleDelete(cert.id)} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Award size={18} /> Issue Certificate</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleIssue} className="p-6 space-y-4">
              <div>
                <label className="form-label">Player *</label>
                <select required value={form.playerId} onChange={e => { f('playerId', e.target.value); const p = players.find(p => p.id === e.target.value); if (p) f('program', p.program); }} className="form-input">
                  <option value="">Select a player…</option>
                  {players.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.registrationNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Certificate Title *</label>
                <input required value={form.title} onChange={e => f('title', e.target.value)} className="form-input" placeholder="e.g. Outstanding Batting Performance" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea rows={2} value={form.description} onChange={e => f('description', e.target.value)} className="form-input resize-none" placeholder="Details about this achievement…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Certificate Type</label>
                  <select value={form.certificateType} onChange={e => f('certificateType', e.target.value)} className="form-input">
                    {CERT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Issued Date</label>
                  <input type="date" value={form.issuedDate} onChange={e => f('issuedDate', e.target.value)} className="form-input" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Program</label>
                  <input value={form.program} onChange={e => f('program', e.target.value)} className="form-input" placeholder="Program name" />
                </div>
                <div>
                  <label className="form-label">Level</label>
                  <input value={form.level} onChange={e => f('level', e.target.value)} className="form-input" placeholder="e.g. Intermediate" />
                </div>
              </div>
              <div>
                <label className="form-label">Issued By</label>
                <input value={form.issuedBy} onChange={e => f('issuedBy', e.target.value)} className="form-input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 py-2.5">{saving ? 'Issuing…' : 'Issue Certificate'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1 py-2.5">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
