# Linkswift Super App - Developer Quick Reference Guide

## Quick Navigation

### Core Documentation
1. **[SUPER_APP_EXECUTIVE_SUMMARY.md](./SUPER_APP_EXECUTIVE_SUMMARY.md)** - Strategic vision & business model (500 lines)
2. **[LINKSWIFT_SUPER_APP_TECHNICAL_BRIEF.md](./LINKSWIFT_SUPER_APP_TECHNICAL_BRIEF.md)** - Complete technical architecture (2,500 lines)
3. **[IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)** - Sprint-by-sprint plan (750 lines)
4. **[PAYSTACK_TO_IVORYPAY_MIGRATION.md](./docs/PAYSTACK_TO_IVORYPAY_MIGRATION.md)** - Payment provider migration guide

---

## Phase 1 Development Checklist

### Months 1-2: Wallet Foundation

**Database Models to Create:**
```typescript
// backend/models/
- EnhancedWalletAccount.ts       // Extended from WalletAccount
- EnhancedWalletTransaction.ts   // Extended from WalletTransaction
- FundingSource.ts               // New
- Beneficiary.ts                 // New
```

**API Routes to Implement:**
```
POST   /api/wallet/fund                       Add funds
POST   /api/wallet/p2p/transfer               P2P transfer
GET    /api/wallet/beneficiaries              List beneficiaries
POST   /api/wallet/beneficiaries              Add beneficiary
```

**Frontend Components:**
```
- WalletHomePage.tsx
- P2PTransferFlow.tsx
- BeneficiaryManager.tsx
- TransactionHistory.tsx
- FundingSourceManager.tsx
```

**Integrations:**
```
- Ivory Pay API (already migrated)
- Bank transfer APIs (if not via Ivory Pay)
- SMS notifications for transfers
```

---

### Months 3-4: Bill Payments

**Database Models:**
```typescript
- BillProvider.ts
- BillPaymentHistory.ts
- RecurringBillPayment.ts
```

**Key Endpoints:**
```
GET    /api/wallet/bills/providers
POST   /api/wallet/bills/pay
GET    /api/wallet/bills/validate
GET    /api/wallet/bills/history
```

**Providers to Integrate (MVP):**
1. Electricity (3 major DisCos)
2. Airtime (4 telecom operators)
3. Cable TV (DStv)

---

### Months 5-8: Delivery Orders

**Database Models:**
```typescript
- DeliveryOrder.ts
- DeliveryRider.ts
- DeliveryRating.ts
```

**API Endpoints:**
```
POST   /api/delivery/orders
GET    /api/delivery/orders/:orderId
GET    /api/delivery/orders/:orderId/tracking
POST   /api/delivery/orders/:orderId/proof
```

**Real-time Features:**
- WebSocket tracking updates (Redis pubsub)
- Live ETA calculation
- Push notifications

---

### Months 9-12: Combo & Loyalty

**Extend Existing Models:**
```typescript
// RideBooking: Add delivery bundle reference
// WalletTransaction: Add loyalty points calculation

// New Models:
- LoyaltyAccount.ts
- LoyaltyTransaction.ts
- LoyaltyRule.ts
```

**Loyalty Points Rules:**
- Ride: 1 point per ₦10 spent
- Delivery: 1 point per ₦8 spent
- Bill payment: 1 point per ₦20 spent
- Referral: 500 points per successful referral

---

## Phase 2 Development Checklist

### Months 5-6: Safety Suite

**Database Models:**
```typescript
- SafetyProfile.ts
- SOSIncident.ts
- AudioRecording.ts
- TrustedContact.ts
```

**Critical API Endpoints:**
```
POST   /api/safety/sos/trigger
POST   /api/safety/verification/id
POST   /api/safety/verification/facial
```

**External Integrations:**
- Emergency services APIs
- Facial recognition provider
- SMS provider (for emergency alerts)

---

### Months 7-8: AI Services

**Services to Build:**
- Route optimization ML model
- NLP chatbot integration
- User prediction models

**Key Endpoints:**
```
POST   /api/ai/routes/optimize
POST   /api/ai/chat/message
GET    /api/ai/predictions/user
```

---

### Months 9-10: Mini-Apps Framework

**Build SDK:**
```typescript
// linkswift-miniapp-sdk/
class LinkswiftMiniApp {
  async getCurrentUser()
  async initiatePayment()
  async createOrder()
  async updateOrderStatus()
  async logEvent()
}
```

**Admin APIs for Mini-Apps:**
```
POST   /api/miniapps/register
GET    /api/miniapps/list
POST   /api/miniapps/:appId/payment
POST   /api/miniapps/:appId/webhook
```

---

## Database Schema Overview

### Collections to Create

