# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Worldpay HPP Integration

Backend endpoints implemented:

- `POST /api/payments/worldpay/session`
- `GET /api/payments/status?ref=TRANSACTION_REFERENCE`
- `POST /api/webhooks/worldpay`
- `POST /api/dev/simulate-worldpay-webhook` (development only)

### Environment variables (backend)

Set these in `backend/.env`:

- `WORLDPAY_BASE_URL` (use `https://try.access.worldpay.com` in Try)
- `WORLDPAY_USERNAME`
- `WORLDPAY_PASSWORD`
- `WORLDPAY_ENTITY` (merchant entity, e.g. `PO4089899937`)
- `WORLDPAY_NARRATIVE_LINE1` (statement descriptor line)
- `APP_BASE_URL` (frontend base URL used for Worldpay result URLs)

### Database schema

Worldpay flow uses:

- `orders` (`status` includes payment lifecycle values, plus currency/exchange_rate)
- `payment_attempts`
- `webhook_event_logs`

Run schema update on existing DB:

```bash
cd backend
npm run db:worldpay-hpp
```

### Local end-to-end flow

1. Create order at checkout.
2. Frontend calls `POST /api/payments/worldpay/session` and redirects to returned HPP URL.
3. For local webhook testing, call:

```bash
curl -X POST http://localhost:5000/api/dev/simulate-worldpay-webhook \
  -H "Content-Type: application/json" \
  -d "{\"ref\":\"<transactionReference>\",\"type\":\"sentForSettlement\"}"
```

4. `/pay/success` or `/pay/pending` polls `/api/payments/status` until confirmed or failed.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## SEO Setup

- Set `VITE_SITE_URL` in `.env` (example: `https://yourhairbeauty.co.uk`).
- Frontend now outputs:
  - canonical URL tags
  - hreflang tags (`en-GB`, `en-US`, `en-IE`, major EU locales, `x-default`)
  - Open Graph + Twitter meta
  - JSON-LD structured data (`HealthAndBeautyBusiness`, `WebSite`, `WebPage`, `BreadcrumbList`)
- Product pages include JSON-LD for `Product`, `Offer`, and breadcrumb schema.
- Brand pages include collection and item-list schema.
- Backend serves:
  - `GET /robots.txt`
  - `GET /sitemap.xml` (dynamic: static pages + products + brands + categories)
- Backend also sends `X-Robots-Tag: noindex` headers for private routes (`/admin`, `/dashboard`, `/checkout`, `/pay`, auth routes, `/api/*`).
