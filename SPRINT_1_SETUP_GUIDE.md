# Sprint 1 Development Environment Setup Guide

## Pre-Requisites

Before starting Sprint 1 development, all team members must set up their development environment following this guide.

---

## 1. System Requirements

### Minimum Requirements
- **RAM**: 16GB
- **Storage**: 100GB free
- **CPU**: Intel i7/M1 or equivalent
- **OS**: macOS 12+, Ubuntu 20.04+, or Windows 11 with WSL2

### Recommended Tools

```bash
# Package Managers
brew install git node npm/yarn/pnpm

# Development Editors
VSCode with extensions: ESLint, Prettier, MongoDB, REST Client

# Docker for local MongoDB
brew install docker docker-compose

# Database tools
MongoDB Compass or Mongo CLI

# API Testing
Postman or Insomnia

# Git GUI (optional)
GitKraken or SourceTree
```

---

## 2. Repository Setup

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/Blackhatdawn/LINK-SWIFT-TRAVEL-HUB-OLDER-VERSION.git
cd LINK-SWIFT-TRAVEL-HUB-OLDER-VERSION

# Checkout development branch
git checkout v0/fsocietyproject-4006-3e858a66

# Create your feature branch
git checkout -b feature/sprint-1-{your-initials}
```

### Install Dependencies

```bash
# Install Node dependencies
npm install
# or
pnpm install
# or
yarn install

# Install Git hooks (pre-commit, pre-push)
npx husky install
```

---

## 3. Environment Variables Setup

### Create `.env.development.local`

```bash
# Copy from template
cp .env.example .env.development.local
```

### Fill in Required Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/linkswift-dev
REDIS_URL=redis://localhost:6379

# Payment Provider (Ivory Pay)
IVORYPAY_PUBLIC_KEY=pk_test_your_key_here
IVORYPAY_SECRET_KEY=sk_test_your_key_here

# Email Service (for OTP)
SENDGRID_API_KEY=your_sendgrid_key_here
SENDGRID_FROM_EMAIL=noreply@linkswift.com

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# AWS S3 (for photo uploads)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=linkswift-dev
AWS_REGION=eu-west-1

# Monitoring (optional for local)
SENTRY_DSN=your_sentry_dsn_here

# Environment
NODE_ENV=development
LOG_LEVEL=debug
```

---

## 4. Docker Setup (Local Database)

### Create `docker-compose.dev.yml`

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: linkswift-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: dev-password
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7.0
    container_name: linkswift-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

### Start Services

```bash
# Start MongoDB and Redis
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker ps

# Connect to MongoDB (in another terminal)
mongosh --username admin --password dev-password --host localhost

# Verify Redis
redis-cli ping  # Should return "PONG"
```

---

## 5. IDE Setup (VSCode)

### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mongodb.mongodb-vscode",
    "humao.rest-client",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "orta.vscode-jest",
    "prisma.prisma"
  ]
}
```

### Install Extensions

```bash
# VSCode command palette (Cmd+Shift+P / Ctrl+Shift+P)
Extensions: Show Recommended Extensions
# Install all
```

### Workspace Settings (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "editor.rulers": [80, 120],
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true
  }
}
```

---

## 6. Database Initialization

### Seed Initial Data

```bash
# Navigate to scripts directory
cd scripts

# Run seed script
npm run seed:development

# Expected output:
# ✓ Created 10 test users
# ✓ Created 50 beneficiaries
# ✓ Created 100 wallet accounts
```

### Verify Database

```bash
# Connect to MongoDB
mongosh --username admin --password dev-password --host localhost

# List databases
show dbs

# Connect to linkswift-dev
use linkswift-dev

# Check collections
show collections

# Count wallets
db.walletaccounts.countDocuments()
```

---

## 7. Start Development Server

### Backend Server

```bash
# Start backend in development mode
npm run dev:backend

# Expected output:
# ✓ Backend server listening on http://localhost:3000
# ✓ WebSocket server ready on ws://localhost:3000
# ✓ MongoDB connected
# ✓ Redis connected
```

### Frontend Server (if separate)

```bash
# In another terminal
npm run dev:frontend

# Expected output:
# ✓ Frontend dev server running on http://localhost:3001
# ✓ Ready to accept connections
```

---

## 8. Test Setup Verification

### Run Tests to Verify Setup

```bash
# Run all tests
npm test

# Run specific test file
npm test -- WalletService.test.ts

# Run with coverage
npm test -- --coverage

# Expected: All tests pass
```

---

## 9. Git Workflow Setup

### Configure Git Hooks

```bash
# Initialize Husky
npx husky install

# Create pre-commit hook (linting)
npx husky add .husky/pre-commit "npm run lint --fix"

# Create pre-push hook (tests)
npx husky add .husky/pre-push "npm test"
```

### Git Configuration

```bash
# Set your Git identity
git config user.name "Your Name"
git config user.email "your.email@linkswift.com"

# Set up automatic branch sync
git config pull.rebase true
```

