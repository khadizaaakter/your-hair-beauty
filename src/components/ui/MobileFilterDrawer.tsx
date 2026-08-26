import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Category } from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';

interface MobileFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
    onApplyFilters: (filters: FilterState) => void;
    currentFilters: FilterState;
    productCount: number;
}

interface FilterState {
    category: string;
    subcategory: string;
    itemType: string;
    minPrice: number;
    maxPrice: number;
    badge: string;
    sort: string;
}

export function MobileFilterDrawer({
    isOpen,
    onClose,
    categories,
    onApplyFilters,
    currentFilters,
    productCount
}: MobileFilterDrawerProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const { getSymbol } = useCurrency();

    // Sync local state when drawer opens or current filters change
    useEffect(() => {
        setLocalFilters(currentFilters);
        if (currentFilters.category && currentFilters.category !== 'all') {
            setExpandedCategory(currentFilters.category);
        }
    }, [currentFilters, isOpen]);

    const handleCategoryClick = (categorySlug: string) => {
        if (expandedCategory === categorySlug) {
            setExpandedCategory(null);
        } else {
            setExpandedCategory(categorySlug);
        }

        // If clicking top-level category, select it
        if (localFilters.category !== categorySlug) {
            setLocalFilters(prev => ({ ...prev, category: categorySlug, subcategory: '', itemType: '' }));
        }
    };

    const handleSubcategoryClick = (subSlug: string) => {
        setLocalFilters(prev => ({
            ...prev,
            subcategory: prev.subcategory === subSlug ? '' : subSlug,
            itemType: ''
        }));
    };

    const handleItemTypeClick = (typeSlug: string) => {
        setLocalFilters(prev => ({
            ...prev,
            itemType: prev.itemType === typeSlug ? '' : typeSlug
        }));
    };

    const handlePriceChange = (min: number, max: number) => {
        setLocalFilters(prev => ({ ...prev, minPrice: min, maxPrice: max }));
    };

    const handleSortChange = (sort: string) => {
        setLocalFilters(prev => ({ ...prev, sort }));
    };



    const handleClearAll = () => {
        setLocalFilters({
            category: 'all',
            subcategory: '',
            itemType: '',
            minPrice: 0,
            maxPrice: 200,
            badge: '',
            sort: 'default'
        });
        setExpandedCategory(null);
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-[70] lg:hidden backdrop-blur-sm"
                    />

                    {/* Bottom Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white z-[80] rounded-t-3xl shadow-2xl h-[85vh] flex flex-col lg:hidden"
                    >
                        {/* Handle bar for visual cue */}
                        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-neon-pink" />
                                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                            </div>
                            <button
                                onClick={handleClearAll}
                                className="text-sm font-medium text-slate-500 hover:text-neon-pink"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                            {/* Sort */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-900">Sort By</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { value: 'default', label: 'Recommended' },
                                        { value: 'price_asc', label: 'Price: Low to High' },
                                        { value: 'price_desc', label: 'Price: High to Low' },
                                        { value: 'newest', label: 'Newest Arrivals' }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${localFilters.sort === option.value
                                                ? 'bg-neon-pink text-white border-neon-pink'
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-neon-pink'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-4">
                                <h3 className="font-bold text-slate-900">Price Range</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Min Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{getSymbol()}</span>
                                            <input
                                                type="number"
                                                value={localFilters.minPrice}
                                                onChange={(e) => handlePriceChange(Number(e.target.value), localFilters.maxPrice)}
                                                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neon-pink"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs text-slate-500 mb-1 block">Max Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{getSymbol()}</span>
                                            <input
                                                type="number"
                                                value={localFilters.maxPrice}
                                                onChange={(e) => handlePriceChange(localFilters.minPrice, Number(e.target.value))}
                                                className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-neon-pink"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="10"
                                    value={localFilters.maxPrice}
                                    onChange={(e) => handlePriceChange(localFilters.minPrice, Number(e.target.value))}
                                    className="w-full accent-neon-pink"
                                />
                            </div>

                            {/* Categories Tree */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-900">Categories</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            setLocalFilters(prev => ({ ...prev, category: 'all', subcategory: '', itemType: '' }));
                                            setExpandedCategory(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${localFilters.category === 'all'
                                            ? 'bg-neon-pink/10 text-neon-pink'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        All Products
                                    </button>

                                    {categories.map((cat) => (
                                        <div key={cat.id} className="space-y-1">
                                            <button
                                                onClick={() => handleCategoryClick(cat.slug)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${localFilters.category === cat.slug
                                                    ? 'bg-neon-pink/10 text-neon-pink'
                                                    : 'text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span>{cat.name}</span>
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform ${expandedCategory === cat.slug ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>

                                            {/* Subcategories Expansion */}
                                            <AnimatePresence>
                                                {expandedCategory === cat.slug && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden pl-4 space-y-1"
                                                    >
                                                        {cat.subcategories?.map((sub) => (
                                                            <div key={sub.id}>
                                                                <button
                                                                    onClick={() => handleSubcategoryClick(sub.slug)}
                                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${localFilters.subcategory === sub.slug
                                                                        ? 'text-neon-pink font-medium'
                                                                        : 'text-slate-500 hover:text-slate-800'
                                                                        }`}
                                                                >
                                                                    {sub.name}
                                                                </button>

                                                                {/* Item Types (if selected subcategory) */}
                                                                {localFilters.subcategory === sub.slug && sub.itemTypes && (
                                                                    <div className="pl-4 space-y-1 mt-1 border-l border-slate-100">
                                                                        {sub.itemTypes.map((type) => (
                                                                            <button
                                                                                key={type.id}
                                                                                onClick={() => handleItemTypeClick(type.slug)}
                                                                                className={`w-full text-left px-3 py-1 rounded-md text-xs transition-colors ${localFilters.itemType === type.slug
                                                                                    ? 'text-neon-pink font-medium'
                                                                                    : 'text-slate-400 hover:text-slate-700'
                                                                                    }`}
                                                                            >
                                                                                {type.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-slate-100 bg-white pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
                            <button
                                onClick={handleApply}
                                className="w-full btn-primary py-3.5 text-base shadow-lg shadow-neon-pink/25 flex items-center justify-center gap-2"
                            >
                                Show {productCount > 0 ? productCount : 'Matching'} Results
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
