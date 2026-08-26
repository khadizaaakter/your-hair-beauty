import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    shimmer?: boolean;
    className?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: () => void;
}

export function NeonButton({
    children,
    variant = 'primary',
    size = 'md',
    shimmer = false,
    className = '',
    disabled = false,
    type = 'button',
    onClick,
}: NeonButtonProps) {
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    const variantClasses = {
        primary: 'bg-neon-pink text-white border-transparent hover:bg-neon-pink-600 hover:shadow-neon-pink',
        outline: 'bg-transparent text-neon-pink border-neon-pink hover:bg-neon-pink/10 hover:shadow-neon-pink-sm',
        ghost: 'bg-transparent text-white border-transparent hover:bg-white/5 hover:text-neon-pink',
    };

    const flickerVariants = {
        hover: {
            textShadow: [
                '0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff1493, 0 0 40px #ff1493',
                '0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff1493',
                '0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff1493, 0 0 40px #ff1493, 0 0 80px #ff1493',
                '0 0 4px #fff',
                '0 0 4px #fff, 0 0 11px #fff, 0 0 19px #ff1493, 0 0 40px #ff1493',
            ],
            boxShadow: variant === 'outline'
                ? [
                    '0 0 5px #ff1493, 0 0 10px #ff1493',
                    '0 0 5px #ff1493',
                    '0 0 5px #ff1493, 0 0 20px #ff1493, 0 0 30px #ff1493',
                    '0 0 2px #ff1493',
                    '0 0 5px #ff1493, 0 0 10px #ff1493',
                ]
                : undefined,
            transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatType: 'reverse' as const,
            },
        },
    };

    return (
        <motion.button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
                relative font-medium border-2 rounded-lg overflow-hidden
                transition-colors duration-200
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${shimmer ? 'shimmer-btn' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            whileHover={disabled ? undefined : "hover"}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            variants={flickerVariants}
        >
            {shimmer && (
                <span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                    style={{ backgroundSize: '200% 100%' }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </motion.button>
    );
}

export default NeonButton;
