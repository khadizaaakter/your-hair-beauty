import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Truck, Shield, ArrowRight } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: Star,
        title: 'Premium Quality',
        description: 'Only the finest ingredients and formulations for your hair and skin.',
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: 'Free next-day delivery on orders over £50. Worldwide shipping available.',
    },
    {
        icon: Shield,
        title: '100% Authentic',
        description: 'All products are genuine and sourced directly from brands.',
    },
];

const testimonials = [
    {
        name: 'Sarah M.',
        rating: 5,
        text: "The Silk Repair Serum transformed my damaged hair. Can't recommend enough!",
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    },
    {
        name: 'Emma L.',
        rating: 5,
        text: 'Amazing quality products and the delivery was super fast. Love this store!',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    },
    {
        name: 'Jessica T.',
        rating: 5,
        text: 'Finally found a brand that works for my hair type. The results are incredible.',
        image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    },
];

export function Features() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 bg-ash-950/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <GlassCard className="h-full text-center" glowOnHover>
                                <div className="w-14 h-14 mx-auto mb-6 rounded-xl bg-neon-pink/10 flex items-center justify-center">
                                    <feature.icon className="w-7 h-7 text-neon-pink" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400">{feature.description}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function Testimonials() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24 relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    className="text-center mb-16"
                >
                    <span className="text-neon-pink text-sm font-semibold uppercase tracking-widest">
                        Testimonials
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mt-4">
                        What Our Customers Say
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            <GlassCard className="h-full">
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-neon-pink text-neon-pink" />
                                    ))}
                                </div>

                                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-neon-pink/30"
                                    />
                                    <span className="font-medium text-white">{testimonial.name}</span>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function CTA() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-3xl overflow-hidden"
                >
                    {/* Background */}
                    <div className="absolute inset-0">
                        <img
                            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                            alt="Beauty Products"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-ash/95 via-ash/80 to-ash/60" />
                    </div>

                    {/* Content */}
                    <div className="relative py-20 px-8 md:px-16 max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ delay: 0.2 }}
                            className="text-neon-pink text-sm font-semibold uppercase tracking-widest"
                        >
                            Limited Time Offer
                        </motion.span>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl font-display font-bold text-white mt-4 mb-6"
                        >
                            Get 20% Off Your First Order
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-300 text-lg mb-8"
                        >
                            Sign up to our newsletter and receive an exclusive discount code
                            for your first purchase. Plus, get early access to new arrivals!
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Link to="/shop">
                                <NeonButton variant="primary" size="lg" shimmer>
                                    Shop Now
                                    <ArrowRight className="inline ml-2 w-5 h-5" />
                                </NeonButton>
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
