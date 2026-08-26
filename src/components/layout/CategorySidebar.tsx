import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Menu, Tag } from 'lucide-react';
import { api, type Category } from '../../lib/api';

interface CategorySidebarProps {
    activeCategory?: string;
    onSelect?: (slug: string) => void;
    showTitle?: boolean;
    className?: string;
}

export function CategorySidebar({ activeCategory, onSelect, showTitle = true, className = '' }: CategorySidebarProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.categories.list();
                if (response.success && response.data) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (isLoading) {
        return (
            <div className={`w-full bg-white rounded-xl shadow-card p-4 animate-pulse ${className}`}>
                {showTitle && <div className="h-8 bg-slate-100 rounded mb-4" />}
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-6 bg-slate-100 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    // Logic to determine which categories to show
    // If we are in "Shop mode" (onSelect provided), show all.
    // If in "Home mode" (no onSelect), truncate.
    const isShopMode = !!onSelect;
    const shouldTruncate = !isShopMode && categories.length > 8;
    const itemsToShow = shouldTruncate ? categories.slice(0, 7) : categories;

    return (
        <div className={`w-full flex flex-col relative z-20 ${className} ${!isShopMode ? 'bg-white rounded-xl shadow-card h-full' : ''}`}>
            {/* Header (Only for Home mode usually) */}
            {showTitle && (
                <div className="p-4 bg-neon-pink text-white flex items-center gap-2 rounded-t-xl">
                    <Menu className="w-5 h-5" />
                    <h2 className="font-bold text-lg">Browse Categories</h2>
                </div>
            )}

            {/* List */}
            <div className={`flex-1 ${showTitle ? 'p-2 border-x border-b border-slate-100 rounded-b-xl' : ''}`}>
                <div className="space-y-3">
                    {/* All Categories Option (Shop Mode) */}
                    {isShopMode && (
                        <button
                            onClick={() => onSelect?.('all')}
                            className={`w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${activeCategory === 'all'
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            All Categories
                            {activeCategory === 'all' && (
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-pink" />
                            )}
                        </button>
                    )}

                    {itemsToShow.map((category) => (
                        <div key={category.id} className="group relative">
                            {isShopMode ? (
                                <button
                                    onClick={() => onSelect?.(category.slug)}
                                    className={`w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${activeCategory === category.slug
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {category.name}
                                    {activeCategory === category.slug && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-neon-pink" />
                                    )}
                                </button>
                            ) : (
                                <Link
                                    to={`/shop?category=${category.slug}`}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:bg-pink-50 hover:text-neon-pink transition-colors"
                                >
                                    <span className="flex items-center gap-3">
                                        <span className="text-sm font-medium truncate">{category.name}</span>
                                    </span>
                                    {category.subcategories && category.subcategories.length > 0 && (
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-neon-pink" />
                                    )}
                                </Link>
                            )}

                            {/* Subcategories Flyout (Home Mode Only for now, or if requested) */}
                            {!isShopMode && category.subcategories && category.subcategories.length > 0 && (
                                <div className="hidden group-hover:block absolute left-full top-0 w-64 bg-white shadow-xl rounded-r-xl border border-l-0 border-slate-100 p-2 z-50">
                                    <h3 className="px-4 py-2 font-semibold text-slate-900 border-b border-slate-100 mb-2">
                                        {category.name}
                                    </h3>
                                    <ul className="space-y-1">
                                        {category.subcategories.slice(0, 10).map((sub) => (
                                            <li key={sub.id}>
                                                <Link
                                                    to={`/shop?category=${category.slug}&subcategory=${sub.slug}`}
                                                    className="block px-4 py-2 text-sm text-slate-600 hover:text-neon-pink hover:bg-slate-50 rounded-lg"
                                                >
                                                    {sub.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Shop by Brand Link */}
                    {!isShopMode && (
                        <Link
                            to="/brands"
                            className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-700 hover:bg-pink-50 hover:text-neon-pink transition-colors font-semibold border-t border-slate-100 mt-2 pt-3"
                        >
                            <span className="flex items-center gap-3">
                                <Tag className="w-4 h-4" />
                                <span className="text-sm">Shop by Brand</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Link>
                    )}

                    {/* View All Link (Home Mode) */}
                    {shouldTruncate && (
                        <Link
                            to="/categories"
                            className="flex items-center justify-between px-4 py-3 text-neon-pink font-semibold hover:bg-slate-50 rounded-xl mt-2"
                        >
                            <span>View All Categories</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
