import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'yourhairbeauty',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    worldpay: {
        username: process.env.WORLDPAY_USERNAME || '',
        password: process.env.WORLDPAY_PASSWORD || '',
        merchantId: process.env.WORLDPAY_MERCHANT_ID || '',
        entity: process.env.WORLDPAY_ENTITY || 'PO4089899937',
        installationId: process.env.WORLDPAY_INSTALLATION_ID || '',
        clientKey: process.env.WORLDPAY_CLIENT_KEY || '',
        baseUrl: (process.env.WORLDPAY_BASE_URL || 'https://access.worldpay.com').replace(/\/+$/, ''),
        env: process.env.WORLDPAY_ENV || 'test',
        webhookSecret: process.env.WORLDPAY_WEBHOOK_SECRET || '',
        narrativeLine1: process.env.WORLDPAY_NARRATIVE_LINE1 || 'YOUR HAIR BEAUTY',
        apiUrl: `${process.env.WORLDPAY_BASE_URL || 'https://access.worldpay.com'}/payment_pages`,
    },

    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    appBaseUrl: process.env.APP_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000',

    email: {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },

    upload: {
        maxSizeMb: parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5'),
    },
};

// ---- Production Safety Checks ----
if (config.nodeEnv === 'production') {
    const errors: string[] = [];

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret' || process.env.JWT_SECRET.includes('CHANGE_ME')) {
        errors.push('JWT_SECRET is not set or is using a default/placeholder value');
    }

    if (!process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'CHANGE_ME') {
        errors.push('DB_PASSWORD is not set or is using a placeholder');
    }

    if (!process.env.WORLDPAY_USERNAME) {
        errors.push('WORLDPAY_USERNAME is not set');
    }

    if (!process.env.SMTP_PASS || process.env.SMTP_PASS === 'CHANGE_ME') {
        errors.push('SMTP_PASS is not set or is using a placeholder');
    }

    if (!process.env.APP_BASE_URL || process.env.APP_BASE_URL.includes('localhost')) {
        errors.push('APP_BASE_URL is not set or still points to localhost');
    }

    if (errors.length > 0) {
        console.error('❌ FATAL: Production environment misconfigured:');
        errors.forEach(e => console.error(`   - ${e}`));
        process.exit(1);
    }
}
