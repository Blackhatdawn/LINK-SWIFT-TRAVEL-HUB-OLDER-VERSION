# Linkswift Super App - Comprehensive Technical Development Brief

## Executive Summary

This document provides a detailed technical architecture and implementation roadmap for transforming the Linkswift Ride platform into a comprehensive African super app ecosystem. The transformation integrates 11 new feature categories across payments, delivery, safety, AI, and ecosystem services, designed to create a unified, seamless user experience while maintaining operational excellence in emerging markets.

**Current State**: Ride-hailing and short-term stay booking platform with basic wallet functionality
**Target State**: Multi-service super app with integrated payments, delivery, safety, AI, and extensible mini-app ecosystem
**Market**: Nigeria and Sub-Saharan Africa with support for low-bandwidth networks
**Timeline**: 18-month phased rollout across MVP, Core, and Premium phases

---

## Part 1: High-Level Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LINKSWIFT SUPER APP PLATFORM                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │            UNIFIED USER EXPERIENCE LAYER (Mobile & Web)          │   │
│  │  ┌─────────┬─────────┬─────────┬─────────┬─────────┬──────────┐ │   │
│  │  │  Rides  │Delivery │Payments │ Wallet  │  Safety │Mini-Apps │ │   │
│  │  └─────────┴─────────┴─────────┴─────────┴─────────┴──────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                  │                                      │
├──────────────────────────────────┼──────────────────────────────────────┤
│                                  │                                      │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │            API GATEWAY & ORCHESTRATION LAYER                    │   │
│  │  ┌────────────┬────────────┬────────────┬─────────────┐        │   │
│  │  │  Auth     │  Routing   │ Payments  │ Notifications        │   │
│  │  └────────────┴────────────┴────────────┴─────────────┘        │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                      │
├──────────────────────────────────┼──────────────────────────────────────┤
│                                  │                                      │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │        BUSINESS LOGIC & MICROSERVICES LAYER                     │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │   │
│  │  │  Ride    │ Delivery │  Wallet  │Insurance │ Loyalty  │      │   │
│  │  │ Service  │ Service  │ Service  │ Service  │ Service  │      │   │
│  │  └──────────┴──────────┴──────────┴──────────┴──────────┘      │   │
│  │  ┌──────────┬──────────┬──────────┬──────────┐                 │   │
│  │  │  Booking │ Matching │   AI /   │ Safety   │                 │   │
│  │  │ Service  │ Service  │  Analytics│ Service  │                 │   │
│  │  └──────────┴──────────┴──────────┴──────────┘                 │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                      │
├──────────────────────────────────┼──────────────────────────────────────┤
│                                  │                                      │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │          DATA PERSISTENCE & CACHING LAYER                       │   │
│  │  ┌────────────┬────────────┬────────────┬─────────────┐        │   │
│  │  │ MongoDB    │   Redis    │ PostgreSQL │   Elastics  │        │   │
│  │  │ (Primary)  │ (Cache)    │(Analytics) │  (Logs)     │        │   │
│  │  └────────────┴────────────┴────────────┴─────────────┘        │   │
│  └──────────────────────────────┬──────────────────────────────────┘   │
│                                  │                                      │
├──────────────────────────────────┼──────────────────────────────────────┤
│                                  │                                      │
│  ┌──────────────────────────────▼──────────────────────────────────┐   │
│  │        EXTERNAL INTEGRATIONS & SERVICES LAYER                   │   │
│  │  ┌─────────────┬──────────────┬──────────────────────┐         │   │
│  │  │ Payment     │ Location &   │   Safety & Analytics │         │   │
│  │  │ Providers   │ Routing      │   Providers          │         │   │
│  │  │ (Ivory Pay) │ (Google, OSM)│ (AI, Emergency, RLS) │         │   │
│  │  └─────────────┴──────────────┴──────────────────────┘         │   │
│  │  ┌─────────────┬──────────────┬──────────────────────┐         │   │
│  │  │ Telecom &   │  Bank API    │   CDN & Storage      │         │   │
│  │  │ Utilities   │  Integration │   (Blob, Images)     │         │   │
│  │  └─────────────┴──────────────┴──────────────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Frontend:**
- React 19 with Vite bundling
- React Router v7 for navigation
- Tailwind CSS v4 for styling
- Motion for animations
- Socket.io-client for real-time updates
- Lucide React for icons

**Backend:**
- Node.js/Express.js
- MongoDB (primary document store)
- Redis (caching and real-time features)
- Socket.io for WebSocket connections
- JWT for authentication
- TypeScript for type safety

**External Services:**
- Ivory Pay (payments)
- Google Maps API / OpenStreetMap (routing)
- Twilio / African telecom APIs (SMS/USSD)
- Facial recognition APIs (safety verification)
- AI/ML services (route optimization, recommendations)

### 1.3 Core Design Principles

1. **Unified Experience**: Single entry point for all services
2. **Seamless Transactions**: Integrated wallet flows across all services
3. **Trust & Safety**: Multi-layered verification and real-time monitoring
4. **Offline Resilience**: Queue-based operations for low-bandwidth scenarios
5. **Scalability**: Microservice architecture with independent scaling
6. **Extensibility**: Mini-app framework for third-party integrations
7. **Compliance**: NDPR, PCI-DSS, and local regulatory adherence

---

## Part 2: Feature-Specific Architecture & Implementation

### 2.1 Linkswift Express (Package/Parcel Delivery)

#### Overview
On-demand courier service with real-time tracking, proof-of-delivery, and integrated "Ride + Deliver" combo option.

#### Database Schema

```typescript
// DeliveryOrder Model
interface DeliveryOrder {
  _id: ObjectId;
  sender: ObjectId;              // User reference
  receiver: ObjectId;            // User reference (optional - can be address-based)
  package: {
    description: string;
    weight: number;              // kg
    dimensions: { length: number; width: number; height: number };
    category: 'document' | 'small' | 'medium' | 'large' | 'fragile';
    estimatedValue: number;      // for insurance calculation
    contents: string;            // declared contents
    requiresSignature: boolean;
    requiresPhotoProof: boolean;
  };
  pickup: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName: string;
    contactPhone: string;
    scheduledTime?: Date;
  };
  dropoff: {
    address: string;
    coordinates: { lat: number; lng: number };
    contactName: string;
    contactPhone: string;
    instructions?: string;
  };
  logistics: {
    rider: ObjectId;            // Delivery rider reference
    vehicleType: 'motorcycle' | 'car' | 'truck';
    estimatedDistance: number;  // km
    estimatedDuration: number;  // minutes
    actualRoute?: {
      polyline: string;         // encoded polyline
      trackingUpdates: Array<{
        timestamp: Date;
        location: { lat: number; lng: number };
        status: string;
      }>;
    };
  };
  pricing: {
    baseFare: number;
    distanceFare: number;
    weightFare: number;
    insuranceFee?: number;
    promoDiscount?: number;
    totalAmount: number;
    currency: 'NGN';
  };
  payment: {
    method: 'wallet' | 'card' | 'cash_on_delivery';
    paymentReference?: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp?: Date;
  };
  proofOfDelivery: {
    deliveredAt?: Date;
    recipientName?: string;
    recipientSignature?: string;      // Base64 encoded
    photos: string[];                 // Array of signed image URLs
    notes?: string;
    status: 'pending' | 'delivered' | 'failed' | 'returned';
  };
  rideBundle?: {
    linkedRide: ObjectId;            // Reference to RideBooking if combo
    riderCombined: boolean;
  };
  status: 'requested' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  ratings?: {
    riderRating: number;             // 1-5
    deliveryQuality: number;         // 1-5
    riderFeedback: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// DeliveryRider Model
interface DeliveryRider extends User {
  riderProfile: {
    licenseNumber: string;
    licenseExpiry: Date;
    vehicleType: string[];           // Supported vehicle types
    currentVehicle?: {
      plate: string;
      make: string;
      model: string;
      insuranceExpiry: Date;
    };
    completedDeliveries: number;
    averageRating: number;
    acceptanceRate: number;
    cancellationRate: number;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    documents: {
      licensePhoto: string;
      vehicleRegistration: string;
      insuranceCertificate: string;
      backgroundCheckStatus: 'pending' | 'verified' | 'failed';
    };
  };
}
```

