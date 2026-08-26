import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Package,
    Users,
    DollarSign,
    Plus,
    Edit2,
    Trash2,
    TrendingUp,
    TrendingDown,
    Search,
    Filter,
    MoreVertical
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';



// Stats Card Component
function StatCard({
    title,
    value,
    change,
    icon: Icon,
    trend
}: {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    trend: 'up' | 'down';
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                    <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{change}</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-neon-pink" />
                </div>
            </div>
        </motion.div>
    );
}

// Custom Tooltip for Charts
function CustomTooltip({ active, payload, label, formatPrice }: { active?: boolean; payload?: Array<{ value: number }>; label?: string, formatPrice: (price: number | string) => string }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
                <p className="text-slate-500 text-sm mb-1">{label}</p>
                <p className="text-slate-900 font-semibold">{formatPrice(payload[0].value)}</p>
            </div>
        );
    }
    return null;
}


export function AdminDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: statsData } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await api.admin.stats();
            return res.success ? res.data : null;
        }
    });

    const { data: productsData } = useQuery({
        queryKey: ['admin-products-summary'],
        queryFn: async () => {
            const res = await api.products.list({ limit: 5 });
            return res.success ? res.data : [];
        }
    });

    const chartRef = useRef(null);
    const chartInView = useInView(chartRef, { once: true, margin: '-50px' });
    const [searchQuery, setSearchQuery] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const { formatPrice } = useCurrency();

    const stats = statsData;
    const chartsData = statsData?.charts || [];

    const deleteMutation = useMutation({
        mutationFn: async (productId: number) => {
            const response = await api.products.delete(productId);
            if (!response.success) {
                throw new Error(response.message || 'Failed to delete product');
            }
            return productId;
        },
        onSuccess: () => {
            toast.success('Product deleted');
            queryClient.invalidateQueries({ queryKey: ['admin-products-summary'] });
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Delete failed');
        },
    });

    const formatTrend = (trend: number | undefined) => {
        if (trend === undefined) return '0% from last month';
        const sign = trend >= 0 ? '+' : '';
        return `${sign}${trend}% from last month`;
    };

    const getTrendDirection = (trend: number | undefined) => {
        return (trend || 0) >= 0 ? 'up' : 'down';
    };

    const filteredProducts = (productsData || []).filter(p => {
        const matchesSearch =
            (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.category_name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStock = !showLowStockOnly || (p.stock_quantity || 0) <= 10;
        return matchesSearch && matchesStock;
    });

    const handleDeleteProduct = (productId: number, productName: string) => {
        if (!window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
            return;
        }
        deleteMutation.mutate(productId);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                        <p className="text-slate-600">Overview of your store performance</p>
                    </div>
                    <Link
                        to="/admin/products"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Product
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={formatPrice(stats?.totalRevenue || 0)}
                        change={formatTrend(stats?.trends?.revenue)}
                        icon={DollarSign}
                        trend={getTrendDirection(stats?.trends?.revenue)}
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats?.totalOrders || 0}
                        change={formatTrend(stats?.trends?.orders)}
                        icon={Package}
                        trend={getTrendDirection(stats?.trends?.orders)}
                    />
                    <StatCard
                        title="Customers"
                        value={stats?.totalCustomers || 0}
                        change={formatTrend(stats?.trends?.customers)}
                        icon={Users}
                        trend={getTrendDirection(stats?.trends?.customers)}
                    />
                    <StatCard
                        title="Products"
                        value={stats?.totalProducts || 0}
                        change={formatTrend(stats?.trends?.products)}
                        icon={BarChart3}
                        trend={getTrendDirection(stats?.trends?.products)}
                    />
                </div>

                {/* Charts Section */}
                <div
                    ref={chartRef}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {/* Sales Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={chartInView ? { opacity: 1, y: 0 } : {}}
                        className="bg-white rounded-2xl shadow-card p-6"
                    >
                        <h3 className="text-xl font-semibold text-slate-900 mb-6">Sales Overview</h3>
                        <div className="h-64 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartsData}>
                                    <defs>
                                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff1493" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ff1493" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} />
                                    <Area
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#ff1493"
                                        strokeWidth={3}
                                        fill="url(#salesGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Orders Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={chartInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-card p-6"
                    >
                        <h3 className="text-xl font-semibold text-slate-900 mb-6">Orders Trend</h3>
                        <div className="h-64 w-full min-h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartsData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip content={<CustomTooltip formatPrice={formatPrice} />} />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        stroke="#ff1493"
                                        strokeWidth={3}
                                        dot={{ fill: '#ff1493', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#ff1493', stroke: 'white', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* Products Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-card"
                >
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="text-xl font-semibold text-slate-900">Product Management</h3>
                            <div className="flex items-center gap-4">
                                {/* Search */}
                                <div className="search-bar">
                                    <Search className="w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent border-none outline-none text-slate-900 text-sm"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowLowStockOnly((current) => !current)}
                                    className={`p-2 border rounded-lg transition-colors ${showLowStockOnly
                                        ? 'border-neon-pink bg-neon-pink/5'
                                        : 'border-slate-200 hover:border-neon-pink/50'
                                        }`}
                                    title={showLowStockOnly ? 'Showing low stock only' : 'Show low stock only'}
                                >
                                    <Filter className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Product</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Category</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Price</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Stock</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Status</th>
                                    <th className="text-left py-4 px-6 text-sm font-medium text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-slate-900">{product.name}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-slate-600">{product.category_name || 'Uncategorized'}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-slate-900">{formatPrice(Number(product.sale_price || product.price))}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-slate-600">{product.stock_quantity}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`
                        px-2.5 py-1 rounded-full text-xs font-medium
                        ${product.stock_quantity > 10 ? 'bg-emerald-100 text-emerald-700' :
                                                    product.stock_quantity > 0 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'}
                      `}>
                                                {product.stock_quantity === 0 ? 'Out of Stock' :
                                                    product.stock_quantity <= 10 ? 'Low Stock' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/admin/products?edit=${product.id}`)}
                                                    className="p-2 rounded-lg hover:bg-neon-pink/10 text-slate-500 hover:text-neon-pink transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                                                    title="Delete product"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => window.open(`/product/${product.id}`, '_blank', 'noopener,noreferrer')}
                                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                                    title="View on storefront"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

export default AdminDashboard;
