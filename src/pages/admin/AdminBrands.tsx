import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Loader2, X, Save } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api, type Brand } from '../../lib/api';
import { ImageUpload } from '../../components/common/ImageUpload';

const brandSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    logo_url: z.string().optional().or(z.literal('')),
    is_active: z.boolean().default(true),
});

type BrandForm = z.infer<typeof brandSchema>;

export function AdminBrands() {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: brands = [], isLoading } = useQuery({
        queryKey: ['brands'],
        queryFn: () => api.admin.brands.list().then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: BrandForm) => api.admin.brands.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setIsCreating(false);
            toast.success('Brand created successfully');
        },
        onError: () => toast.error('Failed to create brand'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: BrandForm }) =>
            api.admin.brands.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            setIsEditing(null);
            toast.success('Brand updated successfully');
        },
        onError: () => toast.error('Failed to update brand'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.brands.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['brands'] });
            toast.success('Brand deleted successfully');
        },
        onError: () => toast.error('Failed to delete brand'),
    });

    const filteredBrands = brands.filter((b: Brand) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
        resolver: zodResolver(brandSchema),
    });

    const handleEdit = (brand: Brand) => {
        setValue('name', brand.name);
        setValue('logo_url', brand.logo_url || '');
        setValue('is_active', brand.is_active === 1);
        setIsEditing(brand.id);
        setIsCreating(false);
    };

    const handleCreate = () => {
        reset();
        setValue('is_active', true);
        setIsCreating(true);
        setIsEditing(null);
    };

    const onSubmit = (data: BrandForm) => {
        if (isEditing) {
            updateMutation.mutate({ id: isEditing, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
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
                    <h1 className="text-2xl font-display font-bold text-slate-900">Brands</h1>
                    <p className="text-slate-500">Manage brand partners</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Brand
                </button>
            </header>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search brands..."
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
                            {isCreating ? 'New Brand' : 'Edit Brand'}
                        </h2>
                        <button
                            onClick={() => { setIsCreating(false); setIsEditing(null); }}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as BrandForm))} className="space-y-4">
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
                                <Controller
                                    name="logo_url"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageUpload
                                            label="Logo"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.logo_url && <p className="text-sm text-red-500 mt-1">{errors.logo_url.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    {...register('is_active')}
                                    className="rounded border-slate-300 text-neon-pink focus:ring-neon-pink"
                                />
                                <span className="text-sm font-medium text-slate-700">Active</span>
                            </label>
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
                                Save Brand
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map((brand: Brand) => (
                    <div key={brand.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                {brand.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-xl font-bold text-slate-400">{brand.name[0]}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-medium text-slate-900">{brand.name}</h3>
                                <div className={`flex items-center gap-1.5 mt-1 text-xs font-medium ${brand.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${brand.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    {brand.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleEdit(brand)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(brand.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
