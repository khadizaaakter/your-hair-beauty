import { motion } from 'framer-motion';

// Product Card Skeleton
export function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            {/* Image skeleton */}
            <div className="aspect-square skeleton" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Brand */}
                <div className="h-3 w-16 skeleton rounded" />
                {/* Title */}
                <div className="h-4 w-full skeleton rounded" />
                <div className="h-4 w-2/3 skeleton rounded" />
                {/* Rating */}
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 skeleton rounded" />
                    ))}
                </div>
                {/* Price */}
                <div className="h-5 w-20 skeleton rounded" />
            </div>
        </div>
    );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <ProductCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}

// Category Circle Skeleton
export function CategoryCircleSkeleton() {
    return (
        <div className="text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full skeleton mx-auto mb-3" />
            <div className="h-4 w-16 skeleton rounded mx-auto" />
        </div>
    );
}

// Hero Skeleton
export function HeroSkeleton() {
    return (
        <div className="relative h-[60vh] md:h-[80vh] overflow-hidden">
            <div className="absolute inset-0 skeleton" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent" />
            <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
                <div className="max-w-xl space-y-4">
                    <div className="h-12 w-3/4 skeleton rounded-lg" />
                    <div className="h-6 w-full skeleton rounded" />
                    <div className="h-6 w-2/3 skeleton rounded" />
                    <div className="h-12 w-40 skeleton rounded-lg mt-6" />
                </div>
            </div>
        </div>
    );
}

// Table Row Skeleton
export function TableRowSkeleton() {
    return (
        <tr className="border-b border-slate-50">
            <td className="py-4 px-6"><div className="h-4 w-48 skeleton rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-24 skeleton rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-16 skeleton rounded" /></td>
            <td className="py-4 px-6"><div className="h-4 w-12 skeleton rounded" /></td>
            <td className="py-4 px-6"><div className="h-6 w-20 skeleton rounded-full" /></td>
            <td className="py-4 px-6">
                <div className="flex gap-2">
                    <div className="w-8 h-8 skeleton rounded" />
                    <div className="w-8 h-8 skeleton rounded" />
                </div>
            </td>
        </tr>
    );
}

// Stat Card Skeleton
export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-card">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="h-4 w-24 skeleton rounded" />
                    <div className="h-8 w-32 skeleton rounded" />
                    <div className="h-4 w-40 skeleton rounded" />
                </div>
                <div className="w-12 h-12 skeleton rounded-xl" />
            </div>
        </div>
    );
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header skeleton */}
            <div className="bg-slate-50 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
                    <div className="h-10 w-64 skeleton rounded-lg mx-auto" />
                    <div className="h-5 w-96 skeleton rounded mx-auto" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <ProductGridSkeleton count={8} />
            </div>
        </div>
    );
}

export default ProductCardSkeleton;
