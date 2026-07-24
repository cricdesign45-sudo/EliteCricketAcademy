import { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Trash2, Search, RefreshCw } from 'lucide-react';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types';

export default function ChatManagement() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.chat.getAll();
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    await db.chat.deleteMessage(id);
    toast.success('Message deleted');
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all chat messages? This cannot be undone.')) return;
    await Promise.all(messages.map(m => db.chat.deleteMessage(m.id)));
    setMessages([]);
    toast.success('All messages cleared');
  };

  const filtered = messages.filter(m =>
    m.senderName.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><MessageCircle size={20} /> Chat Management</h1>
          <p className="text-gray-500 text-sm">Monitor and moderate player chat — {messages.length} total messages</p>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button onClick={handleClearAll} className="btn-outline text-sm text-red-500 border-red-200 hover:bg-red-50">Clear All</button>
          )}
          <button onClick={load} className="btn-outline flex items-center gap-2 text-sm"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search messages or player names…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageCircle size={40} className="mx-auto mb-3 opacity-20" />
          <p>{messages.length === 0 ? 'No chat messages yet' : 'No messages match your search'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(msg => (
            <div key={msg.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {msg.senderName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm">{msg.senderName}</span>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                  <span className="text-xs text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded">#{msg.room}</span>
                </div>
                <p className="text-sm text-gray-700">{msg.message}</p>
              </div>
              <button onClick={() => handleDelete(msg.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0" title="Delete">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
