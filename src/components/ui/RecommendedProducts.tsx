import { useState, useEffect } from 'react';
import { api, type Product } from '../../lib/api';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';

interface RecommendedProductsProps {
    title?: string;
    limit?: number;
    columns?: 2 | 3 | 4;
}

export function RecommendedProducts({ title = "Recommended for You", limit = 4, columns = 2 }: RecommendedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Fetch popular/new products
        api.products.list({ limit, sort: 'newest' })
            .then(response => {
                if (response.success && response.data) {
                    setProducts(response.data);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [limit]);

    if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-neon-pink" /></div>;
    if (products.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' :
                    columns === 3 ? 'grid-cols-2 md:grid-cols-3' :
                        'grid-cols-2 md:grid-cols-4'
                }`}>
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                ))}
            </div>
        </div>
    );
}