| Collection | Size (Phase 1) | Growth (Phase 3) | Indexing |
|-----------|---|---|---|
| Enhanced_WalletAccounts | 100K | 2M | user_id, status |
| EnhancedWalletTransactions | 1M | 500M | wallet_id, created_at |
| DeliveryOrders | 100K | 1M | user_id, status, created_at |
| LoyaltyAccounts | 50K | 1M | user_id, tier |
| SafetyProfiles | 10K | 500K | user_id, verified |
| SOSIncidents | 100 | 10K | user_id, status |
| MiniAppOrders | 5K | 1M | app_id, user_id |
| InsurancePolicies | 5K | 100K | user_id, status |
| LoyaltyTransactions | 100K | 100M | account_id, type |

**Sharding Strategy (Phase 2+):**
- Shard by `user_id` for collections > 10GB
- Keep lookup tables (providers, rules) on primary
- Read replicas in each region

---

## API Response Format

### Standard Success Response
```json
{
  "success": true,
  "data": {
    // Feature-specific data
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-04-02T10:30:00Z",
    "version": "v1"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Wallet balance insufficient for transaction",
    "details": {
      "required": 5000,
      "available": 2000
    }
  }
}
```

---

## Key Algorithms & Business Logic

### Loyalty Points Calculation
```typescript
function calculateLoyaltyPoints(transaction: {
  type: string,
  amount: number,
  userTier: string,
  date: Date
}): number {
  let basePoints = 0;
  
  // Service-based calculation
  if (transaction.type === 'ride') {
    basePoints = Math.floor(transaction.amount / 10);
  } else if (transaction.type === 'delivery') {
    basePoints = Math.floor(transaction.amount / 8);
  } else if (transaction.type === 'bill_payment') {
    basePoints = Math.floor(transaction.amount / 20);
  }
  
  // Tier-based multiplier
  const multipliers = {
    'bronze': 1.0,
    'silver': 1.25,
    'gold': 1.5,
    'platinum': 2.0,
    'diamond': 2.5
  };
  
  return Math.floor(basePoints * multipliers[transaction.userTier]);
}
```

### Surge Pricing (Delivery)
```typescript
function calculateDeliveryPrice(order: {
  distance: number,
  weight: number,
  timestamp: Date,
  timeOfDay: 'peak' | 'normal' | 'off_peak'
}): number {
  const baseFare = 300;
  const distanceFare = order.distance * 40;
  const weightFare = Math.max(0, (order.weight - 1) * 5);
  
  const surgePrices = {
    'peak': 1.5,    // 7-9 AM, 5-7 PM
    'normal': 1.0,  // 9 AM - 5 PM
    'off_peak': 0.8 // 7 PM - 7 AM
  };
  
  const subtotal = baseFare + distanceFare + weightFare;
  return Math.round(subtotal * surgePrices[order.timeOfDay]);
}
```

### Delivery Driver Matching
```typescript
function findBestDriver(order: DeliveryOrder): Driver {
  const availableDrivers = drivers.filter(d => 
    d.status === 'available' &&
    d.vehicleType.includes(order.package.category) &&
    isWithinServiceArea(d.location, order.pickup)
  );
  
  // Score by: distance to pickup, rating, current load
  return availableDrivers.reduce((best, current) => {
    const score = 
      (100 - distanceTo(current, order.pickup)) +
      (current.rating * 10) -
      (current.currentOrders.length * 5);
    
    return score > best.score ? current : best;
  });
}
```

---

## Security Checklist

### Authentication
- [ ] JWT implementation with 15-min expiry
- [ ] Refresh token rotation
- [ ] Multi-factor authentication (SMS OTP)
- [ ] Rate limiting: 100 requests/minute per user

### Data Protection
- [ ] Encryption at rest (AES-256)
- [ ] TLS 1.3 for all HTTP
- [ ] Field-level encryption for PII
- [ ] Signed document URLs (30-day expiry)

### Financial Security
- [ ] No raw card storage
- [ ] Transaction signing & verification
- [ ] Double-entry bookkeeping for wallet
- [ ] Duplicate transaction detection

### Compliance
- [ ] NDPR data processing agreements
- [ ] Privacy policy acceptance tracking
- [ ] Data deletion audit logs
- [ ] Right-to-be-forgotten implementation

---

## Performance Targets

| Metric | Target | How to Achieve |
|--------|--------|---|
| API latency (p95) | < 200ms | Redis cache, DB indexing |
| Booking to driver | < 30s | Pre-calculated zones |
| Real-time location | < 5s latency | WebSocket, Redis pubsub |
| Payment processing | < 2s | Async job queue |
| Page load (3G mobile) | < 3s | CDN, lazy loading |

---

## Testing Requirements

### Unit Tests (60% code coverage)
- Service logic
- Calculation algorithms
- Validation rules
- Error handling

### Integration Tests (25%)
- API endpoints with mocked DB
- Payment flow simulation
- Email/SMS notifications
- External API calls (mocked)

### E2E Tests (15%, critical flows)
1. Complete ride + delivery combo booking
2. Bill payment from start to confirmation
3. P2P transfer between users
4. SOS incident response
5. Loyalty points calculation

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit + integration + E2E)
- [ ] Code review approved
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Staging environment tested

### Deployment (Canary)
- [ ] Deploy to 5% of traffic
- [ ] Monitor error rates (< 0.1%)
- [ ] Monitor latency (p95 < 200ms)
- [ ] Gradual rollout to 100%

