import { useState, useEffect } from 'react';
import { Mail, Phone, Star, Award } from 'lucide-react';
import { db } from '@/lib/db';
import type { Coach } from '@/types';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);

  useEffect(() => {
    db.coaches.getAll().then(data => setCoaches(data.filter(c => c.status === 'active')));
  }, []);

  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <img src="https://images.unsplash.com/photo-1606914700485-38f5d6c3d8ab?w=1400&h=400&fit=crop" alt="Coaches" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Expert Team</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Our Coaching Staff</h1>
          <p className="text-gray-300 text-lg">World-class coaches dedicated to developing your cricket skills.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {coaches.length === 0 ? (
            <div className="text-center py-20 text-gray-400">Loading coaches…</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coaches.map(coach => (
                <div key={coach.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                  <div className="relative h-64 bg-gradient-to-br from-cricket-green to-cricket-green-dark">
                    {coach.photo ? (
                      <img src={coach.photo} alt={coach.name} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold opacity-30">
                        {coach.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-xl">{coach.name}</h3>
                      <p className="text-amber-400 text-sm font-medium">{coach.specialization} Coach</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{coach.bio}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Award size={14} className="text-cricket-green" /><span>{coach.qualifications}</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Star size={14} className="text-amber-400" /><span>{coach.experience} years experience</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} className="text-cricket-green" /><span>{coach.email}</span></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} className="text-cricket-green" /><span>{coach.phone}</span></div>
                    </div>
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
