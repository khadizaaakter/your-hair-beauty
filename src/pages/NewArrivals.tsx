import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Grid3X3, List, Loader2, Sparkles } from 'lucide-react';
import { api, type Product } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';

export function NewArrivals() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        setIsLoading(true);
        // Explicitly fetch New items
        api.products.list({ badge: 'new', limit: 20 })
            .then(response => {
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true });

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <div ref={headerRef} className="relative bg-slate-900 py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-900/60" />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={headerInView ? { opacity: 1, scale: 1 } : {}}
                        className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold uppercase tracking-widest text-xs mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        Just Dropped
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
                    >
                        New Arrivals
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-300 max-w-xl mx-auto"
                    >
                        Be the first to get your hands on the latest drops. Fresh premium hair and beauty products added daily.
                    </motion.p>
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Latest Additions</h2>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-neon-pink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-neon-pink shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 text-neon-pink animate-spin" />
                    </div>
                ) : products.length > 0 ? (
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8'
                            : 'space-y-6'
                    }>
                        {products.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-2xl">
                        <p className="text-slate-500">No new arrivals found at the moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default NewArrivals;
