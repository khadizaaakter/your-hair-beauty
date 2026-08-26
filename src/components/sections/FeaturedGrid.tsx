import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    badge?: string;
}

const featuredProducts: Product[] = [
    {
        id: '1',
        name: 'Silk Repair Serum',
        price: 45.99,
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
        badge: 'Best Seller',
    },
    {
        id: '2',
        name: 'Rose Glow Moisturizer',
        price: 38.99,
        image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b8f?auto=format&fit=crop&w=800&q=80',
        category: 'Skincare',
        badge: 'New',
    },
    {
        id: '3',
        name: 'Keratin Shampoo',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
    },
    {
        id: '4',
        name: 'Vitamin C Serum',
        price: 52.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        category: 'Skincare',
        badge: 'Premium',
    },
    {
        id: '5',
        name: 'Deep Conditioner',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
    },
    {
        id: '6',
        name: 'Night Recovery Cream',
        price: 64.99,
        image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80',
        category: 'Skincare',
        badge: 'Sale',
    },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: '-50px' });
    const { formatPrice } = useCurrency();

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group perspective-1000"
        >
            <motion.div
                className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-500"
                whileHover={{
                    scale: 1.02,
                    rotateY: 5,
                    rotateX: -5,
                    boxShadow: '0 0 30px rgba(255, 20, 147, 0.3)',
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Badge */}
                {product.badge && (
                    <div className={`
            absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-semibold
            ${product.badge === 'Sale'
                            ? 'bg-red-500/90 text-white'
                            : product.badge === 'New'
                                ? 'bg-green-500/90 text-white'
                                : 'bg-neon-pink/90 text-white'
                        }
          `}>
                        {product.badge}
                    </div>
                )}

                {/* Wishlist Button */}
                <motion.button
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Heart className="w-4 h-4 text-white" />
                </motion.button>

                {/* Image Container */}
                <div className="relative overflow-hidden aspect-square">
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ash via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div className="p-5">
                    <span className="text-xs text-neon-pink font-medium uppercase tracking-wider">
                        {product.category}
                    </span>
                    <h3 className="text-lg font-semibold text-white mt-1 mb-2 line-clamp-1">
                        {product.name}
                    </h3>

                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">
                            {formatPrice(product.price)}
                        </span>

                        <motion.button
                            className="p-2 rounded-lg bg-neon-pink/20 text-neon-pink hover:bg-neon-pink hover:text-white transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-2xl border-2 border-neon-pink/50" />
                </div>
            </motion.div>
        </motion.div>
    );
}

export function FeaturedGrid() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section ref={sectionRef} className="py-24 relative">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-pink/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <span className="text-neon-pink text-sm font-semibold uppercase tracking-widest">
                        Featured Collection
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-4 mb-6">
                        Best Sellers
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Discover our most loved products, handpicked for quality and proven by our customers.
                    </p>
                </motion.div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>

                {/* View All Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 rounded-lg text-white hover:bg-white/5 hover:border-neon-pink/50 transition-all duration-300"
                    >
                        View All Products
                        <motion.span
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            â†’
                        </motion.span>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

export default FeaturedGrid;
