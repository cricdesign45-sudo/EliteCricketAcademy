import { useState, useEffect } from 'react';
import { X, Star, Trophy, Award } from 'lucide-react';
import { db } from '@/lib/db';
import type { PlayerOfMonth } from '@/types';

export default function PlayerOfMonthPopup() {
  const [data, setData] = useState<PlayerOfMonth | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const key = `ywcc_pom_seen_${month}_${year}`;
    if (localStorage.getItem(key)) return;

    db.playerOfMonth.getCurrent().then(pom => {
      if (pom) {
        setData(pom);
        setTimeout(() => setShow(true), 700);
      }
    });
  }, []);

  const dismiss = () => {
    if (!data) return;
    const key = `ywcc_pom_seen_${data.month}_${data.year}`;
    localStorage.setItem(key, '1');
    setShow(false);
  };

  if (!show || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden popup-enter">
        {/* Golden header */}
        <div className="relative bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 pt-7 pb-5 px-6 text-center">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-black/20 text-amber-950 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            <Trophy size={11} /> Player of the Month
          </div>
          <p className="text-amber-950/60 text-sm font-semibold">{data.month} {data.year}</p>
        </div>

        {/* Player card */}
        <div className="px-6 pb-6">
          {/* Avatar overlapping header */}
          <div className="flex justify-center -mt-12 mb-4">
            {data.photo ? (
              <img
                src={data.photo}
                alt={data.playerName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-white shadow-xl flex items-center justify-center text-white text-4xl font-bold">
                {data.playerName.charAt(0)}
              </div>
            )}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={15} className="text-amber-400 fill-amber-400" />
            ))}
          </div>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{data.playerName}</h2>
            <div className="flex items-center justify-center gap-1 text-gray-400 text-xs">
              <Award size={11} />
              <span>Young Warriors Cricket Club</span>
            </div>
          </div>

          {data.reason && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
              <p className="text-sm text-gray-700 leading-relaxed text-center italic">
                "{data.reason}"
              </p>
            </div>
          )}

          <button
            onClick={dismiss}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-bold transition-colors text-sm"
          >
            Continue to Website →
          </button>
        </div>
      </div>

      <style>{`
        .popup-enter {
          animation: popup-scale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popup-scale {
          from { transform: scale(0.75); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
