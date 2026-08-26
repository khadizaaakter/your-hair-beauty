import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    Heart,
    ShoppingBag,
    Menu,
    X,
    Phone,
    Truck,
    HelpCircle,
    Mail,
    Loader2,
    Coins,
    ChevronDown
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useCurrency } from '../../context/CurrencyContext';
import { api, type Product } from '../../lib/api';

const categories = [
    { name: 'About', href: '/about' },
    { name: 'Shop by Brand', href: '/brands' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Trending', href: '/trending' },
    { name: 'SALE', href: '/sale', highlight: true },
    { name: 'Contact', href: '/contact' },
];

const utilityLinks = [
    { name: 'Help', href: '/help', icon: HelpCircle },
    { name: 'Shipping', href: '/help#shipping', icon: Truck },
    { name: 'Contact', href: '/contact', icon: Mail },
];

interface NavbarProps {
    onCartClick?: () => void;
}

export function Navbar({ onCartClick }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef<HTMLFormElement>(null);
    const mobileSearchInputRef = useRef<HTMLInputElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const { itemCount: cartCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const { isAuthenticated, isAdmin, user } = useAuth();
    const { getSetting } = useSettings();
    const { currency, setCurrency, formatPrice } = useCurrency();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                setShowResults(true);
                api.products.list({ search: searchQuery, limit: 5 })
                    .then((res) => {
                        if (res.success && res.data) {
                            setSearchResults(res.data);
                        }
                    })
                    .catch(console.error)
                    .finally(() => setIsSearching(false));
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!isMobileSearchOpen) return;
        const timeout = window.setTimeout(() => {
            mobileSearchInputRef.current?.focus();
        }, 120);
        return () => window.clearTimeout(timeout);
    }, [isMobileSearchOpen]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
    }, [location.pathname, location.search]);

    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('mobile-menu-state-change', {
                detail: { isOpen: isMobileMenuOpen },
            })
        );
    }, [isMobileMenuOpen]);

    const headerText = getSetting('header_text', 'FREE UK DELIVERY ON ORDERS OVER GBP 50');
    const contactPhone = getSetting('contact_phone', '02083180999');
    const secondaryPhone = getSetting('contact_phone_secondary', '');
    const promoItems = headerText
        .split(/\s*\|\s*|\s*•\s*|\s{2,}/)
        .map((item) => item.trim())
        .filter(Boolean);
    const tickerItems = promoItems.length > 0 ? promoItems : [headerText];
    const duplicatedTickerItems = [...tickerItems, ...tickerItems];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowResults(false);
        setSearchQuery('');
    };

    const toggleMobileSearch = () => {
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen((prev) => !prev);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white/85 backdrop-blur-md shadow-sm' : 'bg-white'
            }`}
        >
            <div className="bg-neon-pink text-white text-xs py-2 tracking-wide overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center font-medium flex justify-between items-center gap-4">
                    <span className="hidden md:inline">Welcome to Your Hair and Beauty</span>
                    <div className="mx-auto md:mx-0 flex-1 overflow-hidden">
                        <div
                            className="flex min-w-max items-center whitespace-nowrap animate-marquee"
                            style={{ animationDuration: '18s' }}
                        >
                            {duplicatedTickerItems.map((item, index) => (
                                <span
                                    key={`${item}-${index}`}
                                    className="px-6 font-semibold uppercase tracking-wide"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <a
                            href={`tel:${contactPhone}`}
                            className="hover:text-white/80 transition-colors flex items-center gap-1"
                        >
                            <Phone className="w-3 h-3" />
                            {contactPhone}
                        </a>
                        {secondaryPhone && (
                            <a
                                href={`tel:${secondaryPhone}`}
                                className="hover:text-white/80 transition-colors"
                            >
                                {secondaryPhone}
                            </a>
                        )}
                        <Link to="/help" className="hover:text-white/80 transition-colors">
                            Help
                        </Link>
                    </div>
                </div>
            </div>

            <div className="border-b border-slate-100 relative bg-white z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4">
                    <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
                        <Link to="/" className="flex items-center gap-2 md:gap-3 min-w-0 flex-1 lg:flex-none overflow-hidden">
                            <img src="/logo.png" alt="Your Hair and Beauty" className="h-8 md:h-12 w-auto" />
                            <span className="hidden min-[460px]:inline text-base sm:text-lg md:text-xl font-display font-bold text-slate-900 truncate">
                                Your Hair <span className="text-neon-pink">&</span> Beauty
                            </span>
                            <span className="hidden min-[340px]:inline min-[460px]:hidden text-[13px] sm:text-sm font-display font-bold text-slate-900 truncate">
                                Your Hair <span className="text-neon-pink">&</span> Beauty
                            </span>
                        </Link>

                        <nav className="hidden lg:flex flex-1 min-w-0 items-center justify-start gap-3 xl:gap-5 overflow-x-auto scrollbar-hide pl-4 pr-2">
                            {categories.map((category) => {
                                const [path, query = ''] = category.href.split('?');
                                const isActive =
                                    location.pathname === path && (!query || location.search === `?${query}`);

                                return (
                                    <Link
                                        key={category.name}
                                        to={category.href}
                                        className={`text-[13px] xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                                            category.highlight
                                                ? 'text-neon-pink hover:text-pink-600'
                                                : isActive
                                                ? 'text-slate-900'
                                                : 'text-slate-600 hover:text-neon-pink'
                                        }`}
                                    >
                                        {category.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="hidden lg:flex items-center gap-3">
                            <form ref={searchRef} onSubmit={handleSearch} className="w-48 xl:w-56 relative group">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => {
                                        if (searchQuery.length >= 2) setShowResults(true);
                                    }}
                                    className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-4 pr-10 text-sm focus:ring-2 focus:ring-neon-pink/20 transition-all font-medium placeholder-slate-400"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-neon-pink transition-colors"
                                >
                                    {isSearching ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showResults && (searchResults.length > 0 || isSearching) && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[90]"
                                        >
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {searchResults.map((product) => (
                                                    <Link
                                                        key={product.id}
                                                        to={`/product/${product.id}`}
                                                        onClick={() => {
                                                            setShowResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                                            <img
                                                                src={product.images?.[0] || 'https://via.placeholder.com/100'}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-neon-pink font-bold">
                                                                {formatPrice(Number(product.sale_price || product.price))}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                ))}
                                                {isSearching && searchResults.length === 0 && (
                                                    <div className="p-4 text-center text-slate-500 text-sm">
                                                        Searching...
                                                    </div>
                                                )}
                                                {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                                                    <div className="p-4 text-center text-slate-500 text-sm">
                                                        No results found
                                                    </div>
                                                )}
                                            </div>
                                            {searchResults.length > 0 && (
                                                <button
                                                    onClick={() => {
                                                        navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
                                                        setShowResults(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full p-2 text-center text-xs font-bold text-neon-pink hover:bg-neon-pink/5 transition-colors border-t border-slate-100"
                                                >
                                                    View All Results
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>

                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value as any)}
                                className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-slate-300 transition-colors focus:ring-2 focus:ring-neon-pink/20"
                            >
                                <option value="GBP">GBP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>

                            <Link
                                to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
                                className="p-2 text-slate-700 hover:text-neon-pink transition-colors"
                            >
                                <User className="w-6 h-6" />
                            </Link>

                            <Link
                                to="/wishlist"
                                className="relative p-2 text-slate-700 hover:text-neon-pink transition-colors group"
                            >
                                <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-neon-pink text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={onCartClick}
                                className="relative p-2 text-slate-700 hover:text-neon-pink transition-colors group"
                            >
                                <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-neon-pink text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-0.5 sm:gap-1 lg:hidden shrink-0">
                            <button
                                onClick={toggleMobileSearch}
                                className="p-1.5 sm:p-2 text-slate-700"
                                aria-label="Open search"
                            >
                                <Search className="w-5 h-5" />
                            </button>

                            <div className="relative flex items-center rounded-lg border border-slate-200 bg-slate-50 px-1.5 sm:px-2 py-1 shrink-0">
                                <Coins className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as any)}
                                    className="bg-transparent text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer appearance-none border-none pr-4 w-[54px] sm:w-[66px]"
                                    aria-label="Currency selector"
                                >
                                    <option value="GBP">GBP</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="p-1.5 sm:p-2 text-slate-700"
                                aria-label="Open menu"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isMobileSearchOpen && (
                            <motion.form
                                onSubmit={handleSearch}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="lg:hidden pb-3"
                            >
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        ref={mobileSearchInputRef}
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neon-pink/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setIsMobileSearchOpen(false)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                                        aria-label="Close search"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] lg:hidden"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-full max-w-[360px] bg-white z-[80] lg:hidden shadow-2xl flex flex-col"
                            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                                    <img src="/logo.png" alt="Your Hair and Beauty" className="h-8 w-auto" />
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-slate-500 hover:text-neon-pink transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="p-4 space-y-6">
                                    <form
                                        onSubmit={(e) => {
                                            handleSearch(e);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="search-bar w-full"
                                    >
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search products..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-slate-100 border-none rounded-full py-2.5 pl-4 pr-10 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-neon-pink/20"
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </form>

                                    <nav className="space-y-1">
                                        <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            Menu
                                        </p>
                                        {categories.map((category) => (
                                            <Link
                                                key={category.name}
                                                to={category.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center justify-between py-3 px-4 rounded-xl font-medium transition-all ${
                                                    category.highlight
                                                        ? 'text-neon-pink bg-neon-pink/5'
                                                        : 'text-slate-700 hover:bg-slate-50 hover:text-neon-pink'
                                                }`}
                                            >
                                                <span>{category.name}</span>
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
                                        {utilityLinks.map((link) => (
                                            <Link
                                                key={link.name}
                                                to={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-600 hover:text-neon-pink hover:bg-neon-pink/5 transition-all text-center"
                                            >
                                                <link.icon className="w-5 h-5" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                                    {link.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100">
                                {isAuthenticated ? (
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-neon-pink/10 flex items-center justify-center text-neon-pink shrink-0">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <p className="text-sm font-bold text-slate-900 break-words leading-5">
                                                {user?.name}
                                            </p>
                                            <Link
                                                to={isAdmin ? '/admin' : '/dashboard'}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="mt-1 inline-block text-xs text-neon-pink hover:underline"
                                            >
                                                My Account
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="btn-primary w-full justify-center shadow-lg shadow-neon-pink/20"
                                    >
                                        Login / Register
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Navbar;
