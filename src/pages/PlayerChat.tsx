import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, MessageCircle, Users, ArrowLeft, Smile } from 'lucide-react';
import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types';
import logoImg from '@/assets/academy-logo.jpg';

interface PlayerSession {
  id: string;
  name: string;
  regNumber: string;
}

const QUICK_REPLIES = ['👋 Hello everyone!', '🏏 Ready to play!', '💪 Let\'s train hard!', '🎉 Great work team!'];

export default function PlayerChat() {
  const navigate = useNavigate();
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ywcc_player_session');
    if (!stored) { navigate('/player-login'); return; }
    const s: PlayerSession = JSON.parse(stored);
    setSession(s);

    // Load existing messages
    db.chat.getMessages('general', 100).then(msgs => {
      setMessages(msgs);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
    });

    // Real-time subscription
    const channel = supabase
      .channel('room-general')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: 'room=eq.general',
      }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        const newMsg: ChatMessage = {
          id: row.id as string,
          senderId: row.sender_id as string,
          senderName: row.sender_name as string,
          room: row.room as string,
          message: row.message as string,
          createdAt: row.created_at as string,
        };
        setMessages(prev => {
          // Deduplicate
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent | React.KeyboardEvent, text?: string) => {
    e.preventDefault();
    const msg = text || input.trim();
    if (!session || !msg) return;
    setSending(true);
    try {
      await db.chat.send({
        senderId: session.id,
        senderName: session.name,
        room: 'general',
        message: msg,
      });
      setInput('');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDateLabel = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  // Group messages by date
  type Group = { date: string; msgs: ChatMessage[] };
  const groups: Group[] = [];
  messages.forEach(msg => {
    const d = formatDateLabel(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.date === d) last.msgs.push(msg);
    else groups.push({ date: d, msgs: [msg] });
  });

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 flex-shrink-0 z-10">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-3 h-14">
          <Link
            to="/player"
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="relative">
            <img src={logoImg} alt="YWCC" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Team Chat</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Users size={10} /> General · All Players
            </p>
          </div>
        </div>
      </nav>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm">Loading messages…</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation with your team!</p>
            </div>
          ) : (
            <>
              {groups.map(group => (
                <div key={group.date}>
                  <div className="text-center my-4">
                    <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {group.date}
                    </span>
                  </div>
                  {group.msgs.map((msg, idx) => {
                    const isMe = msg.senderId === session?.id;
                    const prevMsg = group.msgs[idx - 1];
                    const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                    const showName = !isMe && showAvatar;

                    return (
                      <div key={msg.id} className={`flex gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar placeholder for spacing */}
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && !isMe && (
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold mt-auto">
                              {msg.senderName.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {showName && (
                            <p className="text-xs text-gray-500 font-semibold mb-0.5 ml-0.5">{msg.senderName}</p>
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-gray-900 text-white rounded-br-md'
                              : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'
                          }`}>
                            {msg.message}
                          </div>
                          <p className={`text-xs text-gray-400 mt-1 ${isMe ? 'mr-0.5' : 'ml-0.5'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {/* Quick replies */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
            {QUICK_REPLIES.map(qr => (
              <button
                key={qr}
                onClick={e => handleSend(e, qr)}
                className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors flex-shrink-0"
              >
                {qr}
              </button>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message the team…"
                className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-gray-50 pr-10"
                maxLength={500}
              />
              <Smile size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-gray-800 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
