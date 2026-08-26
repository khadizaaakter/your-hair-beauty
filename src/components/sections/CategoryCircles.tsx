import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Category } from '../../lib/api';

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
};

export function CategoryCircles() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.categories.list()
            .then(response => {
                if (response.success) {
                    setCategories(response.data || []);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth / 2
                : scrollLeft + clientWidth / 2;

            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <section className="py-12 px-4 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-3 gap-5 sm:grid-cols-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse flex flex-col items-center">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-100" />
                                <div className="h-3 w-16 mx-auto mt-3 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4 bg-white relative group">
            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-8">
                    <h2 className="section-title mb-2">Shop by Category</h2>
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 md:hidden">
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <Link to={`/shop?category=${category.slug}`} className="group block text-center">
                                <motion.div
                                    className="mx-auto mb-3 h-20 w-20 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-neon-pink transition-colors relative"
                                    whileHover={{ scale: 1.03 }}
                                >
                                    <img
                                        src={category.image || 'https://via.placeholder.com/200'}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </motion.div>
                                <p className="text-xs font-semibold leading-tight text-slate-900 group-hover:text-neon-pink transition-colors px-1 break-words min-h-[2rem]">
                                    {category.name}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-neon-pink hidden md:flex"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity hover:text-neon-pink hidden md:flex"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                <div
                    ref={scrollRef}
                    className="hidden md:flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x scroll-smooth px-4 touch-pan-x"
                >
                    {categories.map((category) => (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="flex-shrink-0 snap-center"
                        >
                            <Link to={`/shop?category=${category.slug}`} className="group block text-center w-28">
                                <motion.div
                                    className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 border-2 border-slate-100 group-hover:border-neon-pink transition-colors relative"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <img
                                        src={category.image || 'https://via.placeholder.com/200'}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                </motion.div>
                                <p className="text-sm font-semibold text-slate-900 group-hover:text-neon-pink transition-colors truncate px-1">
                                    {category.name}
                                </p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategoryCircles;
