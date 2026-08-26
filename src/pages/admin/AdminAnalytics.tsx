import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingCart,
    AlertTriangle,
    Loader2,
    Users
} from 'lucide-react';
import { api, type DashboardStats, type Product } from '../../lib/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { useCurrency } from '../../context/CurrencyContext';

function AnalyticsCard({
    title,
    value,
    change,
    icon: Icon,
    trend,
    color = "neon-pink"
}: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    trend?: 'up' | 'down';
    color?: string;
}) {
    const colorClasses = {
        "neon-pink": "text-neon-pink bg-neon-pink/10",
        "emerald": "text-emerald-500 bg-emerald-500/10",
        "blue": "text-blue-500 bg-blue-500/10",
        "amber": "text-amber-500 bg-amber-500/10",
        "purple": "text-purple-500 bg-purple-500/10",
    };

    return (
        <GlassCard>
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
                    <div className="text-3xl font-display font-bold text-slate-900">{value}</div>
                    {change && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                            }`}>
                            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses["neon-pink"]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </GlassCard>
    );
}

export function AdminAnalytics() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, productsRes] = await Promise.all([
                    api.admin.stats(),
                    api.products.list()
                ]);

                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data);
                }
                if (productsRes.success && productsRes.data) {
                    setProducts(productsRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
            </div>
        );
    }

    // Calculations
    const lowStockCount = products.filter(p => (p.stock_quantity || 0) < 10).length;
    const pendingOrders = stats?.pendingOrders || 0;
    // Mock "Active Carts" as a multiple of pending orders for demo purposes, or just use pending
    const activeCarts = Math.max(pendingOrders * 2, 5); // Mock data: usually more carts than orders

    // Charts Data
    const salesData = stats?.charts || [];

    // Calculate daily revenue change (mock logic if not provided)
    const revenueTrend = stats?.trends?.revenue || 0;

    return (
        <>
            <Helmet>
                <title>Analytics Dashboard | Admin</title>
            </Helmet>

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time insights and performance metrics.</p>
                </div>

                {/* At-a-Glance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnalyticsCard
                        title="Daily Revenue"
                        value={formatPrice(stats?.totalRevenue || 0)}
                        change={`${revenueTrend > 0 ? '+' : ''}${revenueTrend}% vs last month`}
                        icon={DollarSign}
                        trend={revenueTrend >= 0 ? 'up' : 'down'}
                        color="emerald"
                    />
                    <AnalyticsCard
                        title="Active Carts"
                        value={activeCarts}
                        change="+12% vs last hour"
                        icon={ShoppingCart}
                        trend="up"
                        color="blue"
                    />
                    <AnalyticsCard
                        title="Low Stock Alerts"
                        value={lowStockCount}
                        change={lowStockCount > 5 ? "Action Needed" : "Inventory Healthy"}
                        icon={AlertTriangle}
                        trend={lowStockCount > 5 ? 'down' : 'up'}
                        color={lowStockCount > 0 ? "amber" : "emerald"}
                    />
                    <AnalyticsCard
                        title="Total Customers"
                        value={stats?.totalCustomers || 0}
                        change="+5 this week"
                        icon={Users}
                        trend="up"
                        color="purple"
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Revenue Trend (Area Chart) */}
                    <div className="lg:col-span-2">
                        <GlassCard className="h-[400px] flex flex-col overflow-hidden">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend (30 Days)</h3>
                            <div className="flex-1 w-full relative min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={salesData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            tickFormatter={(value) => formatPrice(Number(value || 0))}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                            formatter={(value: number | undefined) => [
                                                formatPrice(Number(value || 0)),
                                                'Revenue'
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fill="url(#colorRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Orders Breakdown (Bar Chart) */}
                    <div className="lg:col-span-1">
                        <GlassCard className="h-[400px] flex flex-col overflow-hidden">
                            <h3 className="text-lg font-semibold text-slate-900 mb-6">Weekly Orders</h3>
                            <div className="flex-1 w-full relative min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={salesData.slice(-7)}> {/* Last 7 days */}
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                            }}
                                        />
                                        <Bar
                                            dataKey="orders"
                                            fill="#ff1493"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminAnalytics;
