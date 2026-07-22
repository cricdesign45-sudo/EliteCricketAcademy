import { useState, useEffect } from 'react';
import { ShoppingCart, Package, Star, Tag, X, Plus, Minus, Trash2, ShoppingBag, Phone, User, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { StoreProduct, StoreOrder } from '@/types';

const CATEGORIES = ['All', 'Kit', 'Bat', 'Ball', 'Clothing', 'Accessories', 'Footwear', 'Equipment', 'Other'];

interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export default function Store() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDone, setOrderDone] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'Cash',
    notes: '',
  });

  useEffect(() => {
    db.storeProducts.getActive().then(data => {
      setProducts(data);
      setLoading(false);
    });

    // Pre-fill from player session if logged in
    const session = localStorage.getItem('ywcc_player_session');
    if (session) {
      const s = JSON.parse(session);
      setCheckoutForm(f => ({ ...f, customerName: s.name || '' }));
    }
  }, []);

  const filtered = products.filter(p =>
    catFilter === 'All' || p.category === catFilter
  );

  const featured = filtered.filter(p => p.featured);
  const regular = filtered.filter(p => !p.featured);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  const addToCart = (product: StoreProduct) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));
  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setPlacing(true);
    const orderNumber = `ORD-${Date.now()}`;
    const session = localStorage.getItem('ywcc_player_session');
    const order: Omit<StoreOrder, 'id' | 'createdAt'> = {
      orderNumber,
      customerName: checkoutForm.customerName,
      customerPhone: checkoutForm.customerPhone,
      customerEmail: checkoutForm.customerEmail,
      playerId: session ? JSON.parse(session).id : undefined,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      })),
      totalAmount: cartTotal,
      status: 'pending',
      paymentMethod: checkoutForm.paymentMethod,
      paymentStatus: 'unpaid',
      notes: checkoutForm.notes,
    };
    await db.storeOrders.add(order);
    setOrderDone(orderNumber);
    setCart([]);
    setShowCheckout(false);
    setPlacing(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=1400&h=400&fit=crop" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="text-amber-400 text-sm font-semibold tracking-widest uppercase mb-3">Academy Store</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Cricket Merchandise</h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">Official academy gear, equipment, and clothing for young warriors.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Category Filters + Cart Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${catFilter === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="relative flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <ShoppingCart size={18} />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>
            )}
          </button>
        </div>

        {/* Order Success */}
        {orderDone && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
            <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={24} />
            <div>
              <p className="font-bold text-green-900">Order Placed Successfully!</p>
              <p className="text-green-700 text-sm mt-1">Order <strong>{orderDone}</strong> has been placed. Our team will contact you for pickup/delivery.</p>
              <button onClick={() => setOrderDone(null)} className="text-green-600 text-sm underline mt-2">Dismiss</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading products…</div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Star size={18} className="text-amber-400" /> Featured Products</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featured.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                </div>
              </div>
            )}

            {/* All Products */}
            {regular.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{catFilter === 'All' ? 'All Products' : catFilter}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {regular.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <Package size={48} className="mx-auto mb-3 opacity-40" />
                <p>No products in this category</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="relative bg-white w-full max-w-md flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2"><ShoppingBag size={18} /> Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <ShoppingCart size={40} className="mx-auto mb-3 opacity-40" />
                  <p>Your cart is empty</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  {item.product.image ? (
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0"><Package size={20} className="text-gray-400" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                    <p className="text-blue-600 font-bold text-sm">{formatCurrency(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"><Minus size={12} /></button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"><Plus size={12} /></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(cartTotal)}</span>
                </div>
                <button
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {cart.map(i => (
                  <div key={i.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{i.product.name} × {i.quantity}</span>
                    <span className="font-semibold">{formatCurrency(i.product.price * i.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div>
                <label className="form-label flex items-center gap-1"><User size={12} /> Your Name *</label>
                <input required value={checkoutForm.customerName} onChange={e => setCheckoutForm(f => ({ ...f, customerName: e.target.value }))} className="form-input" placeholder="Full name" />
              </div>
              <div>
                <label className="form-label flex items-center gap-1"><Phone size={12} /> Phone Number *</label>
                <input required value={checkoutForm.customerPhone} onChange={e => setCheckoutForm(f => ({ ...f, customerPhone: e.target.value }))} className="form-input" placeholder="Mobile number" />
              </div>
              <div>
                <label className="form-label">Email (optional)</label>
                <input type="email" value={checkoutForm.customerEmail} onChange={e => setCheckoutForm(f => ({ ...f, customerEmail: e.target.value }))} className="form-input" placeholder="Email address" />
              </div>
              <div>
                <label className="form-label">Payment Method</label>
                <select value={checkoutForm.paymentMethod} onChange={e => setCheckoutForm(f => ({ ...f, paymentMethod: e.target.value }))} className="form-input">
                  <option>Cash</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                </select>
              </div>
              <div>
                <label className="form-label">Notes (optional)</label>
                <textarea rows={2} value={checkoutForm.notes} onChange={e => setCheckoutForm(f => ({ ...f, notes: e.target.value }))} className="form-input resize-none" placeholder="Delivery notes, pickup time, etc." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={placing} className="btn-primary flex-1 py-3 font-bold">{placing ? 'Placing…' : 'Place Order'}</button>
                <button type="button" onClick={() => setShowCheckout(false)} className="btn-outline flex-1 py-3">Back to Cart</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Product Card ─────────────────────────────────────────────── */
function ProductCard({ product, onAdd }: { product: StoreProduct; onAdd: (p: StoreProduct) => void }) {
  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Package size={40} className="text-gray-300" /></div>
        )}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{discount}% OFF</div>
        )}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={9} /> Featured</div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1">
          <Tag size={11} className="text-gray-400" />
          <span className="text-xs text-gray-500">{product.category}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{product.name}</h3>
        {product.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
          <button
            onClick={() => onAdd(product)}
            disabled={product.stock === 0}
            className="flex items-center gap-1.5 bg-gray-900 text-white text-xs px-4 py-2 rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
