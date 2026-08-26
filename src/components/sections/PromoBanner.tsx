import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function PromoBanner() {
    return (
        <section className="py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Banner - Wigs Collection */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden group h-64 md:h-80"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
                            alt="Wigs Collection"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-center">
                            <span className="text-neon-pink text-sm font-semibold uppercase tracking-widest mb-2">
                                Premium Collection
                            </span>
                            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                Luxury Wigs
                            </h3>
                            <Link
                                to="/shop/wigs"
                                className="inline-flex items-center gap-2 text-white font-medium hover:text-neon-pink transition-colors"
                            >
                                Shop Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Banner - Hair Care */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden group h-64 md:h-80"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80"
                            alt="Hair Care"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-neon-pink/80 to-transparent" />
                        <div className="absolute inset-0 p-8 flex flex-col justify-center items-end text-right">
                            <span className="text-white text-sm font-semibold uppercase tracking-widest mb-2">
                                Up to 40% Off
                            </span>
                            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                                Hair Care Essentials
                            </h3>
                            <Link
                                to="/shop?filter=sale"
                                className="inline-flex items-center gap-2 text-white font-medium hover:text-slate-200 transition-colors"
                            >
                                Shop Sale <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default PromoBanner;
