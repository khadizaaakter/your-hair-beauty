import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, X, Save } from 'lucide-react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api, type FeaturedCollection } from '../../lib/api';
import { ImageUpload } from '../../components/common/ImageUpload';

const collectionSchema = z.object({
    title: z.string().min(2, 'Title is required'),
    description: z.string().optional().or(z.literal('')),
    image_url: z.string().optional().or(z.literal('')),
    button_link: z.string().optional().or(z.literal('')),
    order_index: z.coerce.number().int().default(0),
});

type CollectionForm = z.infer<typeof collectionSchema>;

export function AdminCollections() {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const queryClient = useQueryClient();

    const { data: collections = [], isLoading } = useQuery<FeaturedCollection[]>({
        queryKey: ['featured-collections'],
        queryFn: () => api.admin.collections.list().then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: CollectionForm) => api.admin.collections.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['featured-collections'] });
            setIsCreating(false);
            toast.success('Collection created successfully');
        },
        onError: () => toast.error('Failed to create collection'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: CollectionForm }) =>
            api.admin.collections.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['featured-collections'] });
            setIsEditing(null);
            toast.success('Collection updated successfully');
        },
        onError: () => toast.error('Failed to update collection'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.collections.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['featured-collections'] });
            toast.success('Collection deleted successfully');
        },
        onError: () => toast.error('Failed to delete collection'),
    });

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            order_index: 0
        }
    });

    const handleEdit = (collection: FeaturedCollection) => {
        setValue('title', collection.title);
        setValue('description', collection.description || '');
        setValue('image_url', collection.image_url || '');
        setValue('button_link', collection.button_link || '');
        setValue('order_index', collection.order_index);
        setIsEditing(collection.id);
        setIsCreating(false);
    };

    const handleCreate = () => {
        reset();
        setValue('order_index', collections.length);
        setIsCreating(true);
        setIsEditing(null);
    };

    const onSubmit: SubmitHandler<CollectionForm> = (data) => {
        if (isEditing) {
            updateMutation.mutate({ id: isEditing, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this collection?')) {
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
                    <h1 className="text-2xl font-display font-bold text-slate-900">Featured Collections</h1>
                    <p className="text-slate-500">Manage homepage featured collections</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Collection
                </button>
            </header>

            {/* Form Modal/Inline */}
            {(isCreating || isEditing) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isCreating ? 'New Collection' : 'Edit Collection'}
                        </h2>
                        <button
                            onClick={() => { setIsCreating(false); setIsEditing(null); }}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as CollectionForm))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    {...register('title')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <Controller
                                    name="image_url"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageUpload
                                            label="Image"
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {errors.image_url && <p className="text-sm text-red-500 mt-1">{errors.image_url.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Button Link</label>
                                <input
                                    {...register('button_link')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Order Index</label>
                                <input
                                    type="number"
                                    {...register('order_index', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                            </div>
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
                                Save Collection
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                    <div key={collection.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                        <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 relative group">
                            {collection.image_url ? (
                                <img src={collection.image_url} alt={collection.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-300">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handleEdit(collection)}
                                    className="p-2 bg-white text-slate-900 rounded-full hover:bg-neon-pink hover:text-white transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(collection.id)}
                                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{collection.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">{collection.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
