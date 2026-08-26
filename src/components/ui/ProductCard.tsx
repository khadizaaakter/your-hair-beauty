import { motion } from 'framer-motion';
import { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCurrency } from '../../context/CurrencyContext';

interface ProductCardProps {
    product: Product;
    index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const { addItem } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { formatPrice } = useCurrency();
    const isWishlisted = isInWishlist(product.id);

    const [imageLoaded, setImageLoaded] = useState(false);

    // Get image URL - handle array or single image
    const imageUrl = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : 'https://via.placeholder.com/400';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(product);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        toggleItem(product);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
            className="group relative"
        >
            <Link to={`/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square md:aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100">
                    {/* Loading Skeleton */}
                    {!imageLoaded && (
                        <div className="absolute inset-0 skeleton animate-pulse bg-slate-200" />
                    )}
                    <motion.img
                        src={imageUrl}
                        alt={product.name}
                        onLoad={() => setImageLoaded(true)}
                        className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                            }`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Badge */}
                    {(product.badge || product.sale_price) && (
                        <span className={`
                            absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md z-10
                            ${(product.badge === 'new') ? 'bg-emerald-500/90' : ''}
                            ${(product.badge === 'sale' || (!product.badge && product.sale_price)) ? 'bg-red-500/90' : ''}
                            ${(product.badge === 'bestseller') ? 'bg-amber-500/90' : ''}
                            ${(!['new', 'sale', 'bestseller'].includes(product.badge || '') && !product.sale_price) ? 'bg-slate-900/90' : ''}
                        `}>
                            {product.badge === 'bestseller' ? 'Best Seller' : (product.badge || 'Sale')}
                        </span>
                    )}

                    {/* Out of stock overlay */}
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white/90 text-slate-900 px-4 py-2 font-bold rounded-lg shadow-xl uppercase tracking-widest text-sm">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2 translate-x-0 md:translate-x-12 md:group-hover:translate-x-0 transition-transform duration-300 ease-out">
                        <motion.button
                            onClick={handleWishlist}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isWishlisted
                                ? 'bg-neon-pink text-white rotate-0' // Prevent rotation if active
                                : 'bg-white/90 backdrop-blur text-slate-700 hover:bg-neon-pink hover:text-white'
                                }`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </motion.button>

                        <motion.button
                            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur text-slate-700 hover:bg-neon-pink hover:text-white flex items-center justify-center shadow-lg transition-all duration-300 delay-75"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Eye className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Add to Cart Button (Bottom) */}
                    {product.inStock && (
                        <div className="absolute inset-x-4 bottom-4 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 ease-out">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-neon-pink hover:text-white transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Add to Cart
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="mt-4 space-y-1">
                    {/* Brand */}
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {product.brand_name || 'Brand'}
                    </p>

                    {/* Name */}
                    <h3 className="text-base font-medium text-slate-900 leading-snug group-hover:text-neon-pink transition-colors line-clamp-2">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-1">
                        {product.sale_price ? (
                            <>
                                <span className="text-lg font-bold text-slate-900">
                                    {formatPrice(Number(product.sale_price))}
                                </span>
                                <span className="text-sm text-slate-400 line-through decoration-slate-400/50">
                                    {formatPrice(Number(product.price))}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-slate-900">
                                {formatPrice(Number(product.price))}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default ProductCard;
