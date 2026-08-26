import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Filter, X, SlidersHorizontal, LayoutGrid, Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Product, type Category } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';
import { RecommendedProducts } from '../components/ui/RecommendedProducts';
import { MobileFilterDrawer } from '../components/ui/MobileFilterDrawer';
import { useCurrency } from '../context/CurrencyContext';
import { Helmet } from 'react-helmet-async';

const legacyFilterToBadgeMap: Record<string, string> = {
    trending: 'bestseller',
    'best-sellers': 'bestseller',
    bestsellers: 'bestseller',
    new: 'new',
    'new-arrivals': 'new',
    sale: 'sale',
};

export function Shop() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<{ slug: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [gridCols, setGridCols] = useState<3 | 4>(4);
    const { getSymbol } = useCurrency();

    // URL params
    const searchQuery = searchParams.get('q') || '';
    const selectedCategory = searchParams.get('category') || 'all';
    const selectedBrand = searchParams.get('brand') || 'all';
    const selectedSubcategory = searchParams.get('subcategory') || '';
    const selectedBadge = searchParams.get('badge') || '';
    const legacyFilter = searchParams.get('filter') || '';
    const legacyCollection = searchParams.get('collection') || '';
    const sortBy = searchParams.get('sort') || 'default';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const effectiveBadge = selectedBadge || legacyFilterToBadgeMap[legacyFilter] || '';
    const effectiveSearchQuery = searchQuery || legacyCollection;

    const [localSearch, setLocalSearch] = useState(effectiveSearchQuery);
    const [localPriceRange, setLocalPriceRange] = useState([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 200,
    ]);

    const hasFilters = effectiveSearchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' || selectedSubcategory || effectiveBadge || minPrice || maxPrice;

    // Get subcategories for selected category
    const activeCat = categories.find(c => c.slug === selectedCategory);
    const subcategories = (activeCat?.subcategories || []) as any[];

    // Load products
    useEffect(() => {
        setIsLoading(true);
        const params: Record<string, string | number> = { page: currentPage, limit: 20 };
        if (effectiveSearchQuery) params.search = effectiveSearchQuery;
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedBrand && selectedBrand !== 'all') params.brand = selectedBrand;
        if (selectedSubcategory) params.subcategory = selectedSubcategory;
        if (effectiveBadge) params.badge = effectiveBadge;
        if (sortBy && sortBy !== 'default') params.sort = sortBy;
        if (minPrice) params.min_price = parseInt(minPrice);
        if (maxPrice) params.max_price = parseInt(maxPrice);

        api.products.list(params)
            .then(response => {
                if (response.success) {
                    setProducts(response.data || []);
                    const pagination = (response as any).pagination;
                    if (pagination) setTotalPages(pagination.totalPages);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [effectiveSearchQuery, selectedCategory, selectedBrand, selectedSubcategory, effectiveBadge, sortBy, minPrice, maxPrice, currentPage]);

    // Load categories & brands
    useEffect(() => {
        api.categories.list().then(r => { if (r.success && r.data) setCategories(r.data); });
        api.brands.list().then(r => { if (r.success && r.data) setBrands(r.data); });
    }, []);

    useEffect(() => {
        setLocalSearch(effectiveSearchQuery);
    }, [effectiveSearchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const p = new URLSearchParams(searchParams);
        if (localSearch.trim()) {
            p.set('q', localSearch.trim());
            p.delete('collection');
        } else {
            p.delete('q');
            p.delete('collection');
        }
        p.set('page', '1');
        setSearchParams(p);
        setCurrentPage(1);
    };

    const updateParams = (key: string, value: string) => {
        const p = new URLSearchParams(searchParams);
        if (value && value !== 'all' && value !== 'default') {
            p.set(key, value);
        } else {
            p.delete(key);
        }
        if (key === 'badge') p.delete('filter');
        if (key === 'q') p.delete('collection');
        if (key === 'category') p.delete('subcategory');
        p.set('page', '1');
        setSearchParams(p);
        setCurrentPage(1);
    };

    const applyPriceFilter = () => {
        const p = new URLSearchParams(searchParams);
        if (localPriceRange[0] > 0) {
            p.set('minPrice', String(localPriceRange[0]));
        } else {
            p.delete('minPrice');
        }
        if (localPriceRange[1] < 200) {
            p.set('maxPrice', String(localPriceRange[1]));
        } else {
            p.delete('maxPrice');
        }
        setSearchParams(p);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchParams({});
        setLocalSearch('');
        setLocalPriceRange([0, 200]);
        setCurrentPage(1);
    };

    const handleApplyFilters = (filters: any) => {
        const p = new URLSearchParams(searchParams);
        if (filters.category && filters.category !== 'all') {
            p.set('category', filters.category);
        } else {
            p.delete('category');
        }
        if (filters.subcategory) {
            p.set('subcategory', filters.subcategory);
        } else {
            p.delete('subcategory');
        }
        if (filters.sort && filters.sort !== 'default') {
            p.set('sort', filters.sort);
        } else {
            p.delete('sort');
        }
        if (filters.minPrice > 0) {
            p.set('minPrice', filters.minPrice.toString());
        } else {
            p.delete('minPrice');
        }
        if (filters.maxPrice < 500) {
            p.set('maxPrice', filters.maxPrice.toString());
        } else {
            p.delete('maxPrice');
        }
        if (filters.badge) {
            p.set('badge', filters.badge);
            p.delete('filter');
        } else {
            p.delete('badge');
            p.delete('filter');
        }
        p.set('page', '1');
        setSearchParams(p);
        setCurrentPage(1);
        setLocalPriceRange([filters.minPrice, filters.maxPrice]);
    };

    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        pages.push(1);
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <Helmet>
                <title>Shop | Your Hair and Beauty</title>
                <meta name="description" content="Browse over 45,000 hair and beauty products. Shop hair care, skin care, wigs, extensions, and more at Your Hair & Beauty." />
            </Helmet>

            {/* ═══ Compact Header ═══ */}
            <section className="pt-6 pb-8 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">Shop</h1>
                            <p className="text-sm text-slate-500 mt-1">
                                {hasFilters ? 'Filtered results' : 'Browse our full collection'}
                            </p>
                        </div>
                        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={localSearch}
                                onChange={(e) => setLocalSearch(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink transition-all placeholder-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </form>
                    </div>

                    {/* Active filter pills */}
                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2">
                            {effectiveSearchQuery && (
                                <FilterPill
                                    label={searchQuery ? `"${searchQuery}"` : `Collection: ${legacyCollection}`}
                                    onRemove={() => updateParams('q', '')}
                                />
                            )}
                            {selectedCategory !== 'all' && <FilterPill label={`Category: ${selectedCategory}`} onRemove={() => updateParams('category', 'all')} />}
                            {selectedBrand !== 'all' && <FilterPill label={`Brand: ${selectedBrand}`} onRemove={() => updateParams('brand', 'all')} />}
                            {selectedSubcategory && <FilterPill label={`Sub: ${selectedSubcategory}`} onRemove={() => updateParams('subcategory', '')} />}
                            {effectiveBadge && <FilterPill label={effectiveBadge} onRemove={() => updateParams('badge', '')} />}
                            {(minPrice || maxPrice) && (
                                <FilterPill
                                    label={`${getSymbol()}${minPrice || 0} – ${getSymbol()}${maxPrice || '∞'}`}
                                    onRemove={() => {
                                        const p = new URLSearchParams(searchParams);
                                        p.delete('minPrice'); p.delete('maxPrice');
                                        setSearchParams(p);
                                        setLocalPriceRange([0, 200]);
                                    }}
                                />
                            )}
                            <button onClick={clearFilters} className="text-xs font-bold text-neon-pink hover:underline ml-1">
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ Main Content ═══ */}
            <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                    {/* Mobile Filter Toggle */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold shadow-sm"
                        >
                            <Filter className="w-4 h-4 text-neon-pink" />
                            Filters & Categories
                        </button>
                    </div>

                    <MobileFilterDrawer
                        isOpen={showMobileFilters}
                        onClose={() => setShowMobileFilters(false)}
                        categories={categories}
                        onApplyFilters={handleApplyFilters}
                        currentFilters={{
                            category: selectedCategory,
                            subcategory: selectedSubcategory,
                            itemType: '',
                            minPrice: localPriceRange[0],
                            maxPrice: localPriceRange[1],
                            badge: effectiveBadge,
                            sort: sortBy,
                        }}
                        productCount={products.length}
                    />

                    {/* ── Sidebar ── */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-28 space-y-5 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-hide">

                            {/* Collections */}
                            <SidebarCard title="Collections">
                                <div className="space-y-1">
                                    {[
                                        { name: 'All Products', value: '' },
                                        { name: 'Trending', value: 'bestseller' },
                                        { name: 'On Sale', value: 'sale' },
                                        { name: 'New Arrivals', value: 'new' },
                                    ].map((item) => (
                                        <button
                                            key={item.name}
                                            onClick={() => updateParams('badge', item.value)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${(effectiveBadge === item.value && item.value !== '') || (item.value === '' && !effectiveBadge)
                                                    ? 'bg-neon-pink text-white'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >{item.name}</button>
                                    ))}
                                </div>
                            </SidebarCard>

                            {/* Categories — Dropdown */}
                            <SidebarCard title="Category">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => updateParams('category', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </SidebarCard>

                            {/* Subcategories — Dropdown (only when a category is selected) */}
                            {subcategories.length > 0 && (
                                <SidebarCard title="Subcategory">
                                    <select
                                        value={selectedSubcategory}
                                        onChange={(e) => updateParams('subcategory', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink cursor-pointer"
                                    >
                                        <option value="">All Subcategories</option>
                                        {subcategories.map((sub: any, i: number) => (
                                            <option key={i} value={sub.slug || sub}>{sub.name || sub}</option>
                                        ))}
                                    </select>
                                </SidebarCard>
                            )}

                            {/* Brands — Dropdown */}
                            {brands.length > 0 && (
                                <SidebarCard title="Brand">
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => updateParams('brand', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink cursor-pointer"
                                    >
                                        <option value="all">All Brands</option>
                                        {brands.map(b => (
                                            <option key={b.slug} value={b.slug}>{b.name}</option>
                                        ))}
                                    </select>
                                </SidebarCard>
                            )}

                            {/* Price Range */}
                            <SidebarCard title="Price Range">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{getSymbol()}</span>
                                        <input
                                            type="number"
                                            value={localPriceRange[0]}
                                            onChange={(e) => setLocalPriceRange([+e.target.value, localPriceRange[1]])}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-7 pr-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-neon-pink/20 transition-all"
                                        />
                                    </div>
                                    <span className="text-slate-300 text-sm">–</span>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{getSymbol()}</span>
                                        <input
                                            type="number"
                                            value={localPriceRange[1]}
                                            onChange={(e) => setLocalPriceRange([localPriceRange[0], +e.target.value])}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-7 pr-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-neon-pink/20 transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={applyPriceFilter}
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-neon-pink transition-colors"
                                >Apply</button>
                            </SidebarCard>
                        </div>
                    </aside>

                    {/* ── Products Grid Area ── */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4 mb-6 bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
                            <p className="text-sm text-slate-500">
                                <span className="font-bold text-slate-900">{products.length}</span> products
                            </p>
                            <div className="flex items-center gap-3">
                                {/* Grid toggle */}
                                <div className="hidden md:flex items-center gap-1 border-r border-slate-200 pr-3">
                                    <button
                                        onClick={() => setGridCols(3)}
                                        className={`p-1.5 rounded-lg transition-colors ${gridCols === 3 ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    ><LayoutGrid className="w-4 h-4" /></button>
                                    <button
                                        onClick={() => setGridCols(4)}
                                        className={`p-1.5 rounded-lg transition-colors ${gridCols === 4 ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    ><Grid3X3 className="w-4 h-4" /></button>
                                </div>
                                {/* Sort */}
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                    <select
                                        value={sortBy}
                                        onChange={(e) => updateParams('sort', e.target.value)}
                                        className="text-sm border-none bg-transparent font-semibold text-slate-700 focus:ring-0 cursor-pointer pr-6"
                                    >
                                        <option value="default">Featured</option>
                                        <option value="price-asc">Price: Low → High</option>
                                        <option value="price-desc">Price: High → Low</option>
                                        <option value="name">Name: A → Z</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3">
                                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
                                <p className="text-slate-400 text-sm font-medium">Loading products...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <motion.div
                                    layout
                                    className={`grid grid-cols-2 gap-3 lg:gap-5 ${gridCols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-3 lg:grid-cols-4'
                                        }`}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {products.map((product, index) => (
                                            <ProductCard key={product.id} product={product} index={index} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-10">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-neon-pink hover:text-neon-pink transition-colors"
                                        ><ChevronLeft className="w-4 h-4" /></button>

                                        {getPageNumbers().map((page, idx) =>
                                            page === '...' ? (
                                                <span key={`dots-${idx}`} className="px-1 text-slate-400 text-sm">…</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page as number)}
                                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${currentPage === page
                                                            ? 'bg-neon-pink text-white shadow-lg shadow-neon-pink/20'
                                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-neon-pink hover:text-neon-pink'
                                                        }`}
                                                >{page}</button>
                                            )
                                        )}

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:border-neon-pink hover:text-neon-pink transition-colors"
                                        ><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                                    <Search className="w-7 h-7 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">Try adjusting your filters or search terms.</p>
                                <button onClick={clearFilters} className="px-6 py-2.5 bg-neon-pink text-white rounded-xl font-bold hover:bg-neon-pink/90 transition-colors shadow-lg shadow-neon-pink/20 mb-8">
                                    Clear All Filters
                                </button>
                                <div className="text-left max-w-4xl mx-auto px-4">
                                    <RecommendedProducts title="You might like" limit={4} columns={4} />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

/* ── Helper Components ── */

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
            </div>
            <div className="p-3">{children}</div>
        </div>
    );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <button
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-neon-pink transition-colors"
        >
            {label}
            <X className="w-3 h-3" />
        </button>
    );
}

export default Shop;
