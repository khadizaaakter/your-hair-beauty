import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api, type Product } from '../../lib/api';
import { ProductCard } from '../ui/ProductCard';

const tabs = [
    { id: 'new', label: 'NEW ARRIVALS', badge: 'new' },
    { id: 'bestseller', label: 'BEST SELLERS', badge: 'bestseller' },
    { id: 'trending', label: 'TRENDING', badge: '' },
];

export function TabbedProducts() {
    const [activeTab, setActiveTab] = useState('new');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const selectedTab = tabs.find(t => t.id === activeTab);
        const params: Record<string, string | number> = { limit: 8 };

        if (selectedTab?.badge) {
            params.badge = selectedTab.badge;
        } else {
            // Trending: get top-rated products
            params.sort = 'rating';
        }

        api.products.list(params)
            .then(response => {
                if (response.success) {
                    setProducts(response.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [activeTab]);

    return (
        <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <h2 className="section-title mb-3">Discover Our Products</h2>
                    <p className="text-slate-600">Explore our carefully curated collection</p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-10 border-b border-slate-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        {isLoading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-slate-200 rounded-lg mb-3" />
                                    <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                                </div>
                            ))
                        ) : (
                            products.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Link to="/shop" className="btn-outline inline-block">
                            View All Products
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default TabbedProducts;
