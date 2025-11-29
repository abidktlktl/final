# System Architecture Review - Instagram Automation Platform

**Date:** November 27, 2025  
**Status:** ✅ ISSUES IDENTIFIED & FIXED

---

## 📋 Executive Summary

This document provides a complete review of your Instagram Automation System, which consists of:
- **Frontend:** React + TypeScript (Vite) deployed on Netlify
- **Backend:** Fastify.js running on Railway
- **Database:** Redis (for caching/sessions) + JSON file storage
- **Communication:** Instagram Graph API & Facebook Webhook

**Critical Issue Found & Fixed:** CORS misconfiguration preventing frontend-backend communication.

---

## 🏗️ FRONTEND ARCHITECTURE

### Stack
- **Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 5.4.19
- **Deployment:** Netlify (dm2comment.netlify.app)
- **UI Components:** Radix UI + Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Query (TanStack)
- **Forms:** React Hook Form + Zod validation

### Project Structure
```
src/
├── components/           # React components
│   ├── ui/              # Radix UI components
│   ├── DmAutomationSettings.tsx
│   ├── BillingPricing.tsx
│   ├── ProfileSettings.tsx
│   ├── MessageTemplateModal.tsx
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Dashboard
│   ├── Analytics.tsx
│   ├── Settings.tsx
│   ├── AuthCallback.tsx
│   ├── SimpleDashboard.tsx
│   └── ...
├── lib/
│   ├── api.ts           # API service class
│   ├── api-config.ts    # Configuration ✅ FIXED
│   └── utils.ts
└── hooks/
    ├── use-mobile.tsx
    └── use-toast.ts
```

### API Client Configuration
**File:** `src/lib/api-config.ts`

**Status:** ✅ FIXED

**Changes Made:**
```typescript
// OLD (Problematic)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://final-production-e2b7.up.railway.app';

// NEW (Fixed)
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isProduction 
    ? 'https://final-production-e2b7.up.railway.app'
    : 'http://localhost:4000'
);
```

**Endpoints Configured:** 60+ API endpoints including:
- Authentication (Instagram OAuth)
- Content fetching (Reels, Stories)
- Automations (Reel/Story/DM automation)
- Templates & Workflows
- Analytics & Billing
- User management
- Comments & Direct Messages

---

## ⚙️ BACKEND ARCHITECTURE

### Stack
- **Framework:** Fastify 5.6.1 (lightweight HTTP server)
- **Hosting:** Railway (final-production-e2b7.up.railway.app)
- **Port:** 4000 (Railway assigned)
- **CORS:** Configured with multiple allowed origins
- **Database:** Redis client + JSON file storage
- **External APIs:** Instagram Graph API v18.0

### Project Structure
```
backend/
├── server.js            # Main Fastify server ✅ FIXED
├── server-redis.js      # Redis-based server alternative
├── redis-client.js      # Redis connection wrapper
├── redis-enhanced.js    # Enhanced Redis functionality
├── package.json
└── data/
    ├── automations.json # Automation rules
    ├── users.json       # User data
    ├── templates.json   # Message templates
    ├── workflows.json   # Workflow definitions
    ├── analytics.json   # Analytics data
    └── ref.md
```

### API Endpoints Structure

#### Authentication & Instagram Account
- `GET /health` - Health check
- `GET /api/bot/status` - Bot token status
- `GET /api/instagram/account` - Get Instagram Business Account

#### Content Management
- `GET /api/reels` - Fetch user's reels
- `GET /api/stories` - Fetch user's stories

#### Automations
- `GET /api/automation` - Get all automations
- `POST /api/automation/reel/:id` - Save reel automation
- `POST /api/automation/story/:id` - Save story automation
- `DELETE /api/automation/reel/:id` - Delete reel automation
- `DELETE /api/automation/story/:id` - Delete story automation
- `POST /api/automation/dm` - Save DM automation settings
- `GET /api/automation/dm` - Get DM automation settings

