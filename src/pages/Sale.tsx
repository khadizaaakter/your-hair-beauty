import { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Grid3X3, List, Loader2, Tag } from 'lucide-react';
import { api, type Product } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';

export function Sale() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        setIsLoading(true);
        // Explicitly fetch properties on sale
        api.products.list({ badge: 'sale', limit: 20 })
            .then(response => {
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            })
            .catch(error => console.error('Error fetching sale products:', error))
            .finally(() => setIsLoading(false));
    }, []);

    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true });

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <div ref={headerRef} className="relative bg-slate-900 py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-orange-600/30" />

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                        animate={headerInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 text-white font-bold text-xl mb-6 shadow-xl shadow-red-600/30"
                    >
                        SALE
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-bold text-white mb-6"
                    >
                        Special Offers
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={headerInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-300 max-w-xl mx-auto"
                    >
                        Grab your favorites at unbeatable prices. Limited time offers on premium brands.
                    </motion.p>
                </div>
            </div>

            {/* Products */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-red-500" />
                        On Sale Now
                    </h2>
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
                        <p className="text-slate-500">No sale items found at the moment.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Sale;
