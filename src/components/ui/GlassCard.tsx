import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    variant?: 'default' | 'sm' | 'interactive';
    glowOnHover?: boolean;
    className?: string;
}

export function GlassCard({
    children,
    variant = 'default',
    glowOnHover = false,
    className = '',
    ...motionProps
}: GlassCardProps) {
    const baseClasses = 'border border-white/10 transition-all duration-300';

    const variantClasses = {
        default: 'backdrop-blur-xl bg-white/5 rounded-2xl p-6',
        sm: 'backdrop-blur-md bg-white/5 rounded-lg p-4',
        interactive: 'backdrop-blur-xl bg-white/5 rounded-2xl p-6 cursor-pointer',
    };

    const hoverClasses = glowOnHover
        ? 'hover:border-neon-pink/50 hover:shadow-neon-pink-sm'
        : 'hover:bg-white/10';

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
            whileHover={variant === 'interactive' ? { scale: 1.02, y: -5 } : undefined}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}

export default GlassCard;
