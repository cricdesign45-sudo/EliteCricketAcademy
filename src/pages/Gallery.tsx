import { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { db } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import type { GalleryItem } from '@/types';

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    db.gallery.getAll().then(setItems);
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = selectedCategory === 'All' ? items : items.filter(i => i.category === selectedCategory);

  return (
    <div>
      <section className="relative py-28 bg-cricket-dark overflow-hidden">
        <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1400&h=400&fit=crop" alt="Gallery" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="text-amber-400 font-semibold text-sm tracking-widest uppercase mb-3">Our Moments</div>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Gallery</h1>
          <p className="text-gray-300 text-lg">Capturing the spirit of cricket — training, matches, and celebrations.</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat ? 'bg-cricket-green text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-cricket-green'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-md cursor-pointer aspect-square" onClick={() => setLightbox(item.imageUrl)}>
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  <p className="text-gray-300 text-xs">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-4 text-center py-20 text-gray-400">No gallery items found</div>}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"><X size={32} /></button>
          <img src={lightbox} alt="Gallery" className="max-w-4xl max-h-full rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
