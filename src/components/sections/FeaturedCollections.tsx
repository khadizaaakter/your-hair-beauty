import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Collection {
    id: number;
    title: string;
    description: string;
    image: string;
    button_text: string;
    link: string;
    is_active: boolean;
}

export function FeaturedCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.collections.listPublic()
            .then(response => {
                if (response.success) {
                    setCollections(response.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return null; // Or a skeleton loader if preferred
    if (collections.length === 0) return null;

    return (
        <section className="py-16 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-6 h-6 text-neon-pink" />
                            <span className="text-sm font-semibold text-neon-pink uppercase tracking-widest">
                                Curated for You
                            </span>
                        </div>
                        <h2 className="section-title">Featured Collections</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                        >
                            <img
                                src={collection.image}
                                alt={collection.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-8 transform transition-transform duration-500 group-hover:-translate-y-2">
                                <h3 className="text-2xl font-bold text-white mb-2">{collection.title}</h3>
                                <p className="text-white/80 mb-6 line-clamp-2">{collection.description}</p>

                                <Link
                                    to={collection.link}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-neon-pink text-white font-medium rounded-lg hover:bg-neon-pink/90 transition-colors"
                                >
                                    {collection.button_text || 'Shop Now'}
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturedCollections;
