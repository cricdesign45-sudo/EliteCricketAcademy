import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, User } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { Player, PlayerStatReport } from '@/types';

/* ── Role skill definitions ───────────────────────────────────── */
const ROLE_SKILLS: Record<string, string[]> = {
  wicket_keeper: [
    'Keeping', 'Batting', 'Glovework', 'Footwork', 'Reflexes',
    'Catching', 'Stumping', 'Throwing Accuracy', 'Run-Out Skills',
    'Communication', 'Match Awareness', 'Positioning', 'Agility',
    'Fitness', 'Decision Making',
  ],
  batsman: [
    'Batting', 'Footwork', 'Cover Drive', 'Straight Drive', 'Pull Shot',
    'Hook Shot', 'Cut Shot', 'Sweep Shot', 'Lofted Shots', 'Strike Rotation',
    'Power Hitting', 'Shot Selection', 'Running Between Wickets', 'Balance',
    'Concentration', 'Match Awareness',
  ],
  bowler: [
    'Bowling', 'Accuracy', 'Line & Length', 'Pace', 'Swing Bowling',
    'Seam Bowling', 'Spin Bowling', 'Yorkers', 'Bouncers', 'Slower Balls',
    'Variations', 'Death Bowling', 'Powerplay Bowling', 'Field Placement',
    'Fitness', 'Consistency',
  ],
  all_rounder: [
    'Batting', 'Bowling', 'Fielding', 'Catching', 'Throwing',
    'Running Between Wickets', 'Power Hitting', 'Strike Rotation',
    'Pace Bowling', 'Spin Bowling', 'Accuracy', 'Match Awareness',
    'Leadership', 'Fitness', 'Agility', 'Decision Making',
  ],
};

const ROLE_LABELS: Record<string, string> = {
  batsman: 'Batsman',
  bowler: 'Bowler',
  wicket_keeper: 'Wicket Keeper',
  all_rounder: 'All-Rounder',
};

const ROLE_COLORS: Record<string, string> = {
  batsman: 'bg-blue-600',
  bowler: 'bg-emerald-600',
  wicket_keeper: 'bg-purple-600',
  all_rounder: 'bg-amber-600',
};

