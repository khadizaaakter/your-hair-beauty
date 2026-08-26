import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Search,
    Eye,
    Users,
    Mail,
    ShoppingBag,
    X,
    Calendar,
    Loader2,
    Edit,
    Trash2,
    Save,
    UserX,
    UserCheck,
    Crown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, type User, type CustomerDetail, type Order } from '../../lib/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

type CustomerListItem = User & {
    order_count: number;
    total_spent: number;
    status?: 'active' | 'blocked';
    last_order_date?: string;
};

const customerSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerSchema>;

export function AdminCustomers() {
    const [customers, setCustomers] = useState<CustomerListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
    const [editingCustomer, setEditingCustomer] = useState<number | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const { formatPrice } = useCurrency();

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CustomerForm>({
        resolver: zodResolver(customerSchema)
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setIsLoading(true);
            const response = await api.admin.customers.list();
            if (response.success && response.data) {
                setCustomers(response.data as any);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewCustomer = async (customerId: number) => {
        try {
            setIsLoadingDetails(true);
            const response = await api.admin.customers.get(customerId);
            if (response.success && response.data) {
                setSelectedCustomer(response.data);
            } else {
                toast.error('Failed to load customer details');
            }
        } catch (error) {
            console.error('Failed to fetch customer details:', error);
            toast.error('Failed to load customer details');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleEditCustomer = (customer: CustomerListItem) => {
        setValue('name', customer.name);
        setValue('email', customer.email);
        setValue('phone', customer.phone || '');
        setValue('address', customer.address || '');
        setEditingCustomer(customer.id);
    };

    const handleDeleteCustomer = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

        try {
            const response = await api.admin.customers.delete(id);
            if (response.success) {
                toast.success('Customer deleted successfully');
                fetchCustomers();
            }
        } catch (error) {
            toast.error('Failed to delete customer');
        }
    };

    const onUpdateSubmit = async (data: CustomerForm) => {
        if (!editingCustomer) return;

        try {
            const response = await api.admin.customers.update(editingCustomer, data);
            if (response.success) {
                toast.success('Customer updated successfully');
                setEditingCustomer(null);
                fetchCustomers();
            }
        } catch (error) {
            toast.error('Failed to update customer');
        }
    };

    // Filter customers
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch =
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Stats
    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0);
    const avgOrderValue = totalCustomers > 0 ? totalRevenue / customers.reduce((sum, c) => sum + (Number(c.order_count) || 0), 0) : 0;

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
                <title>Customers | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Customers</h1>
                    <p className="text-slate-600">{totalCustomers} registered customers</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{totalCustomers}</p>
                                <p className="text-sm text-slate-600">Total Customers</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{formatPrice(totalRevenue)}</p>
                                <p className="text-sm text-slate-600">Total Revenue</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{formatPrice(isNaN(avgOrderValue) ? 0 : avgOrderValue)}</p>
                                <p className="text-sm text-slate-600">Avg Order Value</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                    />
                </div>

                {/* Edit Modal */}
                {editingCustomer && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900">Edit Customer</h2>
                            <button
                                onClick={() => setEditingCustomer(null)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        {...register('email')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                    />
                                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        {...register('phone')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <input
                                        {...register('address')}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingCustomer(null)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-neon-pink text-white rounded-lg hover:bg-neon-pink/90 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Customers Table */}
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Phone</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Orders</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Last Order</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Lifetime Value</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredCustomers.map((customer) => (
                                    <motion.tr
                                        key={customer.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: customer.status === 'blocked' ? 0.5 : 1 }}
                                        className={`hover:bg-slate-50 ${customer.status === 'blocked' ? 'bg-red-50/30' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${customer.status === 'blocked' ? 'bg-red-100 text-red-600' : 'bg-neon-pink/10 text-neon-pink'}`}>
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{customer.name}</p>
                                                    <p className="text-sm text-slate-500">{customer.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {customer.phone || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${customer.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {customer.status === 'blocked' ? (
                                                    <><UserX className="w-3 h-3" /> Blocked</>
                                                ) : (
                                                    <><UserCheck className="w-3 h-3" /> Active</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900">{customer.order_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 text-sm">
                                            {customer.last_order_date
                                                ? new Date(customer.last_order_date).toLocaleDateString('en-GB')
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <span>{formatPrice(Number(customer.total_spent || 0))}</span>
                                                {(customer.total_spent || 0) > 500 && (
                                                    <span className="bg-amber-100 text-amber-700 p-1 rounded-full" title="VIP Customer">
                                                        <Crown className="w-3 h-3" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewCustomer(customer.id)}
                                                    disabled={isLoadingDetails}
                                                    className="p-2 text-slate-600 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors disabled:opacity-50"
                                                    title="View Details"
                                                >
                                                    {isLoadingDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newStatus = customer.status === 'blocked' ? 'active' : 'blocked';
                                                        setCustomers(prev => prev.map(c => c.id === customer.id ? { ...c, status: newStatus } : c));
                                                        toast.success(`Customer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`);
                                                    }}
                                                    className={`p-2 rounded-lg transition-colors ${customer.status === 'blocked' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-orange-500 hover:bg-orange-50'}`}
                                                    title={customer.status === 'blocked' ? 'Unblock' : 'Block'}
                                                >
                                                    {customer.status === 'blocked' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
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
                </div>
            </div>

            {/* Customer Details Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCustomer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-semibold text-slate-900">Customer Details</h2>
                                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Customer Info */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-neon-pink/10 flex items-center justify-center text-neon-pink text-2xl font-bold">
                                        {selectedCustomer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900">{selectedCustomer.name}</h3>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="w-4 h-4" />
                                            {selectedCustomer.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xl font-bold text-slate-900">{(selectedCustomer.orders ?? []).length}</p>
                                        <p className="text-xs text-slate-500">Orders</p>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xl font-bold text-slate-900">
                                            {formatPrice((selectedCustomer.orders ?? []).reduce((sum: number, o: Order) => sum + o.total_amount, 0))}
                                        </p>
                                        <p className="text-xs text-slate-500">Spent</p>
                                    </div>
                                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                                        <p className="text-xl font-bold text-slate-900">
                                            {formatPrice((selectedCustomer.orders ?? []).length > 0 ? ((selectedCustomer.orders ?? []).reduce((sum: number, o: Order) => sum + o.total_amount, 0) / (selectedCustomer.orders ?? []).length) : 0)}
                                        </p>
                                        <p className="text-xs text-slate-500">Avg Order</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        Member since {new Date(selectedCustomer.created_at).toLocaleDateString('en-GB', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </div>
                                    {selectedCustomer.address && (
                                        <div className="text-sm text-slate-600">
                                            <span className="font-semibold">Address:</span> {selectedCustomer.address}
                                        </div>
                                    )}
                                    {selectedCustomer.phone && (
                                        <div className="text-sm text-slate-600">
                                            <span className="font-semibold">Phone:</span> {selectedCustomer.phone}
                                        </div>
                                    )}
                                </div>

                                {/* Recent Orders */}
                                <div>
                                    <h4 className="font-medium text-slate-900 mb-3">Recent Orders</h4>
                                    <div className="space-y-2">
                                        {(selectedCustomer.orders ?? []).length > 0 ? (
                                            (selectedCustomer.orders ?? []).map((order: Order) => (
                                                <div key={order.id} className="flex justify-between items-center py-2 border-b border-slate-100">
                                                    <div>
                                                        <p className="font-mono text-sm font-medium text-slate-900">#{order.id}</p>
                                                        <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-slate-900">{formatPrice(Number(order.total_amount || 0))}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">No orders found.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminCustomers;
