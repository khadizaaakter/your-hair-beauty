import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Heart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useSettings } from '../../context/SettingsContext';
import { useCurrency } from '../../context/CurrencyContext';
import { RecommendedProducts } from './RecommendedProducts';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

function parseNumericSetting(value: string, fallback: number): number {
    const cleaned = String(value || '')
        .trim()
        .replace(/[^0-9,.-]/g, '')
        .replace(/,/g, '.');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
    const { toggleItem } = useWishlist();
    const { getSetting } = useSettings();
    const { formatPrice } = useCurrency();

    const freeShippingThreshold = Math.max(0, parseNumericSetting(getSetting('free_shipping_threshold', '50'), 50));
    const hasFreeShippingOffer = freeShippingThreshold > 0;
    const progress = freeShippingThreshold > 0 ? Math.min((total / freeShippingThreshold) * 100, 100) : 0;
    const remaining = freeShippingThreshold > 0 ? freeShippingThreshold - total : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[70]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[80] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-neon-pink" />
                                <h2 className="font-display font-bold text-lg">Your Cart</h2>
                                <span className="text-sm text-slate-500">({itemCount} items)</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Free Shipping Progress */}
                        {items.length > 0 && (
                            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-sm">
                                    <div className="p-1.5 bg-white rounded-full text-neon-pink shadow-sm">
                                        <Truck className="w-3 h-3" />
                                    </div>
                                    <span className="font-medium text-slate-700">
                                        {!hasFreeShippingOffer ? (
                                            <>Standard delivery applies at checkout.</>
                                        ) : remaining > 0 ? (
                                            <>Spend <b>{formatPrice(remaining)}</b> more for <b>Free Shipping</b></>
                                        ) : (
                                            <span className="text-green-600 font-bold">You've unlocked Free Shipping!</span>
                                        )}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${hasFreeShippingOffer && remaining <= 0 ? 'bg-green-500' : 'bg-neon-pink'}`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col">
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <ShoppingBag className="w-16 h-16 text-slate-200 mb-4" />
                                        <p className="text-slate-600 mb-4">Your cart is empty</p>
                                        <button
                                            onClick={onClose}
                                            className="text-neon-pink font-medium hover:underline"
                                        >
                                            Continue Shopping
                                        </button>
                                    </div>
                                    <div className="mt-auto pt-6 border-t border-slate-100">
                                        <RecommendedProducts title="Trending Now" limit={2} columns={2} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="flex gap-4 bg-slate-50 rounded-xl p-3"
                                        >
                                            {/* Image */}
                                            <Link
                                                to={`/product/${item.product.id}`}
                                                onClick={onClose}
                                                className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
                                            >
                                                {(() => {
                                                    const selectedVariants = item.selectedVariants && item.selectedVariants.length > 0
                                                        ? item.selectedVariants
                                                        : (item.variant ? [item.variant] : []);
                                                    const variantImage = selectedVariants.find((variant) => variant.image)?.image;
                                                    return (
                                                        <img
                                                            src={variantImage || item.variant?.image || item.product.images?.[0] || 'https://via.placeholder.com/400'}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    );
                                                })()}
                                            </Link>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/product/${item.product.id}`}
                                                    onClick={onClose}
                                                    className="font-medium text-slate-900 hover:text-neon-pink line-clamp-1"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm text-slate-500">{item.product.brand_name || 'Brand'}</p>
                                                {(() => {
                                                    const selectedVariants = item.selectedVariants && item.selectedVariants.length > 0
                                                        ? item.selectedVariants
                                                        : (item.variant ? [item.variant] : []);
                                                    if (selectedVariants.length === 0) return null;
                                                    return (
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            {selectedVariants.map((variant) => `${variant.name}: ${variant.value}`).join(' | ')}
                                                        </p>
                                                    );
                                                })()}
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="p-1.5 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1.5 hover:bg-slate-50 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <span className="font-semibold text-slate-900">
                                                        {(() => {
                                                            const selectedVariants = item.selectedVariants && item.selectedVariants.length > 0
                                                                ? item.selectedVariants
                                                                : (item.variant ? [item.variant] : []);
                                                            const adjustment = selectedVariants.reduce(
                                                                (sum, variant) => sum + Number(variant.price_adjustment || 0),
                                                                0
                                                            );
                                                            return formatPrice((Number(item.product.sale_price || item.product.price) + adjustment) * item.quantity);
                                                        })()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 self-start">
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Remove from Cart"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        toggleItem(item.product);
                                                        removeItem(item.id);
                                                        toast.success("Moved to Wishlist");
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-neon-pink transition-colors"
                                                    title="Move to Wishlist"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Clear Cart */}
                                    <button
                                        onClick={clearCart}
                                        className="text-sm text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        Clear Cart
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-slate-100 p-6 space-y-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                                {/* Subtotal */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="text-xl font-bold text-slate-900">{formatPrice(total)}</span>
                                </div>
                                <p className="text-xs text-slate-500">Shipping calculated at checkout</p>

                                {/* Buttons */}
                                <div className="space-y-2">
                                    <Link
                                        to="/checkout"
                                        onClick={onClose}
                                        className="block w-full btn-primary text-center"
                                    >
                                        Checkout
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="block w-full btn-outline text-center"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default CartDrawer;
