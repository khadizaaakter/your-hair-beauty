import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MouseFollower } from '../ui/MouseFollower';
import { NeonButton } from '../ui/NeonButton';

export function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut' as const,
            },
        },
    };

    return (
        <section
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-ash/90 via-ash/80 to-ash" />
                <div className="absolute inset-0 bg-gradient-to-r from-ash/80 via-transparent to-ash/80" />
            </div>

            {/* Mouse Follower Light Effect */}
            <MouseFollower containerRef={heroRef} />

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute bottom-1/4 -right-20 w-80 h-80 bg-neon-pink/5 rounded-full blur-3xl"
                    animate={{
                        x: [0, -30, 0],
                        y: [0, 20, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Badge */}
                <motion.div variants={itemVariants} className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-sm font-medium">
                        <Sparkles className="w-4 h-4" />
                        Premium Hair & Beauty
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight"
                >
                    <span className="text-gray-300">Elevate Your</span>
                    <br />
                    <span className="relative inline-block">
                        <span className="text-white">Natural </span>
                        <span className="text-neon-pink neon-text">Beauty</span>
                        <motion.span
                            className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-pink to-transparent"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        />
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
                >
                    Discover our curated collection of premium hair care and beauty products,
                    crafted for those who demand excellence.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link to="/shop">
                        <NeonButton variant="primary" size="lg" shimmer>
                            Shop Now
                            <ArrowRight className="inline ml-2 w-5 h-5" />
                        </NeonButton>
                    </Link>
                    <Link to="/about">
                        <NeonButton variant="outline" size="lg">
                            Our Story
                        </NeonButton>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    variants={itemVariants}
                    className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto"
                >
                    {[
                        { value: '500+', label: 'Products' },
                        { value: '50K+', label: 'Customers' },
                        { value: '4.9', label: 'Rating' },
                    ].map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1.5 h-1.5 bg-neon-pink rounded-full"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
}

export default Hero;
