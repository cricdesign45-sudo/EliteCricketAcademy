import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils';
import { toast } from 'sonner';

export default function AddNews() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', author: 'Admin',
    publishDate: getTodayString(), status: 'draft' as 'published' | 'draft',
    category: 'News', image: '', tags: '',
  });

  useEffect(() => {
    if (id) {
      db.news.getById(id).then(post => {
        if (post) {
          setForm({
            title: post.title, content: post.content, excerpt: post.excerpt,
            author: post.author, publishDate: post.publishDate, status: post.status,
            category: post.category, image: post.image || '', tags: (post.tags || []).join(', '),
          });
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (id) {
      await db.news.update(id, data);
      toast.success('Post updated!');
    } else {
      await db.news.add(data);
      toast.success('Post created!');
    }
    navigate('/admin/news');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/news" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <h1 className="page-title">{id ? 'Edit Post' : 'Add News / Blog Post'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="form-label">Title *</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="form-input text-lg" placeholder="Post title..." />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div><label className="form-label">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="form-input">
                <option>News</option><option>Achievement</option><option>Event</option><option>Announcement</option><option>Blog</option>
              </select>
            </div>
            <div><label className="form-label">Author</label><input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Publish Date</label><input type="date" value={form.publishDate} onChange={e => setForm({...form, publishDate: e.target.value})} className="form-input" /></div>
            <div><label className="form-label">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as 'published' | 'draft'})} className="form-input">
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className="form-label">Featured Image URL</label><input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="form-input" placeholder="https://..." /></div>
            <div className="sm:col-span-2"><label className="form-label">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="form-input" placeholder="cricket, training, event" /></div>
          </div>
          <div>
            <label className="form-label">Excerpt *</label>
            <textarea required rows={2} value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} className="form-input resize-none" placeholder="Short summary..." />
          </div>
          <div>
            <label className="form-label">Content *</label>
            <textarea required rows={10} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="form-input resize-none" placeholder="Full article content..." />
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="btn-primary px-8 py-3">{saving ? 'Saving…' : id ? 'Save Changes' : 'Create Post'}</button>
          <Link to="/admin/news" className="btn-outline px-8 py-3">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
