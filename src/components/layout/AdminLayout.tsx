import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Bell, Menu, X, AlertCircle, CalendarCheck, WifiOff } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { auth } from '@/lib/storage';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAttendancePopup, setShowAttendancePopup] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, []);

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate('/login');
      return;
    }
    const today = getTodayString();
    Promise.all([
      db.notifications.getAll(),
      db.holidays.isHoliday(today),
      db.attendance.isMarkedForDate(today),
    ]).then(([notifs, isHoliday, isMarked]) => {
      setUnreadCount(notifs.filter(n => !n.isRead).length);
      if (!isHoliday && !isMarked) {
        setShowAttendancePopup(true);
      }
    });
  }, [navigate]);

  if (!auth.isLoggedIn()) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-gray-800 font-semibold text-sm md:text-base hidden sm:block">Young Warriors Cricket Club</span>
            <span className="text-gray-800 font-semibold text-sm block sm:hidden">YWCC</span>
            {isOffline && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <WifiOff size={12} /> Offline
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/notifications"
              className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to="/"
              target="_blank"
              className="hidden sm:block text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              View Site →
            </Link>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Attendance Reminder Popup */}
      {showAttendancePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAttendancePopup(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <button
              onClick={() => setShowAttendancePopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Attendance Pending</h3>
                <p className="text-gray-500 text-sm">Today's attendance has not been marked yet.</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Please mark today's attendance for all active players. This ensures accurate attendance records.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAttendancePopup(false);
                  navigate('/admin/attendance');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <CalendarCheck size={16} />
                Mark Now
              </button>
              <button
                onClick={() => setShowAttendancePopup(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors text-sm"
              >
                Remind Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