### Post-Deployment
- [ ] Health check passing
- [ ] Database migrations verified
- [ ] Feature flags enabled
- [ ] Analytics tracking verified
- [ ] On-call monitoring active

---

## Common Development Patterns

### Creating a New Service Endpoint

```typescript
// 1. Define the route
router.post('/api/wallet/p2p/transfer', 
  authenticate,
  validateRequest(P2PTransferSchema),
  async (req, res) => {
    try {
      const result = await p2pTransferService.transfer(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      handleError(error, res);
    }
  }
);

// 2. Create the service
class P2PTransferService {
  async transfer(data: P2PTransferRequest): Promise<Transaction> {
    // Validate both wallets exist
    // Check sender balance
    // Deduct + add within transaction
    // Create transaction record
    // Send notifications
    // Log to audit trail
  }
}

// 3. Add integration tests
test('P2P transfer success', async () => {
  const result = await p2pTransferService.transfer({
    toPhone: '08012345678',
    amount: 5000
  });
  
  expect(result.status).toBe('completed');
  expect(result.amount).toBe(5000);
});
```

### Real-Time Updates Pattern

```typescript
// Emit updates to WebSocket clients
io.to(`user:${userId}`).emit('wallet:updated', {
  newBalance: wallet.balance,
  transaction: {
    id: transaction._id,
    amount: transaction.amount,
    type: transaction.type
  }
});

// Client listener
socket.on('wallet:updated', (data) => {
  updateWalletUI(data.newBalance);
  showNotification(`+₦${data.transaction.amount} received`);
});
```

---

## Environment Variables Required

### Phase 1 (MVP)
```
# Payment
IVORYPAY_PUBLIC_KEY=pk_live_...
IVORYPAY_SECRET_KEY=sk_live_...

# Database
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...

# Authentication
JWT_SECRET=your_secret_key
JWT_EXPIRY=900          # 15 minutes

# APIs
GOOGLE_MAPS_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# App
APP_URL=https://linkswift.app
NODE_ENV=production
```

### Phase 2 (Add for Safety)
```
# Safety
FACIAL_RECOGNITION_API_KEY=...
EMERGENCY_DISPATCH_API_KEY=...

# AI
GOOGLE_VERTEX_AI_KEY=...
OPENAI_API_KEY=...
```

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run lint                  # TypeScript lint
npm test                      # Run tests
npm run test:e2e              # E2E tests

# Database
npm run db:migrate            # Run migrations
npm run db:seed               # Seed sample data
npm run db:backup             # Backup MongoDB

# Deployment
npm run build                 # Build for production
npm run deploy:staging        # Deploy to staging
npm run deploy:prod           # Deploy to production
npm run rollback              # Rollback deployment

# Monitoring
npm run logs:prod             # View production logs
npm run metrics:dashboard     # Open metrics dashboard
npm run health:check          # Health check all services
```

---

## Quick Contact Reference

### During Development
- **Product Manager**: Strategy & feature decisions
- **Security Lead**: Security reviews, compliance
- **DevOps Lead**: Infrastructure, deployment issues
- **Design Lead**: UI/UX standards

### For Integrations
- **Payment**: Ivory Pay (already integrated)
- **Maps**: Google Maps API / OpenStreetMap
- **Emergency**: Local police & ambulance services
- **AI/ML**: Google Vertex AI or OpenAI

---

## Key Deadlines

### Phase 1 (MVP)
- **Week 4**: Wallet MVP complete
- **Week 8**: Bill payments live
- **Week 12**: Delivery orders MVP
- **Week 16**: Combo + Loyalty complete

### Deliverable Quality Gates
- Code coverage: > 80%
- API documentation: 100%
- Security review: Passed
- Performance tests: Passed

---

## Resources

### Documentation Files in Repo
- `LINKSWIFT_SUPER_APP_TECHNICAL_BRIEF.md` - Full architecture (start here)
- `IMPLEMENTATION_ROADMAP.md` - Sprint planning
- `SUPER_APP_EXECUTIVE_SUMMARY.md` - Business strategy
- `README.md` - Project overview
- `docs/OPERATIONS_RUNBOOK.md` - Ops procedures

### External Resources
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## FAQ

**Q: Where do I start if I'm new to the project?**
A: Read SUPER_APP_EXECUTIVE_SUMMARY.md (20 min) → LINKSWIFT_SUPER_APP_TECHNICAL_BRIEF.md (parts 2-3) → IMPLEMENTATION_ROADMAP.md

**Q: What's the priority order for Phase 1?**
A: Wallet → Bills → Delivery → Loyalty (in that order)

**Q: Who do I ask about feature scope changes?**
A: Your Product Manager, but check IMPLEMENTATION_ROADMAP.md first

**Q: How do I report a security issue?**
A: Contact the Security Lead immediately (not in GitHub issues)

**Q: What's the approval process for API changes?**
A: Design spec → Code review → Security review → Staging test

---

**Version**: 1.0  
**Last Updated**: April 2, 2026  
**Status**: Ready for Development