#### API Endpoints

```
POST   /api/delivery/orders                    Create delivery request
GET    /api/delivery/orders/:orderId          Get delivery details
GET    /api/delivery/orders                   List user's deliveries (paginated)
PATCH  /api/delivery/orders/:orderId/status   Update delivery status
GET    /api/delivery/orders/:orderId/tracking  Get real-time tracking
POST   /api/delivery/orders/:orderId/proof     Submit proof of delivery
POST   /api/delivery/orders/:orderId/rate      Rate delivery & rider
GET    /api/delivery/pricing                   Get delivery quote
POST   /api/delivery/combo                     Create ride + delivery combo
GET    /api/delivery/riders/available          Find available riders
```

#### Key Features

1. **Dynamic Pricing Engine**
   - Base fare + distance-based + weight-based pricing
   - Surge pricing during peak hours
   - Promotion and loyalty discounts

2. **Real-Time Tracking**
   - WebSocket-based location updates every 10 seconds
   - Map visualization with ETA
   - Push notifications at key milestones

3. **Proof of Delivery**
   - Photo capture and storage (signed URLs)
   - Digital signature capture
   - GPS coordinates validation

4. **Ride + Deliver Combo**
   - Same driver handles passenger + package
   - Optimized route planning
   - Combined pricing with discount

5. **Rider Fleet Management**
   - Document verification (license, insurance, background check)
   - Real-time availability and capacity tracking
   - Performance metrics and ratings

---

### 2.2 Linkswift Pay (Digital Wallet & Payments)

#### Overview
Full-featured digital wallet with P2P transfers, bill payments, merchant QR payments, and cash-out capabilities.

#### Database Schema

```typescript
// EnhancedWalletAccount Model
interface EnhancedWalletAccount {
  _id: ObjectId;
  user: ObjectId;
  balance: number;
  currency: 'NGN';
  fundingSources: Array<{
    _id: ObjectId;
    type: 'bank_account' | 'debit_card' | 'ussd' | 'agent_cash';
    provider?: string;             // Bank or telecom name
    accountIdentifier: string;     // Last 4 digits or account number
    verified: boolean;
    isPrimary: boolean;
    createdAt: Date;
  }>;
  limits: {
    dailyTransactionLimit: number;
    monthlyTransactionLimit: number;
    maxTransactionAmount: number;
    dailyWithdrawalLimit: number;
  };
  kyc: {
    level: 'tier1' | 'tier2' | 'tier3';  // Progressive KYC tiers
    verified: boolean;
    bvn?: string;                         // Bank Verification Number
    verificationDocuments?: string[];
    verifiedAt?: Date;
  };
  beneficiaries: Array<{
    _id: ObjectId;
    name: string;
    accountNumber?: string;
    bankCode?: string;
    phoneNumber?: string;
    type: 'bank' | 'phone';
    nickname?: string;
    savedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// EnhancedWalletTransaction Model
interface EnhancedWalletTransaction {
  _id: ObjectId;
  fromWallet: ObjectId;
  toWallet?: ObjectId;
  type: 'credit' | 'debit' | 'p2p_transfer' | 'bill_payment' | 'merchant_payment' | 'cash_out' | 'cash_in' | 'refund';
  amount: number;
  currency: 'NGN';
  fee: number;
  netAmount: number;
  
  // P2P Transfer details
  p2pTransfer?: {
    recipientPhone: string;
    recipientName: string;
    note?: string;
    status: 'pending' | 'sent' | 'received' | 'failed';
  };
  
  // Bill Payment details
  billPayment?: {
    provider: 'electricity' | 'airtime' | 'data' | 'cable_tv' | 'water' | 'insurance';
    providerName: string;
    billRef: string;
    customerIdentifier: string;       // Meter number, phone, etc
    billAmount: number;
    confirmationCode?: string;
  };
  
  // Merchant Payment details
  merchantPayment?: {
    merchantId: ObjectId;
    merchantName: string;
    qrCodeId: string;
    reference: string;
    description: string;
  };
  
  // Cash-out details
  cashOut?: {
    method: 'bank_transfer' | 'agent' | 'ussd';
    recipientAccount: string;
    bankCode?: string;
    processingTime: string;           // '1-2 hours' or 'instant'
    status: 'pending' | 'processing' | 'completed' | 'failed';
    failureReason?: string;
  };
  
  // Cash-in details
  cashIn?: {
    agentId: ObjectId;
    agentName: string;
    agentPhone: string;
    reference: string;
    verificationCode?: string;
  };
  
  paymentReference: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  failureReason?: string;
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// MerchantQRCode Model
interface MerchantQRCode {
  _id: ObjectId;
  merchant: ObjectId;
  code: string;                       // Unique QR code identifier
  qrImage: string;                   // Image URL (SVG/PNG)
  label: string;
  amount?: number;                   // Fixed amount (optional)
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// BillProvider Model
interface BillProvider {
  _id: ObjectId;
  name: string;
  category: 'electricity' | 'airtime' | 'data' | 'cable_tv' | 'water' | 'insurance';
  providerCode: string;
  icon: string;
  description: string;
  baseFee: number;
  supportedAmounts?: number[];       // For fixed-amount providers
  apiEndpoint: string;
  requiresCustomerIdentifier: boolean;
  customerIdentifierLabel: string;   // "Meter Number", "Phone Number", etc
  estimatedProcessingTime: string;
  isActive: boolean;
  createdAt: Date;
}
```

#### API Endpoints

```
// Wallet Management
GET    /api/wallet/balance                    Get wallet balance
POST   /api/wallet/fund                       Add funds to wallet
POST   /api/wallet/withdraw                   Withdraw from wallet
GET    /api/wallet/transactions               Get transaction history
GET    /api/wallet/funding-sources            Get linked funding sources
POST   /api/wallet/funding-sources            Link new funding source
DELETE /api/wallet/funding-sources/:sourceId  Unlink funding source

// P2P Transfers
POST   /api/wallet/p2p/transfer               Send money to another user
POST   /api/wallet/p2p/request                Request money from user
GET    /api/wallet/p2p/requests               Get incoming/outgoing requests
PATCH  /api/wallet/p2p/requests/:requestId    Accept/decline request
GET    /api/wallet/beneficiaries              Get saved beneficiaries
POST   /api/wallet/beneficiaries              Add new beneficiary
DELETE /api/wallet/beneficiaries/:beneficiaryId  Remove beneficiary

// Bill Payments
GET    /api/wallet/bills/providers             Get available bill providers
POST   /api/wallet/bills/pay                   Pay a bill
GET    /api/wallet/bills/history               Get bill payment history
POST   /api/wallet/bills/validate              Validate bill details

// Merchant Payments
POST   /api/wallet/merchant/qr/generate        Generate QR code
GET    /api/wallet/merchant/qr/:qrCodeId       Get QR code details
POST   /api/wallet/merchant/pay-qr             Pay via QR code
GET    /api/wallet/merchant/transactions       Get merchant transactions
GET    /api/wallet/merchant/analytics          Get sales analytics

// Cash-Out
POST   /api/wallet/cashout                     Initiate cash-out
GET    /api/wallet/cashout/agents              Find nearby agents
GET    /api/wallet/cashout/banks               Get bank list
GET    /api/wallet/cashout/status/:reference   Check cash-out status

// KYC
POST   /api/wallet/kyc/verify                  Initiate KYC verification
GET    /api/wallet/kyc/status                  Get KYC status
POST   /api/wallet/kyc/documents               Upload KYC documents
```

#### Key Features

1. **Progressive KYC**
   - Tier 1: Phone verification
   - Tier 2: ID document + selfie
   - Tier 3: Full KYC with bank verification

2. **Multiple Funding Sources**
   - Debit cards (Ivory Pay integration)
   - Bank transfers (USSD support)
   - Cash-in through agent network
   - Airtime-to-cash conversion

3. **Bill Payment Integration**
   - Electricity (all Nigerian DisCos)
   - Airtime top-up (MTN, GLO, Airtel, 9mobile)
   - Data bundles
   - Cable TV (DStv, GOtv)
   - Water bills
   - Insurance premiums

