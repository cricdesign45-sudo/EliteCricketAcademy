import { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { auth } from '@/lib/storage';
import { db } from '@/lib/db';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      navigate('/login');
    } else {
      db.notifications.getAll().then(notifs => setUnreadCount(notifs.filter(n => !n.isRead).length));
    }
  }, [navigate]);

  if (!auth.isLoggedIn()) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-cricket-green focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/notifications" className="relative p-2 text-gray-500 hover:text-cricket-green hover:bg-cricket-green/5 rounded-lg transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link to="/" target="_blank" className="text-sm text-cricket-green hover:underline">View Site →</Link>
            <div className="w-8 h-8 bg-cricket-green rounded-full flex items-center justify-center text-white font-bold text-sm">A</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
