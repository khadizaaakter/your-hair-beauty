import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, type Product } from '../../lib/api';
import { subscribeToNewsletter } from '../../lib/newsletter';
import { ProductCard } from '../ui/ProductCard';

export function LatestDealsSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        // Get products with sale prices
        api.products.list({ badge: 'sale', limit: 10 })
            .then(response => {
                if (response.success && response.data.length > 0) {
                    setProducts(response.data.slice(0, 10));
                } else {
                    // Fallback: get featured products
                    return api.products.list({ featured: 'true', limit: 10 });
                }
                return response;
            })
            .then(response => {
                if (response && response.success && products.length === 0) {
                    setProducts(response.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleSubscribe = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubscribing) return;

        setIsSubscribing(true);
        const result = await subscribeToNewsletter(email, 'latest-deals');
        if (result.success) {
            toast.success(result.message);
            setEmail('');
        } else {
            toast.error(result.message);
        }
        setIsSubscribing(false);
    };

    if (isLoading) {
        return (
            <section className="py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10">
                        <div className="h-6 w-28 bg-white/10 rounded mb-2 animate-pulse" />
                        <div className="h-8 w-44 bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="aspect-square bg-slate-200 rounded-lg mb-3" />
                                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-slate-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-400 uppercase tracking-widest">
                                Flash Deals
                            </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-white">Latest Deals</h2>
                        <p className="text-slate-400 mt-2">Limited time offers - grab them before they're gone!</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Countdown Timer Placeholder */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Clock className="w-5 h-5 text-neon-pink" />
                            <span className="text-sm font-medium">Ends in 24:00:00</span>
                        </div>
                        <Link
                            to="/shop?badge=sale"
                            className="inline-flex items-center gap-2 text-neon-pink font-medium hover:underline"
                        >
                            View All Deals
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl overflow-hidden"
                        >
                            <ProductCard product={product} index={index} />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
                >
                    <div className="text-center md:text-left">
                        <p className="text-lg font-semibold">Subscribe for exclusive deals</p>
                        <p className="text-slate-400 text-sm">Be the first to know about new promotions</p>
                    </div>
                    <form onSubmit={handleSubscribe} className="flex gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:border-neon-pink focus:outline-none w-64"
                        />
                        <motion.button
                            type="submit"
                            disabled={isSubscribing}
                            className="px-6 py-2 bg-neon-pink text-white font-semibold rounded-lg hover:bg-neon-pink-600 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}

export default LatestDealsSection;