4. **Merchant QR Payments**
   - Dynamic and fixed-amount QR codes
   - Real-time transaction notifications
   - Merchant dashboard with analytics

5. **P2P Transfers**
   - Phone number-based transfers
   - Request money functionality
   - Scheduled transfers
   - Transfer limits based on KYC tier

---

### 2.3 Advanced Safety Suite

#### Overview
Multi-layered safety system with SOS, audio recording, enhanced verification, and family monitoring.

#### Database Schema

```typescript
// SafetyProfile Model
interface SafetyProfile {
  _id: ObjectId;
  user: ObjectId;
  trustedContacts: Array<{
    _id: ObjectId;
    name: string;
    phone: string;
    relationship: string;
    notificationPreference: 'all' | 'sos_only' | 'none';
    isEmergencyContact: boolean;
  }>;
  
  verification: {
    idDocument: {
      type: 'national_id' | 'passport' | 'drivers_license';
      number: string;
      issuingCountry: string;
      expiryDate: Date;
      documentImage: string;         // Encrypted storage
      status: 'pending' | 'verified' | 'rejected';
      verifiedAt?: Date;
    };
    facialRecognition: {
      enrollmentPhotos: string[];    // Multiple angles
      verificationVector: Buffer;    // ML embedding
      verified: boolean;
      verifiedAt?: Date;
      failedAttempts: number;
      lastAttempt?: Date;
    };
    backgroundCheck: {
      status: 'pending' | 'clear' | 'flagged';
      checkedAt?: Date;
      expiryDate?: Date;
      agency: string;
    };
  };
  
  audioRecording: {
    enabled: boolean;
    consentGiven: boolean;
    consentDate: Date;
    privacyPolicy: {
      autoDelete: 'never' | '7_days' | '30_days' | '90_days';
      encryptionEnabled: boolean;
      storageLocation: string;       // 'device_only' | 'encrypted_cloud'
    };
  };
  
  emergencySettings: {
    sosButtonConfig: {
      enabled: boolean;
      triggerMethod: 'triple_tap' | 'hold_3sec' | 'voice';
      phrase?: string;               // For voice activation
    };
    autoSOS: {
      enabled: boolean;
      triggerConditions: string[];   // e.g., 'sudden_deceleration', 'unusual_route'
    };
    policeIntegration: {
      enabled: boolean;
      preferredDispatch: string;     // Police unit code
      emergencyNumber: string;
    };
  };
  
  familyProfiles: Array<{
    _id: ObjectId;
    sharedWith: ObjectId;           // Guardian/family member
    viewingPermissions: string[];   // 'live_location', 'ride_history', 'emergency_contacts'
    canDisable: boolean;            // Can person disable monitoring
    createdAt: Date;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

// SOSIncident Model
interface SOSIncident {
  _id: ObjectId;
  user: ObjectId;
  type: 'manual' | 'auto_triggered';
  triggerMethod?: string;           // e.g., 'triple_tap', 'sudden_stop'
  
  location: {
    coordinates: { lat: number; lng: number };
    address: string;
    accuracy: number;               // meters
  };
  
  ride?: {
    rideId: ObjectId;
    driver: ObjectId;
    vehicleInfo: string;
    driverPhoneVisible: boolean;
  };
  
  notificationsSent: Array<{
    recipient: ObjectId;           // Trusted contact or emergency service
    type: 'sms' | 'push' | 'call';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
  }>;
  
  audioRecording?: {
    recordingId: string;
    url: string;                   // Encrypted/signed URL
    duration: number;              // seconds
    encrypted: boolean;
  };
  
  emergencyResponse: {
    policeDispatched: boolean;
    policeArrivalTime?: number;    // minutes
    policeContactPhone?: string;
    ambulanceDispatched: boolean;
    status: 'active' | 'responded' | 'resolved' | 'cancelled';
  };
  
  resolution: {
    resolvedAt?: Date;
    resolutionNotes?: string;
    userConfirmedSafe: boolean;
    confirmedAt?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// AudioRecording Model
interface AudioRecording {
  _id: ObjectId;
  incident: ObjectId;             // SOSIncident reference
  user: ObjectId;
  ride: ObjectId;
  encryptionKey: string;          // Stored securely
  fileUrl: string;                // Signed, expires in 90 days
  duration: number;              // seconds
  audioMetadata: {
    codec: string;
    bitrate: number;
    sampleRate: number;
  };
  accessLog: Array<{
    accessedBy: ObjectId;
    timestamp: Date;
    accessType: 'playback' | 'download' | 'analysis';
  }>;
  retentionPolicy: {
    autoDeleteDate: Date;
    manualDeleteRequest?: Date;
  };
  createdAt: Date;
}
```

#### API Endpoints

```
// Safety Profile
POST   /api/safety/profile/initialize         Create safety profile
GET    /api/safety/profile                    Get safety profile
PATCH  /api/safety/profile                    Update safety settings
POST   /api/safety/trusted-contacts           Add trusted contact
DELETE /api/safety/trusted-contacts/:contactId  Remove contact

// Verification
POST   /api/safety/verification/id            Upload ID document
POST   /api/safety/verification/facial        Enroll for facial recognition
GET    /api/safety/verification/status        Get verification status
POST   /api/safety/verification/bgcheck       Request background check

// SOS & Emergency
POST   /api/safety/sos/trigger                Trigger SOS manually
POST   /api/safety/sos/cancel                 Cancel active SOS
GET    /api/safety/sos/history                Get SOS history
GET    /api/safety/sos/:sosId                 Get SOS incident details
PATCH  /api/safety/sos/:sosId/resolve         Resolve SOS incident

// Audio Recording
GET    /api/safety/recording/consent          Get recording consent
POST   /api/safety/recording/consent          Grant consent
DELETE /api/safety/recording/consent          Revoke consent
GET    /api/safety/recording/:recordingId     Get recording (encrypted)
GET    /api/safety/recording/:recordingId/logs  Get access logs

// Family Monitoring
POST   /api/safety/family-profiles            Share profile with family member
GET    /api/safety/family-profiles            Get monitoring permissions
DELETE /api/safety/family-profiles/:shareId   Remove family member access
```

#### Key Features

1. **SOS System**
   - Triple-tap activation
   - Voice activation with custom phrase
   - Auto-SOS on unusual conditions
   - Real-time location sharing
   - Push notifications to trusted contacts
   - Police/ambulance integration

2. **Identity Verification**
   - ID document upload with OCR
   - Liveness detection
   - Facial recognition enrollment
   - Background checks via third-party
   - Periodic re-verification

3. **Audio Recording**
   - Ride recording with explicit consent
   - End-to-end encryption
   - Automatic retention policies
   - Access logging and audit trail
   - User controls for deletion

4. **Family Monitoring**
   - Real-time location tracking
   - Ride history access
   - Emergency contact notification
   - Can be disabled by primary user

---

### 2.4 AI-Powered Features

#### Overview
Intelligent route optimization, chatbot support, and predictive analytics.

#### Key Components

```typescript
// AI Service Interfaces

interface RouteOptimizationRequest {
  pickupCoordinates: { lat: number; lng: number };
  dropoffCoordinates: { lat: number; lng: number };
  rideType: string;
  preferences?: {
    avoidHighways?: boolean;
    avoidTolls?: boolean;
    preferredRoute?: 'fastest' | 'shortest' | 'safest';
  };
  realTimeData: {
    trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe';
    weatherCondition: string;
    eventNearby?: string;
  };
}

interface OptimizedRoute {
  route: {
    distance: number;              // km
    estimatedTime: number;         // minutes
    confidence: number;            // 0-100
    polyline: string;
  };
  recommendations: {
    bestTimeToTravel: Date;
    alternativeRoutes: Array<{
      polyline: string;
      distance: number;
      estimatedTime: number;
      traffic: string;
    }>;
  };
  predictions: {
    expectedArrival: Date;
    congestionRisk: 'low' | 'medium' | 'high';
    weatherImpact: string;
  };
}

// AI Chat Interface
interface ChatMessage {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    rideId?: string;
    deliveryId?: string;
    walletId?: string;
  };
}

// Predictive Analytics
interface UserPredictions {
  userId: ObjectId;
  predictions: {
    nextRideLikelihood: number;    // %
    preferredPickupTime: Date;
    estimatedMonthlySpend: number;
    churnRisk: 'low' | 'medium' | 'high';
    recommendedServices: string[]; // ['delivery', 'bills', 'insurance']
  };
  preferences: {
    preferredRideType: string;
    preferredPaymentMethod: string;
    priceElasticity: number;
    loyaltyTierPrediction: string;
  };
}
```

