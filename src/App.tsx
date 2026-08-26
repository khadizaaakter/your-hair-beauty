import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SettingsProvider } from './context/SettingsContext';
import { CurrencyProvider } from './context/CurrencyContext';

// Route Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { CartDrawer } from './components/ui/CartDrawer';
import { FirstOrderOfferPopup } from './components/ui/FirstOrderOfferPopup';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { CategoriesDrawer } from './components/layout/CategoriesDrawer';
import { SearchModal } from './components/layout/SearchModal';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { RouteSeo } from './components/seo/RouteSeo';

// Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Categories } from './pages/Categories';
import { Help } from './pages/Help';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { SearchResults } from './pages/SearchResults';
import { Checkout } from './pages/Checkout';
import { Contact } from './pages/Contact';
import { Trending } from './pages/Trending';
import { BestSellers } from './pages/BestSellers';
import { NewArrivals } from './pages/NewArrivals';
import { Sale } from './pages/Sale';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { CookiePolicy } from './pages/CookiePolicy';
import { ReturnsPolicy } from './pages/ReturnsPolicy';
import { Brands } from './pages/Brands';
import { BrandDetail } from './pages/BrandDetail';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Order Pages
import PaymentSuccess from './pages/pay/PaymentSuccess';
import PaymentFailure from './pages/pay/PaymentFailure';
import PaymentStatus from './pages/pay/PaymentStatus';
import { OrderSuccess } from './pages/OrderSuccess';
import { OrderFailure } from './pages/OrderFailure';
import { TrackOrder } from './pages/TrackOrder';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminBrands } from './pages/admin/AdminBrands';
import { AdminHero } from './pages/admin/AdminHero';
import { AdminCollections } from './pages/admin/AdminCollections';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminMessages } from './pages/admin/AdminMessages';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Page transition variants


// Main Layout with Navbar/Footer
// Main Layout with Navbar/Footer
import { useEffect } from 'react';

function MainLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    const handleOpenSearch = () => setIsSearchOpen(true);

    window.addEventListener('open-cart-drawer', handleOpenCart);
    window.addEventListener('open-search-modal', handleOpenSearch);

    return () => {
      window.removeEventListener('open-cart-drawer', handleOpenCart);
      window.removeEventListener('open-search-modal', handleOpenSearch);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onCartClick={() => setIsCartOpen(true)} />
      <div className="pt-[104px] md:pt-28 flex-1 pb-[140px] sm:pb-[150px] lg:pb-0 overflow-x-hidden">
        <Outlet />
      </div>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FirstOrderOfferPopup />
      <CategoriesDrawer />
      <MobileBottomNav />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

// Auth Layout (removed as integrated into MainLayout)

function AnimatedRoutes() {
  return (
    <Routes>
      {/* Main Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:category" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/help" element={<Help />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/sale" element={<Sale />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/returns-policy" element={<ReturnsPolicy />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/brands/:slug" element={<BrandDetail />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/wishlist" element={<Navigate to="/dashboard?tab=wishlist" replace />} />

        {/* Auth Routes (now in MainLayout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Customer Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={<Checkout />} />
        {/* New Payment Status Routes */}
        <Route path="/pay/success" element={<PaymentSuccess />} />
        <Route path="/pay/pending" element={<PaymentSuccess mode="pending" />} />
        <Route path="/pay/failure" element={<PaymentFailure />} />
        <Route path="/pay/cancel" element={<PaymentStatus type="cancel" />} />
        <Route path="/pay/error" element={<PaymentStatus type="error" />} />
        <Route path="/pay/expiry" element={<PaymentStatus type="expiry" />} />

        {/* Legacy Checkout Routes */}
        <Route path="/checkout/success" element={<OrderSuccess />} />
        <Route path="/checkout/failure" element={<OrderFailure />} />
        <Route path="/checkout/pending" element={<OrderSuccess />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <SettingsProvider>
              <CurrencyProvider>
                <CartProvider>
                  <WishlistProvider>
                    <ScrollToTop />
                    <RouteSeo />
                    <AnimatedRoutes />
                    <Toaster position="bottom-right" />
                  </WishlistProvider>
                </CartProvider>
              </CurrencyProvider>
            </SettingsProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
