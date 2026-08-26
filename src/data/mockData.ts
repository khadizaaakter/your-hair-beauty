// Product Types
export interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    salePrice?: number;
    image: string;
    category: string;
    subcategory?: string;
    badge?: 'new' | 'sale' | 'bestseller';
    inStock: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    subcategories?: string[];
}

export interface Brand {
    id: string;
    name: string;
    logo: string;
}

// Mock Products Data
export const products: Product[] = [
    {
        id: '1',
        name: 'Wonder Lace Bond Supreme',
        brand: 'Ebin New York',
        price: 15.99,
        image: '/images/products/ebin-wonder-lace-bond-supreme.png',
        category: 'Hair Care',
        subcategory: 'Adhesives',
        badge: 'bestseller',
        inStock: true,
    },
    {
        id: '2',
        name: 'Aqua Hair Wax Bright White',
        brand: 'RedOne',
        price: 9.99,
        image: '/images/products/redone-aqua-hair-wax-white.png',
        category: 'Hair Care',
        subcategory: 'Styling',
        badge: 'new',
        inStock: true,
    },
    {
        id: '3',
        name: 'Aqua Hair Gel Wax Black',
        brand: 'RedOne',
        price: 9.99,
        image: '/images/products/redone-aqua-hair-gel-wax-black.png',
        category: 'Hair Care',
        subcategory: 'Styling',
        inStock: true,
    },
    {
        id: '4',
        name: 'Wonder Lace Bond Active',
        brand: 'Ebin New York',
        price: 14.99,
        image: '/images/products/ebin-wonder-lace-bond-active.png',
        category: 'Hair Care',
        subcategory: 'Adhesives',
        badge: 'sale',
        salePrice: 12.99,
        inStock: true,
    },
    {
        id: '5',
        name: 'Wonder Lace Melt Spray',
        brand: 'Ebin New York',
        price: 12.99,
        image: '/images/products/ebin-wonder-lace-melt-spray.png',
        category: 'Hair Care',
        subcategory: 'Finishing',
        inStock: true,
    },
    {
        id: '6',
        name: 'Rosemary Mint Strengthening Shampoo',
        brand: 'Mielle',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
        category: 'Hair Care',
        subcategory: 'Shampoo',
        badge: 'bestseller',
        inStock: true,
    },
    {
        id: '7',
        name: 'Honey & Ginger Edge Control',
        brand: 'Ebin New York',
        price: 8.99,
        salePrice: 6.99,
        image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=600&q=80',
        category: 'Hair Care',
        subcategory: 'Styling',
        badge: 'sale',
        inStock: true,
    },
    {
        id: '8',
        name: 'Mousse Def Texture Foam',
        brand: 'The Doux',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=600&q=80',
        category: 'Hair Care',
        subcategory: 'Styling',
        badge: 'new',
        inStock: true,
    },
    {
        id: '9',
        name: 'Brazilian Keratin Body Wave 22"',
        brand: 'SL Raw Virgin Hair',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
        category: 'Wigs',
        subcategory: 'Lace Front',
        badge: 'bestseller',
        inStock: true,
    },
    {
        id: '10',
        name: 'Vitamin C Brightening Serum',
        brand: 'SheaMoisture',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
        category: 'Skincare',
        subcategory: 'Serums',
        inStock: true,
    },
    {
        id: '11',
        name: 'Ultra Black Permanent Hair Color',
        brand: 'Dark & Lovely',
        price: 7.99,
        salePrice: 5.99,
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80',
        category: 'Hair Color',
        subcategory: 'Permanent',
        badge: 'sale',
        inStock: true,
    },
    {
        id: '12',
        name: 'Jamaican Black Castor Oil',
        brand: 'Sunny Isle',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
        category: 'Hair Care',
        subcategory: 'Oils',
        badge: 'bestseller',
        inStock: true,
    },
    {
        id: '13',
        name: 'Deep Conditioning Hair Mask',
        brand: 'Cantu',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
        subcategory: 'Treatments',
        badge: 'new',
        inStock: true,
    },
    {
        id: '14',
        name: 'HD Lace Frontal Wig 20"',
        brand: 'Beauty Forever',
        price: 159.99,
        salePrice: 129.99,
        image: 'https://images.unsplash.com/photo-1595470607449-a17d443472b6?auto=format&fit=crop&w=800&q=80',
        category: 'Wigs',
        subcategory: 'HD Lace',
        badge: 'sale',
        inStock: true,
    },
    {
        id: '15',
        name: 'Argan Oil Leave-In Conditioner',
        brand: 'OGX',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
        subcategory: 'Conditioners',
        inStock: true,
    },
    {
        id: '16',
        name: 'Santal 33 Eau de Parfum',
        brand: 'Le Labo',
        price: 180.00,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        category: 'Fragrance',
        subcategory: 'Perfume',
        badge: 'bestseller',
        inStock: true,
    },
    {
        id: '17',
        name: 'Hydrating Body Lotion',
        brand: 'Sanctuary Spa',
        price: 12.50,
        image: 'https://images.unsplash.com/photo-1556228578-0d85ec1a585f?auto=format&fit=crop&w=800&q=80',
        category: 'Body Care',
        subcategory: 'Lotion',
        inStock: true,
    },
    {
        id: '18',
        name: 'Matte Liquid Lipstick',
        brand: 'Fenty Beauty',
        price: 24.00,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        category: 'Makeup',
        subcategory: 'Lips',
        badge: 'new',
        inStock: true,
    },
    {
        id: '19',
        name: 'Sleep & Wellness Bath Soak',
        brand: 'Sanctuary Spa',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80',
        category: 'Wellness',
        subcategory: 'Bath',
        inStock: true,
    },
    {
        id: '20',
        name: 'Tea Tree Special Shampoo',
        brand: 'Paul Mitchell',
        price: 18.99,
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
        subcategory: 'Shampoo',
        inStock: true,
    },
    {
        id: '21',
        name: 'Silk Pillowcase for Hair',
        brand: 'Slip',
        price: 89.00,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        category: 'Accessories',
        subcategory: 'Bedding',
        inStock: true,
    },
    {
        id: '22',
        name: 'Edge Booster Strong Hold',
        brand: 'Style Factor',
        price: 11.49,
        image: 'https://images.unsplash.com/photo-1595470607449-a17d443472b6?auto=format&fit=crop&w=800&q=80',
        category: 'Hair Care',
        subcategory: 'Styling',
        inStock: true,
    },
];

