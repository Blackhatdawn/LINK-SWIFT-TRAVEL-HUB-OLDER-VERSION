
# LinkSwift Travel Hub

This repository contains a full-stack Vite + React + Express application.

## Run locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Update required variables in `.env.local` (`JWT_SECRET` is mandatory, and `MONGO_URI` is required in production).
4. Start dev server:
   ```bash
   npm run dev
   ```

## Production notes

- `NODE_ENV=production` requires a valid `MONGO_URI`.
- Set `PAYSTACK_SECRET_KEY` for payment initialization and webhook signature validation (required).
- Configure `CLIENT_ORIGINS` to trusted domains only.
- Build the frontend before running in production:
  ```bash
  npm run build
  ```

## Scripts

- `npm run dev` — run backend + Vite middleware
- `npm run build` — build frontend
- `npm run preview` — preview built frontend
- `npm run lint` — type-check (no emit)


## Payments webhook

Configure Paystack webhook URL to:

```
POST /api/payments/paystack/webhook
```


## Core API surfaces

- `GET /api/wallet`
- `POST /api/wallet/topup`
- `POST /api/wallet/transfer`
- `POST /api/wallet/pay`
- `POST /api/express/quote`
- `POST /api/express/orders`
- `GET /api/express/orders/my`
- `GET /api/miniapps/catalog`
- `GET /api/miniapps/catalog/:appId`
- `POST /api/miniapps/orders`
- `GET /api/miniapps/orders/my`

### Payment return UI

Set your Paystack callback URL to:

```
${APP_URL}/payment/return
```

The app polls `GET /api/payments/status/:reference` to display pending/success/failure states.
