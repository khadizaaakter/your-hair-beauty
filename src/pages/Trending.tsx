import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Grid3X3, List, Loader2 } from 'lucide-react';
import { api, type Product } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';

export function Trending() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // We can just use the 'bestseller' (often trending) or 'featured' logic
    // For now, let's fetch products with badge='bestseller' to simulate trending
    useEffect(() => {
        setIsLoading(true);
        api.products.list({ badge: 'bestseller', limit: 20 })
            .then(response => {
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            })
            .catch(error => console.error('Error fetching trending products:', error))
            .finally(() => setIsLoading(false));
    }, []);

    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true });

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <div ref={headerRef} className="relative bg-slate-900 py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-neon-pink/20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/30 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-bold tracking-wider uppercase mb-6"
                    >
                        Curated Collection
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
                    >
                        Trending Now
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-300 max-w-xl mx-auto"
                    >
                        Discover the hottest products everyone is talking about. Shop the viral sensations and must-have favorites.
                    </motion.p>
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Trending Products</h2>
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
                        <p className="text-slate-500">No trending products found at the moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Trending;
