import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { Notification } from '@/types';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.notifications.getAll();
    setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const typeColors: Record<string, string> = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-gray-500 text-sm">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={async () => { await db.notifications.markAllRead(); toast.success('All marked as read'); load(); }} className="btn-outline flex items-center gap-2">
            <CheckCheck size={16} /> Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading notifications…</div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`border rounded-xl p-4 flex items-start gap-4 ${typeColors[n.type]} ${!n.isRead ? 'ring-2 ring-offset-1 ring-current/20' : 'opacity-70'}`}>
              <Bell size={20} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{n.title}</p>
                  <span className="text-xs opacity-70">{formatDate(n.date)}</span>
                </div>
                <p className="text-sm mt-1 opacity-80">{n.message}</p>
              </div>
              <div className="flex gap-1">
                {!n.isRead && (
                  <button onClick={async () => { await db.notifications.markRead(n.id); load(); }} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors" title="Mark read">
                    <CheckCheck size={16} />
                  </button>
                )}
                <button onClick={async () => { await db.notifications.delete(n.id); load(); }} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Bell size={48} className="mx-auto mb-3 opacity-30" />
              <p>No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