// Categories
export const categories: Category[] = [
    {
        id: '1',
        name: 'Hair Care',
        slug: 'hair-care',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
        subcategories: ['Shampoo', 'Conditioner', 'Treatments', 'Oils', 'Styling', 'Finishing', 'Hair Gel'],
    },
    {
        id: '2',
        name: 'Wigs',
        slug: 'wigs',
        image: 'https://images.unsplash.com/photo-1595454223600-91fbea0f3b76?w=600&q=80',
        subcategories: ['Lace Front', 'HD Lace', 'Closure', 'Headband Wigs'],
    },
    {
        id: '3',
        name: 'Hair Extensions',
        slug: 'hair-extensions',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
        subcategories: ['Clip-ins', 'Tape-ins', 'Wefts', 'Ponytails', 'I-Tips'],
    },
    {
        id: '4',
        name: 'Braids & Crochet',
        slug: 'braids-crochet',
        image: 'https://images.unsplash.com/photo-1605259560340-42468d6f6e3c?w=600&q=80',
        subcategories: ['Braiding Hair', 'Crochet Braids', 'Pre-Stretched', 'Locs'],
    },
    {
        id: '5',
        name: 'Hair Color',
        slug: 'hair-color',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80',
        subcategories: ['Permanent', 'Semi-Permanent', 'Developer', 'Bleach'],
    },
    {
        id: '6',
        name: 'Electrical',
        slug: 'electrical',
        image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80',
        subcategories: ['Hair Dryers', 'Straighteners', 'Curlers', 'Clippers'],
    },
    {
        id: '7',
        name: 'Accessories',
        slug: 'accessories',
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&q=80',
        subcategories: ['Brushes & Combs', 'Hair Tools', 'Caps & Bonnets', 'Mirrors'],
    },
    {
        id: '8',
        name: 'Skincare',
        slug: 'skincare',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
        subcategories: ['Cleansers', 'Serums', 'Moisturizers', 'Masks'],
    },
    {
        id: '9',
        name: 'Body Care',
        slug: 'body-care',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=600&q=80',
        subcategories: ['Lotion', 'Wash', 'Scrub', 'Oil'],
    },
    {
        id: '10',
        name: 'Fragrance',
        slug: 'fragrance',
        image: 'https://images.unsplash.com/photo-1547881338-64950a493f24?w=600&q=80',
        subcategories: ['Perfume', 'Body Mist', 'Cologne'],
    },
    {
        id: '11',
        name: 'Makeup',
        slug: 'makeup',
        image: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=600&q=80',
        subcategories: ['Face', 'Eyes', 'Lips', 'Brushes'],
    },
    {
        id: '12',
        name: 'Wellness',
        slug: 'wellness',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=80',
        subcategories: ['Supplements', 'Aromatherapy', 'Bath'],
    },
    {
        id: '13',
        name: 'Kids',
        slug: 'kids',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?w=600&q=80',
        subcategories: ['Hair Care', 'Styling', 'Accessories'],
    },
    {
        id: '14',
        name: 'Men’s',
        slug: 'mens',
        image: 'https://images.unsplash.com/photo-1621607512214-6829e9399cc7?w=600&q=80',
        subcategories: ['Hair Care', 'Styling', 'Beard Care', 'Shaving'],
    },
    {
        id: '15',
        name: 'Barber',
        slug: 'barber',
        image: 'https://images.unsplash.com/photo-1503951914205-b2a608ae7c1b?w=600&q=80',
        subcategories: ['Clippers & Trimmers', 'Shears', 'Capes', 'Shaving Products'],
    },
];

