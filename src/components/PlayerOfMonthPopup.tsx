import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { db } from '@/lib/db';
import type { PlayerOfMonth } from '@/types';

export default function PlayerOfMonthPopup() {
  const [pom, setPom] = useState<PlayerOfMonth | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storageKey = 'ywcc_pom_dismissed';
    const dismissed = localStorage.getItem(storageKey);
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;

    if (dismissed === monthKey) return; // Already dismissed this month

    db.playerOfMonth.getCurrent().then(current => {
      if (current) {
        setPom(current);
        // Show after 2 seconds
        setTimeout(() => setVisible(true), 2000);
      }
    });
  }, []);

  const dismiss = () => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    localStorage.setItem('ywcc_pom_dismissed', monthKey);
    setVisible(false);
  };

  if (!visible || !pom) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Golden top strip */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

        {/* Close */}
        <button onClick={dismiss} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10">
          <X size={20} />
        </button>

        {/* Sparkle BG */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />

        <div className="relative p-7 text-center">
          {/* Stars decoration */}
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
            ))}
          </div>

          {/* Title */}
          <div className="text-amber-400 text-xs font-bold uppercase tracking-[3px] mb-1">🏆 Recognition</div>
          <h2 className="text-2xl font-bold mb-1">Player of the Month</h2>
          <p className="text-gray-400 text-sm mb-6">{pom.month} {pom.year}</p>

          {/* Player */}
          <div className="flex flex-col items-center mb-5">
            {pom.photo ? (
              <img src={pom.photo} alt={pom.playerName}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-400 shadow-xl shadow-amber-400/20 mb-3" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-gray-900 text-4xl font-bold border-4 border-amber-400 shadow-xl shadow-amber-400/20 mb-3">
                {pom.playerName.charAt(0)}
              </div>
            )}
            <h3 className="text-3xl font-bold">{pom.playerName}</h3>
          </div>

          {pom.reason && (
            <div className="bg-white/10 rounded-2xl p-4 mb-5 text-sm text-gray-300 leading-relaxed italic">
              "{pom.reason}"
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={dismiss}
              className="flex-1 bg-amber-400 text-gray-900 font-bold py-3 rounded-xl hover:bg-amber-300 transition-colors text-sm"
            >
              Congratulations! 🎉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
