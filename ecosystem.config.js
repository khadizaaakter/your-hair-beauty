// PM2 Ecosystem Config — Your Hair & Beauty
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
    apps: [{
        name: 'yourhairbeauty',
        script: 'dist/index.js',
        cwd: '/home/yourhairbeauty/public_html/backend',

        // Environment
        env: {
            NODE_ENV: 'production',
        },

        // Process management
        instances: 1,
        exec_mode: 'fork',
        autorestart: true,
        max_restarts: 10,
        restart_delay: 5000,
        max_memory_restart: '512M',

        // Logging
        error_file: '/home/yourhairbeauty/logs/app-error.log',
        out_file: '/home/yourhairbeauty/logs/app-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,

        // Watch (disabled in production)
        watch: false,
    }]
};