#### Direct Messages
- `POST /api/messages/send` - Send DM
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/thread/:thread_id` - Get thread messages

#### Webhooks
- `GET /webhook/instagram` - Webhook verification
- `POST /webhook/instagram` - Webhook event processing

### CORS Configuration
**File:** `backend/server.js`

**Status:** ✅ FIXED

**Allowed Origins:**
```javascript
const allowedOrigins = [
  'https://dm2comment.netlify.app',              // ✅ ADDED - Frontend
  'https://final-production-e2b7.up.railway.app', // ✅ FIXED - Backend
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173'
];
```

**CORS Methods Allowed:** GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH

---

## 🗄️ DATABASE ARCHITECTURE

### Data Storage Strategy

#### 1. Redis (In-Memory Cache & Session Store)
**Purpose:** High-speed data access, comment deduplication, webhook tracking

**Key Features:**
- Comment reply deduplication (`hasCommentBeenReplied()`, `markCommentAsReplied()`)
- Webhook duplicate prevention
- Session management
- Daily statistics tracking

**Data Tracked:**
```
- event:webhook_received:TIMESTAMP
- event:dm_received:TIMESTAMP
- event:comment_replied:TIMESTAMP
- comment:replied:COMMENT_ID
- stats:daily:DATE
```

**Connection File:** `backend/redis-client.js`

#### 2. JSON File Storage
**Purpose:** Persistent storage of automations and user data

**Files:**
```
backend/data/
├── automations.json     # User automation rules
├── users.json          # User profiles
├── user.json           # Current user info
├── templates.json      # Message templates
├── workflows.json      # Workflow definitions
├── analytics.json      # Analytics data
└── ref.md              # Reference data
```

**Data Structure Example (automations.json):**
```json
{
  "reels": {
    "reel_id_123": {
      "id": "reel_id_123",
      "comment": "Thanks for commenting! @{username}",
      "dm": "Welcome to our page!",
      "updatedAt": "2025-11-27T...",
      "createdAt": "2025-11-20T..."
    }
  },
  "stories": {},
  "dm_automations": {
    "welcome_message": {
      "enabled": true,
      "message": "Thanks for messaging!",
      "delay": 1
    },
    "keyword_responses": [
      {
        "keywords": ["price", "cost"],
        "response": "Our pricing: ..."
      }
    ]
  }
}
```

### Data Flow Diagram

```
Frontend (Netlify)
    ↓ (HTTPS)
    └─→ Backend (Railway) - Port 4000
        ├─→ Redis (Session/Cache)
        ├─→ JSON Files (Persistence)
        └─→ Instagram Graph API (v18.0)
            ├─→ Reels/Stories
            ├─→ Comments
            ├─→ Direct Messages
            └─→ User Profiles
```

---

## 🔧 CRITICAL ISSUES FOUND & FIXED

### ❌ Issue #1: CORS Origin Mismatch
**Problem:** Backend CORS whitelist had outdated Railway URL
```javascript
// OLD
const allowedOrigins = [
  'https://final-production-cdd8.up.railway.app',  // ❌ OLD URL
  'http://localhost:3000',
  // ...
];
```

**Impact:** Frontend domain (`dm2comment.netlify.app`) was NOT whitelisted, causing CORS errors

**Fix Applied:** ✅
```javascript
// NEW
const allowedOrigins = [
  'https://dm2comment.netlify.app',                 // ✅ ADDED
  'https://final-production-e2b7.up.railway.app',   // ✅ CORRECT URL
  // ...
];
```

---

### ❌ Issue #2: Frontend API URL Configuration
**Problem:** Hardcoded production URL didn't account for development environment

**Impact:** Local development couldn't connect to backend at `localhost:4000`

**Fix Applied:** ✅
```typescript
// OLD
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://final-production-e2b7.up.railway.app';

