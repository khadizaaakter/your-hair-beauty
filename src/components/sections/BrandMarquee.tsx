import { useEffect, useState } from 'react';
import { api, type Brand } from '../../lib/api';

export function BrandMarquee() {
    const [brands, setBrands] = useState<Brand[]>([]);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await api.brands.list();
                if (response.success && response.data) {
                    setBrands(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch brands:', error);
            }
        };

        fetchBrands();
    }, []);

    // If no brands, don't render section
    if (brands.length === 0) return null;

    // Duplicate brands for seamless loop (2 sets match the -50% translation)
    const duplicatedBrands = [...brands, ...brands];

    return (
        <section className="py-12 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-widest">
                    Trusted by Top Brands
                </p>
            </div>

            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

                <div
                    className="flex animate-marquee py-4"
                    style={{ animationDuration: typeof window !== 'undefined' && window.innerWidth < 768 ? '12s' : '18s' }}
                >
                    {duplicatedBrands.map((brand, index) => (
                        <div
                            key={`${brand.id}-${index}`}
                            className="flex-shrink-0 mx-8 md:mx-12 flex items-center justify-center transition-all duration-500 transform hover:scale-110"
                        >
                            {brand.logo ? (
                                <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="h-8 md:h-12 object-contain"
                                />
                            ) : (
                                <span className="text-xl md:text-2xl font-bold tracking-tighter whitespace-nowrap text-slate-800 dark:text-slate-200 uppercase italic">
                                    {brand.name}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default BrandMarquee;
