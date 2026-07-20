import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, UtensilsCrossed,
  UserCog, BookOpen, Image, Newspaper, Trophy, MessageSquare,
  Settings, LogOut, ChevronDown, ChevronRight, Globe, Bell,
  BarChart3, FileText, Star, Menu, X
} from 'lucide-react';
import { auth } from '@/lib/storage';
import { cn } from '@/lib/utils';

const sidebarSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    ],
  },
  {
    label: 'Management',
    items: [
      { label: 'Players', icon: Users, path: '/admin/players' },
      { label: 'Coaches', icon: UserCog, path: '/admin/coaches' },
      { label: 'Programs', icon: BookOpen, path: '/admin/programs' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Attendance', icon: CalendarCheck, path: '/admin/attendance' },
      { label: 'Holidays', icon: UtensilsCrossed, path: '/admin/holidays' },
      { label: 'Fee Management', icon: CreditCard, path: '/admin/fees' },
      { label: 'Fee Reports', icon: BarChart3, path: '/admin/fees/reports' },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Website Editor', icon: Globe, path: '/admin/website-editor' },
      { label: 'Gallery', icon: Image, path: '/admin/gallery' },
      { label: 'News & Blog', icon: Newspaper, path: '/admin/news' },
      { label: 'Achievements', icon: Trophy, path: '/admin/achievements' },
      { label: 'Testimonials', icon: Star, path: '/admin/testimonials' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Messages', icon: MessageSquare, path: '/admin/messages' },
      { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Reports Overview', icon: FileText, path: '/admin/reports' },
      { label: 'Player Stats', icon: BarChart3, path: '/admin/player-stats' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function AdminSidebar({ collapsed, onToggle }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={cn(
      'h-screen bg-cricket-dark flex flex-col transition-all duration-300 sticky top-0',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {!collapsed && (
          <div>
            <div className="text-white font-display font-bold text-base">Elite Cricket</div>
            <div className="text-amber-400 text-xs">Admin Panel</div>
          </div>
        )}
        <button onClick={onToggle} className="text-gray-400 hover:text-white p-1 rounded ml-auto">
          {collapsed ? <Menu size={20} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3">
        {sidebarSections.map((section) => (
          <div key={section.label} className="mb-2">
            {!collapsed && (
              <p className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.label}</p>
            )}
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive(item.path)
                    ? 'bg-cricket-green text-white'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-cricket-dark font-bold text-sm">A</div>
            <div>
              <p className="text-white text-sm font-medium">Admin</p>
              <p className="text-gray-500 text-xs">admin@eca.com</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium',
            collapsed && 'justify-center'
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
