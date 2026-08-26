import { Home, Store, ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';

export function MobileBottomNav() {
    const { itemCount: cartCount } = useCart();
    const { isAuthenticated, isAdmin } = useAuth();
    const [isHidden, setIsHidden] = useState(false);
    const navItemClass =
        'flex flex-1 min-w-0 flex-col items-center gap-1 rounded-xl transition-colors';
    const navLabelClass = 'text-[10px] font-medium leading-none';

    useEffect(() => {
        const handleMenuStateChange = (event: Event) => {
            const customEvent = event as CustomEvent<{ isOpen?: boolean }>;
            setIsHidden(Boolean(customEvent.detail?.isOpen));
        };

        window.addEventListener('mobile-menu-state-change', handleMenuStateChange as EventListener);
        return () => {
            window.removeEventListener('mobile-menu-state-change', handleMenuStateChange as EventListener);
        };
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-sm border-t border-slate-100 px-2 pt-2.5 z-50 lg:hidden shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)] transition-transform duration-200 ${
                isHidden ? 'translate-y-full pointer-events-none' : 'translate-y-0'
            }`}
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
        >
            <div className="flex justify-between items-end gap-1">
                {/* 1. Home */}
                <NavLink
                    to="/"
                    className={({ isActive }) => `${navItemClass} ${isActive ? 'text-neon-pink' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Home className="w-5 h-5" />
                    <span className={navLabelClass}>Home</span>
                </NavLink>

                {/* 2. Categories (Trigger) */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-categories-drawer'))}
                    className={`${navItemClass} text-slate-400 hover:text-slate-600`}
                >
                    <LayoutGrid className="w-5 h-5" />
                    <span className={navLabelClass}>Categories</span>
                </button>

                {/* 3. Shop */}
                <NavLink
                    to="/shop"
                    className={({ isActive }) => `${navItemClass} ${isActive ? 'text-neon-pink' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Store className="w-5 h-5" />
                    <span className={navLabelClass}>Shop</span>
                </NavLink>

                {/* 4. Cart */}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-cart-drawer'))}
                    className={`${navItemClass} text-slate-400 hover:text-slate-600 relative`}
                >
                    <div className="relative">
                        <ShoppingBag className="w-5 h-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-pink text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className={navLabelClass}>Cart</span>
                </button>

                {/* 5. Account */}
                <NavLink
                    to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'}
                    className={({ isActive }) => `${navItemClass} ${isActive ? 'text-neon-pink' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <User className="w-5 h-5" />
                    <span className={navLabelClass}>Account</span>
                </NavLink>
            </div>
        </div>
    );
}
