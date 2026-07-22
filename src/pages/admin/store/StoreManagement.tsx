import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Package, Star, Tag } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { StoreProduct } from '@/types';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['All', 'Kit', 'Bat', 'Ball', 'Clothing', 'Accessories', 'Footwear', 'Equipment', 'Other'];

export default function StoreManagement() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.storeProducts.getAll();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) {
      await db.storeProducts.delete(id);
      toast.success('Product deleted');
      load();
    }
  };

  const toggleFeatured = async (product: StoreProduct) => {
    await db.storeProducts.update(product.id, { featured: !product.featured });
    toast.success(product.featured ? 'Removed from featured' : 'Marked as featured');
    load();
  };

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
  const activeCount = products.filter(p => p.status === 'active').length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="page-title">Store Management</h1>
          <p className="text-gray-500 text-sm">Manage academy merchandise and products</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/store/orders" className="btn-outline text-sm flex items-center gap-2"><Package size={14} /> Orders</Link>
          <button onClick={() => { setEditingProduct(null); setShowAddForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Products', value: products.length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Active Products', value: activeCount, color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Out of Stock', value: outOfStock, color: 'bg-red-50 border-red-200 text-red-800' },
          { label: 'Inventory Value', value: formatCurrency(totalValue), color: 'bg-amber-50 border-amber-200 text-amber-800' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="form-input w-auto">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-auto">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading products…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 opacity-40" />
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="relative h-44 bg-gray-100">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={40} className="text-gray-300" />
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} /> Featured
                  </div>
                )}
                <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                  product.status === 'active' ? 'bg-green-500 text-white' :
                  product.status === 'out_of_stock' ? 'bg-red-500 text-white' : 'bg-gray-400 text-white'
                }`}>
                  {product.status === 'out_of_stock' ? 'Out of Stock' : product.status}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{product.name}</h3>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <Tag size={11} className="text-gray-400" />
                  <span className="text-xs text-gray-500">{product.category}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className={`font-medium ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { setEditingProduct(product); setShowAddForm(true); }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => toggleFeatured(product)}
                    className={`flex items-center justify-center gap-1 text-xs px-2 py-1.5 rounded-lg font-medium transition-colors ${product.featured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-amber-50'}`}
                    title={product.featured ? 'Remove featured' : 'Mark as featured'}
                  >
                    <Star size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowAddForm(false); setEditingProduct(null); }}
          onSave={() => { setShowAddForm(false); setEditingProduct(null); load(); }}
          uploading={uploading}
          setUploading={setUploading}
        />
      )}
    </div>
  );
}

/* ── Product Form Modal ─────────────────────────────────────────── */
function ProductFormModal({
  product, onClose, onSave, uploading, setUploading,
}: {
  product: StoreProduct | null;
  onClose: () => void;
  onSave: () => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    category: product?.category || 'Kit',
    image: product?.image || '',
    stock: product?.stock?.toString() || '0',
    status: product?.status || 'active' as StoreProduct['status'],
    featured: product?.featured || false,
    tags: product?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `store/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('academy-media').upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from('academy-media').getPublicUrl(path);
      setForm(f => ({ ...f, image: data.publicUrl }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
      category: form.category,
      image: form.image || undefined,
      stock: parseInt(form.stock),
      status: form.status,
      featured: form.featured,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };
    if (product) {
      await db.storeProducts.update(product.id, payload);
      toast.success('Product updated!');
    } else {
      await db.storeProducts.add(payload);
      toast.success('Product added!');
    }
    setSaving(false);
    onSave();
  };

  const f = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image */}
          <div>
            <label className="form-label">Product Image</label>
            {form.image && <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-200" />}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input text-xs" />
            {uploading && <p className="text-xs text-blue-600 mt-1">Uploading…</p>}
          </div>

          <div>
            <label className="form-label">Product Name *</label>
            <input required value={form.name} onChange={e => f('name', e.target.value)} className="form-input" placeholder="e.g. Cricket Bat — Willow Grade A" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea rows={2} value={form.description} onChange={e => f('description', e.target.value)} className="form-input resize-none" placeholder="Product description…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price (₹) *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={e => f('price', e.target.value)} className="form-input" placeholder="0.00" />
            </div>
            <div>
              <label className="form-label">Original Price (₹)</label>
              <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => f('originalPrice', e.target.value)} className="form-input" placeholder="0.00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select value={form.category} onChange={e => f('category', e.target.value)} className="form-input">
                {['Kit', 'Bat', 'Ball', 'Clothing', 'Accessories', 'Footwear', 'Equipment', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={e => f('stock', e.target.value)} className="form-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)} className="form-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => f('featured', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-700 font-medium">Featured Product</span>
              </label>
            </div>
          </div>
          <div>
            <label className="form-label">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => f('tags', e.target.value)} className="form-input" placeholder="e.g. sale, new, cricket" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || uploading} className="btn-primary flex-1 py-2.5">{saving ? 'Saving…' : product ? 'Update Product' : 'Add Product'}</button>
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