---

## 10. API Documentation Setup

### Swagger/OpenAPI Setup

```bash
# Install Swagger UI
npm install swagger-ui-express swagger-jsdoc

# Access API docs at http://localhost:3000/api-docs
```

### Generate API Documentation

```bash
# Generate OpenAPI schema
npm run generate:openapi

# Docs available at:
# http://localhost:3000/api-docs (Swagger UI)
# http://localhost:3000/api-docs.json (Raw JSON)
```

---

## 11. Debugging Setup

### Node Debugger Setup

```javascript
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "program": "${workspaceFolder}/server.ts",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Enable Source Maps

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false
  }
}
```

---

## 12. Code Quality Tools

### ESLint Configuration

```bash
# Already configured in project, verify:
npm run lint

# Fix issues automatically
npm run lint:fix
```

### Prettier Configuration

```bash
# Format all files
npm run format

# Check formatting (without changes)
npm run format:check
```

### TypeScript Checking

```bash
# Type checking without compilation
npm run type-check

# Should pass without errors
```

---

## 13. Monitoring & Logging Setup

### Winston Logger Configuration

```bash
# Logs directory will be created automatically
logs/
├── combined.log       # All logs
├── error.log          # Errors only
└── access.log         # HTTP access logs
```

### View Logs in Development

```bash
# Stream logs in real-time
tail -f logs/combined.log

# Follow specific service
tail -f logs/error.log
```

---

## 14. Local Testing API

### Using REST Client Extension

Create `api.rest` file:

```rest
### Environment Variables
@baseUrl = http://localhost:3000/api
@token = your_jwt_token_here

### 1. Create Wallet Account
POST {{baseUrl}}/wallet
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439011",
  "tier": "tier1"
}

### 2. Add Beneficiary
POST {{baseUrl}}/beneficiaries
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "accountName": "Chidi Okoro",
  "accountNumber": "0123456789",
  "bankCode": "007"
}

### 3. Get Wallet Balance
GET {{baseUrl}}/wallet/balance
Authorization: Bearer {{token}}
```

---

## 15. Troubleshooting Common Issues

### Issue: MongoDB Connection Refused

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# Restart MongoDB
docker-compose -f docker-compose.dev.yml restart mongodb

# Verify connection
mongosh --host localhost
```

### Issue: Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:backend
```

### Issue: Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use pnpm (faster)
pnpm install
```

### Issue: TypeScript Compilation Errors

```bash
# Clear compiled files
npm run clean

# Rebuild
npm run build

# Check types
npm run type-check
```

---

## 16. Team Onboarding Checklist

Each team member should verify:

- [ ] Repository cloned and on correct branch
- [ ] Node dependencies installed
- [ ] `.env.development.local` configured
- [ ] Docker containers running (MongoDB, Redis)
- [ ] Database seeded with test data
- [ ] Backend server starts without errors
- [ ] Frontend server starts (if applicable)
- [ ] All tests pass
- [ ] Can make API calls to backend
- [ ] VSCode extensions installed and working
- [ ] Git hooks working (pre-commit linting)
- [ ] Can view logs in real-time
- [ ] Documentation accessible (API docs at /api-docs)
- [ ] IDE debugging configured and working
- [ ] Git workflow understood (branching, PRs, commits)

---

## 17. Useful Commands Reference

```bash
# Development
npm run dev:backend        # Start backend
npm run dev:frontend       # Start frontend
npm run dev:all            # Start all services

# Testing
npm test                   # Run all tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # With coverage

# Code Quality
npm run lint              # ESLint check
npm run lint:fix          # Fix lint issues
npm run format            # Prettier format
npm run type-check        # TypeScript check

# Database
npm run seed:development  # Seed test data
npm run migrate:up        # Run migrations
npm run migrate:down      # Rollback migrations

# Build
npm run build             # Build for production
npm run clean             # Clean build artifacts

# Docker
docker-compose -f docker-compose.dev.yml up -d    # Start
docker-compose -f docker-compose.dev.yml down     # Stop
docker-compose -f docker-compose.dev.yml logs -f  # Logs
```

---

## 18. Additional Resources

- **Repository**: https://github.com/Blackhatdawn/LINK-SWIFT-TRAVEL-HUB-OLDER-VERSION
- **API Documentation**: http://localhost:3000/api-docs (after starting server)
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express.js Docs**: https://expressjs.com/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Testing with Jest**: https://jestjs.io/docs/getting-started
- **Slack Channel**: #sprint-1-wallet

---

## 19. Support & Getting Help

If you encounter issues:

1. **Check Troubleshooting Section** (Section 15)
2. **Search GitHub Issues** for similar problems
3. **Post in Slack** #sprint-1-wallet with error details
4. **Schedule pair programming** with team lead

---

**Document Status**: Ready for Use  
**Last Updated**: [Today's Date]  
**Version**: 1.0

