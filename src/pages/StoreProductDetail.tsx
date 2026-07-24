import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, Heart, Star, Package, Tag,
  Share2, CheckCircle, AlertTriangle, Send, Minus, Plus
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { addToCart, toggleWishlist, isWishlisted } from '@/lib/cart';
import { toast } from 'sonner';
import type { StoreProduct, ProductReview } from '@/types';

function StarRating({ rating, max = 5, size = 16, interactive = false, onChange }: {
  rating: number; max?: number; size?: number; interactive?: boolean; onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
          onMouseEnter={interactive ? () => setHover(i + 1) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          className={interactive ? 'transition-transform hover:scale-110' : 'cursor-default'}
          style={!interactive ? { pointerEvents: 'none' } : {}}
        >
          <Star
            size={size}
            className={i < (hover || Math.round(rating)) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
          />
        </button>
      ))}
    </div>
  );
}

export default function StoreProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [related, setRelated] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Player session
  const [session] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ywcc_player_session') || 'null'); }
    catch { return null; }
  });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setWishlisted(isWishlisted(id));
    Promise.all([
      db.storeProducts.getActive(),
      db.productReviews.getByProduct(id),
    ]).then(([allProducts, revs]) => {
      const found = allProducts.find(p => p.id === id);
      if (!found) { setLoading(false); return; }
      setProduct(found);
      setReviews(revs);
      setRelated(allProducts.filter(p => p.id !== id && p.category === found.category).slice(0, 4));
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      action: { label: 'Go to Store', onClick: () => navigate('/store') },
    });
  };

  const handleWishlist = () => {
    if (!id) return;
    const added = toggleWishlist(id);
    setWishlisted(added);
    toast.success(added ? 'Added to wishlist!' : 'Removed from wishlist');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !id) return;
    setSubmittingReview(true);
    await db.productReviews.add({
      productId: id,
      playerId: session.id,
      playerName: session.name,
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });
    const updated = await db.productReviews.getByProduct(id);
    setReviews(updated);
    setReviewComment('');
    setReviewRating(5);
    toast.success('Review submitted!');
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading product…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
          <Link to="/store" className="text-blue-600 hover:underline text-sm">← Back to Store</Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    star: r,
    count: reviews.filter(rev => rev.rating === r).length,
    pct: reviews.length > 0 ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
          <Link to="/store" className="text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition-colors">
            <ArrowLeft size={14} /> Store
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Product Hero */}
        <div className="grid lg:grid-cols-2 gap-10 mb-10">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex items-center justify-center p-6">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <Package size={80} className="text-gray-200" />
              )}
            </div>
            {discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
            {product.featured && (
              <div className="absolute top-4 right-4 bg-amber-400 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Star size={12} fill="white" /> Featured
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={13} className="text-gray-400" />
              <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">{product.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={avgRating} />
                <span className="text-sm font-bold text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 mb-5 text-sm font-semibold ${
              product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {product.stock > 0 ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {product.stock > 5 ? `In Stock (${product.stock} available)` : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of Stock'}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">{product.description}</p>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-medium text-gray-700">Qty:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCart size={18} /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`p-3.5 rounded-xl border font-bold transition-all ${
                  wishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
                }`}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-3.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"
                title="Share product"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Back link */}
            <Link to="/store" className="mt-6 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors w-fit">
              <ArrowLeft size={13} /> Back to Store
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Review Summary + Add Review */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Customer Reviews</h2>
            {reviews.length > 0 ? (
              <>
                <div className="text-center mb-5">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{avgRating.toFixed(1)}</div>
                  <StarRating rating={avgRating} size={20} />
                  <p className="text-gray-400 text-xs mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="space-y-2">
                  {ratingCounts.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 w-3 text-right">{star}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-400 w-4">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">No reviews yet. Be the first!</p>
            )}

            {/* Add Review */}
            {session ? (
              <form onSubmit={handleSubmitReview} className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-800 mb-3">Write a Review</p>
                <StarRating rating={reviewRating} size={22} interactive onChange={setReviewRating} />
                <p className="text-xs text-gray-400 mt-1 mb-3">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                </p>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-gray-400 mb-3"
                  placeholder="Share your experience…"
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={13} /> {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-2">Login to write a review</p>
                <Link to="/player-login" className="text-xs text-blue-600 hover:underline font-semibold">
                  Player Login →
                </Link>
              </div>
            )}
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm text-center">
                <Star size={40} className="text-gray-200 fill-gray-100 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {review.playerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{review.playerName}</p>
                        <StarRating rating={review.rating} size={13} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => (
                <Link
                  key={p.id}
                  to={`/store/${p.id}`}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="h-36 bg-gray-50 overflow-hidden flex items-center justify-center p-3">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <Package size={32} className="text-gray-200" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</p>
                    <p className="text-base font-bold text-gray-900 mt-1">{formatCurrency(p.price)}</p>
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
