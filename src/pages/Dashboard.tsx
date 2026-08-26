import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    Clock,
    CheckCircle,
    Truck,
    Settings,
    Heart,
    ShoppingBag,
    LogOut,
    User,
    Download,
    Trash2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { generateInvoiceFromOrder } from '../lib/generateInvoice';
import { api, type Order } from '../lib/api';

const sidebarItems = [
    { icon: ShoppingBag, label: 'Orders', id: 'orders' },
    { icon: Heart, label: 'Wishlist', id: 'wishlist' },
    { icon: User, label: 'Profile', id: 'profile' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

function StatusBadge({ status }: { status: string }) {
    const config = {
        pending_payment: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Awaiting Payment' },
        paid: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Paid' },
        payment_failed: { color: 'bg-red-100 text-red-700', icon: Package, label: 'Payment Failed' },
        processing: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Processing' },
        shipped: { color: 'bg-blue-100 text-blue-700', icon: Truck, label: 'Shipped' },
        delivered: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Delivered' },
    }[status] || { color: 'bg-slate-100 text-slate-700', icon: Package, label: status };

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            <config.icon className="w-4 h-4" />
            {config.label}
        </span>
    );
}

function OrderStatusBar({ status }: { status: string }) {
    const steps = ['processing', 'shipped', 'delivered'];
    const normalizedStatus = status === 'pending_payment' || status === 'paid'
        ? 'processing'
        : status;
    const currentIndex = steps.indexOf(normalizedStatus);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;

    return (
        <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                    <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
            ${index <= safeIndex
                            ? 'bg-neon-pink text-white'
                            : 'bg-slate-200 text-slate-500'
                        }
          `}>
                        {index + 1}
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-12 h-1 ${index < safeIndex ? 'bg-neon-pink' : 'bg-slate-200'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function Dashboard() {
    const { logout, user } = useAuth();
    const { items: wishlistItems, toggleItem: toggleWishlist, clearWishlist } = useWishlist();
    const { addItem } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const allowedTabs = ['orders', 'wishlist', 'profile', 'settings'];
    const initialTab = requestedTab && allowedTabs.includes(requestedTab) ? requestedTab : 'orders';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const { formatPrice } = useCurrency();

    // Profile state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');

    // Email change state
    const [emailChangeStep, setEmailChangeStep] = useState<'initial' | 'otp'>('initial');
    const [emailChangeOtp, setEmailChangeOtp] = useState('');
    const [updatingEmail, setUpdatingEmail] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: (user as any).phone || '',
                address: user.address || ''
            });

            // Fetch orders
            setLoadingOrders(true);
            api.orders.list().then(response => {
                if (response.success && response.data) {
                    setOrders(response.data);
                }
                setLoadingOrders(false);
            });
        }
    }, [user]);

    useEffect(() => {
        const nextTab = requestedTab && allowedTabs.includes(requestedTab) ? requestedTab : 'orders';
        if (nextTab !== activeTab) {
            setActiveTab(nextTab);
        }
    }, [requestedTab, activeTab]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const nextParams = new URLSearchParams(searchParams);
        if (tabId === 'orders') {
            nextParams.delete('tab');
        } else {
            nextParams.set('tab', tabId);
        }
        setSearchParams(nextParams, { replace: true });
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingProfile(true);
        setProfileMessage('');

        // Exclude email from general profile update
        const { email, ...dataToUpdate } = profileData;

        const response = await api.auth.updateProfile(dataToUpdate);
        if (response.success) {
            setProfileMessage('Profile updated successfully!');
            // Reload to refresh context
            window.location.reload();
        } else {
            setProfileMessage(response.message || 'Failed to update profile');
        }
        setUpdatingProfile(false);
    };

    const handleRequestEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingEmail(true);
        setProfileMessage('');

        const response = await api.auth.requestEmailChange(profileData.email);
        if (response.success) {
            setEmailChangeStep('otp');
            setProfileMessage('Verification code sent to your new email.');
        } else {
            setProfileMessage(response.message || 'Failed to request email change');
        }
        setUpdatingEmail(false);
    };

    const handleVerifyEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdatingEmail(true);
        setProfileMessage('');

        const response = await api.auth.verifyEmailChange(emailChangeOtp);
        if (response.success) {
            setProfileMessage('Email updated successfully!');
            window.location.reload();
        } else {
            setProfileMessage(response.message || 'Failed to verify email change');
        }
        setUpdatingEmail(false);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
                        My Account
                    </h1>
                    <p className="text-slate-600">Welcome back! Manage your orders and account settings.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-2xl shadow-card p-3 lg:p-4">
                            <nav className="flex lg:block gap-2 lg:gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                                {sidebarItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabChange(item.id)}
                                        className={`
                      shrink-0 lg:w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors whitespace-nowrap
                      ${activeTab === item.id
                                                ? 'bg-neon-pink/10 text-neon-pink font-medium'
                                                : 'text-slate-700 hover:bg-slate-50'
                                            }
                    `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                            <div className="mt-2 pt-2 border-t border-slate-200">
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900">Order History</h2>
                                    <span className="text-sm text-slate-500">{orders.length} orders</span>
                                </div>

                                {loadingOrders ? (
                                    <div className="text-center py-12">Loading orders...</div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                                        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">No orders yet</h3>
                                        <p className="text-slate-600">Start shopping to see your orders here.</p>
                                    </div>
                                ) : (
                                    orders.map((order, index) => (
                                        <motion.div
                                            key={order.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-shadow"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                <div>
                                                    <p className="font-semibold text-slate-900">Order #{order.id}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Ordered on {new Date(order.created_at).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <StatusBadge status={order.status} />
                                            </div>

                                            {/* Items */}
                                            <div className="border-t border-slate-100 pt-4 mb-4">
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className="flex justify-between py-2">
                                                        <span className="text-slate-700">
                                                            {item.name || 'Product'} <span className="text-slate-400">x{item.quantity}</span>
                                                        </span>
                                                        <span className="font-medium text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <div>
                                                    <span className="text-sm text-slate-500">Total</span>
                                                    <p className="text-lg font-bold text-slate-900">{formatPrice(order.total_amount)}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <motion.button
                                                        onClick={() => void generateInvoiceFromOrder({
                                                            id: order.id,
                                                            created_at: order.created_at,
                                                            total_amount: order.total_amount,
                                                            items: order.items || [],
                                                            user_name: user?.name,
                                                            user_email: user?.email,
                                                            shipping_address: order.shipping_address,
                                                            status: order.status,
                                                            payment_status: order.payment_status,
                                                            worldpay_order_code: order.worldpay_order_code,
                                                            currency: order.currency,
                                                        })}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neon-pink bg-neon-pink/10 rounded-lg hover:bg-neon-pink/20 transition-colors"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Invoice
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => {
                                                            order.items?.forEach(item => {
                                                                // Construct a minimal product object for addItem
                                                                // Note: Depending on addItem implementation, we might need full product details.
                                                                // Assuming addItem handles basic { id, name, price, images }
                                                                addItem({
                                                                    id: item.product_id,
                                                                    name: item.name || 'Product',
                                                                    price: item.price,
                                                                    images: item.images || [],
                                                                    stock_quantity: 999, // Hack: assume stock for reorder, or fetch fresh
                                                                    is_featured: 0,
                                                                    inStock: true
                                                                } as any, item.quantity);
                                                            });
                                                        }}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                        Buy It Again
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Status Bar */}
                                            {order.status !== 'delivered' && <OrderStatusBar status={order.status} />}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-slate-900">My Wishlist</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-500">{wishlistItems.length} items</span>
                                        {wishlistItems.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    wishlistItems.forEach(item => addItem(item));
                                                    clearWishlist();
                                                }}
                                                className="text-sm font-medium text-neon-pink hover:text-pink-600 underline"
                                            >
                                                Add All to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {wishlistItems.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Heart className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">Your wishlist is empty</h3>
                                        <p className="text-slate-600 mb-6">Save items you love to buy later.</p>
                                        <Link
                                            to="/shop"
                                            className="inline-flex px-6 py-2 bg-neon-pink text-white rounded-xl font-medium hover:bg-neon-pink/90 transition-colors"
                                        >
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {wishlistItems.map((item) => (
                                            <div key={item.id} className="bg-white rounded-2xl shadow-card p-4 flex gap-4">
                                                <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                                    {item.images && item.images.length > 0 && (
                                                        <img
                                                            src={item.images[0]}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-slate-900 line-clamp-1">{item.name}</h3>
                                                    <p className="text-neon-pink font-bold mt-1">{formatPrice(Number(item.sale_price || item.price))}</p>
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => addItem(item)}
                                                            className="flex-1 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                        <button
                                                            onClick={() => toggleWishlist(item)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile Details</h2>
                                {profileMessage && (
                                    <div className={`mb-4 p-4 rounded-lg ${profileMessage.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {profileMessage}
                                    </div>
                                )}
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-neon-pink focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">To change email, go to Settings.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="Add phone number"
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-neon-pink focus:outline-none"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                            <textarea
                                                value={profileData.address}
                                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                placeholder="Enter your full address"
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-neon-pink focus:outline-none min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={updatingProfile}
                                            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                        >
                                            {updatingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-2xl shadow-card p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">Account Settings</h2>
                                {activeTab === 'settings' && profileMessage && (
                                    <div className={`mb-4 p-4 rounded-lg ${profileMessage.includes('success') || profileMessage.includes('sent') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {profileMessage}
                                    </div>
                                )}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                        <div>
                                            <h3 className="font-medium text-slate-900">Email Notifications</h3>
                                            <p className="text-sm text-slate-500">Receive updates about your orders and promotions</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-pink"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-slate-100">
                                        <div>
                                            <h3 className="font-medium text-slate-900">Waitlist Alerts</h3>
                                            <p className="text-sm text-slate-500">Get notified when items are back in stock</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-pink"></div>
                                        </label>
                                    </div>

                                    {/* Change Email Section */}
                                    <div className="pt-4">
                                        <h3 className="font-medium text-slate-900 mb-4">Change Email Address</h3>

                                        {emailChangeStep === 'initial' ? (
                                            <form onSubmit={handleRequestEmailChange} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Email Address</label>
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-neon-pink focus:outline-none"
                                                        placeholder="Enter new email"
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={updatingEmail}
                                                    className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                                                >
                                                    {updatingEmail ? 'Sending Code...' : 'Send Verification Code'}
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleVerifyEmailChange} className="space-y-4">
                                                <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-4 text-sm">
                                                    We've sent a 6-digit verification code to <strong>{profileData.email}</strong>.
                                                    Please enter it below to confirm this change.
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                                                    <input
                                                        type="text"
                                                        value={emailChangeOtp}
                                                        onChange={(e) => setEmailChangeOtp(e.target.value)}
                                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-neon-pink focus:outline-none text-center tracking-widest text-lg"
                                                        placeholder="000000"
                                                        maxLength={6}
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        type="submit"
                                                        disabled={updatingEmail}
                                                        className="px-6 py-2 bg-neon-pink text-white rounded-xl font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {updatingEmail ? 'Verifying...' : 'Verify & Update Email'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmailChangeStep('initial')}
                                                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div >
        </main >
    );
}

export default Dashboard;
