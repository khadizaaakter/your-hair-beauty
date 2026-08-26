import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, SlidersHorizontal, ChevronRight, Loader2 } from 'lucide-react';
import { api, type Product, type Category } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';
import { RecommendedProducts } from '../components/ui/RecommendedProducts';

export function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [localQuery, setLocalQuery] = useState(query);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load categories on mount
    useEffect(() => {
        api.categories.list()
            .then(response => {
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            })
            .catch(console.error);
    }, []);

    // Search when query changes
    useEffect(() => {
        if (!query) {
            setProducts([]);
            return;
        }

        setIsLoading(true);
        api.products.list({ search: query, limit: 50 })
            .then(response => {
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [query]);

    // Filter products client-side (API search returned data)
    const filteredProducts = products.filter(p => {
        // Filter by category
        if (selectedCategory && p.category_name !== selectedCategory) {
            return false;
        }

        // Filter by price  
        const price = p.sale_price || p.price;
        if (price < priceRange[0] || price > priceRange[1]) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        const priceA = a.sale_price || a.price;
        const priceB = b.sale_price || b.price;

        switch (sortBy) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'newest':
                return (a.badge === 'new' ? 0 : 1) - (b.badge === 'new' ? 0 : 1);
            default:
                return 0;
        }
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ q: localQuery });
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setPriceRange([0, 200]);
        setSortBy('relevance');
    };

    return (
        <>
            <Helmet>
                <title>{query ? `Search: "${query}"` : 'Search'} | Your Hair and Beauty</title>
                <meta name="description" content={`Search results for "${query}" at Your Hair and Beauty`} />
            </Helmet>

            <main className="bg-white min-h-screen">
                {/* Header */}
                <div className="bg-slate-50 py-8">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                            <Link to="/" className="hover:text-neon-pink">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-slate-900 font-medium">Search Results</span>
                        </nav>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={localQuery}
                                    onChange={(e) => setLocalQuery(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-neon-pink focus:outline-none"
                                />
                            </div>
                        </form>

                        {/* Results Count */}
                        <p className="mt-4 text-slate-600">
                            {query && (
                                <>
                                    Showing <span className="font-semibold text-slate-900">{filteredProducts.length}</span> results for{' '}
                                    <span className="font-semibold text-slate-900">"{query}"</span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex gap-8">
                        {/* Filters Sidebar Drawer (Mobile) & Sidebar (Desktop) */}
                        <div className={`
                            fixed inset-0 z-50 lg:relative lg:z-0 lg:block
                            ${showFilters ? 'block' : 'hidden'}
                        `}>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                                onClick={() => setShowFilters(false)}
                            />

                            <aside className={`
                                fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 p-6 overflow-y-auto transition-transform
                                lg:sticky lg:top-24 lg:w-64 lg:p-0 lg:bg-transparent lg:z-0
                                ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                            `}>
                                <div className="space-y-6">
                                    {/* Filter Header */}
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900">Filters</h3>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-neon-pink hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <h4 className="font-medium text-slate-900 mb-3 text-sm uppercase tracking-wider">Category</h4>
                                        <div className="space-y-2">
                                            {categories.map((cat) => (
                                                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="category"
                                                        checked={selectedCategory === cat.name}
                                                        onChange={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                                                        className="w-4 h-4 text-neon-pink border-slate-300 focus:ring-neon-pink/20"
                                                    />
                                                    <span className="text-sm text-slate-600 group-hover:text-neon-pink transition-colors">{cat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <h4 className="font-medium text-slate-900 mb-3 text-sm uppercase tracking-wider">Price Range</h4>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-neon-pink focus:outline-none"
                                                min={0}
                                                placeholder="Min"
                                            />
                                            <span className="text-slate-400">to</span>
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-neon-pink focus:outline-none"
                                                min={0}
                                                placeholder="Max"
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Close Button */}
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="btn-primary w-full lg:hidden mt-8"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </aside>
                        </div>

                        {/* Products Grid */}
                        <div className="flex-1">
                            {/* Sort & Filter Toggle */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                </button>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-neon-pink focus:outline-none"
                                >
                                    <option value="relevance">Sort: Relevance</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>

                            {/* Results */}
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                    {filteredProducts.map((product, index) => (
                                        <ProductCard key={product.id} product={product} index={index} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Search className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
                                    <p className="text-slate-600 mb-4">Try adjusting your search or filters</p>
                                    <button
                                        onClick={clearFilters}
                                        className="btn-outline mb-12"
                                    >
                                        Clear Filters
                                    </button>
                                    <div className="text-left max-w-4xl mx-auto">
                                        <RecommendedProducts title="Popular Products" limit={4} columns={4} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default SearchResults;
