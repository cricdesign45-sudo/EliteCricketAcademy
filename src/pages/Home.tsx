import { useState, useEffect } from 'react';
import PlayerOfMonthPopup from '@/components/PlayerOfMonthPopup';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Award, Users, Trophy, Target, Zap } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { Program, NewsPost, Testimonial, Achievement, WebsiteContent } from '@/types';

type HomeContent = WebsiteContent['home'];

const defaultHome: HomeContent = {
  heroTitle: 'Train Like a Champion',
  heroSubtitle: 'Elite Cricket Academy — where future champions are forged through discipline, skill, and passion.',
  heroCTA: 'Enroll Now',
  statsSection: [
    { label: 'Players Trained', value: '500+' },
    { label: 'State Champions', value: '12' },
    { label: 'National Players', value: '35' },
    { label: 'Years of Excellence', value: '15+' },
  ],
  aboutTitle: 'Building Champions Since 2010',
  aboutContent: 'Young Warriors Cricket Club has been nurturing cricket talent for over 15 years. Our world-class facilities, professional coaching staff, and structured training programs have produced dozens of state and national level cricketers.',
  missionTitle: 'Our Mission',
  missionContent: 'To identify, develop, and nurture cricket talent through professional coaching, modern facilities, and a holistic development approach.',
};

export default function Home() {
  const [home, setHome] = useState<HomeContent>(defaultHome);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    Promise.all([
      db.websiteContent.get(),
      db.programs.getAll(),
      db.news.getAll(),
      db.testimonials.getAll(),
      db.achievements.getAll(),
    ]).then(([content, progs, newsData, tests, achs]) => {
      if (content.home) setHome(content.home);
      setPrograms(progs.filter(p => p.status === 'active').slice(0, 3));
      setNews(newsData.filter(n => n.status === 'published').slice(0, 3));
      setTestimonials(tests.filter(t => t.status === 'approved').slice(0, 3));
      setAchievements(achs.slice(0, 4));
    });
  }, []);

  return (
    <div className="bg-white">
      <PlayerOfMonthPopup />
      {/* ── Hero ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gray-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&h=900&fit=crop"
            alt="Cricket"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-gray-900/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-6">
              <Zap size={12} className="text-yellow-400" /> Young Warriors Cricket Club
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.05] mb-6 tracking-tight">
              {home.heroTitle}
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-lg">
              {home.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="bg-white text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-gray-100 transition-all duration-200 hover:shadow-lg"
              >
                {home.heroCTA}
              </Link>
              <Link
                to="/programs"
                className="border border-white/30 hover:border-white text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              >
                View Programs <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {home.statsSection.map((stat, i) => (
                <div key={i} className="py-5 px-6 text-center border-r border-white/10 last:border-0">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3">About Us</p>
              <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">{home.aboutTitle}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{home.aboutContent}</p>
              <ul className="space-y-3 mb-8">
                {['NCA & BCCI Certified Coaches', 'World-class Training Facilities', 'Structured Development Programs', 'Mental Conditioning & Fitness Training'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700 text-sm">
                    <CheckCircle size={16} className="text-gray-900 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Learn More <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1574791017827-96e4a50d93f3?w=700&h=500&fit=crop"
                alt="Training"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-5 -left-5 bg-gray-900 text-white p-5 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-xs text-gray-400 mt-0.5">Years of Excellence</div>
              </div>
              <div className="absolute -top-5 -right-5 bg-white border border-gray-200 shadow-xl p-4 rounded-xl">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-xs text-gray-500">Players Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      {programs.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3">Training</p>
                <h2 className="text-4xl font-bold text-gray-900">Programs for Every Level</h2>
              </div>
              <Link to="/programs" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors self-start sm:self-auto whitespace-nowrap">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {programs.map((program, i) => (
                <div
                  key={program.id}
                  className={`rounded-2xl overflow-hidden border transition-shadow hover:shadow-lg ${
                    i === 1 ? 'bg-gray-900 text-white border-gray-800 shadow-xl' : 'bg-white border-gray-200'
                  }`}
                >
                  {program.photo && (
                    <img src={program.photo} alt={program.name} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-6">
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${
                      i === 1 ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>{program.level}</span>
                    <h3 className={`text-xl font-bold mb-2 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>{program.name}</h3>
                    <p className={`text-sm mb-5 leading-relaxed ${i === 1 ? 'text-gray-400' : 'text-gray-500'}`}>{program.description}</p>
                    <div className={`space-y-1.5 mb-5 text-xs ${i === 1 ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div>Age Group: {program.ageGroup}</div>
                      <div>Duration: {program.duration}</div>
                      <div>{program.schedule}</div>
                    </div>
                    <div className={`text-2xl font-bold mb-4 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>
                      ₹{program.fee.toLocaleString()}
                      <span className={`text-xs font-normal ml-1 ${i === 1 ? 'text-gray-500' : 'text-gray-400'}`}>/course</span>
                    </div>
                    <Link
                      to="/register"
                      className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        i === 1 ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Achievements ── */}
      {achievements.length > 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase mb-3">Our Pride</p>
                <h2 className="text-4xl font-bold text-white">Recent Achievements</h2>
              </div>
              <Link to="/achievements" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 border border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors self-start sm:self-auto whitespace-nowrap">
                All Achievements <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {achievements.map(a => (
                <div key={a.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-colors">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <Trophy size={20} className="text-white" />
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{a.level}</span>
                  <h3 className="font-bold text-white text-base mt-2 mb-2 leading-tight">{a.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{a.description}</p>
                  <p className="text-gray-600 text-xs mt-3">{formatDate(a.date)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3">Why Choose Us</p>
            <h2 className="text-4xl font-bold text-gray-900">Everything You Need to Excel</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Expert Coaching', desc: 'NCA & BCCI certified coaches with 10+ years of professional experience.' },
              { icon: Users, title: 'Small Batch Size', desc: 'Maximum 20 players per batch for personalised attention and faster growth.' },
              { icon: Award, title: 'Proven Results', desc: '35+ national and 120+ state-level players produced over 15 years.' },
              { icon: Zap, title: 'Modern Facilities', desc: 'World-class nets, video analysis, fitness centre and sports science support.' },
            ].map(f => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── News ── */}
      {news.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3">Latest</p>
                <h2 className="text-4xl font-bold text-gray-900">News & Events</h2>
              </div>
              <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 border border-gray-300 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors self-start sm:self-auto whitespace-nowrap">
                All News <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {news.map(post => (
                <Link key={post.id} to={`/news/${post.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=280&fit=crop'}
                    alt={post.title}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-bold text-gray-900 mt-2 mb-2 leading-tight group-hover:text-gray-600 transition-colors">{post.title}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{post.excerpt}</p>
                    <p className="text-gray-400 text-xs mt-3">{formatDate(post.publishDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-3">Testimonials</p>
              <h2 className="text-4xl font-bold text-gray-900">What They Say</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={s <= t.rating ? 'text-gray-900 fill-gray-900' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 text-sm">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Cricket Journey?</h2>
          <p className="text-gray-400 text-lg mb-10">Join Young Warriors Cricket Club and train with the best coaches in the country.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-gray-100 transition-colors"
            >
              Register Now
            </Link>
            <Link
              to="/contact"
              className="border border-white/30 hover:border-white text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
