# Paystack to Ivory Pay Migration Guide

## Overview

This document outlines the migration from Paystack to Ivory Pay payment processor for the LinkSwift Travel Hub platform. All ride and stay booking payments now use Ivory Pay instead of Paystack.

## Migration Changes

### 1. Environment Variables

**Before (Paystack):**
```
PAYSTACK_SECRET_KEY=sk_test_xxx
```

**After (Ivory Pay):**
```
IVORYPAY_PUBLIC_KEY=pk_test_xxx
IVORYPAY_SECRET_KEY=sk_test_xxx
```

Both keys are required for production deployment.

### 2. Service Layer

**Removed:**
- `backend/services/paystack.ts`

**Added:**
- `backend/services/ivorypay.ts`

**Key differences:**
| Aspect | Paystack | Ivory Pay |
|--------|----------|-----------|
| Base URL | `https://api.paystack.co` | `https://api.ivorypay.io` |
| Auth Header | `Authorization: Bearer` | `x-api-key` |
| Signature Algorithm | HMAC SHA512 | HMAC SHA256 |
| Webhook Header | `x-paystack-signature` | `x-ivorypay-signature` |
| Success Event | `charge.success` | `payment.success` |

### 3. Payment Routes

**Before:**
```
POST /api/payments/paystack/webhook
```

**After:**
```
POST /api/payments/ivorypay/webhook
```

### 4. Controllers Updated

- `backend/controllers/paymentController.ts`
  - `handlePaystackWebhook` → `handleIvoryPayWebhook`
  - Updated event type detection: `charge.success` → `payment.success`
  - Updated signature verification method

- `backend/controllers/rideController.ts`
  - Uses `initializeIvoryPayTransaction` instead of `initializePaystackTransaction`
  - Payment response provider: `"IvoryPay"` instead of `"Paystack"`

- `backend/controllers/stayController.ts`
  - Uses `initializeIvoryPayTransaction` instead of `initializePaystackTransaction`
  - Payment response provider: `"IvoryPay"` instead of `"Paystack"`

### 5. Webhook Configuration

To complete the migration:

1. **Remove Paystack webhook:**
   - Log in to Paystack dashboard
   - Remove webhook for `POST /api/payments/paystack/webhook`

2. **Add Ivory Pay webhook:**
   - Log in to Ivory Pay dashboard
   - Add webhook endpoint: `https://yourdomain.com/api/payments/ivorypay/webhook`
   - Ensure signature header is set to: `x-ivorypay-signature`

### 6. Testing

Test files have been updated:

- `tests/paystack.test.ts`
  - Updated to test `verifyIvoryPayWebhookSignature`
  - Uses SHA256 HMAC algorithm
  - Tests with `payment.success` event type

- `tests/integration.test.ts`
  - Updated webhook handler test to use Ivory Pay
  - Uses correct signature header and event structure

Run tests with:
```bash
npm run test
```

### 7. Documentation Updates

- **README.md**: Updated webhook configuration section
- **OPERATIONS_RUNBOOK.md**: Updated environment variable rotation guidance
- **.env.example**: Updated with Ivory Pay keys

## API Response Format

### Payment Initialization Response

**Both providers return similar structure:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.ivorypay.io/...",
    "access_code": "XXXXX",
    "reference": "LS-RIDE-XXXXX"
  }
}
```

### Webhook Payload

**Ivory Pay webhook:**
```json
{
  "event": "payment.success",
  "data": {
    "id": "STRING",
    "reference": "LS-RIDE-XXXXX",
    "status": "success",
    "metadata": {
      "bookingType": "ride",
      "bookingId": "...",
      "userId": "..."
    }
  }
}
```

## Event Naming Convention

Payment references maintain the same format:
- Rides: `LS-RIDE-{8-char-hex}`
- Stays: `LS-STAY-{8-char-hex}`

## Provider Field in PaymentEvent

The `PaymentEvent` model now stores:
```javascript
{
  provider: 'ivorypay',  // Changed from 'paystack'
  eventKey: 'ivorypay:{id}',  // Changed from 'paystack:{id}'
  eventType: 'payment.success',  // Changed from 'charge.success'
  ...
}
```

## Rollback Plan

If needed to rollback to Paystack:

1. Reverse all environment variables
2. Restore `backend/services/paystack.ts` from git history
3. Revert changes to controllers and routes
4. Update webhook configuration in Paystack dashboard
5. Redeploy application

```bash
git revert <commit-hash>
```

## Support and Troubleshooting

### Common Issues

**Invalid signature error:**
- Verify `IVORYPAY_SECRET_KEY` matches dashboard key
- Ensure webhook handler receives raw body (not JSON-parsed)

**Transaction initialization failure:**
- Verify `IVORYPAY_PUBLIC_KEY` is correct
- Check if Ivory Pay API is accessible
- Ensure request headers include `x-api-key`

**Webhook not firing:**
- Confirm webhook URL is publicly accessible
- Check Ivory Pay dashboard for webhook delivery logs
- Verify `x-ivorypay-signature` header is being sent

### Debugging

Enable debug logging by adding console statements in:
- `backend/services/ivorypay.ts`
- `backend/controllers/paymentController.ts`

## Timeline

- **Phase 1**: Environment setup and testing
- **Phase 2**: Deploy to staging
- **Phase 3**: Production deployment
- **Phase 4**: Monitor webhook processing
- **Phase 5**: Decommission Paystack integration

## Next Steps

1. Update deployment configuration with new environment variables
2. Test payment flow end-to-end in staging
3. Coordinate with Ivory Pay support for webhook verification
4. Monitor payment success rates post-deployment
5. Update user-facing documentation if needed
