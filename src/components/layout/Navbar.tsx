import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Programs', path: '/programs' },
  { label: 'Coaches', path: '/coaches' },
  { label: 'Achievements', path: '/achievements' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'News', path: '/news' },
  { label: 'Schedule', path: '/schedule' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-cricket-dark shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="text-cricket-dark font-bold text-lg">EC</span>
            </div>
            <div>
              <div className="text-white font-display font-bold text-lg leading-tight">Elite Cricket</div>
              <div className="text-amber-400 text-xs tracking-widest uppercase">Academy</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                  location.pathname === link.path
                    ? 'text-amber-400 bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/register" className="btn-secondary text-xs px-4 py-2">Enroll Now</Link>
            <Link to="/login" className="text-gray-300 hover:text-white text-sm">Admin Login</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-white p-2" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="lg:hidden pb-4">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-amber-400' : 'text-gray-300 hover:text-white'
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 px-4 pt-3 border-t border-white/10 mt-2">
              <Link to="/register" className="btn-secondary text-xs" onClick={() => setOpen(false)}>Enroll Now</Link>
              <Link to="/login" className="text-gray-300 text-sm pt-1" onClick={() => setOpen(false)}>Admin Login</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
