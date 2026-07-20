import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Calendar, ChevronRight } from 'lucide-react';
import { db } from '@/lib/db';
import type { Program } from '@/types';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
};

export default function Programs() {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    db.programs.getAll().then(setPrograms);
  }, []);

  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <img src="https://images.unsplash.com/photo-1574791017827-96e4a50d93f3?w=1400&h=400&fit=crop" alt="Programs" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">What We Offer</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Our Training Programs</h1>
          <p className="text-gray-300 text-lg">Structured programs designed for every level — from young beginners to aspiring professionals.</p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map(program => (
              <div key={program.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="h-3 bg-cricket-green" />
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${levelColors[program.level]}`}>{program.level}</span>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${program.status === 'active' ? 'badge-green' : 'badge-red'}`}>{program.status}</span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">{program.name}</h2>
                  <p className="text-gray-600 mb-6">{program.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Users size={16} className="text-cricket-green" /><span>Age: {program.ageGroup}</span></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Clock size={16} className="text-cricket-green" /><span>Duration: {program.duration}</span></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar size={16} className="text-cricket-green" /><span className="text-xs">{program.schedule}</span></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Users size={16} className="text-amber-500" /><span>{program.currentPlayers}/{program.maxPlayers} Enrolled</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div><span className="text-3xl font-bold text-cricket-green">₹{program.fee.toLocaleString()}</span><span className="text-gray-500 text-sm"> /course</span></div>
                    <Link to="/register" className="btn-primary flex items-center gap-2">Enroll <ChevronRight size={16} /></Link>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">Coach: <span className="font-medium text-gray-700">{program.coach}</span></div>
                </div>
              </div>
            ))}
            {programs.length === 0 && <div className="col-span-2 text-center py-20 text-gray-400">Loading programs…</div>}
          </div>
        </div>
      </section>

      <section className="py-20 bg-cricket-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12"><h2 className="text-4xl font-display font-bold">Why Train With Us?</h2></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Professional Coaches', desc: 'All coaches are NCA/BCCI certified with years of professional experience.' },
              { title: 'Modern Facilities', desc: 'State-of-the-art facilities including indoor nets, batting simulators, and gym.' },
              { title: 'Structured Curriculum', desc: 'Science-backed training programs designed to maximize player potential.' },
            ].map(item => (
              <div key={item.title} className="bg-white/10 rounded-xl p-6 text-center">
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-green-100 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
