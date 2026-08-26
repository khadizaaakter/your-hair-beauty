// Imports remain the same
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type HeroSlider } from '../../lib/api';

export function HeroCarousel() {
    const [slides, setSlides] = useState<HeroSlider[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch hero sliders from API - no mock data
    useEffect(() => {
        api.heroSliders.list()
            .then(response => {
                if (response.success && response.data && response.data.length > 0) {
                    setSlides(response.data);
                }
            })
            .catch(() => {
                // No fallback - just show empty state
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Auto-advance slides
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    if (isLoading || slides.length === 0) {
        return (
            <section className="relative h-[340px] sm:h-[420px] lg:h-[600px] bg-gradient-to-r from-pink-50 to-purple-50 animate-pulse rounded-2xl overflow-hidden" />
        );
    }

    const slide = slides[currentSlide];

    return (
        <section className="relative h-[340px] sm:h-[420px] lg:h-[600px] overflow-hidden rounded-2xl shadow-card group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                    {/* Content */}
                    <div className="relative h-full flex items-center px-5 sm:px-8 md:px-16">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="max-w-[18rem] sm:max-w-lg text-left"
                        >
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-3 sm:mb-4 leading-tight drop-shadow-lg">
                                {slide.title}
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-5 sm:mb-8 font-light drop-shadow-md line-clamp-3 sm:line-clamp-none">
                                {slide.description}
                            </p>
                            <Link to={slide.button_link || '/shop'}>
                                <motion.button
                                    className="bg-neon-pink text-white font-semibold text-base px-7 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-neon-pink/50 hover:bg-neon-pink/90 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {slide.button_text || 'Shop Now'}
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100 hidden sm:flex"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors opacity-0 group-hover:opacity-100 hidden sm:flex"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-neon-pink w-8'
                                : 'bg-white/50 w-2 hover:bg-white'
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default HeroCarousel;
