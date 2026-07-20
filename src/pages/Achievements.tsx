import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { Achievement } from '@/types';

const levelColors: Record<string, string> = {
  district: 'bg-green-100 text-green-700 border-green-200',
  state: 'bg-blue-100 text-blue-700 border-blue-200',
  national: 'bg-purple-100 text-purple-700 border-purple-200',
  international: 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    db.achievements.getAll().then(setAchievements);
  }, []);

  const byLevel = {
    international: achievements.filter(a => a.level === 'international').length,
    national: achievements.filter(a => a.level === 'national').length,
    state: achievements.filter(a => a.level === 'state').length,
    district: achievements.filter(a => a.level === 'district').length,
  };

  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <img src="https://images.unsplash.com/photo-1574791017827-96e4a50d93f3?w=1400&h=400&fit=crop" alt="Achievements" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Our Pride</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Achievements & Awards</h1>
          <p className="text-gray-300 text-lg">Celebrating the success stories of our players and academy.</p>
        </div>
      </section>

      <section className="bg-cricket-green py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[['District', byLevel.district], ['State', byLevel.state], ['National', byLevel.national], ['International', byLevel.international]].map(([lvl, count]) => (
              <div key={lvl}>
                <div className="text-3xl font-bold text-amber-400">{count}+</div>
                <div className="text-green-200 text-sm mt-1">{lvl} Level</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {achievements.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Loading achievements…</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map(a => (
                <div key={a.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow border-l-4 border-cricket-green">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-cricket-green/10 rounded-xl flex items-center justify-center">
                      <Trophy className="text-cricket-green" size={24} />
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${levelColors[a.level]}`}>{a.level}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{a.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{a.description}</p>
                  {a.playerName && <p className="text-cricket-green text-sm font-medium">🏏 {a.playerName}</p>}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="badge-blue text-xs">{a.category}</span>
                    <span className="text-gray-400 text-xs">{formatDate(a.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
