import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Trophy } from 'lucide-react';
import { db } from '@/lib/db';
import type { WebsiteContent } from '@/types';

type AboutContent = WebsiteContent['about'];

const defaultAbout: AboutContent = {
  title: 'About Elite Cricket Academy',
  content: 'Founded in 2010, Elite Cricket Academy has grown to become one of the premier cricket training institutes in the country.',
  vision: 'To be the leading cricket development institution producing world-class cricketers.',
  mission: 'To provide professional cricket training that transforms passionate players into champions.',
  values: ['Excellence', 'Discipline', 'Teamwork', 'Integrity', 'Innovation'],
  foundedYear: '2010',
  founderName: 'Mr. Vikram Rajput',
};

export default function About() {
  const [about, setAbout] = useState<AboutContent>(defaultAbout);

  useEffect(() => {
    db.websiteContent.get().then(content => {
      if (content.about) setAbout(content.about);
    });
  }, []);

  const team = [
    { name: about.founderName || 'Mr. Vikram Rajput', role: 'Founder & Director', desc: 'Former national-level cricketer with a vision to create world-class cricket talent.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&faces=true' },
    { name: 'Mahendra Singh', role: 'Head Coach – Batting', desc: 'NCA Level 3 certified coach with 15 years of experience training state and national players.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&faces=true' },
    { name: 'Suresh Yadav', role: 'Bowling Coach', desc: 'Specialist fast bowling coach with expertise in swing and seam bowling techniques.', img: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop' },
  ];

  return (
    <div>
      <section className="relative py-32 bg-cricket-dark overflow-hidden">
        <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1400&h=500&fit=crop" alt="About" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Our Story</div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6">{about.title}</h1>
          <p className="text-gray-300 text-xl leading-relaxed">{about.content}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-cricket-green/5 border border-cricket-green/20 rounded-2xl p-8">
              <Eye className="text-cricket-green mb-4" size={40} />
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">{about.vision}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
              <Target className="text-amber-500 mb-4" size={40} />
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">{about.mission}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <Heart className="text-blue-500 mb-4" size={40} />
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Our Values</h3>
              <ul className="space-y-2">
                {about.values.map(v => (
                  <li key={v} className="flex items-center gap-2 text-gray-600">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>{v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 cricket-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[['Founded', about.foundedYear], ['Players Trained', '500+'], ['State Champions', '12'], ['National Players', '35+']].map(([label, value]) => (
              <div key={label}>
                <div className="text-4xl font-display font-bold text-amber-400">{value}</div>
                <div className="text-green-200 text-sm mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">Leadership</div>
            <h2 className="text-4xl font-display font-bold text-gray-900">Meet Our Team</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map(member => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <img src={member.img} alt={member.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-cricket-green font-medium text-sm mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">Infrastructure</div>
            <h2 className="text-4xl font-display font-bold text-gray-900">World-Class Facilities</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Full-size Cricket Ground', 'Indoor Training Nets (6 lanes)', 'Batting Simulator Technology', 'Strength & Conditioning Gym', 'Video Analysis Lab', 'Medical & Physio Center'].map(facility => (
              <div key={facility} className="flex items-center gap-4 p-5 bg-cricket-green/5 rounded-xl border border-cricket-green/10">
                <div className="w-10 h-10 bg-cricket-green rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy size={20} className="text-white" />
                </div>
                <span className="font-medium text-gray-800">{facility}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
