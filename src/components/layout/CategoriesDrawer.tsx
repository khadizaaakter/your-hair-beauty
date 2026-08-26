import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { api, type Category } from '../../lib/api';

export function CategoriesDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-categories-drawer', handleOpen);

        // Fetch categories when component mounts/drawer opens
        api.categories.list().then(response => {
            if (response.success && response.data) {
                setCategories(response.data);
            }
        });

        return () => window.removeEventListener('open-categories-drawer', handleOpen);
    }, []);

    const onClose = () => {
        setIsOpen(false);
        setTimeout(() => setActiveCategory(null), 300); // Reset after close animation
    };

    const handleCategoryClick = (category: Category) => {
        if (category.subcategories && category.subcategories.length > 0) {
            setActiveCategory(category);
        } else {
            navigate(`/shop?category=${category.slug}`);
            onClose();
        }
    };

    const handleSubcategoryClick = (subSlug: string) => {
        if (activeCategory) {
            navigate(`/shop?category=${activeCategory.slug}&subcategory=${subSlug}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 w-full max-w-[360px] bg-white z-[70] shadow-xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white">
                            {activeCategory ? (
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className="flex items-center text-slate-600 font-medium"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-1" />
                                    Back
                                </button>
                            ) : (
                                <span className="text-lg font-bold font-display text-slate-800">Categories</span>
                            )}
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {activeCategory ? (
                                <div className="p-2">
                                    <div className="mb-4 p-4 bg-slate-50 rounded-lg flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white">
                                            {activeCategory.image ? (
                                                <img src={activeCategory.image} alt={activeCategory.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200" />
                                            )}
                                        </div>
                                        <span className="font-bold text-slate-900">{activeCategory.name}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => {
                                                navigate(`/shop?category=${activeCategory.slug}`);
                                                onClose();
                                            }}
                                            className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-between"
                                        >
                                            View All {activeCategory.name}
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        </button>
                                        {activeCategory.subcategories?.map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => handleSubcategoryClick(sub.slug)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 text-slate-600 flex items-center justify-between"
                                            >
                                                {sub.name}
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {/* Shop by Brand (top of list) */}
                                    <button
                                        onClick={() => {
                                            navigate('/brands');
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-4 p-3 rounded-xl bg-neon-pink/5 hover:bg-neon-pink/10 transition-colors group border border-neon-pink/20"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-neon-pink/10 overflow-hidden shrink-0 border border-neon-pink/20">
                                            <img
                                                src="/images/shop-by-brand.jpeg"
                                                alt="Shop by Brand"
                                                className="w-full h-full object-cover"
                                                onError={(event) => {
                                                    const target = event.currentTarget as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    if (target.parentElement) {
                                                        target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                                        target.parentElement.textContent = 'SB';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <span className="flex-1 text-left font-semibold text-neon-pink">Shop by Brand</span>
                                        <ChevronRight className="w-5 h-5 text-neon-pink/50" />
                                    </button>

                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat)}
                                            className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:border-neon-pink transition-colors">
                                                {cat.image ? (
                                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-200" />
                                                )}
                                            </div>
                                            <span className="flex-1 text-left font-medium text-slate-700 group-hover:text-neon-pink transition-colors">{cat.name}</span>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-neon-pink transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

