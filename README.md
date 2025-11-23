# InstaAuto — Privacy-First Instagram Automation Demo

A fully working mobile-first Instagram automation prototype with no real Instagram integration. Perfect for product demos, validation, and development.

## 🚀 Key Features

- **Mock Instagram OAuth** - Connect button with demo authentication
- **Reels & Stories Management** - Browse and manage content with responsive UI
- **Automation Setup** - Auto-comments for Reels, Auto-DMs for Stories
- **Test Simulation** - Built-in testing without external API calls
- **Export/Import** - Share automations via JSON files
- **Mobile-First Design** - Bottom navigation and touch-optimized interface
- **Privacy-First** - All data stored locally and in-memory only

## 🛡️ Privacy & Security

✅ **Local Storage Only** - No cloud storage or external databases  
✅ **No Real Instagram API** - All data is mocked for safety  
✅ **Session-Only Data** - Backend data resets on server restart  
✅ **Browser-Only Tokens** - Authentication stored in localStorage  

## 🎯 Perfect For

- **Product Demos** - Show automation features without real accounts
- **Client Presentations** - Safe demo environment for agencies
- **Development** - Clear integration points for real Instagram API
- **Validation** - Test user flows and interface design

## 🏗️ Architecture

**Frontend**: React + TypeScript + Tailwind CSS + ShadCN UI  
**Backend**: Node.js + Express with in-memory JSON store  
**Authentication**: Mock OAuth flow with localStorage tokens  
**Data Flow**: RESTful API with optimistic UI updates  

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Two terminal windows

### Backend Setup
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:4000
```

### Frontend Setup  
```bash
# In project root
npm install
npm run dev
# Frontend runs on http://localhost:8080
```

### Usage
1. Open http://localhost:8080
2. Click "Connect Instagram (Demo)"
3. Browse Reels and Stories in Dashboard
4. Click items to set up automations
5. Test automations with built-in simulator
6. Export/import data in Settings

## 📱 Mobile-First UX

- **Bottom Navigation** - Home, Dashboard, Settings
- **Large Touch Targets** - 44px minimum for mobile accessibility  
- **Card-Based Interface** - Easy browsing and interaction
- **Modal Editors** - Optimized for small screens
- **Live Preview** - See automation output before saving
- **Responsive Design** - Works on all screen sizes

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/mock-connect` - Mock Instagram OAuth

### Content
- `GET /api/reels` - Fetch mock Reels data
- `GET /api/stories` - Fetch mock Stories data

### Automations
- `GET /api/automation` - Get all automations
- `POST /api/automation/reel/:id` - Save Reel automation
- `POST /api/automation/story/:id` - Save Story automation  
- `DELETE /api/automation/reel/:id` - Delete Reel automation
- `DELETE /api/automation/story/:id` - Delete Story automation

## 🔌 Integration Ready

Clear TODO markers throughout codebase for real Instagram integration:

```javascript
// TODO: Replace with real Instagram OAuth
// TODO: Replace with real Instagram API call
```

**Integration Points:**
- OAuth flow in `/api/auth/mock-connect`
- Data fetching in `/api/reels` and `/api/stories`  
- Real automation triggers (currently simulated)

## 📊 Data Structure

```json
{
  "reels": {
    "r1": {
      "id": "r1",
      "comment": "Great content! 👏",
      "schedule": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "stories": {
    "s1": {
      "id": "s1", 
      "dm": "Thanks for the story! 💯",
      "schedule": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 🎨 Design System

Instagram-inspired color palette with mobile-first components:

- **Primary**: Instagram gradient (pink to orange)
- **Cards**: Rounded corners with subtle shadows
- **Typography**: Clear hierarchy optimized for mobile
- **Touch Targets**: Minimum 44px for accessibility
- **Animations**: Smooth transitions and micro-interactions

## 🚢 Deployment Ready

**Development**: Frontend proxies `/api` calls to backend  
**Production**: Deploy frontend and backend separately or together

**Example Docker Setup:**
- Frontend: Static files served by nginx
- Backend: Node.js container with API endpoints
- Both: Single docker-compose for easy deployment

## 📋 Roadmap

**Potential Enhancements:**
- [ ] A/B testing for comment variations
- [ ] Analytics dashboard with mock engagement data
- [ ] Scheduling with calendar interface
- [ ] Bulk automation setup
- [ ] Advanced filtering and search
- [ ] Unit tests for backend and components

## 🤝 Contributing

This is a demo project designed for forking and customization. Key areas for extension:

1. **Real Instagram API** - Replace mock endpoints
2. **Database Integration** - Add persistent storage  
3. **Advanced Scheduling** - Add cron jobs for automation
4. **Analytics** - Track automation performance
5. **Multi-Account** - Support multiple Instagram accounts

## 📄 License

MIT License - Perfect for forking and commercial use.

---

**⚡ Ready to ship in minutes, ready to scale when needed.**