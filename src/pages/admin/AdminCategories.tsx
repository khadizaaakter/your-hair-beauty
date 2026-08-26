import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Loader2, X, Save, Layers } from 'lucide-react';

import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api, type Category } from '../../lib/api';
import { ImageUpload } from '../../components/common/ImageUpload';
import { SubcategoryManager } from '../../components/admin/SubcategoryManager';
const categorySchema = z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
    description: z.string().optional(),
    image: z.string().optional().or(z.literal('')),
});

type CategoryForm = z.infer<typeof categorySchema>;

export function AdminCategories() {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [managingSubcategories, setManagingSubcategories] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: () => api.categories.list().then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: CategoryForm) => api.admin.categories.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsCreating(false);
            toast.success('Category created successfully');
        },
        onError: () => toast.error('Failed to create category'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CategoryForm }) =>
            api.admin.categories.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsEditing(null);
            toast.success('Category updated successfully');
        },
        onError: () => toast.error('Failed to update category'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.categories.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Category deleted successfully');
        },
        onError: () => toast.error('Failed to delete category'),
    });

    const filteredCategories = categories.filter((c: Category) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema),
    });

    const handleEdit = (category: Category) => {
        setValue('name', category.name);
        setValue('slug', category.slug);
        setValue('description', category.description || '');
        setValue('image', category.image || '');
        setIsEditing(category.id);
        setIsCreating(false);
    };

    const handleCreate = () => {
        reset();
        setIsCreating(true);
        setIsEditing(null);
    };

    const onSubmit = (data: CategoryForm) => {
        if (isEditing) {
            updateMutation.mutate({ id: isEditing, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-neon-pink" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Categories</h1>
                    <p className="text-slate-500">Manage product categories</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </header>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-neon-pink"
                />
            </div>

            {/* Form Modal/Inline */}
            {(isCreating || isEditing) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isCreating ? 'New Category' : 'Edit Category'}
                        </h2>
                        <button
                            onClick={() => { setIsCreating(false); setIsEditing(null); }}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input
                                    {...register('name')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                                <input
                                    {...register('slug')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                                {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                            />
                        </div>

                        <div>
                            <Controller
                                name="image"
                                control={control}
                                render={({ field }) => (
                                    <ImageUpload
                                        label="Image"
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image.message}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => { setIsCreating(false); setIsEditing(null); }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 disabled:opacity-50"
                            >
                                {(createMutation.isPending || updateMutation.isPending) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save Category
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Slug</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Products</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCategories.map((category: Category) => (
                                <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {category.image && (
                                                <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover" />
                                            )}
                                            <span className="font-medium text-slate-900">{category.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{category.slug}</td>
                                    <td className="px-6 py-4 text-slate-600">{category.product_count || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setManagingSubcategories(category)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Manage Subcategories"
                                            >
                                                <Layers className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {
                managingSubcategories && (
                    <SubcategoryManager
                        categoryId={managingSubcategories.id}
                        categoryName={managingSubcategories.name}
                        onClose={() => setManagingSubcategories(null)}
                    />
                )
            }
        </div >
    );
}
