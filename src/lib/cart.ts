/**
 * Shopping cart utilities — localStorage-based, shared across pages.
 * Dispatches 'ywcc-cart-updated' custom event on all changes.
 */
import type { StoreProduct } from '@/types';

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

const CART_KEY = 'ywcc_cart';
const WISHLIST_KEY = 'ywcc_wishlist';

// ─── Cart ─────────────────────────────────────────────────────────

export function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}

function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('ywcc-cart-updated'));
}

export function addToCart(product: StoreProduct): void {
  const cart = getCart();
  const idx = cart.findIndex(i => i.product.id === product.id);
  if (idx >= 0) cart[idx].quantity += 1;
  else cart.push({ product, quantity: 1 });
  saveCart(cart);
}

export function removeFromCart(productId: string): void {
  saveCart(getCart().filter(i => i.product.id !== productId));
}

export function updateCartQty(productId: string, delta: number): void {
  const cart = getCart()
    .map(i => i.product.id === productId ? { ...i, quantity: i.quantity + delta } : i)
    .filter(i => i.quantity > 0);
  saveCart(cart);
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('ywcc-cart-updated'));
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, i) => sum + i.quantity, 0);
}

// ─── Wishlist ─────────────────────────────────────────────────────

export function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); }
  catch { return []; }
}

export function toggleWishlist(productId: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx >= 0) list.splice(idx, 1);
  else list.push(productId);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  return idx < 0; // true = added
}

export function isWishlisted(productId: string): boolean {
  return getWishlist().includes(productId);
}
