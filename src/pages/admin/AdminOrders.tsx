import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Search,
    Eye,
    Package,
    Clock,
    Truck,
    CheckCircle,
    X,
    ChevronDown,
    Loader2,
    FileText,
    Download
} from 'lucide-react';
import { api, type Order } from '../../lib/api';
import toast from 'react-hot-toast';
import { generateInvoiceFromOrder } from '../../lib/generateInvoice';
import { NeonButton } from '../../components/ui/NeonButton';
import { useCurrency } from '../../context/CurrencyContext';

const statusOptions = [
    { value: 'pending_payment', label: 'Pending Payment', icon: Clock, color: 'bg-amber-100 text-amber-700' },
    { value: 'paid', label: 'Paid', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
    { value: 'payment_failed', label: 'Payment Failed', icon: X, color: 'bg-red-100 text-red-700' },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
    { value: 'processing', label: 'Processing', icon: Package, color: 'bg-indigo-100 text-indigo-700' },
    { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
    { value: 'cancelled', label: 'Cancelled', icon: X, color: 'bg-red-100 text-red-700' },
];

function getGuestName(order: Order): string {
    const shipping = order.shipping_address && typeof order.shipping_address === 'object'
        ? order.shipping_address
        : null;
    const first = String(shipping?.firstName || '').trim();
    const last = String(shipping?.lastName || '').trim();
    return [first, last].filter(Boolean).join(' ').trim();
}

function getGuestEmail(order: Order): string {
    const shipping = order.shipping_address && typeof order.shipping_address === 'object'
        ? order.shipping_address
        : null;
    return String(shipping?.email || '').trim();
}

function getCustomerLabel(order: Order): string {
    return order.user_name || getGuestName(order) || (order.user_id ? `User ${order.user_id}` : 'Guest');
}

function getCustomerEmail(order: Order): string {
    return order.user_email || getGuestEmail(order) || 'N/A';
}

function formatShippingAddress(value: unknown): string {
    if (!value) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        const shipping = value as Record<string, unknown>;
        const lines = [
            [shipping.firstName, shipping.lastName].filter(Boolean).join(' '),
            shipping.address,
            shipping.city,
            shipping.postcode,
            shipping.country,
        ]
            .map((part) => String(part || '').trim())
            .filter(Boolean);
        return lines.join(', ');
    }
    return 'N/A';
}

export function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
    const { formatPrice } = useCurrency();

    // Batch Actions
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        } else {
            setSelectedOrderIds([]);
        }
    };

    const handleSelectOrder = (id: number) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBatchStatusUpdate = async (status: string) => {
        if (!selectedOrderIds.length) return;
        const confirmMsg = `Are you sure you want to mark ${selectedOrderIds.length} orders as ${status}?`;
        if (!window.confirm(confirmMsg)) return;

        let successCount = 0;
        setIsLoading(true);
        try {
            // Parallel or sequential updates? Parallel is faster but might hit rate limits.
            // Let's do parallel with Promise.all
            await Promise.all(selectedOrderIds.map(async (id) => {
                const res = await api.admin.orders.updateStatus(id, status);
                if (res.success) successCount++;
            }));
            toast.success(`Successfully updated ${successCount} orders to ${status}`);
            setSelectedOrderIds([]);
            fetchOrders();
        } catch (error) {
            console.error('Batch update failed', error);
            toast.error('Some updates failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchDownload = async () => {
        if (!selectedOrderIds.length) return;
        toast.loading('Preparing invoices...', { id: 'batch-download' });

        // Sequential download to avoid browser blocking multiple downloads
        for (const id of selectedOrderIds) {
            const order = orders.find(o => o.id === id);
            if (order) {
                try {
                    await generateInvoiceFromOrder({
                        id: order.id,
                        created_at: order.created_at,
                        total_amount: order.total_amount,
                        items: order.items || [],
                        user_name: order.user_name,
                        user_email: order.user_email,
                        shipping_address: order.shipping_address,
                        status: order.status,
                        payment_status: order.payment_status,
                        worldpay_order_code: order.worldpay_order_code,
                        currency: order.currency,
                    });
                    // Small delay to prevent browser blocking
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (err) {
                    console.error(`Failed to download invoice for order ${id}`, err);
                }
            }
        }
        toast.success('Invoices downloaded', { id: 'batch-download' });
        setSelectedOrderIds([]);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await api.admin.orders.list();
            if (response.success && response.data) {
                // The API returns { data: Order[], ... } but list returns OrdersListResponse which has data: Order[]
                // Let's verify type compatibility. api.admin.orders.list returns Promise<OrdersListResponse>
                // OrdersListResponse has data: Order[].
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        try {
            // Optimistic update
            const originalOrders = [...orders];
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus as any } : order
            ));

            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
            }

            const response = await api.admin.orders.updateStatus(orderId, newStatus);

            if (response.success) {
                toast.success(`Order #${orderId} status updated to ${newStatus}`);
            } else {
                // Revert on failure
                setOrders(originalOrders);
                if (selectedOrder?.id === orderId) {
                    setSelectedOrder(prev => prev ? { ...prev, status: originalOrders.find(o => o.id === orderId)?.status as any } : null);
                }
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
            // Revert would be robust here too, but simple error toast is start
            fetchOrders(); // Refresh to be sure
        }
    };

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toString().includes(searchQuery) ||
            getCustomerLabel(order).toLowerCase().includes(searchQuery.toLowerCase()) ||
            getCustomerEmail(order).toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !filterStatus || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        pending: orders.filter(o => o.status === 'pending' || o.status === 'pending_payment').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    };

    const getStatusConfig = (status: string) => {
        return statusOptions.find(s => s.value === status) || statusOptions[0];
    };

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
                <title>Orders Management | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Orders</h1>
                    <p className="text-slate-600">{orders.length} total orders</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['pending', 'shipped', 'delivered'].map((statusKey) => {
                        const status = statusOptions.find(s => s.value === statusKey);
                        if (!status) return null;
                        return (
                            <div key={status.value} className="bg-white rounded-xl p-4 shadow-card">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${status.color}`}>
                                        <status.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {stats[statusKey as keyof typeof stats]}
                                        </p>
                                        <p className="text-sm text-slate-600">{status.label}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:border-neon-pink focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Batch Actions Bar */}
                <AnimatePresence>
                    {selectedOrderIds.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-neon-pink/5 border border-neon-pink/20 rounded-xl p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-neon-pink" />
                                <span className="font-medium text-slate-900">{selectedOrderIds.length} orders selected</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <NeonButton size="sm" variant="outline" onClick={() => handleBatchStatusUpdate('shipped')}>
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        <span>Mark Shipped</span>
                                    </div>
                                </NeonButton>
                                <NeonButton size="sm" variant="outline" onClick={handleBatchDownload}>
                                    <div className="flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        <span>Download Invoices</span>
                                    </div>
                                </NeonButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="w-12 px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-neon-pink focus:ring-neon-pink"
                                            checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Order ID</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Customer</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Date</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Total</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Payment</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Status</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredOrders.map((order) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-neon-pink focus:ring-neon-pink"
                                                    checked={selectedOrderIds.includes(order.id)}
                                                    onChange={() => handleSelectOrder(order.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono font-medium text-slate-900">#{order.id}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">{getCustomerLabel(order)}</p>
                                                    <p className="text-sm text-slate-500">{getCustomerEmail(order)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">
                                                {new Date(order.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-900">
                                                {formatPrice(order.total_amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                                        order.payment_status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {(order.payment_status || 'pending').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-sm font-medium cursor-pointer ${statusConfig.color}`}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => void generateInvoiceFromOrder({
                                                            id: order.id,
                                                            created_at: order.created_at,
                                                            total_amount: order.total_amount,
                                                            items: order.items || [],
                                                            user_name: order.user_name,
                                                            user_email: order.user_email,
                                                            shipping_address: order.shipping_address,
                                                            status: order.status,
                                                            payment_status: order.payment_status,
                                                            worldpay_order_code: order.worldpay_order_code,
                                                            currency: order.currency,
                                                        })}
                                                        className="p-2 text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                                                        title="Download Invoice"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-slate-600 hover:text-neon-pink hover:bg-neon-pink/10 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this order?')) {
                                                                api.admin.orders.delete(order.id)
                                                                    .then(() => {
                                                                        toast.success('Order deleted');
                                                                        fetchOrders();
                                                                    })
                                                                    .catch(() => toast.error('Failed to delete order'));
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-600">No orders found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-semibold text-slate-900">Order Details</h2>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <p className="text-sm text-slate-500">Order ID</p>
                                    <p className="font-mono font-bold text-slate-900">#{selectedOrder.id}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Customer</p>
                                        <p className="font-medium text-slate-900">{getCustomerLabel(selectedOrder)}</p>
                                        <p className="text-sm text-slate-600">{getCustomerEmail(selectedOrder)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Date</p>
                                        <p className="font-medium text-slate-900">
                                            {new Date(selectedOrder.created_at).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-2">Items</p>
                                    <div className="space-y-2">
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, i) => (
                                                <div key={i} className="flex justify-between py-2 border-b border-slate-100 gap-4">
                                                    <div>
                                                        <span>{item.name || `Product ${item.product_id}`} x{item.quantity}</span>
                                                        {Array.isArray((item as any).selected_variants) && (item as any).selected_variants.length > 0 && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {(item as any).selected_variants.map((variant: any) => `${variant.name}: ${variant.value}`).join(' | ')}
                                                            </p>
                                                        )}
                                                        {(!Array.isArray((item as any).selected_variants) || (item as any).selected_variants.length === 0) && item.variant_name && item.variant_value && (
                                                            <p className="text-xs text-slate-500 mt-1">{item.variant_name}: {item.variant_value}</p>
                                                        )}
                                                    </div>
                                                    <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 italic">No items details available</p>
                                        )}
                                        <div className="flex justify-between pt-2 font-semibold">
                                            <span>Total</span>
                                            <span>{formatPrice(selectedOrder.total_amount)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Shipping</p>
                                    <p className="font-medium text-slate-900">{(selectedOrder as any).shipping_method || 'Standard'}</p>
                                    <p className="text-sm text-slate-600">{formatShippingAddress(selectedOrder.shipping_address)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Payment Status</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                        selectedOrder.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                            selectedOrder.payment_status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {selectedOrder.payment_status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AdminOrders;
