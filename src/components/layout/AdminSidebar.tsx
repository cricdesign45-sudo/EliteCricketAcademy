import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, CalendarCheck, UtensilsCrossed,
  UserCog, BookOpen, Image, Newspaper, Trophy, MessageSquare,
  Settings, LogOut, Globe, Bell,
  BarChart3, FileText, Star, X, ChevronLeft, ChevronRight
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
      { label: 'Att. Calendar', icon: BarChart3, path: '/admin/attendance/calendar' },
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
    label: 'Store',
    items: [
      { label: 'Products', icon: BookOpen, path: '/admin/store' },
      { label: 'Orders', icon: CreditCard, path: '/admin/store/orders' },
    ],
  },
  {
    label: 'Recognition',
    items: [
      { label: 'Certificates', icon: Star, path: '/admin/certificates' },
      { label: 'Player of Month', icon: Trophy, path: '/admin/player-of-month' },
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
    label: 'Security',
    items: [
      { label: 'Activity Logs', icon: FileText, path: '/admin/activity-logs' },
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
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
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

  const handleLinkClick = () => {
    onMobileClose();
  };

  const SidebarContent = () => (
    <aside className={cn(
      'h-full bg-gray-900 flex flex-col transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center border-b border-white/10 h-16 flex-shrink-0',
        collapsed ? 'justify-center px-2' : 'px-4 justify-between'
      )}>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">Young Warriors</div>
            <div className="text-blue-400 text-xs">Admin Panel</div>
          </div>
        )}
        {/* Desktop toggle */}
        <button
          onClick={onToggle}
          className="hidden md:flex text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3">
        {sidebarSections.map((section) => (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{section.label}</p>
            )}
            {section.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive(item.path)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon size={17} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin</p>
              <p className="text-gray-500 text-xs truncate">admin@academy.com</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-medium',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut size={17} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="relative z-10 w-64 h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
