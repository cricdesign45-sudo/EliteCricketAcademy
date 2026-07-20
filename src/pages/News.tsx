import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { NewsPost } from '@/types';

export default function News() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [news, setNews] = useState<NewsPost[]>([]);

  useEffect(() => {
    db.news.getAll().then(data => setNews(data.filter(n => n.status === 'published')));
  }, []);

  const categories = ['All', ...Array.from(new Set(news.map(n => n.category)))];
  const filtered = news.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || n.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Stay Updated</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">News & Events</h1>
          <p className="text-gray-300 text-lg">Latest updates, events, and stories from Elite Cricket Academy.</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-cricket-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-cricket-green'}`}>{cat}</button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <>
              <div className="mb-8">
                <Link to={`/news/${filtered[0].id}`} className="group block">
                  <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
                    <img src={filtered[0].image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=450&fit=crop'} alt={filtered[0].title} className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-10 bg-white flex flex-col justify-center">
                      <span className="badge-green mb-4 self-start">{filtered[0].category}</span>
                      <h2 className="text-3xl font-display font-bold text-gray-900 mb-4 group-hover:text-cricket-green transition-colors leading-tight">{filtered[0].title}</h2>
                      <p className="text-gray-600 mb-4 leading-relaxed">{filtered[0].excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(filtered[0].publishDate)}</span>
                        <span>By {filtered[0].author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.slice(1).map(post => (
                  <Link key={post.id} to={`/news/${post.id}`} className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <img src={post.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&h=280&fit=crop'} alt={post.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="p-5">
                      <span className="badge-blue text-xs mb-2 inline-block">{post.category}</span>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-cricket-green transition-colors leading-tight">{post.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                      <p className="text-gray-400 text-xs">{formatDate(post.publishDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">No news found matching your search.</div>
          )}
        </div>
      </section>
    </div>
  );
}