#### API Endpoints

```
// Route Optimization
POST   /api/ai/routes/optimize               Get optimized route
POST   /api/ai/routes/alternatives           Get alternative routes
GET    /api/ai/routes/history                Get historical route performance

// Chat Support
POST   /api/ai/chat/message                  Send chat message
GET    /api/ai/chat/conversation/:conversationId  Get conversation
POST   /api/ai/chat/voice                    Send voice message
GET    /api/ai/chat/suggested-responses      Get quick response suggestions

// Predictive Analytics
GET    /api/ai/predictions/user              Get personalized predictions
GET    /api/ai/predictions/pricing           Get price alerts
GET    /api/ai/recommendations              Get service recommendations
GET    /api/ai/analytics/dashboard          Get user analytics

// Voice Assistant
POST   /api/ai/voice/book-ride              Voice book a ride
POST   /api/ai/voice/check-fare             Voice fare inquiry
POST   /api/ai/voice/pay-bill               Voice bill payment
```

#### Implementation Details

1. **Route Optimization**
   - Real-time traffic integration (Google Maps API, OpenStreetMap)
   - Machine learning model trained on historical data
   - Weather and event impact prediction
   - Alternative route suggestions

2. **Chat Support**
   - Natural language processing (Google Vertex AI, OpenAI)
   - Context-aware responses (understands rides, wallet, etc)
   - Escalation to human agents when needed
   - Multilingual support (English, Pidgin, Hausa, Yoruba)

3. **Predictive Analytics**
   - Churn prediction model
   - Service recommendation engine
   - Price elasticity analysis
   - User lifetime value estimation

---

### 2.5 Bill Payments & Utilities Module

#### Overview
Dedicated, prominent home-screen section for Nigerian utilities.

#### Database Schema (extends BillProvider and EnhancedWalletTransaction)

```typescript
// UtilityProvider Model (extends BillProvider)
interface UtilityProvider extends BillProvider {
  category: 'electricity' | 'airtime' | 'data' | 'cable_tv' | 'water' | 'insurance';
  
  // Electricity-specific
  electricity?: {
    discos: Array<{
      discoId: string;
      discoName: string;
      vendCode: string;
    }>;
  };
  
  // Airtime/Data-specific
  telecom?: {
    operators: Array<{
      operatorId: string;
      operatorName: string;
      vendCode: string;
      supportedBundles?: Array<{
        bundleId: string;
        amount: number;
        validity: string;
      }>;
    }>;
  };
  
  // Cable TV
  cableTV?: {
    providers: Array<{
      providerId: string;
      providerName: string;
      plans: Array<{
        planId: string;
        planName: string;
        monthlyFee: number;
        channels: number;
      }>;
    }>;
  };
}

// BillPaymentHistory Model
interface BillPaymentHistory {
  _id: ObjectId;
  user: ObjectId;
  provider: ObjectId;
  transaction: ObjectId;           // Reference to WalletTransaction
  
  paymentDetails: {
    customerIdentifier: string;    // Meter/phone/account number
    amount: number;
    confirmationCode: string;
    status: 'successful' | 'pending' | 'failed';
  };
  
  savedForRecurring: boolean;
  recurringSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextPaymentDate: Date;
    isActive: boolean;
  };
  
  receipt: {
    url: string;
    downloadedAt: Date[];
    sharedWith?: Array<{
      email: string;
      sharedAt: Date;
    }>;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### UI/UX Components

1. **Home Page Quick Access Widget**
   - Grid of top 6 utilities (electricity, airtime, data, cable, water, insurance)
   - Recent transaction shortcuts
   - "Pay My Bill" prominent CTA

2. **Utility-Specific Flows**
   - Step 1: Select provider/DISCO/operator
   - Step 2: Enter customer identifier (meter number, phone, etc)
   - Step 3: Input amount or select plan
   - Step 4: Confirm and pay
   - Step 5: Instant confirmation with receipt

3. **Recurring Payments**
   - Checkbox to save for auto-pay
   - Edit/pause/cancel recurring payments
   - Notification 24h before payment

---

### 2.6 Mini-Apps / Third-Party Ecosystem

#### Overview
Modular architecture for third-party mini-apps inside the Linkswift platform.

#### Database Schema

```typescript
// MiniApp Model
interface MiniApp {
  _id: ObjectId;
  name: string;
  description: string;
  icon: string;
  category: 'pharmacy' | 'events' | 'maintenance' | 'custom';
  
  developer: {
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    businessLicense: string;
    insurance?: string;
  };
  
  technical: {
    appUrl: string;                 // Mini-app origin
    webhookEndpoints: {
      paymentWebhook: string;
      orderUpdateWebhook: string;
      refundWebhook: string;
    };
    apiKeys: {
      publishable: string;
      secret: string;               // Encrypted storage
    };
    supportedEvents: string[];
    rateLimits: {
      requestsPerSecond: number;
      requestsPerDay: number;
    };
  };
  
  listing: {
    published: boolean;
    publishedAt?: Date;
    featured: boolean;
    screenshots: string[];
    rating: number;                 // 0-5
    reviewCount: number;
    installs: number;
  };
  
