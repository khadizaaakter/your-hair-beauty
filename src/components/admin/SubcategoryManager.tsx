
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Edit, Save, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

interface SubcategoryManagerProps {
    categoryId: number;
    categoryName: string;
    onClose: () => void;
}

export function SubcategoryManager({ categoryId, categoryName, onClose }: SubcategoryManagerProps) {
    const [newItemName, setNewItemName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ['subcategories', categoryId],
        queryFn: () => api.admin.subcategories.list(categoryId),
    });

    const subcategories = response?.data || [];


    const createMutation = useMutation({
        mutationFn: (name: string) => api.admin.subcategories.create({
            category_id: categoryId,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
            setNewItemName('');
            toast.success('Subcategory added');
        },
        onError: () => toast.error('Failed to add subcategory')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: number; name: string }) => api.admin.subcategories.update(id, {
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
            setEditingId(null);
            toast.success('Subcategory updated');
        },
        onError: () => toast.error('Failed to update subcategory')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.subcategories.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
            toast.success('Subcategory deleted');
        },
        onError: () => toast.error('Failed to delete subcategory')
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;
        createMutation.mutate(newItemName);
    };

    const handleUpdate = (id: number) => {
        if (!editName.trim()) return;
        updateMutation.mutate({ id, name: editName });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden"
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-lg">Manage Subcategories: {categoryName}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    <form onSubmit={handleAdd} className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="New subcategory name..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-neon-pink"
                        />
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !newItemName.trim()}
                            className="px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 disabled:opacity-50 flex items-center gap-2"
                        >
                            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add
                        </button>
                    </form>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-neon-pink" />
                            </div>
                        ) : subcategories.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                No subcategories yet.
                            </div>
                        ) : (
                            subcategories.map((sub: any) => (
                                <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                                    {editingId === sub.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:border-neon-pink"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleUpdate(sub.id)}
                                                disabled={updateMutation.isPending}
                                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            >
                                                <Save className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-medium text-slate-700">{sub.name}</span>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(sub.id);
                                                        setEditName(sub.name);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this subcategory?')) {
                                                            deleteMutation.mutate(sub.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
