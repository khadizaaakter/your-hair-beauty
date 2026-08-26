import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { api, type Category } from '../lib/api';
import { Search, ChevronRight, Loader2, LayoutGrid, List, FolderOpen } from 'lucide-react';

type ViewMode = 'grid' | 'list';

export function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    useEffect(() => {
        api.categories.list()
            .then(r => { if (r.success && r.data) setCategories(r.data); })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="w-8 h-8 animate-spin text-neon-pink" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <Helmet>
                <title>All Categories | Your Hair & Beauty</title>
                <meta name="description" content="Browse all product categories — hair care, skin care, wigs, extensions, styling tools and more at Your Hair & Beauty." />
            </Helmet>

            {/* ── Header ── */}
            <section className="pt-6 pb-6 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">Categories</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'} available
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink transition-all placeholder-slate-400"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                ><LayoutGrid className="w-4 h-4" /></button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                ><List className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-slate-900 mb-1">No categories found</h3>
                        <p className="text-sm text-slate-500">Try a different search term.</p>
                        {search && (
                            <button onClick={() => setSearch('')} className="mt-4 text-sm font-bold text-neon-pink hover:underline">
                                Clear search
                            </button>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ── Grid View ── */
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((cat, idx) => (
                                <motion.div
                                    key={cat.id}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                    <Link
                                        to={`/shop?category=${cat.slug}`}
                                        className="block bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-neon-pink/20 transition-all group"
                                    >
                                        {/* Image */}
                                        <div className="relative h-36 sm:h-44 overflow-hidden bg-slate-100">
                                            {cat.image ? (
                                                <img
                                                    src={cat.image}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-pink/5 to-purple-100/30">
                                                    <span className="text-4xl font-display font-bold text-neon-pink/20">{cat.name.charAt(0)}</span>
                                                </div>
                                            )}
                                            {/* Product count badge */}
                                            <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 shadow-sm">
                                                {cat.product_count || 0}
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-neon-pink transition-colors">
                                                {cat.name}
                                            </h3>
                                            {cat.subcategories && cat.subcategories.length > 0 && (
                                                <p className="text-xs text-slate-400">
                                                    {cat.subcategories.slice(0, 3).map((s: any) => s.name || s).join(', ')}
                                                    {cat.subcategories.length > 3 && ` +${cat.subcategories.length - 3}`}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    /* ── List View ── */
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((cat, idx) => (
                                <motion.div
                                    key={cat.id}
                                    layout
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ delay: idx * 0.02 }}
                                >
                                    <Link
                                        to={`/shop?category=${cat.slug}`}
                                        className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-neon-pink/20 transition-all group"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-pink/5 to-purple-100/30">
                                                    <span className="text-lg font-display font-bold text-neon-pink/20">{cat.name.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 group-hover:text-neon-pink transition-colors">
                                                {cat.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {cat.product_count || 0} products
                                                {cat.subcategories && cat.subcategories.length > 0 && (
                                                    <span className="text-slate-300 mx-2">·</span>
                                                )}
                                                {cat.subcategories && cat.subcategories.length > 0 && (
                                                    <span className="text-slate-400">
                                                        {cat.subcategories.slice(0, 4).map((s: any) => s.name || s).join(', ')}
                                                        {cat.subcategories.length > 4 && ` +${cat.subcategories.length - 4}`}
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Arrow */}
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-neon-pink transition-colors shrink-0" />
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Categories;
