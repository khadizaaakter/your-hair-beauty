import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Loader2, X, Save, Ticket } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { api, type Coupon } from '../../lib/api';
import { useCurrency } from '../../context/CurrencyContext';

const couponSchema = z.object({
    code: z.string().min(3, 'Code is required').toUpperCase(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.coerce.number().positive('Value must be positive'),
    min_order_amount: z.coerce.number().min(0).default(0),
    max_uses: z.coerce.number().int().positive().optional().or(z.literal('')),
    expiry_date: z.string().optional().or(z.literal('')),
});

type CouponForm = z.infer<typeof couponSchema>;

export function AdminCoupons() {
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();
    const { formatPrice, getSymbol } = useCurrency();

    const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
        queryKey: ['coupons'],
        queryFn: () => api.admin.coupons.list().then(res => res.data),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => {
            // Transform form data for API (handle empty strings as undefined/null)
            const payload = {
                ...data,
                max_uses: data.max_uses === '' ? undefined : data.max_uses,
                expiry_date: data.expiry_date === '' ? undefined : data.expiry_date,
            };
            return api.admin.coupons.create(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            setIsCreating(false);
            toast.success('Coupon created successfully');
        },
        onError: () => toast.error('Failed to create coupon'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => {
            const payload = {
                ...data,
                max_uses: data.max_uses === '' ? undefined : data.max_uses,
                expiry_date: data.expiry_date === '' ? undefined : data.expiry_date,
            };
            return api.admin.coupons.update(id, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            setIsEditing(null);
            toast.success('Coupon updated successfully');
        },
        onError: () => toast.error('Failed to update coupon'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.admin.coupons.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            toast.success('Coupon deleted successfully');
        },
        onError: () => toast.error('Failed to delete coupon'),
    });

    const filteredCoupons = coupons.filter(c =>
        c.code.includes(searchTerm.toUpperCase())
    );

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            discount_type: 'percentage',
            min_order_amount: 0
        }
    });

    const handleEdit = (coupon: Coupon) => {
        setValue('code', coupon.code);
        setValue('discount_type', coupon.discount_type === 'percent' ? 'percentage' : coupon.discount_type);
        setValue('discount_value', coupon.discount_value);
        setValue('min_order_amount', coupon.min_order_amount);
        setValue('max_uses', coupon.max_uses || '∞');
        setValue('expiry_date', coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : '');
        setIsEditing(coupon.id);
        setIsCreating(false);
    };

    const handleCreate = () => {
        reset();
        setValue('discount_type', 'percentage');
        setIsCreating(true);
        setIsEditing(null);
    };

    const onSubmit: SubmitHandler<CouponForm> = (data) => {
        if (isEditing) {
            updateMutation.mutate({ id: isEditing, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
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
                    <h1 className="text-2xl font-display font-bold text-slate-900">Coupons</h1>
                    <p className="text-slate-500">Manage discount codes</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Coupon
                </button>
            </header>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search coupons..."
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
                            {isCreating ? 'New Coupon' : 'Edit Coupon'}
                        </h2>
                        <button
                            onClick={() => { setIsCreating(false); setIsEditing(null); }}
                            className="text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as CouponForm))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                                <input
                                    {...register('code')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none uppercase"
                                />
                                {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
                                <select
                                    {...register('discount_type')}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ({getSymbol()})</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('discount_value', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                                {errors.discount_value && <p className="text-sm text-red-500 mt-1">{errors.discount_value.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min. Order Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('min_order_amount', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Uses (Optional)</label>
                                <input
                                    type="number"
                                    {...register('max_uses', { valueAsNumber: true })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date (Optional)</label>
                                <input
                                    type="date"
                                    {...register('expiry_date')}
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
                                Save Coupon
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
                                <th className="px-6 py-4 font-semibold text-slate-900">Code</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Discount</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Usage</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                <Ticket className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{coupon.code}</p>
                                                <p className="text-xs text-slate-500">
                                                    Min. {formatPrice(Number(coupon.min_order_amount || 0))}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">
                                        {(coupon.discount_type === 'percent' || coupon.discount_type === 'percentage')
                                            ? `${coupon.discount_value}%`
                                            : formatPrice(Number(coupon.discount_value || 0))}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {coupon.used_count} / {coupon.max_uses || '∞'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {coupon.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
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
        </div>
    );
}
