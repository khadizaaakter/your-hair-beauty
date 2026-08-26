import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, type Product } from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const searchProducts = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await api.products.list({ search: query, limit: 5 });
                if (response.success && response.data) {
                    setResults(response.data);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
            onClose();
            setQuery('');
        }
    };

    const handleProductClick = (id: number) => {
        navigate(`/product/${id}`);
        onClose();
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-0 right-0 z-[61] bg-white p-4 shadow-xl rounded-b-2xl"
                    >
                        <form onSubmit={handleSubmit} className="relative mb-4">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search for products..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-xl py-3 pl-10 pr-10 text-base focus:ring-2 focus:ring-neon-pink/20"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-200 rounded-full text-slate-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    Cancel
                                </button>
                            )}
                        </form>

                        {/* Quick Results */}
                        {query.length >= 2 && (
                            <div className="space-y-2">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-4 text-slate-400">
                                        <Loader className="w-5 h-5 animate-spin mr-2" />
                                        Searching...
                                    </div>
                                ) : results.length > 0 ? (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Top Results</p>
                                        {results.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleProductClick(product.id)}
                                                className="flex items-center gap-3 w-full p-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                            >
                                                <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden shrink-0">
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                                                    <p className="text-xs text-neon-pink font-bold">{formatPrice(Number(product.sale_price || product.price || 0))}</p>
                                                </div>
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full py-3 mt-2 text-sm font-medium text-neon-pink bg-neon-pink/5 rounded-xl hover:bg-neon-pink/10 transition-colors"
                                        >
                                            View all results for "{query}"
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        No products found for "{query}"
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
