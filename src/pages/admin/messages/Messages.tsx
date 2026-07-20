import { useState, useEffect, useCallback } from 'react';
import { Trash2, Mail, Phone } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { ContactMessage } from '@/types';

export default function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.messages.getAll();
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedMsg = messages.find(m => m.id === selected);

  const markRead = async (id: string) => {
    await db.messages.update(id, { status: 'read' });
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' as const } : m));
  };

  const handleDelete = async (id: string) => {
    await db.messages.delete(id);
    setSelected(null);
    toast.success('Message deleted');
    load();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Contact Messages</h1>
        <p className="text-gray-500 text-sm">{messages.filter(m => m.status === 'unread').length} unread messages</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5 h-[calc(100vh-220px)]">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
          {loading && <div className="text-center py-12 text-gray-400">Loading…</div>}
          {!loading && messages.length === 0 && <div className="text-center py-12 text-gray-400">No messages yet</div>}
          {messages.map(msg => (
            <div
              key={msg.id}
              onClick={() => { setSelected(msg.id); if (msg.status === 'unread') markRead(msg.id); }}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selected === msg.id ? 'bg-cricket-green/5 border-l-4 border-l-cricket-green' : msg.status === 'unread' ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className={`text-sm font-semibold ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>{msg.name}</p>
                <span className="text-xs text-gray-400">{formatDate(msg.date)}</span>
              </div>
              <p className="text-xs font-medium text-cricket-green mb-1">{msg.subject}</p>
              <p className="text-xs text-gray-500 truncate">{msg.message}</p>
              {msg.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
            </div>
          ))}
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          {selectedMsg ? (
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMsg.subject}</h2>
                  <p className="text-gray-500 text-sm mt-1">{formatDate(selectedMsg.date)}</p>
                </div>
                <button onClick={() => handleDelete(selectedMsg.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-cricket-green rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedMsg.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedMsg.name}</p>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1"><Mail size={12} />{selectedMsg.email}</span>
                    {selectedMsg.phone && <span className="flex items-center gap-1"><Phone size={12} />{selectedMsg.phone}</span>}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-5">
                <p className="text-gray-700 leading-relaxed">{selectedMsg.message}</p>
              </div>
              <div className="mt-4">
                <a href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`} className="btn-primary flex items-center gap-2 w-fit">
                  <Mail size={16} /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Mail size={48} className="mx-auto mb-3 opacity-50" />
                <p>Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