/* ── Rating Slider ───────────────────────────────────────────── */
function RatingInput({
  skill, value, onChange,
}: { skill: string; value: number; onChange: (v: number) => void }) {
  const color =
    value >= 8 ? 'text-emerald-600 bg-emerald-50 border-emerald-300' :
    value >= 6 ? 'text-blue-600 bg-blue-50 border-blue-300' :
    value >= 4 ? 'text-amber-600 bg-amber-50 border-amber-300' :
    'text-red-500 bg-red-50 border-red-300';

  const barColor =
    value >= 8 ? 'bg-emerald-500' :
    value >= 6 ? 'bg-blue-500' :
    value >= 4 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700 w-44 flex-shrink-0 font-medium">{skill}</span>
      <div className="flex-1 relative">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${barColor}`}
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <input
          type="range"
          min={0} max={10} step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center transition-colors"
        >−</button>
        <span className={`w-9 h-9 rounded-lg border-2 text-base font-bold flex items-center justify-center ${color}`}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(10, value + 1))}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs flex items-center justify-center transition-colors"
        >+</button>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function AddPlayerStatReport() {
  const navigate = useNavigate();
  const { playerId, reportId } = useParams();

  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState(playerId || '');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [role, setRole] = useState<PlayerStatReport['role']>('batsman');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingReport, setExistingReport] = useState<PlayerStatReport | null>(null);

  /* Initialize ratings when role changes */
  useEffect(() => {
    const skills = ROLE_SKILLS[role] || [];
    setRatings(prev => {
      const next: Record<string, number> = {};
      skills.forEach(s => { next[s] = prev[s] ?? 5; });
      return next;
    });
  }, [role]);

  /* Load players + optional existing report */
  useEffect(() => {
    async function load() {
      const allPlayers = await db.players.getAll();
      setPlayers(allPlayers);
      if (playerId) {
        const p = allPlayers.find(pl => pl.id === playerId) || null;
        setSelectedPlayer(p);
        if (p?.position) {
          const pos = p.position.toLowerCase();
          if (pos.includes('keeper') || pos.includes('wicket')) setRole('wicket_keeper');
          else if (pos.includes('bowl')) setRole('bowler');
          else if (pos.includes('all')) setRole('all_rounder');
          else setRole('batsman');
        }
      }
      if (reportId) {
        const reports = await db.playerStatReports.getAll();
        const found = reports.find(r => r.id === reportId) || null;
        if (found) {
          setExistingReport(found);
          setSelectedPlayerId(found.playerId);
          setRole(found.role);
          setRatings(found.stats);
          setNotes(found.notes || '');
          setReportDate(found.reportDate);
        }
      }
      setLoading(false);
    }
    load();
  }, [playerId, reportId]);

  /* Update selected player when picker changes */
  useEffect(() => {
    if (selectedPlayerId) {
      const p = players.find(pl => pl.id === selectedPlayerId) || null;
      setSelectedPlayer(p);
    }
  }, [selectedPlayerId, players]);

  const skills = ROLE_SKILLS[role] || [];
  const overallRating = skills.length > 0
    ? parseFloat((skills.reduce((s, k) => s + (ratings[k] ?? 5), 0) / skills.length).toFixed(2))
    : 0;

  const resetAll = () => {
    const next: Record<string, number> = {};
    skills.forEach(s => { next[s] = 5; });
    setRatings(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) { toast.error('Please select a player'); return; }
    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return;
    setSaving(true);
    const payload = {
      playerId: selectedPlayerId,
      playerName: player.name,
      role,
      stats: ratings,
      overallRating,
      notes: notes.trim() || undefined,
      markedBy: 'Admin',
      reportDate,
    };
    if (existingReport) {
      await db.playerStatReports.update(existingReport.id, payload);
      toast.success('Report updated');
    } else {
      await db.playerStatReports.add(payload);
      toast.success('Report saved');
    }
    setSaving(false);
    navigate('/admin/player-stats');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/player-stats" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">{existingReport ? 'Edit Stat Report' : 'New Player Stat Report'}</h1>
          <p className="text-gray-500 text-sm">Rate player skills on a scale of 0–10</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Setup Row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><User size={16} /> Player & Role</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Select Player *</label>
              <select
                required
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
                className="form-input"
              >
                <option value="">— Choose player —</option>
                {players.filter(p => p.status === 'active').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (#{p.jerseyNumber})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Report Date *</label>
              <input
                type="date"
                required
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Player Role *</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as PlayerStatReport['role'])}
                className="form-input"
              >
                {Object.entries(ROLE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Player card preview */}
          {selectedPlayer && (
            <div className="mt-4 flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              {selectedPlayer.photo ? (
                <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {selectedPlayer.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-gray-900">{selectedPlayer.name}</p>
                <p className="text-sm text-gray-500">{selectedPlayer.program} · #{selectedPlayer.jerseyNumber} · {selectedPlayer.position}</p>
              </div>
              <div className={`ml-auto px-3 py-1.5 rounded-lg text-white text-xs font-bold ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </div>
            </div>
          )}
        </div>

        {/* Skill Ratings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Skill Ratings — {ROLE_LABELS[role]}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{skills.length} skills · Drag slider or use +/− buttons</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-gray-500">Overall</p>
                <p className={`text-2xl font-bold ${
                  overallRating >= 8 ? 'text-emerald-600' :
                  overallRating >= 6 ? 'text-blue-600' :
                  overallRating >= 4 ? 'text-amber-600' : 'text-red-500'
                }`}>{overallRating}<span className="text-base font-normal text-gray-400">/10</span></p>
              </div>
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Rating scale legend */}
          <div className="flex flex-wrap gap-3 mb-5 text-xs">
            {[
              { range: '9–10', label: 'Exceptional', color: 'bg-emerald-100 text-emerald-700' },
              { range: '7–8', label: 'Good', color: 'bg-blue-100 text-blue-700' },
              { range: '5–6', label: 'Average', color: 'bg-amber-100 text-amber-700' },
              { range: '3–4', label: 'Below Avg', color: 'bg-orange-100 text-orange-700' },
              { range: '0–2', label: 'Needs Work', color: 'bg-red-100 text-red-700' },
            ].map(item => (
              <span key={item.range} className={`px-2.5 py-1 rounded-full font-medium ${item.color}`}>
                {item.range} — {item.label}
              </span>
            ))}
          </div>

          <div className="space-y-0">
            {skills.map(skill => (
              <RatingInput
                key={skill}
                skill={skill}
                value={ratings[skill] ?? 5}
                onChange={v => setRatings(prev => ({ ...prev, [skill]: v }))}
              />
            ))}
          </div>
        </div>

        {/* Visual Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Skill Summary</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {skills.map(skill => {
              const val = ratings[skill] ?? 5;
              const barColor =
                val >= 8 ? 'bg-emerald-500' : val >= 6 ? 'bg-blue-500' :
                val >= 4 ? 'bg-amber-500' : 'bg-red-500';
              return (
                <div key={skill} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-36 flex-shrink-0 truncate">{skill}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${val * 10}%` }} />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-5 text-right">{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="form-label text-base font-bold text-gray-900 block mb-3">Coach Notes (optional)</label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="form-input resize-none"
            placeholder="Observations, improvement areas, strengths…"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !selectedPlayerId}
            className="btn-primary flex items-center gap-2 px-8 py-3"
          >
            <Save size={16} /> {saving ? 'Saving…' : existingReport ? 'Update Report' : 'Save Report'}
          </button>
          <Link to="/admin/player-stats" className="btn-outline px-8 py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
