import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Star, ArrowRight, Play, CheckCircle } from 'lucide-react';
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
  aboutContent: 'Elite Cricket Academy has been nurturing cricket talent for over 15 years. Our world-class facilities, professional coaching staff, and structured training programs have produced dozens of state and national level cricketers.',
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
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&h=900&fit=crop" alt="Cricket Academy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-cricket-dark/90 via-cricket-dark/70 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Star size={14} fill="currentColor" /> India's Premier Cricket Academy
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6">{home.heroTitle}</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">{home.heroSubtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="bg-amber-400 hover:bg-amber-500 text-cricket-dark font-bold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-amber-400/25">
                {home.heroCTA}
              </Link>
              <Link to="/programs" className="border-2 border-white/40 hover:border-white text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center gap-2">
                <Play size={20} className="fill-white" /> View Programs
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 backdrop-blur-sm rounded-t-2xl overflow-hidden">
              {home.statsSection.map((stat, i) => (
                <div key={i} className="bg-cricket-dark/80 text-center py-6 px-4">
                  <div className="text-3xl font-display font-bold text-amber-400">{stat.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">About Us</div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">{home.aboutTitle}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{home.aboutContent}</p>
              <ul className="space-y-3 mb-8">
                {['NCA & BCCI Certified Coaches', 'World-class Training Facilities', 'Structured Development Programs', 'Mental Conditioning & Fitness Training'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={20} className="text-cricket-green flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base">Learn More <ArrowRight size={18} /></Link>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1574791017827-96e4a50d93f3?w=700&h=500&fit=crop" alt="Training" className="rounded-2xl shadow-2xl w-full" />
              <div className="absolute -bottom-6 -left-6 bg-cricket-green text-white p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm text-green-200">Years of Excellence</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-amber-400 text-cricket-dark p-4 rounded-xl shadow-xl">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-xs font-semibold">Players Trained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      {programs.length > 0 && (
        <section className="py-20 bg-cricket-green/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">Training Programs</div>
              <h2 className="text-4xl font-display font-bold text-gray-900">Programs for Every Level</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">From young beginners to aspiring professionals, we have a program designed to maximize your potential.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {programs.map((program, i) => (
                <div key={program.id} className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow ${i === 1 ? 'bg-cricket-green text-white' : 'bg-white'}`}>
                  <div className="p-8">
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${i === 1 ? 'bg-white/20 text-white' : 'bg-cricket-green/10 text-cricket-green'}`}>{program.level}</span>
                    <h3 className={`text-2xl font-display font-bold mb-3 ${i === 1 ? 'text-white' : 'text-gray-900'}`}>{program.name}</h3>
                    <p className={`text-sm mb-4 ${i === 1 ? 'text-green-100' : 'text-gray-600'}`}>{program.description}</p>
                    <div className={`space-y-2 mb-6 text-sm ${i === 1 ? 'text-green-100' : 'text-gray-600'}`}>
                      <div>👥 Age: {program.ageGroup}</div>
                      <div>⏱️ Duration: {program.duration}</div>
                      <div>🏋️ {program.schedule}</div>
                    </div>
                    <div className={`text-3xl font-bold mb-4 ${i === 1 ? 'text-amber-300' : 'text-cricket-green'}`}>
                      ₹{program.fee.toLocaleString()}<span className="text-sm font-normal opacity-70"> /course</span>
                    </div>
                    <Link to="/register" className={`block text-center py-3 rounded-lg font-semibold transition-colors ${i === 1 ? 'bg-amber-400 text-cricket-dark hover:bg-amber-500' : 'bg-cricket-green text-white hover:bg-cricket-green-dark'}`}>Enroll Now</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/programs" className="btn-outline inline-flex items-center gap-2 px-6 py-3">View All Programs <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="py-20 cricket-gradient text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Our Pride</div>
              <h2 className="text-4xl font-display font-bold">Recent Achievements</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map(a => (
                <div key={a.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors">
                  <div className="text-amber-400 mb-3"><Award size={32} /></div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-green-100 uppercase tracking-wider">{a.level}</span>
                  <h3 className="font-bold text-lg mt-3 mb-2">{a.title}</h3>
                  <p className="text-green-200 text-sm">{a.description}</p>
                  <p className="text-amber-400/70 text-xs mt-3">{formatDate(a.date)}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/achievements" className="border-2 border-white/40 hover:border-white text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 font-semibold transition-colors">All Achievements <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* News Section */}
      {news.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">Latest Updates</div>
                <h2 className="text-4xl font-display font-bold text-gray-900">News & Events</h2>
              </div>
              <Link to="/news" className="btn-outline hidden md:inline-flex items-center gap-2">All News <ArrowRight size={16} /></Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {news.map(post => (
                <Link key={post.id} to={`/news/${post.id}`} className="group">
                  <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <img src={post.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=280&fit=crop'} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-6">
                      <span className="text-xs font-semibold text-cricket-green bg-cricket-green/10 px-2 py-1 rounded-full">{post.category}</span>
                      <h3 className="font-bold text-gray-900 text-lg mt-3 mb-2 group-hover:text-cricket-green transition-colors leading-tight">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{post.excerpt}</p>
                      <p className="text-gray-400 text-xs mt-3">{formatDate(post.publishDate)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-cricket-green font-semibold text-sm tracking-widest uppercase mb-3">What They Say</div>
              <h2 className="text-4xl font-display font-bold text-gray-900">Testimonials</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cricket-green rounded-full flex items-center justify-center text-white font-bold">{t.name.charAt(0)}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{t.name}</div>
                      <div className="text-gray-500 text-sm">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-amber-400">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold text-cricket-dark mb-4">Ready to Start Your Cricket Journey?</h2>
          <p className="text-cricket-dark/70 text-lg mb-8">Join Elite Cricket Academy today and train with the best coaches in the country.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-cricket-dark text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-cricket-green transition-colors">Register Now</Link>
            <Link to="/contact" className="border-2 border-cricket-dark text-cricket-dark font-bold px-8 py-4 rounded-xl text-lg hover:bg-cricket-dark hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