  commerce: {
    takingEnabledAt?: Date;
    commissionPercentage: number;   // Linkswift's cut
    minPayout: number;
    payoutFrequency: 'daily' | 'weekly' | 'monthly';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// MiniAppOrder Model
interface MiniAppOrder {
  _id: ObjectId;
  miniApp: ObjectId;
  user: ObjectId;
  
  order: {
    externalOrderId: string;       // Mini-app's order ID
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    tax: number;
    deliveryFee?: number;
    total: number;
  };
  
  payment: {
    method: 'wallet' | 'card';
    status: 'pending' | 'completed' | 'failed';
    transaction: ObjectId;
    linkswiftCommission: number;
  };
  
  delivery?: {
    type: 'express' | 'standard';
    address: string;
    estimatedArrival: Date;
    trackingUrl?: string;
  };
  
  status: 'created' | 'confirmed' | 'processing' | 'ready' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    message?: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

// MiniAppPayment Model
interface MiniAppPayment {
  _id: ObjectId;
  miniApp: ObjectId;
  order: ObjectId;
  
  payment: {
    amount: number;
    currency: 'NGN';
    paymentMethod: 'linkswift_wallet' | 'linkswift_card';
    reference: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
  };
  
  settlement: {
    linkswiftCommission: number;
    miniAppEarnings: number;
    settled: boolean;
    settledAt?: Date;
  };
  
  webhooksSent: Array<{
    event: string;
    timestamp: Date;
    status: 'sent' | 'failed';
    retries: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### SDK & Integration

```typescript
// Linkswift Mini-App SDK (JavaScript)
class LinkswiftMiniApp {
  constructor(apiKey: string, appId: string) {
    this.apiKey = apiKey;
    this.appId = appId;
  }
  
  // User
  async getCurrentUser(): Promise<User> { }
  async getUserWallet(): Promise<WalletInfo> { }
  
  // Payment
  async initiatePayment(order: Order): Promise<PaymentResult> { }
  async handleWebhookSignature(payload: any, signature: string): boolean { }
  
  // Orders
  async createOrder(orderData: any): Promise<Order> { }
  async updateOrderStatus(orderId: string, status: string): Promise<void> { }
  async refundOrder(orderId: string, reason: string): Promise<void> { }
  
  // Notifications
  async sendNotification(userId: string, message: string): Promise<void> { }
  
  // Analytics
  async logEvent(eventName: string, metadata: any): Promise<void> { }
}
```

#### First Mini-Apps

1. **Pharmacy Delivery**
   - Browse pharmacy catalogs
   - Express delivery integration
   - Prescription uploads
   - Price comparison

2. **Event Ticketing**
   - Browse events
   - Ticket purchase
   - E-ticket delivery
   - Promotional campaigns

3. **Car Maintenance**
   - Service booking
   - Parts availability
   - Mobile mechanic dispatch
   - Warranty management

---

### 2.7 Interstate Luxury Travel

#### Database Schema

```typescript
// InterstateLuxuryRide Model
interface InterstateLuxuryRide {
  _id: ObjectId;
  
  route: {
    origin: {
      city: string;
      address: string;
      coordinates: { lat: number; lng: number };
      pickupPoints: Array<{ name: string; address: string; coordinates: any }>;
    };
    destination: {
      city: string;
      address: string;
      coordinates: { lat: number; lng: number };
      dropoffPoints: Array<{ name: string; address: string; coordinates: any }>;
    };
    distance: number;               // km
  };
  
  schedule: {
    departureTime: Date;
    estimatedArrival: Date;
    daysOfWeek: string[];          // For recurring routes
    frequency: 'daily' | 'weekly' | 'custom';
  };
  
  vehicleClass: {
    type: 'premium_car' | 'suv' | 'minibus' | 'luxury_coach';
    capacity: number;
    amenities: string[];            // WiFi, AC, phone charger, etc
    image: string;
  };
  
  pricing: {
    baseFare: number;
    perPassenger: boolean;         // True = per person, False = whole vehicle
    surgeMultiplier?: number;
    discountForMultipleBookings?: number;
  };
  
  availability: {
    totalSeats: number;
    availableSeats: number;
    bookings: ObjectId[];          // Array of InterstateLuxuryBooking refs
    status: 'scheduled' | 'accepting_bookings' | 'full' | 'departed' | 'completed' | 'cancelled';
  };
  
  driver: {
    driverId: ObjectId;
    name: string;
    rating: number;
    licenseExpiry: Date;
    yearsExperience: number;
  };
  
  vehicle: {
    plate: string;
    make: string;
    model: string;
    year: number;
    insuranceExpiry: Date;
    inspectionExpiry: Date;
  };
  
  amenities: {
    wifi: boolean;
    airConditioning: boolean;
    phoneChargers: boolean;
    toiletOnboard: boolean;
    refreshments: boolean;
    entertainment: string[];       // Videos, music, etc
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// InterstateLuxuryBooking Model
interface InterstateLuxuryBooking {
  _id: ObjectId;
  ride: ObjectId;
  user: ObjectId;
  
  booking: {
    numberOfPassengers: number;
    passengerNames: string[];
    pickupPoint: {
      name: string;
      address: string;
      pickupTime: Date;
    };
    dropoffPoint: {
      name: string;
      address: string;
    };
    specialRequests?: string;
  };
  
  pricing: {
    farePerPassenger: number;
    totalFare: number;
    taxes: number;
    insuranceFee?: number;
    totalAmount: number;
    discounts?: number;
  };
  
  payment: {
    method: 'wallet' | 'card';
    reference: string;
    status: 'completed' | 'pending' | 'failed';
  };
  
  status: 'confirmed' | 'boarding' | 'departed' | 'arrived' | 'completed' | 'cancelled';
  
  insurance: {
    included: boolean;
    provider?: string;
    policyNumber?: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### API Endpoints

```
GET    /api/interstate/routes                 List available routes
GET    /api/interstate/routes/:routeId        Get route details
GET    /api/interstate/routes/search           Search routes by cities/date
POST   /api/interstate/bookings               Book interstate ride
GET    /api/interstate/bookings/:bookingId    Get booking details
PATCH  /api/interstate/bookings/:bookingId    Modify booking
POST   /api/interstate/bookings/:bookingId/cancel  Cancel booking
GET    /api/interstate/bookings               Get user's bookings
```

---

### 2.8 Fuel & EV Charging Delivery

#### Database Schema

```typescript
// FuelDeliveryOrder Model
interface FuelDeliveryOrder {
  _id: ObjectId;
  user: ObjectId;
  
  fuelDetails: {
    type: 'petrol' | 'diesel' | 'lpg';
    quantity: number;              // liters
    estimatedPrice: number;
    actualPrice?: number;
    paymentMethod: 'prepaid' | 'pay_on_delivery';
  };
  
  delivery: {
    location: {
      address: string;
      coordinates: { lat: number; lng: number };
      gpsAccuracy: number;
    };
    vehicle: {
      licensePlate: string;
      make: string;
      model: string;
    };
    scheduledTime?: Date;
    deliveryWindow: { start: Date; end: Date };
    specialInstructions?: string;
  };
  
  logistics: {
    deliveryPartner: ObjectId;
    vehicleUsed: 'motorcycle_jerry_cans' | 'small_tanker' | 'medium_tanker';
    estimatedArrival: Date;
    trackingUpdates: Array<{ lat: number; lng: number; timestamp: Date }>;
  };
  
  safety: {
    safetyCheckPhotoUrl?: string;
    driverSignature?: string;
    userSignature?: string;
    harmatanInsuranceIncluded: boolean;
    spilageInsurance?: boolean;
  };
  
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// EVChargingStation Model
interface EVChargingStation {
  _id: ObjectId;
  
  location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    city: string;
  };
  
  chargers: Array<{
    chargerId: string;
    type: 'AC_Level_2' | 'DC_Fast';
    power: number;                 // kW
    connector: 'CCS' | 'CHAdeMO' | 'Tesla';
    available: boolean;
    currentlyUsedBy?: ObjectId;
  }>;
  
  pricing: {
    pricePerKwh: number;
    minChargeFee?: number;
    parkingFee?: number;
  };
  
  amenities: {
    diningNearby: boolean;
    restrooms: boolean;
    shopping: boolean;
  };
  
  operator: {
    name: string;
    phone: string;
    rating: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// MobileChargingUnit Model
interface MobileChargingUnit {
  _id: ObjectId;
  
  unit: {
    registrationNumber: string;
    capacity: number;             // kWh
    chargerTypes: string[];
    currentLocation: { lat: number; lng: number };
    availability: 'available' | 'in_transit' | 'charging' | 'offline';
  };
  
  operator: ObjectId;
  driver: ObjectId;
  
  activeBooking?: {
    bookingId: ObjectId;
    customerLocation: { lat: number; lng: number };
    eta: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// EVChargingBooking Model
interface EVChargingBooking {
  _id: ObjectId;
  user: ObjectId;
  
  booking: {
    type: 'station' | 'mobile_unit';
    station?: ObjectId;
    mobileUnit?: ObjectId;
    chargerId?: string;
  };
  
  vehicle: {
    licensePlate: string;
    batteryCapacity: number;      // kWh
    connectorType: string;
  };
  
  chargingDetails: {
    scheduledTime: Date;
    estimatedDuration: number;    // minutes
    targetCharge: number;          // % of battery
    estimatedCost: number;
  };
  
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 2.9 Car Rental & Hire

#### Database Schema

```typescript
// RentalVehicle Model
interface RentalVehicle {
  _id: ObjectId;
  
  vehicleInfo: {
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    bodyType: 'sedan' | 'suv' | 'van' | 'truck';
    fuelType: 'petrol' | 'diesel' | 'hybrid' | 'electric';
    capacity: number;             // persons
    trunk: number;                // liters
    transmission: 'manual' | 'automatic';
  };
  
  pricing: {
    hourlyRate: number;
    dailyRate: number;
    weeklyRate: number;
    monthlyRate: number;
    minimumRentalHours: number;
    cancellationPolicy: 'free' | 'paid_24h' | 'paid_72h';
  };
  
  availability: {
    currentLocation: { lat: number; lng: number };
    status: 'available' | 'rented' | 'maintenance' | 'offline';
    mileage: number;
  };
  
  documentation: {
    insuranceExpiry: Date;
    roadTaxExpiry: Date;
    inspectionExpiry: Date;
    vehiclePhotos: string[];
    vroomConditionReport: string;
  };
  
  features: {
    gps: boolean;
    dashcam: boolean;
    bluetooth: boolean;
    ac: boolean;
    powerSteering: boolean;
    airbags: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// RentalBooking Model
interface RentalBooking {
  _id: ObjectId;
  user: ObjectId;
  vehicle: ObjectId;
  
  rental: {
    type: 'self_drive' | 'with_driver';
    pickupLocation: {
      name: string;
      address: string;
      coordinates: { lat: number; lng: number };
    };
    pickupTime: Date;
    dropoffLocation: {
      name: string;
      address: string;
      coordinates: { lat: number; lng: number };
    };
    dropoffTime: Date;
    estimatedDuration: number;   // hours
    driver?: ObjectId;            // If with_driver option
  };
  
  pricing: {
    rentalCost: number;
    insuranceCost?: number;
    fuelDeposit?: number;
    deliveryFee?: number;
    totalCost: number;
    paymentStatus: 'completed' | 'pending';
  };
  
  insurance: {
    included: boolean;
    type?: 'basic' | 'comprehensive' | 'premium';
    deductible?: number;
    externalCarrier?: string;
  };
  
  documents: {
    driverLicenseCopy: string;
    idCopy: string;
    vehicleKeyHandoverSignedAt?: Date;
    conditionCheckPhotos: string[];
  };
  
  fuelPolicy: {
    type: 'full_to_full' | 'full_to_empty' | 'empty_to_empty';
    initialFuelLevel: number;
    finalFuelLevel?: number;
  };
  
  status: 'confirmed' | 'vehicle_collected' | 'in_progress' | 'completed' | 'returned' | 'cancelled';
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 2.10 Insurance & Roadside Assistance

#### Database Schema

```typescript
// InsurancePolicy Model
interface InsurancePolicy {
  _id: ObjectId;
  user: ObjectId;
  
  policy: {
    type: 'ride_insurance' | 'delivery_insurance' | 'comprehensive_coverage';
    provider: string;
    policyNumber: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired' | 'cancelled' | 'suspended';
  };
  
  coverage: {
    coverage_type: string[];     // e.g., 'passenger_liability', 'medical', 'third_party'
    limitPerClaim: number;
    annualLimit?: number;
    deductible: number;
    premium: number;
    autoRenewal: boolean;
  };
  
  applicableServices: {
    rides: boolean;
    rides_tier: 'all' | 'premium_only';
    delivery: boolean;
    delivery_tier: 'all' | 'express_only';
  };
  
  claims: ObjectId[];            // Array of InsuranceClaim refs
  
  documentUrl: string;           // Policy PDF
  
  createdAt: Date;
  updatedAt: Date;
}

// InsuranceClaim Model
interface InsuranceClaim {
  _id: ObjectId;
  policy: ObjectId;
  user: ObjectId;
  
  incident: {
    date: Date;
    type: 'accident' | 'injury' | 'property_damage' | 'third_party_claim';
    description: string;
    location: { lat: number; lng: number; address: string };
    policeReportFiled?: boolean;
    fir_number?: string;
  };
  
  claimDetails: {
    claimAmount: number;
    supportingDocuments: string[];  // Photos, FIR, medical reports
    witnessStatement?: string;
    estimateFromWorkshop?: string;
  };
  
  processing: {
    status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
    reviewedBy?: ObjectId;
    approvalDate?: Date;
    rejectionReason?: string;
    amountApproved?: number;
    amountPaid?: number;
    paymentDate?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// RoadsideAssistance Model
interface RoadsideAssistance {
  _id: ObjectId;
  user: ObjectId;
  
  subscription: {
    type: 'basic' | 'premium';
    provider: string;
    startDate: Date;
    endDate: Date;
    status: 'active' | 'expired';
    coverageArea: string[];       // Cities/regions
    coveragePerYear: number;      // Number of free services
    premium: number;
  };
  
  includedServices: {
    breakdown_tow: boolean;
    fuel_delivery: boolean;
    lockout_assistance: boolean;
    flatTire_assistance: boolean;
    jumpStart: boolean;
    mechanicHotline: boolean;
  };
  
  incidents: ObjectId[];         // Array of AssistanceIncident refs
  
  createdAt: Date;
  updatedAt: Date;
}

// AssistanceIncident Model
interface AssistanceIncident {
  _id: ObjectId;
  subscription: ObjectId;
  user: ObjectId;
  
  incident: {
    type: 'breakdown' | 'accident' | 'lockout' | 'flatTire' | 'other';
    location: { lat: number; lng: number; address: string };
    vehicle: {
      licensePlate: string;
      make: string;
      model: string;
    };
    description: string;
    datetime: Date;
  };
  
  response: {
    dispatchedVehicle?: {
      mechanic: ObjectId;
      vehicleNumber: string;
      eta: Date;
    };
    status: 'requested' | 'dispatched' | 'en_route' | 'on_scene' | 'resolved' | 'escalated';
    resolvedAt?: Date;
    resolutionType?: 'fixed_on_site' | 'towed' | 'referred_to_workshop';
  };
  
  cost: {
    costToUser: number;           // 0 if covered by subscription
    serviceProvider: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 2.11 Loyalty & Rewards Hub

#### Database Schema

```typescript
// LoyaltyAccount Model
interface LoyaltyAccount {
  _id: ObjectId;
  user: ObjectId;
  
  points: {
    balance: number;
    lifetime: number;            // Total earned
    lastActivity: Date;
    currency: 'points';
  };
  
  tier: {
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    pointsEarned: number;
    pointsToNextTier: number;
    tierBenefits: {
      discountPercentage: number;
      bonusPointsMultiplier: number;
      prioritySupport: boolean;
      exclusiveOffers: boolean;
    };
    upgradedAt?: Date;
  };
  
  redemption: {
    totalRedeemed: number;
    availableRedemptionCatalogue: ObjectId[];  // Array of RedemptionItem refs
  };
  
  transactions: ObjectId[];      // Array of LoyaltyTransaction refs
  
  referrals: {
    referralCode: string;
    referredUsers: ObjectId[];
    referralBonus: number;       // Points earned from referrals
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// LoyaltyPointsRule Model
interface LoyaltyPointsRule {
  _id: ObjectId;
  
  rule: {
    action: 'ride_completed' | 'delivery_completed' | 'payment_made' | 'first_time_service' | 'referral' | 'birthday';
    pointsEarned: number;
    pointsMultiplier?: number;   // For tier-based multiplier
  };
  
  conditions: {
    minimumAmount?: number;
    serviceType?: string[];
    tierRequirement?: string[];
    timeframeRestriction?: {
      dayOfWeek?: string[];
      hourRange?: { start: number; end: number };
    };
  };
  
  validityPeriod: {
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// RedemptionItem Model
interface RedemptionItem {
  _id: ObjectId;
  
  item: {
    name: string;
    description: string;
    category: 'ride_discount' | 'delivery_discount' | 'cashback' | 'merchandise' | 'experience';
    image: string;
  };
  
  cost: {
    pointsRequired: number;
    monetaryValue?: number;
  };
  
  terms: {
    validityDays: number;
    usageLimit?: number;
    applicable_services?: string[];
    minimumSpend?: number;
    blackoutDates?: Date[];
  };
  
  inventory: {
    totalAvailable: number;
    claimed: number;
    status: 'active' | 'inactive' | 'paused';
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// LoyaltyTransaction Model
interface LoyaltyTransaction {
  _id: ObjectId;
  loyaltyAccount: ObjectId;
  
  transaction: {
    type: 'earn' | 'redeem' | 'expire' | 'bonus' | 'adjustment';
    pointsAmount: number;
    source?: string;              // Service that generated points
    sourceId?: ObjectId;          // Reference to ride/delivery/etc
  };
  
  status: 'completed' | 'pending' | 'reversed';
  
  metadata: {
    tierBefore?: string;
    tierAfter?: string;
    multiplierApplied?: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### API Endpoints

```
GET    /api/loyalty/account                   Get loyalty account
GET    /api/loyalty/points/balance            Get points balance
GET    /api/loyalty/tier                      Get tier info & benefits
POST   /api/loyalty/redeem                    Redeem points
GET    /api/loyalty/redemption-options        Get available redemptions
GET    /api/loyalty/transactions              Get points history
POST   /api/loyalty/referral/generate         Generate referral code
GET    /api/loyalty/referrals                 Get referral stats
```

---

## Part 3: API Gateway & Cross-Service Integrations

### 3.1 Unified API Gateway Architecture

```typescript
// Express Middleware Structure
app.use('/api/v1/', (req, res, next) => {
  // Request logging & tracing
  req.id = generateUniqueId();
  req.startTime = Date.now();
  
  // Rate limiting per user/IP
  // CORS validation
  // API version negotiation
  
  next();
});

app.use('/api/v1/', authenticate);  // JWT verification
app.use('/api/v1/', enrichUserContext);  // Add user wallet, loyalty, safety data

// Service-specific routers
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/safety', safetyRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/utilities', utilityRoutes);
app.use('/api/v1/interstate', interstateRoutes);
app.use('/api/v1/miniapps', miniAppRoutes);
```

### 3.2 Cross-Service Events & Webhooks

```typescript
// Event Bus Implementation
class EventBus {
  async publishEvent(eventType: string, data: any) {
    // Log to event store
    // Push to Redis pubsub
    // Queue webhooks for subscribed services
    
    // Example events:
    // 'ride.completed' -> Update loyalty, Process payment, Send notification
    // 'delivery.completed' -> Update rating, Send receipt, Trigger reward
    // 'wallet.topup.completed' -> Update balance, Trigger promotion check
  }
}

// Webhook Distribution
interface ServiceWebhook {
  service: string;
  event: string;
  endpoint: string;
  retryPolicy: {
    maxRetries: 3;
    backoffMultiplier: 2;
    timeout: 10000;
  };
}
```

---

## Part 4: Security, Compliance & Data Privacy

### 4.1 Security Architecture

**Authentication & Authorization:**
- Multi-factor authentication (SMS OTP, TOTP, biometric)
- Role-based access control (RBAC)
- API key management for mini-apps
- JWT with short expiry (15 min) + refresh tokens

**Data Protection:**
- End-to-end encryption for sensitive data (PII, payment info)
- Field-level encryption for sensitive documents
- TLS 1.3 for all communications
- CORS policies strictly enforced
- CSRF tokens for state-changing operations

**Financial Security:**
- PCI-DSS compliance (via Ivory Pay)
- Payment token storage (no raw card data)
- Transaction signing and verification
- Double-entry bookkeeping for wallet
- Real-time fraud detection

**Operational Security:**
- Secrets management (HashiCorp Vault)
- API rate limiting (by user, IP, service)
- Request validation and sanitization
- SQL injection prevention (parameterized queries)
- NoSQL injection prevention (schema validation)

### 4.2 Compliance Checklist

**NDPR (Nigerian Data Protection Regulation):**
- [ ] Data processing agreements with all vendors
- [ ] User consent management for data collection
- [ ] Right to be forgotten implementation
- [ ] Data breach notification procedures (72 hours)
- [ ] Privacy impact assessments completed
- [ ] Data controller/processor roles defined

**PCI-DSS (Payment Card Industry):**
- [ ] Secure payment processing via Ivory Pay
- [ ] No raw payment card storage
- [ ] Quarterly security assessments
- [ ] Penetration testing program
- [ ] Secure development lifecycle

**CBN (Central Bank of Nigeria) Regulations:**
- [ ] Licensed payment service provider approval
- [ ] Transaction reporting and monitoring
- [ ] KYC/AML compliance
- [ ] Reserve requirements adherence
- [ ] Regular regulatory reporting

**Local Regulations:**
- [ ] Nigerian Telecom Consumer Protection Regulations
- [ ] Electricity sector regulations (for bill payments)
- [ ] Motor insurance requirements
- [ ] Road Transport Regulations
- [ ] Mini-app ecosystem vetting process

### 4.3 Data Privacy Policy

- No third-party data sharing without explicit consent
- User-controlled data retention (auto-delete after X days/usage)
- Transparent logging of data access
- GDPR-compliant for EU users
- Privacy controls accessible in-app

---

## Part 5: Database Schema Summary

### Core Collections

```
Users                    // Enhanced with KYC, safety, loyalty fields
├── KYC Status
├── Safety Profile
├── Loyalty Account
└── Transaction History

Rides
├── Chauffeur assignments
├── Real-time tracking
├── Payments & refunds
└── Ratings & reviews

Deliveries (New)
├── Package details
├── Proof of delivery
├── Rider assignments
└── Damage claims

Stays
├── Properties
├── Bookings
├── Reviews
└── Payments

Wallet (Enhanced)
├── Funding sources
├── Transactions
├── P2P transfers
├── Bill payments
└── Merchant settlements

Payments (Enhanced)
├── Multiple payment methods
├── Recurring billing
├── Refund tracking
└── Reconciliation

Safety (New)
├── SOS incidents
├── Audio recordings
├── ID verification
└── Family profiles

Loyalty (New)
├── Points balance
├── Tier management
├── Redemptions
└── Rules

MiniApps (New)
├── App registry
├── Orders
├── Payments
└── Webhooks

Interstate Travel (New)
├── Routes
├── Schedules
└── Bookings

Insurance (New)
├── Policies
├── Claims
└── Incidents

Support Collections:
├── Notifications
├── Messages
├── Analytics/Logs
├── System Configuration
└── Audit Trail
```

---

## Part 6: Phased Implementation Roadmap

### Phase 1: MVP (Months 1-4)
**Goals:** Establish payment & wallet foundation, launch delivery

**Features:**
1. ✅ Linkswift Pay (basic wallet, P2P, bill payments)
2. ✅ Linkswift Express (delivery with basic tracking)
3. ✅ Enhanced ride + delivery combo
4. ✅ Basic loyalty system

**Deliverables:**
- Updated Wallet service with P2P & bills
- Delivery orders & tracking system
- Bill provider integrations (top 3)
- Loyalty points for rides & delivery

**Technical Tasks:**
- [ ] Migrate to enhanced WalletAccount schema
- [ ] Build EnhancedWalletTransaction service
- [ ] Implement delivery order matching algorithm
- [ ] Real-time tracking via Redis pubsub
- [ ] Integrate with 3 bill providers (Disco, airtime, cable)
- [ ] Loyalty points calculation engine

**Success Metrics:**
- 50% of rides using in-app payment
- 100+ deliveries/day
- 1000+ active wallet users
- ARPU increase of 30%

---

### Phase 2: Core Services (Months 5-10)
**Goals:** Launch safety, ecosystem, interstate travel

**Features:**
1. ✅ Advanced Safety Suite (SOS, audio recording, family monitoring)
2. ✅ AI-powered features (route optimization, chatbot)
3. ✅ Mini-apps framework (Pharmacy, Events, Maintenance)
4. ✅ Interstate luxury travel
5. ✅ Fuel & EV charging
6. ✅ Enhanced bill payments (all utilities)

**Deliverables:**
- Safety profile system with SOS
- AI route optimization & chatbot
- Mini-app SDK & first 3 mini-apps
- Interstate ride booking & management
- Fuel delivery & EV charging integration

**Technical Tasks:**
- [ ] Safety profile schema & verification flow
- [ ] SOS incident management & emergency dispatch
- [ ] Audio recording encryption & retention
- [ ] ML-based route optimization model
- [ ] NLP chatbot integration
- [ ] Mini-app SDK development
- [ ] Interstate ride scheduler
- [ ] Fuel delivery logistics integration
- [ ] EV charging station API integration

**Success Metrics:**
- 10,000+ active safety profiles
- 100+ SOS incidents responded to
- 50+ mini-app merchants onboarded
- Interstate routes in 5+ cities
- 20% of delivery orders fuel-related

---

### Phase 3: Premium Services (Months 11-18)
**Goals:** Insurance, car rental, advanced features

**Features:**
1. ✅ Insurance & Roadside Assistance
2. ✅ Car Rental & Hire
3. ✅ Advanced loyalty tiers (Gold, Platinum, Diamond)
4. ✅ Merchant QR code payments (100+ merchants)
5. ✅ Cash-out network (2000+ agents)
6. ✅ Advanced AI (predictive pricing, recommendations)

**Deliverables:**
- Insurance policy management & claims
- Car rental fleet & booking system
- Multi-tier loyalty with exclusive benefits
- Merchant onboarding & QR payment network
- Cash-out agent network
- Predictive analytics dashboard

**Technical Tasks:**
- [ ] Insurance partner integration APIs
- [ ] Claims management workflow
- [ ] Car rental fleet management system
- [ ] Loyalty tier upgrade algorithms
- [ ] Merchant portal & QR integration
- [ ] Agent network management
- [ ] Predictive ML models (churn, pricing, recommendations)
- [ ] Analytics dashboard development

**Success Metrics:**
- 50,000+ insurance policies active
- 200+ car rentals/day
- 1M+ loyalty points redeemed/month
- 500+ merchant QR payments/day
- 10,000+ cash-out agents network
- 5x ARPU increase vs MVP

---

## Part 7: Infrastructure & DevOps

### 7.1 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│     CloudFlare CDN & DDoS Protection        │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│    Load Balancer (Multi-region)              │
│    - Geo-routing                             │
│    - Health checks                           │
│    - SSL termination                         │
└────────────────┬────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐    ┌───▼──┐    ┌───▼──┐
│ Zone1│    │ Zone2│    │ Zone3│
│(Lagos)   │(Abuja)   │(PhC) │
└───┬──┘    └───┬──┘    └───┬──┘
    │            │            │
    └────────────┼────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──────┐ ┌──▼────────┐ ┌─▼────────┐
│ Kubernetes│ │   Redis   │ │ MongoDB  │
│  Cluster  │ │  Cluster  │ │ Replica  │
│ (Microsvcs)│ │(Cache/PubSub)│(Primary)│
└──────────┘ └───────────┘ └──────────┘
```

### 7.2 Container Architecture

- **Frontend**: React SPA containerized with Nginx
- **API Gateway**: Express.js with API versioning
- **Services**: Microservices per feature (Ride, Delivery, Wallet, etc)
- **Workers**: Background jobs (notifications, reconciliation, analytics)
- **Cache**: Redis for real-time data & pubsub
- **Database**: MongoDB primary with replicas in each region

### 7.3 CI/CD Pipeline

```yaml
stages:
  - test: Unit tests, integration tests, e2e tests
  - build: Docker image build, push to registry
  - security: SAST, dependency scanning, container scanning
  - deploy_staging: Canary deployment to staging
  - performance_tests: Load testing, latency benchmarks
  - deploy_prod: Blue-green deployment to production
  - monitoring: Health checks, alert configuration
```

---

## Part 8: Scalability & Performance

### 8.1 Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| Booking to Driver Assignment | < 30 seconds |
| Real-time Location Update Latency | < 5 seconds |
| Payment Processing | < 2 seconds |
| Bill Payment Confirmation | < 5 seconds |
| Page Load Time (Mobile, 3G) | < 3 seconds |
| Chat Response Time | < 1 second |

### 8.2 Scaling Strategies

**Horizontal Scaling:**
- Kubernetes auto-scaling based on CPU/memory/custom metrics
- Database sharding by user_id for collections > 100GB
- Read replicas in each geographic region

**Caching Layers:**
- Redis for session, user context, rates, tracking
- CDN for static assets, images, documents
- Client-side caching for non-critical data

**Asynchronous Processing:**
- Queue-based job processing (Bull.js with Redis)
- WebSocket for real-time updates instead of polling
- Event-driven architecture for cross-service communication

**Database Optimization:**
- Indexed queries for common access patterns
- Aggregation pipelines for analytics
- Sharded collections for high-volume tables
- TTL indexes for auto-cleanup of old data

---

## Part 9: Testing Strategy

### 9.1 Testing Pyramid

```
                    ▲
                   ╱│╲
                  ╱ │ ╲
                 ╱  │  ╲
                ╱_E2E_╲   Integration
               ╱ tests  ╲   Tests
              ╱___________╲
             ╱   Unit      ╲
            ╱     Tests      ╲
           ╱___________________╲
```

**Unit Tests** (60% coverage)
- Service logic
- Utility functions
- Validation rules

**Integration Tests** (25% coverage)
- API endpoint tests
- Database operations
- External service mocks

**E2E Tests** (15% coverage)
- Critical user flows (booking, payment, delivery)
- Cross-service workflows
- Staged environment

### 9.2 Testing Scenarios

**Ride + Delivery Combo Flow:**
1. User books ride + delivery
2. Driver assigned
3. Passenger picked up
4. Package picked up
5. Passenger + package en route
6. Package delivered first
7. Passenger at destination
8. Both marked complete
9. Payment charged
10. Loyalty points awarded

**Bill Payment Flow:**
1. User selects utility provider
2. Enters customer identifier
3. System validates identifier
4. Amount confirmed
5. Wallet deducted
6. Provider API called
7. Confirmation received
8. Receipt generated
9. Transaction logged

---

## Part 10: Success Metrics & KPIs

### Phase 1 KPIs
- **Adoption**: 50,000 WAU (weekly active users)
- **Engagement**: 30% wallet usage in rides
- **Delivery**: 1000+ deliveries/day, 4.5+ rating
- **Payment**: 95%+ successful transactions
- **Retention**: 60% D30 retention rate

### Phase 2 KPIs
- **Safety**: 99.9% SOS response rate, 100K+ safety profiles
- **Ecosystem**: 50+ mini-app merchants, 10K+ mini-app GMV/day
- **Interstate**: 500+ trips/day, 4.6+ rating
- **ARPU**: 3x increase from Phase 1
- **NPS**: 45+ Net Promoter Score

### Phase 3 KPIs
- **Insurance**: 100K+ active policies
- **Car Rental**: 50K+ rentals/month
- **Loyalty**: 5M+ points redeemed/month
- **Ecosystem Revenue**: 20% of total GMV
- **Platform GMV**: 50B+ NGN/month
- **NPS**: 60+ (premium tier)

---

## Part 11: Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Regulatory changes | High | Legal team monitoring, compliance-first design |
| Cybersecurity breach | Critical | Multi-layer security, penetration testing quarterly |
| Payment provider outage | High | Fallback payment methods, provider redundancy |
| High churn rate | Medium | User retention programs, loyalty incentives |
| Driver shortage | Medium | Incentive programs, corporate partnerships |
| Mini-app fraud | Medium | Vetting process, monitoring, insurance |

---

## Part 12: Technology Stack Details

### Frontend
- React 19 with TypeScript
- Vite 6.2 (build tool)
- Tailwind CSS 4.1
- React Router v7
- Socket.io-client for real-time
- Lucide React for icons
- Motion.dev for animations

### Backend
- Node.js 20 LTS
- Express.js 4.21
- TypeScript 5.8
- MongoDB 7.0 (primary DB)
- Redis 7.0 (cache/pubsub)
- Socket.io 4.8 (WebSockets)
- JWT for auth (jsonwebtoken 9.0)
- Bull.js for job queues

### External Services
- **Payments**: Ivory Pay (replacing Paystack)
- **Maps/Routing**: Google Maps API, OpenStreetMap
- **Storage**: AWS S3 or Vercel Blob
- **Communications**: Twilio, Africastalking
- **Analytics**: Mixpanel, Sentry for errors
- **AI/ML**: Google Vertex AI, OpenAI
- **Hosting**: Vercel, AWS, or Heroku

### DevOps
- Docker for containerization
- Kubernetes for orchestration
- GitHub Actions for CI/CD
- Terraform for IaC
- Datadog/New Relic for monitoring
- ELK Stack for logging

---

## Conclusion

This comprehensive technical brief provides a complete roadmap for transforming Linkswift Ride into a dominant African super app. The phased approach minimizes risk while maximizing market traction, with clear success metrics at each stage.

**Key Success Factors:**
1. Flawless payment & wallet experience (foundation)
2. Uncompromising safety standards
3. Seamless cross-service integration
4. Reliable low-bandwidth support
5. Strong compliance posture
6. Data-driven optimization

**Next Steps:**
1. Stakeholder review and approval of this brief
2. Detailed sprint planning for Phase 1
3. Development environment setup
4. Database schema implementation
5. API development begins

---

**Document Version**: 1.0  
**Last Updated**: April 2, 2026  
**Prepared By**: v0 AI Architecture Team  
**Status**: Ready for Implementation
