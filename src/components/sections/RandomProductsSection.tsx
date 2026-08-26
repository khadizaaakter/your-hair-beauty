import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shuffle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type Product } from '../../lib/api';
import { ProductCard } from '../ui/ProductCard';

const shuffleProducts = (items: Product[]): Product[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export function RandomProductsSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.products.list({ limit: 40 })
            .then((response) => {
                if (!response.success) return;

                const pool = response.data.filter((product) => !product.badge);
                const source = pool.length >= 10 ? pool : response.data;
                setProducts(shuffleProducts(source).slice(0, 10));
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10">
                        <div className="h-6 w-36 bg-slate-200 rounded mb-2 animate-pulse" />
                        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse">
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
        <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shuffle className="w-6 h-6 text-neon-pink" />
                            <span className="text-sm font-semibold text-neon-pink uppercase tracking-widest">
                                Mixed Picks
                            </span>
                        </div>
                        <h2 className="section-title">Recommended For You</h2>
                    </div>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 text-neon-pink font-medium hover:underline"
                    >
                        Explore More
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                    {products.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default RandomProductsSection;
