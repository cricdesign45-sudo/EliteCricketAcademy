import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { NewsPost } from '@/types';

export default function NewsManagement() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.news.getAll();
    setNews(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}"?`)) {
      await db.news.delete(id);
      toast.success('Post deleted');
      load();
    }
  };

  const togglePublish = async (id: string, current: string) => {
    await db.news.update(id, { status: current === 'published' ? 'draft' : 'published' });
    toast.success(current === 'published' ? 'Post moved to draft' : 'Post published!');
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">News & Blog Management</h1>
          <p className="text-gray-500 text-sm">{news.filter(n => n.status === 'published').length} published</p>
        </div>
        <Link to="/admin/news/add" className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Post</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading posts…</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="table-th">Title</th>
                  <th className="table-th">Category</th>
                  <th className="table-th">Author</th>
                  <th className="table-th">Date</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {news.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/50">
                    <td className="table-td font-medium max-w-xs">
                      <p className="truncate">{post.title}</p>
                      <p className="text-xs text-gray-400 truncate">{post.excerpt}</p>
                    </td>
                    <td className="table-td"><span className="badge-blue text-xs">{post.category}</span></td>
                    <td className="table-td text-gray-600">{post.author}</td>
                    <td className="table-td text-gray-500">{formatDate(post.publishDate)}</td>
                    <td className="table-td"><span className={post.status === 'published' ? 'badge-green' : 'badge-yellow'}>{post.status}</span></td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => togglePublish(post.id, post.status)} className="p-1.5 text-gray-500 hover:text-cricket-green hover:bg-cricket-green/5 rounded-lg" title={post.status === 'published' ? 'Unpublish' : 'Publish'}>
                          {post.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <Link to={`/admin/news/${post.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={15} /></Link>
                        <button onClick={() => handleDelete(post.id, post.title)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && news.length === 0 && <div className="text-center py-12 text-gray-400">No posts found</div>}
        </div>
      </div>
    </div>
  );
}
