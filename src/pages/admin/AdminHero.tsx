import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, X, Save, GripVertical } from 'lucide-react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api, type HeroSlider } from '../../lib/api';
import { ImageUpload } from '../../components/common/ImageUpload';

const heroSchema = z.object({
    image: z.string().min(1, 'Image is required'),
    title: z.string().min(2, 'Title is required'),
    description: z.string().optional(),
    button_text: z.string().optional(),
    button_link: z.string().optional(),
    order_index: z.coerce.number().int().default(0),
});

type HeroForm = z.infer<typeof heroSchema>;

export function AdminHero() {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const queryClient = useQueryClient();

    const { data: sliders = [], isLoading } = useQuery({
        queryKey: ['hero-sliders'],
        queryFn: () => api.admin.heroSliders.list().then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: HeroForm) => api.admin.heroSliders.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
            setIsCreating(false);
            toast.success('Slider created successfully');
        },
        onError: () => toast.error('Failed to create slider'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: HeroForm }) =>
            api.admin.heroSliders.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
            setIsEditing(null);
            toast.success('Slider updated successfully');
        },
        onError: () => toast.error('Failed to update slider'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.heroSliders.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hero-sliders'] });
            toast.success('Slider deleted successfully');
        },
        onError: () => toast.error('Failed to delete slider'),
    });

    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
        resolver: zodResolver(heroSchema),
    });

    const handleEdit = (slider: HeroSlider) => {
        setValue('image', slider.image);
        setValue('title', slider.title || '');
        setValue('description', slider.description || '');
        setValue('button_text', slider.button_text || '');
        setValue('button_link', slider.button_link || '');
        setValue('order_index', slider.order_index);
        setIsEditing(slider.id);
        setIsCreating(false);
    };

    const handleCreate = () => {
        reset();
        setValue('order_index', sliders.length);
        setIsCreating(true);
        setIsEditing(null);
    };

    const onSubmit: SubmitHandler<HeroForm> = (data) => {
        if (isEditing) {
            updateMutation.mutate({ id: isEditing, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this slider?')) {
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
                    <h1 className="text-2xl font-display font-bold text-slate-900">Hero Sliders</h1>
                    <p className="text-slate-500">Manage homepage hero carousel</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Slide
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
                            {isCreating ? 'New Slide' : 'Edit Slide'}
                        </h2>
                        <button
                            onClick={() => { setIsCreating(false); setIsEditing(null); }}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as HeroForm))} className="space-y-4">
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
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                {...register('description')}
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
                                <input
                                    {...register('button_text')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                            </div>
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
                                Save Slide
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* List */}
            <div className="space-y-4">
                {sliders.map((slider: HeroSlider) => (
                    <div key={slider.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-64 aspect-[21/9] rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={slider.image} alt={slider.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-semibold text-slate-900">{slider.title}</h3>
                            <p className="text-slate-600 mb-2">{slider.description}</p>
                            {slider.button_text && (
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                    {slider.button_text} &rarr; {slider.button_link}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 text-slate-300 cursor-move">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <button
                                onClick={() => handleEdit(slider)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(slider.id)}
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
