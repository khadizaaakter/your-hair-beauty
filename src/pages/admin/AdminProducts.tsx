import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Package,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type Product, type ProductInput, type Brand } from '../../lib/api';
import toast from 'react-hot-toast';
import { ImageUpload } from '../../components/common/ImageUpload';
import { RichTextEditor } from '../../components/common/RichTextEditor';
import { useCurrency } from '../../context/CurrencyContext';

// Categories will be fetched from API
type VariantType = 'Size' | 'Color' | 'Image';

interface ImageVariantOptionDraft {
    id: string;
    title: string;
    image: string;
}

interface VariantGroupDraft {
    id: string;
    type: VariantType;
    optionsText: string;
    imageOptions: ImageVariantOptionDraft[];
}

const VARIANT_TYPE_OPTIONS: VariantType[] = ['Size', 'Color', 'Image'];

const createVariantGroup = (type: VariantType = 'Size'): VariantGroupDraft => ({
    id: `variant-group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    optionsText: '',
    imageOptions: type === 'Image'
        ? [{ id: `img-opt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: '', image: '' }]
        : [],
});

const normalizeVariantType = (name?: string): VariantType => {
    const normalized = String(name || '').toLowerCase();
    if (normalized.includes('color') || normalized.includes('colour')) return 'Color';
    if (normalized.includes('image')) return 'Image';
    return 'Size';
};

const productSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    shortDescription: z.string().max(500, 'Short description must be under 500 characters').optional(),
    description: z.string().max(12000, 'Long description must be under 12000 characters').optional(),
    howToUse: z.string().max(3000, 'How to use must be under 3000 characters').optional(),
    ingredients: z.string().max(3000, 'Ingredients must be under 3000 characters').optional(),
    brandId: z.coerce.number().min(1, 'Brand is required'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    salePrice: z.union([z.number(), z.nan()]).optional(),
    category: z.string().min(2, 'Category is required'),
    subcategory: z.string().optional(),
    inStock: z.union([z.boolean(), z.string()]).transform(val => val === true || val === 'true'),
    mainImage: z.string().min(1, 'Main image is required'),
    additionalImages: z.array(z.string()).optional(),
    badge: z.enum(['new', 'sale', 'bestseller', '']).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export function AdminProducts() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamString = searchParams.toString();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string; slug: string; subcategories?: { id: number; name: string; slug: string }[] }[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [availableSubcategories, setAvailableSubcategories] = useState<{ id: number; name: string; slug: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [filterCategory, setFilterCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variantGroups, setVariantGroups] = useState<VariantGroupDraft[]>([]);
    const { formatPrice } = useCurrency();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            additionalImages: [],
        },
    });

    const { fields: additionalImageFields, append: appendAdditionalImage, remove: removeAdditionalImage } = useFieldArray({
        control,
        name: 'additionalImages'
    });

    // Watch category changes to update subcategories
    const selectedCategory = watch('category');
    const shortDescriptionValue = watch('shortDescription');

    useEffect(() => {
        if (selectedCategory) {
            const category = categories.find(c => c.slug === selectedCategory);
            setAvailableSubcategories(category?.subcategories || []);
        } else {
            setAvailableSubcategories([]);
        }
    }, [selectedCategory, categories]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    useEffect(() => {
        const nextSearch = searchParams.get('q') || '';
        setSearchQuery(nextSearch);
    }, [searchParamString]);

    const fetchCategories = async () => {
        try {
            const response = await api.categories.list();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await api.admin.brands.list();
            if (response.success && response.data) {
                setBrands(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch brands:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await api.products.list();
            if (response.success && response.data) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.brand_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !filterCategory || p.category_slug === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // Out of stock count
    const outOfStockCount = products.filter(p => !p.inStock).length;

    const updateVariantGroup = (groupId: string, updater: (group: VariantGroupDraft) => VariantGroupDraft) => {
        setVariantGroups((prev) => prev.map((group) => (group.id === groupId ? updater(group) : group)));
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setAvailableSubcategories([]);
        setVariantGroups([]);
        reset({
            name: '',
            shortDescription: '',
            description: '',
            howToUse: '',
            ingredients: '',
            brandId: 0,
            price: 0,
            salePrice: undefined,
            category: '',
            subcategory: '',
            inStock: true,
            mainImage: '',
            additionalImages: [],
            badge: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = async (product: Product) => {
        let sourceProduct: Product = product;

        try {
            const detailResponse = await api.products.get(product.id);
            if (detailResponse.success && detailResponse.data) {
                sourceProduct = detailResponse.data;
            }
        } catch (error) {
            console.error('Failed to fetch product details for editing, using list data fallback:', error);
        }

        setEditingProduct(sourceProduct);
        // Set subcategories for the product's category
        const category = categories.find(c => c.slug === sourceProduct.category_slug);
        setAvailableSubcategories(category?.subcategories || []);
        setValue('name', sourceProduct.name);
        setValue('shortDescription', sourceProduct.short_description || '');
        setValue('description', sourceProduct.description || '');
        setValue('howToUse', sourceProduct.how_to_use || '');
        setValue('ingredients', sourceProduct.ingredients || '');
        setValue('brandId', sourceProduct.brand_id || 0);
        setValue('price', sourceProduct.price);
        setValue('salePrice', sourceProduct.sale_price);
        setValue('category', sourceProduct.category_slug || '');
        setValue(
            'subcategory',
            (sourceProduct as any).subcategory ||
            (sourceProduct as any).subcategory_slug ||
            (product as any).subcategory ||
            (product as any).subcategory_slug ||
            ''
        );
        setValue('inStock', sourceProduct.inStock ?? sourceProduct.stock_quantity > 0);
        // Use first image as main and the rest as additional images
        const mainImage = sourceProduct.images && sourceProduct.images.length > 0 ? sourceProduct.images[0] : '';
        const additionalImages = sourceProduct.images && sourceProduct.images.length > 1 ? sourceProduct.images.slice(1) : [];
        setValue('mainImage', mainImage);
        setValue('additionalImages', additionalImages);
        setValue('badge', (sourceProduct.badge || '') as '' | 'new' | 'sale' | 'bestseller');

        if (sourceProduct.variants && sourceProduct.variants.length > 0) {
            const groupMap = new Map<VariantType, VariantGroupDraft>();

            sourceProduct.variants.forEach((variant) => {
                const type = normalizeVariantType(variant.name);
                const existing = groupMap.get(type) || createVariantGroup(type);

                if (type === 'Image') {
                    existing.imageOptions.push({
                        id: `img-opt-${variant.id || Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                        title: variant.value || '',
                        image: variant.image || '',
                    });
                } else {
                    const value = type === 'Color' ? (variant.color_code || variant.value) : variant.value;
                    if (value) {
                        existing.optionsText = existing.optionsText
                            ? `${existing.optionsText}, ${value}`
                            : value;
                    }
                }

                if (type === 'Image' && existing.imageOptions.length > 0) {
                    existing.imageOptions = existing.imageOptions.filter((opt) => opt.title || opt.image);
                }

                groupMap.set(type, existing);
            });

            setVariantGroups(Array.from(groupMap.values()).map((group) => ({
                ...group,
                optionsText: group.optionsText.trim(),
                imageOptions: group.type === 'Image'
                    ? (group.imageOptions.length > 0 ? group.imageOptions : [{ id: `img-opt-${Date.now()}`, title: '', image: '' }])
                    : [],
            })));
        } else {
            setVariantGroups([]);
        }

        setIsModalOpen(true);
    };

    const onSubmit = async (data: ProductFormData) => {
        setIsSubmitting(true);
        try {
            // Handle optional salePrice (NaN from empty numeric input)
            const cleanSalePrice = (typeof data.salePrice === 'number' && !isNaN(data.salePrice)) ? data.salePrice : null;

            // Automatic badge: if sale price is lower than regular price, set to 'sale'
            // Otherwise use the selected badge
            let effectiveBadge: 'new' | 'sale' | 'bestseller' | null = (data.badge === '' ? null : data.badge as any);
            if (cleanSalePrice && cleanSalePrice < data.price) {
                effectiveBadge = 'sale';
            }

            const category = categories.find(c => c.slug === data.category);
            const categoryId = category ? category.id : undefined;

            // Find subcategory ID if selected
            let subcategoryId: number | undefined;
            if (data.subcategory) {
                const sub = availableSubcategories.find(s => s.slug === data.subcategory);
                if (sub) subcategoryId = sub.id;
            }

            const normalizedImages = [data.mainImage, ...(data.additionalImages || [])]
                .map((url) => url?.trim())
                .filter((url): url is string => Boolean(url));

            const uniqueImages = normalizedImages.filter((url, index) => normalizedImages.indexOf(url) === index);

            let parsedVariants: ProductInput['variants'] = [];

            const normalizedGroups = variantGroups
                .map((group) => ({
                    ...group,
                    optionsText: group.optionsText.trim(),
                    imageOptions: group.imageOptions.map((opt) => ({
                        ...opt,
                        title: opt.title.trim(),
                        image: opt.image.trim(),
                    })),
                }))
                .filter((group) => {
                    if (group.type === 'Image') {
                        return group.imageOptions.some((option) => option.title || option.image);
                    }
                    return Boolean(group.optionsText);
                });

            const seenTypes = new Set<VariantType>();
            for (const group of normalizedGroups) {
                if (seenTypes.has(group.type)) {
                    toast.error(`Duplicate variant type "${group.type}" is not allowed.`);
                    setIsSubmitting(false);
                    return;
                }
                seenTypes.add(group.type);

                if (group.type === 'Image') {
                    const hasOptions = group.imageOptions.some((option) => option.title || option.image);
                    if (!hasOptions) {
                        toast.error('Add at least one image variant option.');
                        setIsSubmitting(false);
                        return;
                    }

                    for (const option of group.imageOptions) {
                        if (!option.title && !option.image) continue;
                        if (!option.title || !option.image) {
                            toast.error('Image variants require both title and image.');
                            setIsSubmitting(false);
                            return;
                        }

                        parsedVariants.push({
                            name: 'Image',
                            value: option.title,
                            image: option.image,
                            price_adjustment: 0,
                            stock_quantity: data.inStock ? 100 : 0,
                        });
                    }
                    continue;
                }

                const parsedVariantOptions = group.optionsText
                    .split(/[\n,]/)
                    .map((value) => value.trim())
                    .filter(Boolean);

                if (parsedVariantOptions.length === 0) {
                    toast.error(`Add at least one option for ${group.type} variants.`);
                    setIsSubmitting(false);
                    return;
                }

                if (group.type === 'Color') {
                    const invalid = parsedVariantOptions.find((value) => !/^#?[0-9A-Fa-f]{6}$/.test(value));
                    if (invalid) {
                        toast.error(`Invalid color code: "${invalid}". Use 6-digit hex like #FFFFFF.`);
                        setIsSubmitting(false);
                        return;
                    }
                }

                Array.from(new Set(parsedVariantOptions)).forEach((value) => {
                    if (group.type === 'Color') {
                        const normalizedColor = value.startsWith('#') ? value.toUpperCase() : `#${value.toUpperCase()}`;
                        parsedVariants.push({
                            name: 'Color',
                            value: normalizedColor,
                            color_code: normalizedColor,
                            price_adjustment: 0,
                            stock_quantity: data.inStock ? 100 : 0,
                        });
                        return;
                    }

                    parsedVariants.push({
                        name: 'Size',
                        value,
                        color_code: undefined,
                        price_adjustment: 0,
                        stock_quantity: data.inStock ? 100 : 0,
                    });
                });
            }

            const apiPayload: ProductInput = {
                name: data.name,
                short_description: data.shortDescription || undefined,
                description: data.description || undefined,
                how_to_use: data.howToUse || undefined,
                ingredients: data.ingredients || undefined,
                price: data.price,
                sale_price: cleanSalePrice,
                stock_quantity: data.inStock ? 100 : 0,
                is_featured: effectiveBadge === 'bestseller',
                badge: effectiveBadge,
                category_id: categoryId,
                subcategory_id: subcategoryId,
                brand_id: data.brandId,
                images: uniqueImages,
                variants: parsedVariants,
            };

            if (editingProduct) {
                const response = await api.products.update(editingProduct.id, apiPayload);
                if (response.success) {
                    toast.success('Product updated successfully');
                    fetchProducts();
                    setIsModalOpen(false);
                } else {
                    toast.error('Failed to update product');
                }
            } else {
                const response = await api.products.create(apiPayload);
                if (response.success) {
                    toast.success('Product created successfully');
                    fetchProducts();
                    setIsModalOpen(false);
                } else {
                    toast.error('Failed to create product');
                }
            }
        } catch (error) {
            console.error('Failed to save product:', error);
            toast.error('An error occurred while saving the product');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (productId: number) => {
        try {
            const response = await api.products.delete(productId);
            if (response.success) {
                toast.success('Product deleted successfully');
                setProducts(prev => prev.filter(p => p.id !== productId));
                setDeleteConfirm(null);
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete product');
        }
    };

    useEffect(() => {
        const editId = Number(searchParams.get('edit'));
        if (!editId || products.length === 0) return;

        const productToEdit = products.find((product) => product.id === editId);
        if (productToEdit) {
            openEditModal(productToEdit);
        } else {
            toast.error('Product not found');
        }

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('edit');
        setSearchParams(nextParams, { replace: true });
    }, [products, searchParamString, setSearchParams]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Products Management | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-900">Products</h1>
                        <p className="text-slate-600">{products.length} total products</p>
                    </div>
                    <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>

                {/* Out of Stock Alert */}
                {outOfStockCount > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <p className="text-amber-800">
                            <span className="font-semibold">{outOfStockCount} products</span> are out of stock
                        </p>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-left text-sm font-semibold text-slate-700">
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`transition-colors ${(product.stock_quantity || 0) <= 10
                                            ? 'bg-red-50/50 hover:bg-red-50'
                                            : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.images?.[0] || 'https://via.placeholder.com/400'}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{product.name}</p>
                                                    <p className="text-sm text-slate-500">{product.brand_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize text-slate-700">{product.category_name || product.category_slug}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{formatPrice(Number(product.sale_price || product.price))}</p>
                                                {product.sale_price && (
                                                    <p className="text-sm text-slate-400 line-through">{formatPrice(Number(product.price))}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${product.inStock
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.badge && (
                                                <span className={`badge ${product.badge === 'sale' ? 'badge-sale' :
                                                    product.badge === 'new' ? 'badge-new' : 'badge-pink'
                                                    }`}>
                                                    {product.badge}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-2 text-slate-600 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(product.id)}
                                                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-600">No products found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {editingProduct ? 'Edit Product' : 'Add Product'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input {...register('name')} className="input-field" disabled={isSubmitting} />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Short Description (Max 500 chars)</label>
                                    <textarea {...register('shortDescription')} className="input-field h-20 resize-none" disabled={isSubmitting} />
                                    <p className="mt-1 text-xs text-slate-500">
                                        {(shortDescriptionValue || '').length}/500 characters
                                    </p>
                                    {errors.shortDescription && <p className="text-sm text-red-500 mt-1">{errors.shortDescription.message}</p>}
                                </div>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <RichTextEditor
                                            label="Long Description"
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                            placeholder="Add product details, benefits, key selling points, and bullet lists."
                                        />
                                    )}
                                />
                                {errors.description && <p className="text-sm text-red-500 -mt-2">{errors.description.message}</p>}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">How to Use</label>
                                    <textarea
                                        {...register('howToUse')}
                                        className="input-field h-28 resize-y"
                                        disabled={isSubmitting}
                                        placeholder="Apply to clean hair. Massage evenly from roots to ends. Style as desired. For best results, use 2-3 times per week."
                                    />
                                    {errors.howToUse && <p className="text-sm text-red-500 mt-1">{errors.howToUse.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ingredients</label>
                                    <textarea
                                        {...register('ingredients')}
                                        className="input-field h-28 resize-y"
                                        disabled={isSubmitting}
                                        placeholder="Water, Glycerin, Cetyl Alcohol, Shea Butter, Fragrance..."
                                    />
                                    {errors.ingredients && <p className="text-sm text-red-500 mt-1">{errors.ingredients.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                                    <select {...register('brandId', { valueAsNumber: true })} className="input-field" disabled={isSubmitting}>
                                        <option value="">Select Brand...</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                                        ))}
                                    </select>
                                    {errors.brandId && <p className="text-sm text-red-500 mt-1">{errors.brandId.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                        <input {...register('price', { valueAsNumber: true })} type="number" step="0.01" className="input-field" disabled={isSubmitting} />
                                        {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Sale Price</label>
                                        <input {...register('salePrice', { valueAsNumber: true })} type="number" step="0.01" className="input-field" disabled={isSubmitting} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                        <select {...register('category')} className="input-field" disabled={isSubmitting}>
                                            <option value="">Select...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
                                        <select {...register('subcategory')} className="input-field" disabled={isSubmitting || availableSubcategories.length === 0}>
                                            <option value="">{availableSubcategories.length === 0 ? 'Select category first' : 'Select...'}</option>
                                            {availableSubcategories.map(sub => (
                                                <option key={sub.id} value={sub.slug}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">In Stock</label>
                                        <select {...register('inStock')} className="input-field" disabled={isSubmitting}>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Badge</label>
                                        <select {...register('badge')} className="input-field" disabled={isSubmitting}>
                                            <option value="">None</option>
                                            <option value="new">New</option>
                                            <option value="sale">Sale</option>
                                            <option value="bestseller">Bestseller</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <Controller
                                        name="mainImage"
                                        control={control}
                                        render={({ field }) => (
                                            <ImageUpload
                                                label="Product Main Image"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                    {errors.mainImage && <p className="text-sm text-red-500 mt-1">{errors.mainImage.message}</p>}
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-slate-900">Additional Product Images (Optional)</h3>
                                        <button
                                            type="button"
                                            onClick={() => appendAdditionalImage('')}
                                            className="text-sm text-neon-pink hover:text-neon-pink/80 flex items-center gap-1 font-medium"
                                        >
                                            <Plus className="w-4 h-4" /> Add Image
                                        </button>
                                    </div>
                                    {additionalImageFields.length > 0 ? (
                                        <div className="space-y-3">
                                            {additionalImageFields.map((field, index) => (
                                                <div key={field.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                            Image {index + 2}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAdditionalImage(index)}
                                                            className="p-1 text-slate-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <Controller
                                                        name={`additionalImages.${index}`}
                                                        control={control}
                                                        render={({ field: imageField }) => (
                                                            <ImageUpload
                                                                label="Gallery Image"
                                                                value={imageField.value}
                                                                onChange={imageField.onChange}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-500">No additional images added yet.</p>
                                    )}
                                </div>

                                {/* Variant Section */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-semibold text-slate-900">Variants</h3>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVariantGroups((prev) => {
                                                    const used = new Set(prev.map((group) => group.type));
                                                    const nextType = VARIANT_TYPE_OPTIONS.find((option) => !used.has(option)) || 'Size';
                                                    return [...prev, createVariantGroup(nextType)];
                                                })
                                            }
                                            className="text-sm text-neon-pink hover:text-neon-pink/80 flex items-center gap-1 font-medium"
                                            disabled={isSubmitting}
                                        >
                                            <Plus className="w-4 h-4" /> Add Variant Type
                                        </button>
                                    </div>

                                    {variantGroups.length === 0 ? (
                                        <p className="text-xs text-slate-500">No variants configured. Add one or more variant types (Size, Color, Image).</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {variantGroups.map((group, index) => {
                                                const usedTypes = new Set(
                                                    variantGroups
                                                        .filter((g) => g.id !== group.id)
                                                        .map((g) => g.type)
                                                );

                                                return (
                                                    <div key={group.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex-1">
                                                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                                                    Variant Type {index + 1}
                                                                </label>
                                                                <select
                                                                    value={group.type}
                                                                    onChange={(event) => {
                                                                        const nextType = event.target.value as VariantType;
                                                                        updateVariantGroup(group.id, (current) => ({
                                                                            ...current,
                                                                            type: nextType,
                                                                            optionsText: nextType === 'Image' ? '' : current.optionsText,
                                                                            imageOptions: nextType === 'Image'
                                                                                ? (current.imageOptions.length > 0
                                                                                    ? current.imageOptions
                                                                                    : [{ id: `img-opt-${Date.now()}`, title: '', image: '' }])
                                                                                : [],
                                                                        }));
                                                                    }}
                                                                    className="input-field"
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {VARIANT_TYPE_OPTIONS.map((option) => (
                                                                        <option
                                                                            key={option}
                                                                            value={option}
                                                                            disabled={usedTypes.has(option)}
                                                                        >
                                                                            {option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setVariantGroups((prev) => prev.filter((entry) => entry.id !== group.id))}
                                                                className="p-2 text-slate-400 hover:text-red-500"
                                                                disabled={isSubmitting}
                                                                title="Remove variant type"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {group.type === 'Image' ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <p className="text-xs font-medium text-slate-600">Image Options (title + image required)</p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateVariantGroup(group.id, (current) => ({
                                                                                ...current,
                                                                                imageOptions: [
                                                                                    ...current.imageOptions,
                                                                                    {
                                                                                        id: `img-opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                                                                                        title: '',
                                                                                        image: '',
                                                                                    },
                                                                                ],
                                                                            }))
                                                                        }
                                                                        className="text-xs text-neon-pink hover:text-neon-pink/80 font-medium"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        + Add image option
                                                                    </button>
                                                                </div>

                                                                {group.imageOptions.map((option) => (
                                                                    <div key={option.id} className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
                                                                        <div className="flex items-center justify-between">
                                                                            <label className="block text-xs font-medium text-slate-600">Title</label>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateVariantGroup(group.id, (current) => ({
                                                                                        ...current,
                                                                                        imageOptions: current.imageOptions.filter((entry) => entry.id !== option.id),
                                                                                    }))
                                                                                }
                                                                                className="p-1 text-slate-400 hover:text-red-500"
                                                                                disabled={isSubmitting}
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                        <input
                                                                            value={option.title}
                                                                            onChange={(event) =>
                                                                                updateVariantGroup(group.id, (current) => ({
                                                                                    ...current,
                                                                                    imageOptions: current.imageOptions.map((entry) =>
                                                                                        entry.id === option.id
                                                                                            ? { ...entry, title: event.target.value }
                                                                                            : entry
                                                                                    ),
                                                                                }))
                                                                            }
                                                                            className="input-field"
                                                                            disabled={isSubmitting}
                                                                            placeholder="Front View"
                                                                        />
                                                                        <ImageUpload
                                                                            label="Variant Image"
                                                                            value={option.image}
                                                                            onChange={(value) =>
                                                                                updateVariantGroup(group.id, (current) => ({
                                                                                    ...current,
                                                                                    imageOptions: current.imageOptions.map((entry) =>
                                                                                        entry.id === option.id
                                                                                            ? { ...entry, image: value }
                                                                                            : entry
                                                                                    ),
                                                                                }))
                                                                            }
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                    {group.type} Options (comma or new line separated)
                                                                </label>
                                                                <textarea
                                                                    value={group.optionsText}
                                                                    onChange={(event) =>
                                                                        updateVariantGroup(group.id, (current) => ({ ...current, optionsText: event.target.value }))
                                                                    }
                                                                    className="input-field h-24 resize-y"
                                                                    disabled={isSubmitting}
                                                                    placeholder={group.type === 'Color' ? '#000000, #FFFFFF' : 'S, M, L, XL'}
                                                                />
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {group.type === 'Color'
                                                                        ? 'Use only 6-digit hex color codes (e.g. #FF5733).'
                                                                        : 'Example: S, M, L, XL or 100ml, 250ml.'}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-outline" disabled={isSubmitting}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </span>
                                        ) : (
                                            <>{editingProduct ? 'Update' : 'Add'} Product</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl p-6 max-w-sm w-full text-center"
                        >
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Product?</h3>
                            <p className="text-slate-600 mb-6">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline">
                                    Cancel
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-600">
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
export default AdminProducts;
