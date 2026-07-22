import { useState, useEffect, useCallback } from 'react';
import { Trash2, Mail, Phone, MessageSquare, Reply, Send, Users, User } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { ContactMessage, PlayerMessage } from '@/types';

type Tab = 'contact' | 'players';

export default function Messages() {
  const [activeTab, setActiveTab] = useState<Tab>('contact');

  // Contact messages
  const [contactMsgs, setContactMsgs] = useState<ContactMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(true);

  // Player messages
  const [playerMsgs, setPlayerMsgs] = useState<PlayerMessage[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadContact = useCallback(async () => {
    setContactLoading(true);
    const data = await db.messages.getAll();
    setContactMsgs(data);
    setContactLoading(false);
  }, []);

  const loadPlayerMsgs = useCallback(async () => {
    setPlayerLoading(true);
    const data = await db.playerMessages.getAll();
    setPlayerMsgs(data);
    setPlayerLoading(false);
  }, []);

  useEffect(() => { loadContact(); }, [loadContact]);
  useEffect(() => { loadPlayerMsgs(); }, [loadPlayerMsgs]);

  // Contact handlers
  const selectedContactMsg = contactMsgs.find(m => m.id === selectedContact);
  const markContactRead = async (id: string) => {
    await db.messages.update(id, { status: 'read' });
    setContactMsgs(prev => prev.map(m => m.id === id ? { ...m, status: 'read' as const } : m));
  };
  const deleteContact = async (id: string) => {
    await db.messages.delete(id);
    setSelectedContact(null);
    toast.success('Message deleted');
    loadContact();
  };

  // Player message handlers
  const selectedPlayerMsg = playerMsgs.find(m => m.id === selectedPlayer);
  const handleSelectPlayer = async (id: string) => {
    setSelectedPlayer(id);
    setReplyText('');
    const msg = playerMsgs.find(m => m.id === id);
    if (msg && msg.status === 'unread') {
      await db.playerMessages.markRead(id);
      setPlayerMsgs(prev => prev.map(m => m.id === id ? { ...m, status: 'read' as const, isRead: true } : m));
    }
  };
  const handleReply = async () => {
    if (!selectedPlayer || !replyText.trim()) return;
    setReplying(true);
    await db.playerMessages.reply(selectedPlayer, replyText.trim());
    toast.success('Reply sent!');
    setReplyText('');
    loadPlayerMsgs();
    setReplying(false);
  };
  const deletePlayerMsg = async (id: string) => {
    await db.playerMessages.delete(id);
    setSelectedPlayer(null);
    toast.success('Message deleted');
    loadPlayerMsgs();
  };

  const contactUnread = contactMsgs.filter(m => m.status === 'unread').length;
  const playerUnread = playerMsgs.filter(m => m.status === 'unread').length;

  return (
    <div>
      <div className="mb-5">
        <h1 className="page-title">Messages</h1>
        <p className="text-gray-500 text-sm">{contactUnread + playerUnread} unread</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-5 w-fit">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'contact' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Mail size={14} /> Contact Form
          {contactUnread > 0 && <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{contactUnread}</span>}
        </button>
        <button
          onClick={() => setActiveTab('players')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'players' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={14} /> Player Messages
          {playerUnread > 0 && <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{playerUnread}</span>}
        </button>
      </div>

      {/* Contact Messages Tab */}
      {activeTab === 'contact' && (
        <div className="grid lg:grid-cols-5 gap-5 h-[calc(100vh-260px)]">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
            {contactLoading && <div className="text-center py-12 text-gray-400">Loading…</div>}
            {!contactLoading && contactMsgs.length === 0 && <div className="text-center py-12 text-gray-400">No contact messages</div>}
            {contactMsgs.map(msg => (
              <div
                key={msg.id}
                onClick={() => { setSelectedContact(msg.id); if (msg.status === 'unread') markContactRead(msg.id); }}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedContact === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : msg.status === 'unread' ? 'bg-amber-50/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-semibold ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>{msg.name}</p>
                  <span className="text-xs text-gray-400">{formatDate(msg.date)}</span>
                </div>
                <p className="text-xs font-medium text-blue-600 mb-1">{msg.subject}</p>
                <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                {msg.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1" />}
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
            {selectedContactMsg ? (
              <div className="p-6 h-full overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedContactMsg.subject}</h2>
                    <p className="text-gray-500 text-sm mt-1">{formatDate(selectedContactMsg.date)}</p>
                  </div>
                  <button onClick={() => deleteContact(selectedContactMsg.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedContactMsg.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedContactMsg.name}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1"><Mail size={12} />{selectedContactMsg.email}</span>
                      {selectedContactMsg.phone && <span className="flex items-center gap-1"><Phone size={12} />{selectedContactMsg.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-700 leading-relaxed">{selectedContactMsg.message}</p>
                </div>
                <div className="mt-4">
                  <a href={`mailto:${selectedContactMsg.email}?subject=Re: ${selectedContactMsg.subject}`} className="btn-primary flex items-center gap-2 w-fit">
                    <Mail size={16} /> Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center"><Mail size={48} className="mx-auto mb-3 opacity-50" /><p>Select a message to read</p></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Player Messages Tab */}
      {activeTab === 'players' && (
        <div className="grid lg:grid-cols-5 gap-5 h-[calc(100vh-260px)]">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
            {playerLoading && <div className="text-center py-12 text-gray-400">Loading…</div>}
            {!playerLoading && playerMsgs.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-40" />
                <p>No player messages yet</p>
              </div>
            )}
            {playerMsgs.map(msg => (
              <div
                key={msg.id}
                onClick={() => handleSelectPlayer(msg.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedPlayer === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : msg.status === 'unread' ? 'bg-amber-50/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-semibold ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>{msg.senderName}</p>
                  <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
                {msg.subject && <p className="text-xs font-medium text-blue-600 mb-1">{msg.subject}</p>}
                <p className="text-xs text-gray-500 truncate">{msg.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  {msg.status === 'unread' && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  {msg.status === 'replied' && <span className="text-xs text-green-600 font-medium">✓ Replied</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            {selectedPlayerMsg ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">{selectedPlayerMsg.senderName.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedPlayerMsg.senderName}</p>
                      <p className="text-xs text-gray-400">Player · {new Date(selectedPlayerMsg.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => deletePlayerMsg(selectedPlayerMsg.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {selectedPlayerMsg.subject && (
                    <p className="text-sm font-semibold text-gray-700">Re: {selectedPlayerMsg.subject}</p>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400"><User size={12} /> Player</div>
                    <p className="text-gray-700 text-sm leading-relaxed">{selectedPlayerMsg.message}</p>
                  </div>

                  {selectedPlayerMsg.reply && (
                    <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                      <div className="flex items-center gap-2 mb-2 text-xs text-blue-600 font-medium"><Reply size={12} /> Admin Reply · {selectedPlayerMsg.repliedAt ? new Date(selectedPlayerMsg.repliedAt).toLocaleString() : ''}</div>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedPlayerMsg.reply}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type your reply…"
                      className="form-input flex-1 resize-none text-sm"
                    />
                    <button
                      onClick={handleReply}
                      disabled={replying || !replyText.trim()}
                      className="btn-primary px-4 flex items-center gap-2 self-end disabled:opacity-50"
                    >
                      <Send size={14} /> {replying ? 'Sending…' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center"><MessageSquare size={48} className="mx-auto mb-3 opacity-50" /><p>Select a message to read</p></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
