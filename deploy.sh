#!/bin/bash
# ============================================
# Your Hair & Beauty — Deployment Script
# Run from the project root: bash deploy.sh
# ============================================
set -e

APP_NAME="yourhairbeauty-api"
BACKEND_CWD="/home/yourhairbeauty/public_html/backend"

echo "🚀 Starting deployment..."

# 1. Install frontend dependencies & build
echo "📦 Installing frontend dependencies..."
npm ci --legacy-peer-deps --production=false

echo "🔨 Building frontend..."
npm run build

# 2. Install backend dependencies & build
echo "📦 Installing backend dependencies..."
cd backend
if ! npm ci --legacy-peer-deps --production=false; then
    echo "⚠️  Backend npm ci failed, using existing node_modules"
fi

echo "🔨 Building backend..."
npm run build
cd ..

# 3. Create required directories
mkdir -p backend/uploads
mkdir -p /home/yourhairbeauty/logs

# 4. Restart PM2 process
echo "♻️  Restarting application..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    pm2 restart "$APP_NAME"
else
    pm2 start dist/index.js --name "$APP_NAME" --cwd "$BACKEND_CWD"
fi

# 5. Save PM2 process list (survives reboot)
pm2 save

echo ""
echo "✅ Deployment complete!"
echo "🌐 Site: https://yourhairbeauty.co.uk"
echo "📊 Logs: pm2 logs yourhairbeauty"
echo "📈 Status: pm2 status"
