# Deployment Guide — Your Hair & Beauty

Production deployment for **yourhairbeauty.co.uk** on Virtualmin (Ubuntu 22.04).

---

## Architecture

```
                     ┌──────────────┐
    Internet ──────► │ Apache/Nginx │ :443 (SSL)
                     │   (Proxy)    │
                     └──────┬───────┘
                            │ :5000
                     ┌──────▼───────┐
                     │  Node.js     │  ← PM2 managed
                     │  Express     │
                     │  (backend/)  │
                     ├──────────────┤
                     │ Static Files │  ← dist/ (React build)
                     │ API Routes   │  ← /api/*
                     │ Uploads      │  ← /uploads/*
                     └──────┬───────┘
                            │
                     ┌──────▼───────┐
                     │   MySQL      │
                     │   Database   │
                     └──────────────┘
```

---

## Prerequisites

### 1. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # Should show v20.x
```

### 2. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 startup  # Follow the instructions to enable auto-start on boot
```

### 3. Create MySQL Database

Via Virtualmin UI or command line:

```bash
mysql -u root -p
CREATE DATABASE IF NOT EXISTS yourhairbeauty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'yourhairbeauty'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON yourhairbeauty.* TO 'yourhairbeauty'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Then import the schema:

```bash
cd /home/yourhairbeauty/public_html
mysql -u yourhairbeauty -p yourhairbeauty < backend/database/schema.sql
```

---

## Deployment Steps

### 1. Upload Files

Upload the project to `/home/yourhairbeauty/public_html/` via SFTP or Git:

```bash
cd /home/yourhairbeauty/public_html
git clone YOUR_REPO_URL .
# or upload via FileZilla/WinSCP
```

### 2. Configure Environment

```bash
# Backend environment (REQUIRED — copy and fill in real values)
cp backend/.env.example backend/.env
nano backend/.env

# Frontend environment (for build)
cp .env.example .env
nano .env
# Set: VITE_API_URL=/api
```

**Critical values to set in `backend/.env`:**

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DB_USER` | `yourhairbeauty` |
| `DB_PASSWORD` | Your MySQL password |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `WORLDPAY_ENV` | `live` |
| `FRONTEND_URL` | `https://yourhairbeauty.co.uk` |
| `SMTP_PASS` | Your email password |

### 3. Build & Deploy

```bash
chmod +x deploy.sh
bash deploy.sh
```

### 4. Verify

```bash
# Check process is running
pm2 status

# Check health endpoint
curl http://localhost:5000/api/health

# Check logs
pm2 logs yourhairbeauty --lines 20
```

---

## Web Server Proxy Setup

### Option A: Apache (Default on Virtualmin)

In Virtualmin → Web Configuration → Edit Directives, add:

```apache
# Node.js Reverse Proxy
ProxyPreserveHost On
ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/

# Allow websockets (optional, for future use)
RewriteEngine On
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteRule /(.*) ws://127.0.0.1:5000/$1 [P,L]
```

Enable required Apache modules:

```bash
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2
```

### Option B: Nginx

If using Nginx, create `/etc/nginx/sites-available/yourhairbeauty.co.uk`:

```nginx
server {
    listen 80;
    server_name yourhairbeauty.co.uk www.yourhairbeauty.co.uk;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourhairbeauty.co.uk www.yourhairbeauty.co.uk;

    ssl_certificate /home/yourhairbeauty/ssl.cert;
    ssl_certificate_key /home/yourhairbeauty/ssl.key;

    # Proxy all requests to Node.js
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Then enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/yourhairbeauty.co.uk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL Certificate

Virtualmin handles SSL automatically via Let's Encrypt. Verify in:
**Virtualmin → Server Configuration → Manage SSL Certificate → Let's Encrypt**

---

## File Permissions

```bash
# Ensure Node.js can write to uploads
chown -R yourhairbeauty:yourhairbeauty /home/yourhairbeauty/public_html/backend/uploads
chmod 755 /home/yourhairbeauty/public_html/backend/uploads

# Ensure logs directory exists and is writable
mkdir -p /home/yourhairbeauty/logs
chown yourhairbeauty:yourhairbeauty /home/yourhairbeauty/logs
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check if app is running |
| `pm2 logs yourhairbeauty` | View live logs |
| `pm2 restart yourhairbeauty` | Restart the app |
| `pm2 stop yourhairbeauty` | Stop the app |
| `bash deploy.sh` | Full rebuild & restart |
| `curl localhost:5000/api/health` | Health check |

---

## Folder Structure (Production)

```
/home/yourhairbeauty/
├── public_html/              ← Project root
│   ├── dist/                 ← Frontend build (served by Express)
│   ├── backend/
│   │   ├── dist/             ← Compiled backend JS
│   │   ├── uploads/          ← User uploads
│   │   ├── database/         ← Schema & seed SQL
│   │   ├── .env              ← Backend secrets (not in git)
│   │   └── package.json
│   ├── ecosystem.config.js   ← PM2 config
│   ├── deploy.sh             ← Deploy script
│   ├── .env                  ← Frontend env (VITE_API_URL=/api)
│   └── package.json
└── logs/                     ← PM2 application logs
```
