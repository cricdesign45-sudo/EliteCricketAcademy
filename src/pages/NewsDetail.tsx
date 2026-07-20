import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { NewsPost } from '@/types';

export default function NewsDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [related, setRelated] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [p, all] = await Promise.all([db.news.getById(id!), db.news.getAll()]);
      setPost(p);
      setRelated(all.filter(n => n.status === 'published' && n.id !== id).slice(0, 3));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h2>
          <Link to="/news" className="btn-primary">Back to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img src={post.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&h=500&fit=crop'} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <span className="badge-green mb-3 inline-block">{post.category}</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/news" className="inline-flex items-center gap-2 text-cricket-green hover:underline mb-8"><ArrowLeft size={16} /> Back to News</Link>

        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.publishDate)}</span>
            <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
            <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 badge-blue"><Tag size={10} /> {tag}</span>
              ))}
            </div>
          </div>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {post.content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Related News</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(r => (
                <Link key={r.id} to={`/news/${r.id}`} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group">
                  <img src={r.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=200&fit=crop'} alt={r.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-cricket-green transition-colors">{r.title}</h3>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(r.publishDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
