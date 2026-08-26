import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function SpecialCollection() {
    return (
        <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Main Feature - Large Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-3xl overflow-hidden group h-[500px] lg:row-span-2"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
                            alt="Summer Collection"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-8">
                            <span className="inline-block px-4 py-1 bg-neon-pink text-white text-xs font-semibold rounded-full mb-4">
                                FEATURED COLLECTION
                            </span>
                            <h3 className="text-3xl lg:text-4xl font-display font-bold text-white mb-3">
                                Summer Glow Collection
                            </h3>
                            <p className="text-white/80 mb-6 max-w-md">
                                Discover our hand-picked selection of must-have products for the perfect summer look.
                            </p>
                            <Link
                                to="/shop?collection=summer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-neon-pink hover:text-white transition-colors"
                            >
                                Shop Collection
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Top Right Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-2xl overflow-hidden group h-60"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1595470607449-a17d443472b6?auto=format&fit=crop&w=800&q=80"
                            alt="Wig Essentials"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/80 to-transparent" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-center">
                            <span className="text-white/80 text-sm font-medium mb-1">NEW IN</span>
                            <h4 className="text-xl font-display font-bold text-white mb-3">
                                Wig Essentials
                            </h4>
                            <Link
                                to="/shop/wigs"
                                className="inline-flex items-center gap-1 text-white font-medium text-sm hover:underline"
                            >
                                Shop Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Bottom Right Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative rounded-2xl overflow-hidden group h-60"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80"
                            alt="Skincare Routine"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-slate-900/80 to-transparent" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-center items-end text-right">
                            <span className="text-emerald-400 text-sm font-medium mb-1">30% OFF</span>
                            <h4 className="text-xl font-display font-bold text-white mb-3">
                                Skincare Bundles
                            </h4>
                            <Link
                                to="/shop/skincare"
                                className="inline-flex items-center gap-1 text-white font-medium text-sm hover:underline"
                            >
                                Shop Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default SpecialCollection;
