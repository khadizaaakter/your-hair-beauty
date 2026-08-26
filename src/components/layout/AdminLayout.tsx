import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    ChevronDown,
    MessageSquare,
    ShieldCheck
} from 'lucide-react';
import { NeonButton } from '../ui/NeonButton';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: MessageSquare, label: 'Messages', href: '/admin/messages' },
    { icon: Package, label: 'Categories', href: '/admin/categories' },
    { icon: Package, label: 'Collections', href: '/admin/collections' },
    { icon: Package, label: 'Hero Sliders', href: '/admin/hero' },
    { icon: Package, label: 'Brands', href: '/admin/brands' },
    { icon: Package, label: 'Coupons', href: '/admin/coupons' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-slate-600 hover:text-neon-pink"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                    <span className="font-display font-bold text-lg">
                        <span className="text-slate-900">Admin</span>
                        <span className="text-neon-pink"> Panel</span>
                    </span>
                    <div className="w-10 h-10" />
                </div>
            </header>

            {/* Desktop Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-full bg-slate-900 text-white z-40 transition-all duration-300 overflow-hidden
          ${sidebarOpen ? 'w-64' : 'w-20'}
          hidden lg:flex lg:flex-col
        `}
            >
                {/* Logo */}
                <div className="p-5 border-b border-slate-800 shrink-0">
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neon-pink flex items-center justify-center">
                            <span className="text-white font-bold text-lg">Y</span>
                        </div>
                        {sidebarOpen && (
                            <div className="flex flex-col">
                                <span className="font-display font-bold">
                                    Admin Panel
                                </span>
                                <span className="text-[10px] text-neon-pink uppercase tracking-widest font-semibold flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" />
                                    Super Admin
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive
                                        ? 'bg-neon-pink text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Actions */}
                <div className="shrink-0 border-t border-slate-800 p-3 space-y-2 bg-slate-900/80 backdrop-blur">
                    <NeonButton
                        variant="ghost"
                        onClick={() => logout()}
                        className={`w-full ${sidebarOpen ? 'justify-start !px-4' : 'justify-center !px-0'}`}
                    >
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {sidebarOpen && <span>Sign Out</span>}
                        </div>
                    </NeonButton>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={`
                            w-full rounded-lg border border-slate-800 bg-slate-800/70 text-slate-300
                            hover:text-white hover:border-slate-700 transition-colors
                            ${sidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 flex items-center justify-center'}
                        `}
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        <span className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} w-full`}>
                            {sidebarOpen && <span className="text-sm font-medium">Collapse</span>}
                            <ChevronDown className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: mobileMenuOpen ? 0 : '-100%' }}
                transition={{ type: 'tween' }}
                className="lg:hidden fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40"
            >
                <div className="p-6 border-b border-slate-800">
                    <span className="font-display font-bold text-lg">Admin Panel</span>
                </div>
                <nav className="p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive
                                        ? 'bg-neon-pink text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }
                `}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </motion.aside>

            {/* Main Content */}
            <main
                className={`
          transition-all duration-300 min-h-screen
          pt-16 lg:pt-0
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}
            >
                {/* Desktop Top Bar */}
                <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:border-neon-pink focus:outline-none w-64"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Admin Console</p>
                </header>

                {/* Page Content */}
                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