// Brands for Marquee
// Brands for Marquee
export const brands: Brand[] = [
    { id: '1', name: 'X-Pression', logo: 'https://cdn.brandfetch.io/outre.com/logo' },
    { id: '2', name: 'SheaMoisture', logo: 'https://cdn.brandfetch.io/sheamoisture.com/logo' },
    { id: '3', name: 'Camille Rose', logo: 'https://cdn.brandfetch.io/camillerose.com/logo' },
    { id: '4', name: 'CHI', logo: 'https://cdn.brandfetch.io/chi.com/logo' },
    { id: '5', name: 'KeraCare', logo: 'https://cdn.brandfetch.io/keracare.com/logo' },
    { id: '6', name: 'Difeel', logo: 'https://cdn.brandfetch.io/difeel.com/logo' },
    { id: '7', name: 'Creme of Nature', logo: 'https://cdn.brandfetch.io/cremeofnature.com/logo' },
    { id: '8', name: 'AS I AM', logo: 'https://cdn.brandfetch.io/asiamnaturally.com/logo' },
    { id: '9', name: 'Palmers', logo: 'https://cdn.brandfetch.io/palmers.com/logo' },
    { id: '10', name: 'Cantu', logo: 'https://cdn.brandfetch.io/cantubeauty.com/logo' },
    { id: '11', name: 'ORS', logo: 'https://cdn.brandfetch.io/orshaircare.com/logo' },
];

// Hero Slides
export const heroSlides = [
    {
        id: 1,
        title: 'Moroccanoil Collection',
        subtitle: 'Experience the power of argan oil for silky, shiny hair.',
        cta: 'Shop Moroccanoil',
        image: '/images/hero/hero-moroccanoil.png',
        link: '/shop?brand=Moroccanoil',
    },
    {
        id: 2,
        title: 'Olaplex Hair Repair',
        subtitle: 'The original bond builder for stronger, healthier hair.',
        cta: 'Shop Olaplex',
        image: '/images/hero/hero-olaplex.png',
        link: '/shop?brand=Olaplex',
    },
    {
        id: 3,
        title: 'The Doux Styling',
        subtitle: 'Professional quality texture for every curl type.',
        cta: 'Shop The Doux',
        image: '/images/hero/hero-thedoux.jpg',
        link: '/shop?brand=The+Doux',
    },
    {
        id: 4,
        title: 'Creme of Nature',
        subtitle: 'Certified natural ingredients for healthy, beautiful hair.',
        cta: 'Shop Creme of Nature',
        image: '/images/hero/hero-creme-of-nature.jpg',
        link: '/shop?brand=Creme+of+Nature',
    },
];

// Blog Posts
export const blogPosts = [
    {
        id: '1',
        title: '10 Tips for Healthy Natural Hair',
        excerpt: 'Discover the secrets to maintaining gorgeous, healthy natural hair all year round.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
        date: '2024-01-15',
        category: 'Hair Care',
    },
    {
        id: '2',
        title: 'The Ultimate Skincare Routine',
        excerpt: 'Build the perfect morning and evening skincare routine for glowing skin.',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600',
        date: '2024-01-10',
        category: 'Skincare',
    },
    {
        id: '3',
        title: 'Wig Styling 101: Expert Tips',
        excerpt: 'Learn how to style, maintain, and store your wigs like a professional.',
        image: 'https://images.unsplash.com/photo-1595454223600-91fbea0f3b76?w=600',
        date: '2024-01-05',
        category: 'Wigs',
    },
];

// Helper functions
export const getProductsByCategory = (category: string) =>
    products.filter(p => p.category.toLowerCase() === category.toLowerCase());

export const getNewArrivals = () =>
    products.filter(p => p.badge === 'new');

export const getBestSellers = () =>
    products.filter(p => p.badge === 'bestseller');

export const getSaleProducts = () =>
    products.filter(p => p.badge === 'sale' || p.salePrice);