// NEW
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isProduction 
    ? 'https://final-production-e2b7.up.railway.app'
    : 'http://localhost:4000'
);
```

**Result:** 
- Production: Uses Railway URL
- Development: Uses localhost:4000

---

### ⚠️ Issue #3: Redis Integration Status
**Status:** Configured but may need verification

**Redis Client Features:**
- Comment deduplication tracking
- Webhook duplicate prevention
- Session storage
- Statistics aggregation

**Recommendation:** Verify Redis connection is active on Railway

---

## 📊 Feature Breakdown

### 1. Comment Automation
- Auto-reply to comments with custom templates
- Follow/unfollow conditionals
- Keyword-based routing
- Duplicate prevention via Redis

### 2. DM Automation
- Welcome message automation
- Story reply automation
- Keyword-triggered responses
- Response delay configuration

### 3. Analytics
- Daily statistics tracking
- Reach & engagement metrics
- Follower growth tracking
- Automation success rates

### 4. Workflow System
- Multi-step message sequences
- Conditional branching
- Scheduled messaging
- Template variables

### 5. User Management
- Profile settings
- Timezone configuration
- Notification preferences
- Privacy controls

---

## 🔐 Security Considerations

### Current Implementations
- ✅ CORS protection
- ✅ Bearer token authentication
- ✅ Environment variable management
- ✅ Admin key protection (token update endpoint)

### Recommendations
- [ ] Implement rate limiting on API endpoints
- [ ] Add request validation middleware
- [ ] Use HTTPS everywhere (already done)
- [ ] Store sensitive tokens in Railway Secrets, not in code
- [ ] Add request signature verification for webhooks
- [ ] Implement audit logging for automated actions

---

## 🚀 Deployment Status

### Frontend (Netlify)
- **URL:** dm2comment.netlify.app
- **Build Command:** `npm run build:frontend`
- **Status:** ✅ Ready to deploy (after CORS fix)

### Backend (Railway)
- **URL:** final-production-e2b7.up.railway.app
- **Port:** 4000 (auto-assigned)
- **Status:** ✅ Updated with CORS fix

### Environment Variables Required
```
# Backend (Railway)
INSTAGRAM_BOT_ACCESS_TOKEN=your_token_here
WEBHOOK_VERIFY_TOKEN=your_webhook_token_here
PORT=4000 (Railway assigns this)
NODE_ENV=production

# Frontend (Netlify)
VITE_API_URL=https://final-production-e2b7.up.railway.app
```

---

## 📋 Next Steps

### Immediate Actions
1. ✅ Fix CORS configuration - **DONE**
2. ✅ Fix frontend API config - **DONE**
3. Test frontend-backend connectivity
4. Verify Redis connection on Railway
5. Deploy backend changes to Railway
6. Deploy frontend changes to Netlify

### Testing Checklist
- [ ] Health endpoint accessible: `/health`
- [ ] Bot status endpoint: `/api/bot/status`
- [ ] Fetch reels: `GET /api/reels` (with token)
- [ ] Fetch automations: `GET /api/automation`
- [ ] Create automation: `POST /api/automation/reel/:id`
- [ ] Webhook verification: `GET /webhook/instagram`

### Recommended Improvements
1. Add API rate limiting
2. Implement request validation
3. Add comprehensive error logging
4. Create API documentation (Swagger/OpenAPI)
5. Set up monitoring & alerting
6. Add automated tests
7. Implement CI/CD pipeline for automatic deployments

---

## 📞 Support Resources

- **Fastify Docs:** https://www.fastify.io/
- **Vite Docs:** https://vitejs.dev/
- **React Docs:** https://react.dev/
- **Instagram Graph API:** https://developers.facebook.com/docs/instagram-api
- **Netlify Docs:** https://docs.netlify.com/
- **Railway Docs:** https://railway.app/docs

---

## ✅ Summary

**Issues Fixed:**
- ✅ CORS whitelist updated with correct Railway URL
- ✅ CORS includes Netlify frontend domain
- ✅ Frontend API config supports both development and production
- ✅ Development environment points to localhost:4000
- ✅ Production environment points to Railway backend

**Status:** Your application infrastructure is now properly configured for frontend-backend communication. Deploy the changes to Railway and Netlify to activate the fixes.
