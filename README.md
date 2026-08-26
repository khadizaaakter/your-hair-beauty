# React + TypeScript + Vite

A full-stack e-commerce platform for hair and beauty products, built with React, TypeScript, Vite, and Node.js.

## Features

* Product browsing and e-commerce functionality
* Shopping cart and checkout
* User authentication
* Order management
* Worldpay payment integration
* Payment status and webhook handling
* SEO optimization with JSON-LD, sitemap, robots.txt, and hreflang
* Responsive and modern UI

## Tech Stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Node.js
* REST API

## Project Structure

```text
yourhairbeauty/
├── backend/       # Backend and API
├── src/           # Frontend source
├── public/        # Static assets
├── .env.example   # Environment configuration
├── DEPLOYMENT.md  # Deployment guide
└── package.json
```

## Setup

```bash
npm install
npm run dev
```

Configure the required environment variables in `.env` and `backend/.env`.

For Worldpay database setup:

```bash
cd backend
npm run db:worldpay-hpp
```

## Payment Flow

Checkout → Worldpay → Webhook → Payment Status → Order Confirmation

## Deployment

See `DEPLOYMENT.md` for deployment instructions.
