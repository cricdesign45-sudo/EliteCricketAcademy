import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import logoImg from '@/assets/academy-logo.jpg';

function getAdminPassword(): string {
  try {
    const v = localStorage.getItem('ywcc_credentials');
    return v ? JSON.parse(v).password : 'admin123';
  } catch { return 'admin123'; }
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const correctPassword = getAdminPassword();
      if (username === 'admin' && password === correctPassword) {
        localStorage.setItem('eca_admin_token', 'logged_in');
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&h=900&fit=crop" alt="bg" className="w-full h-full object-cover opacity-10" />
      </div>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoImg} alt="Young Warriors Cricket Club" className="w-20 h-20 rounded-full object-cover border-4 border-blue-600 shadow-lg mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Young Warriors Cricket Club Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="form-label">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input pl-9"
                placeholder="Enter username"
                required
              />
            </div>
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="form-input pl-9 pr-10"
                placeholder="Enter password"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base font-bold disabled:opacity-70">
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">Default: admin / admin123</p>

        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-600 text-sm hover:underline">← Back to Website</Link>
        </div>
      </div>
    </div>
  );
}
