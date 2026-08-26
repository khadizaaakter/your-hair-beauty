import { HeroCarousel } from '../components/sections/HeroCarousel';
import { FeaturesBanner } from '../components/sections/FeaturesBanner';
import { CategoryCircles } from '../components/sections/CategoryCircles';
import { NewArrivalsSection } from '../components/sections/NewArrivalsSection';
import { TrendingSection } from '../components/sections/TrendingSection';
import { SalesSection } from '../components/sections/SalesSection';
import { RandomProductsSection } from '../components/sections/RandomProductsSection';
import { BrandMarquee } from '../components/sections/BrandMarquee';
import { NewsletterCTA } from '../components/sections/NewsletterCTA';
import { InstagramFeed } from '../components/sections/InstagramFeed';
import { TikTokFeed } from '../components/sections/TikTokFeed';
import { GoogleReviews } from '../components/sections/GoogleReviews';
import { CategorySidebar } from '../components/layout/CategorySidebar'; // Import the new sidebar
import { FeaturedCollections } from '../components/sections/FeaturedCollections';
import { Helmet } from 'react-helmet-async';

export function Home() {
    return (
        <main className="bg-slate-50 min-h-screen pb-12 overflow-x-hidden">
            <Helmet>
                <title>Your Hair & Beauty | Afro, Caribbean & Beauty Products</title>
                <meta
                    name="description"
                    content="Shop Afro, Caribbean and beauty essentials from trusted UK brands with delivery options across the UK, USA and Europe."
                />
            </Helmet>

            <h1 className="sr-only">
                Your Hair and Beauty - Afro, Caribbean and European hair and beauty products
            </h1>

            {/* 1. Hero Section with Sidebar */}
            <div className="container mx-auto px-4 pt-0 pb-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Hidden on mobile, visible on lg screens */}
                    <div className="hidden lg:block w-1/4 min-w-[280px]">
                        <CategorySidebar />
                    </div>

                    {/* Right Hero Slider */}
                    <div className="flex-1 w-full lg:w-3/4">
                        <HeroCarousel />
                    </div>
                </div>
            </div>

            {/* 2. Features/Trust Badges */}
            <FeaturesBanner />

            {/* 2.5 Brand Partners (Moved) */}
            <BrandMarquee />

            {/* Rest of the sections... mostly unchanged but ensuring spacing */}
            <div className="space-y-12">
                {/* 3. Shop by Category (Mobile/Alternate view) */}
                <div className="lg:hidden">
                    <CategoryCircles />
                </div>

                {/* 4. Trending Products */}
                <TrendingSection />

                {/* 4.5. Featured Collections */}
                <FeaturedCollections />

                {/* 5. New Arrivals */}
                <NewArrivalsSection />





                {/* 8. On Sale Section */}
                <SalesSection />

                {/* 8.5 Randomized Products */}
                <RandomProductsSection />

                {/* 9. Newsletter CTA */}
                <NewsletterCTA />

                {/* 10. Instagram Feed */}
                <InstagramFeed />

                {/* 11. TikTok Feed */}
                <TikTokFeed />

                {/* 12. Google Reviews */}
                <GoogleReviews />


            </div>
        </main>
    );
}

export default Home;
