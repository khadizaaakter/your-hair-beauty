import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, Loader2, ShoppingBag } from 'lucide-react';
import { api, type Brand } from '../lib/api';

const ALPHABET = Array.from(Array(26)).map((_, i) => String.fromCharCode(i + 65));

export function Brands() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeLetter, setActiveLetter] = useState<string | null>(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await api.brands.list();
                if (response.success && response.data) {
                    setBrands(response.data);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrands();
    }, []);

    // Filter brands by search query
    const filteredBrands = brands.filter(brand =>
        (brand.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group filtered brands by first letter
    const groupedBrands = filteredBrands.reduce((acc, brand) => {
        let firstLetter = (brand.name || '').charAt(0).toUpperCase();
        if (!/[A-Z]/.test(firstLetter)) firstLetter = '#';
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(brand);
        return acc;
    }, {} as Record<string, Brand[]>);

    // Letters that have brands
    const lettersWithBrands = new Set(Object.keys(groupedBrands));

    // Which letters to show (if a letter is active, show only that letter)
    const visibleLetters = activeLetter
        ? [activeLetter]
        : [...(groupedBrands['#'] ? ['#'] : []), ...ALPHABET.filter(l => lettersWithBrands.has(l))];

    const handleLetterClick = (letter: string) => {
        if (activeLetter === letter) {
            setActiveLetter(null); // Toggle off
        } else {
            setActiveLetter(letter);
            setSearchQuery(''); // Clear search when filtering by letter
        }
    };

    const handleShowAll = () => {
        setActiveLetter(null);
        setSearchQuery('');
    };

    return (
        <main className="min-h-screen bg-white">
            <Helmet>
                <title>Brands Directory | Your Hair and Beauty</title>
                <meta name="description" content="Browse all our premium hair and beauty brands from A to Z." />
            </Helmet>

            {/* Header */}
            <section className="pt-32 pb-12 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2"
                    >
                        BRANDS DIRECTORY
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500"
                    >
                        {brands.length}+ premium brands
                    </motion.p>
                </div>
            </section>

            <section className="py-8">
                <div className="max-w-4xl mx-auto px-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-neon-pink mb-4" />
                            <p className="text-slate-500">Loading brands...</p>
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Brands Found</h3>
                            <p className="text-slate-500">Check back later for our brand collections.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* A-Z Letter Navigation */}
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <button
                                    onClick={handleShowAll}
                                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${!activeLetter
                                        ? 'bg-neon-pink text-white shadow-md'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Show all
                                </button>
                                {ALPHABET.map(letter => {
                                    const hasBrands = lettersWithBrands.has(letter);
                                    const isActive = activeLetter === letter;
                                    return (
                                        <button
                                            key={letter}
                                            onClick={() => hasBrands && handleLetterClick(letter)}
                                            disabled={!hasBrands}
                                            className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-all ${isActive
                                                ? 'bg-neon-pink text-white shadow-md'
                                                : hasBrands
                                                    ? 'bg-slate-100 text-slate-700 hover:bg-neon-pink/10 hover:text-neon-pink cursor-pointer'
                                                    : 'text-slate-300 cursor-not-allowed'
                                                }`}
                                        >
                                            {letter}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Bar */}
                            <div className="relative max-w-md mx-auto">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Brands"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value) setActiveLetter(null);
                                    }}
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink transition-all"
                                />
                            </div>

                            {/* Grouped Brands List */}
                            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                                {visibleLetters.length === 0 && (
                                    <div className="text-center py-12 text-slate-400">
                                        No brands found matching your search.
                                    </div>
                                )}
                                {visibleLetters.map((letter) => {
                                    const letterBrands = groupedBrands[letter];
                                    if (!letterBrands || letterBrands.length === 0) return null;

                                    return (
                                        <div key={letter} className="border-b border-slate-50 last:border-b-0">
                                            {/* Letter Header */}
                                            <div className="px-6 py-4 bg-slate-50/70">
                                                <h2 className="text-2xl font-display font-bold text-slate-900">{letter}</h2>
                                            </div>
                                            {/* Brand Names */}
                                            <div className="divide-y divide-slate-50">
                                                {letterBrands.map((brand) => (
                                                    <Link
                                                        key={brand.id}
                                                        to={`/brands/${brand.slug}`}
                                                        className="block px-6 py-3.5 text-slate-700 hover:bg-neon-pink/5 hover:text-neon-pink transition-colors font-medium text-[15px] uppercase tracking-wide"
                                                    >
                                                        {brand.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default Brands;
