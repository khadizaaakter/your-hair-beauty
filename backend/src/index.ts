import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { testConnection } from './config/database';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import paymentRoutes from './routes/payments';
import uploadRoutes from './routes/upload';
import publicRoutes from './routes/public';
import brandsRoutes from './routes/brands';
import wishlistRoutes from './routes/wishlist';
import contactRoutes from './routes/contact';
import currencyRoutes from './routes/currency';
import webhooksRoutes from './routes/webhooks';
import devRoutes from './routes/dev';
import seoRoutes from './routes/seo';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Trust proxy (needed for rate limiting behind Nginx/Apache)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: config.nodeEnv === 'production' ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://elfsightcdn.com", "https://*.elfsight.com", "https://static.elfsight.com", "https://universe-static.elfsightcdn.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.elfsight.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            connectSrc: ["'self'", "https://*.elfsight.com", "https://elfsightcdn.com", "https://universe-static.elfsightcdn.com"],
            frameSrc: ["'self'", "https://*.elfsight.com", "https://universe-static.elfsightcdn.com"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
        }
    } : false,
}));

// CORS configuration
const allowedOrigins = [config.frontendUrl];
if (config.nodeEnv === 'development') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Technical SEO: enforce noindex on private app routes at header level
const noIndexRoutePatterns = [
    /^\/admin(?:\/|$)/,
    /^\/dashboard(?:\/|$)/,
    /^\/checkout(?:\/|$)/,
    /^\/pay(?:\/|$)/,
    /^\/login(?:\/|$)/,
    /^\/register(?:\/|$)/,
    /^\/forgot-password(?:\/|$)/,
    /^\/api(?:\/|$)/,
];

app.use((req, res, next) => {
    if (noIndexRoutePatterns.some((pattern) => pattern.test(req.path))) {
        res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv });
});

// SEO endpoints (robots + sitemap)
app.use('/', seoRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/dev', devRoutes);
app.use('/api', publicRoutes); // Public routes (no auth)

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// --- Production: Serve React frontend build ---
if (config.nodeEnv === 'production') {
    const frontendBuildPath = path.join(__dirname, '../../dist');

    // Serve static assets (JS, CSS, images, etc.)
    app.use(express.static(frontendBuildPath, {
        maxAge: '1y',       // Cache static assets for 1 year
        immutable: true,    // Vite uses content hashes, so files are immutable
    }));

    // SPA fallback: all non-API routes → index.html
    // Express 5 requires named wildcard: {*path} instead of *
    app.get('{*path}', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
}

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start server
async function startServer() {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected && config.nodeEnv === 'production') {
        console.error('❌ Cannot start server without database in production');
        process.exit(1);
    }

    app.listen(config.port, () => {
        console.log(`🚀 Server running on port ${config.port}`);
        console.log(`📦 Environment: ${config.nodeEnv}`);
        console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
        if (config.nodeEnv === 'production') {
            console.log(`📁 Serving frontend from: dist/`);
        }
    });
}

startServer();

export default app;
