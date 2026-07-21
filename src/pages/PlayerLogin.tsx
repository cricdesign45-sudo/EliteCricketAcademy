import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Hash, Calendar, AlertCircle, Shield } from 'lucide-react';
import { db } from '@/lib/db';
import logoImg from '@/assets/academy-logo.jpg';

export default function PlayerLogin() {
  const [regNumber, setRegNumber] = useState('');
  const [dob, setDob] = useState('');
  const [showDob, setShowDob] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const players = await db.players.getAll();
    const player = players.find(
      p =>
        p.registrationNumber.toLowerCase() === regNumber.toLowerCase().trim() &&
        p.dateOfBirth === dob
    );
    if (player) {
      localStorage.setItem('ywcc_player_session', JSON.stringify({ id: player.id, name: player.name, regNumber: player.registrationNumber }));
      navigate('/player');
    } else {
      setError('Invalid registration number or date of birth.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&h=900&fit=crop"
          alt="bg"
          className="w-full h-full object-cover opacity-5"
        />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img
              src={logoImg}
              alt="Young Warriors Cricket Club"
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Player Portal</h1>
            <p className="text-gray-500 text-sm mt-1">Young Warriors Cricket Club</p>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
            <Shield size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800">How to login</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Use your <strong>Registration Number</strong> (e.g. YWCC-0001) and your <strong>Date of Birth</strong> as password.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Registration Number</label>
              <div className="relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={regNumber}
                  onChange={e => setRegNumber(e.target.value)}
                  className="form-input pl-9 uppercase"
                  placeholder="e.g. YWCC-0001"
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">Date of Birth (Password)</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showDob ? 'text' : 'date'}
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="form-input pl-9 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowDob(!showDob)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showDob ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Verifying...' : 'Login to Player Portal'}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2">
            <Link to="/" className="text-blue-600 text-sm hover:underline">← Back to Website</Link>
            <p className="text-xs text-gray-400">Contact admin if you forgot your registration number.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
