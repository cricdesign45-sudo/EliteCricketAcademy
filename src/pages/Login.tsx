import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/storage';

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
      if (auth.login(username, password)) {
        navigate('/admin');
      } else {
        setError('Invalid credentials. Use admin / admin123');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-cricket-dark flex items-center justify-center p-4">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&h=900&fit=crop" alt="bg" className="w-full h-full object-cover opacity-10" />
      </div>
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cricket-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-display font-bold text-2xl">EC</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Young Warriros Cricket Club Management</p>
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


        <div className="mt-4 text-center">
          <Link to="/" className="text-cricket-green text-sm hover:underline">← Back to Website</Link>
        </div>
      </div>
    </div>
  );
}
