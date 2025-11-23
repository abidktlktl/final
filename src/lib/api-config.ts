// API Configuration for backend connection
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Get API URL from environment variable or use default
// For production, use Railway backend; for development, use local backend
const API_BASE_URL = import.meta.env.VITE_API_URL || (isProduction ? 'https://fastify-production-56d7.up.railway.app' : 'http://localhost:4000');

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    // Auth
    authInstagram: '/api/auth/instagram',
    authCallback: '/api/auth/instagram/callback',
    mockConnect: '/api/auth/mock-connect',
    
    // Content
    reels: '/api/reels',
    stories: '/api/stories',
    
    // Automations
    automation: '/api/automation',
    reelAutomation: (id: string) => `/api/automation/reel/${id}`,
    storyAutomation: (id: string) => `/api/automation/story/${id}`,
    bulkAutomation: '/api/automation/bulk',
    
    // Templates
    templates: (type: string) => `/api/templates/${type}`,
    
    // Analytics
    analyticsSummary: '/api/analytics/summary',
    
    // User
    userProfile: '/api/user/profile',
    
    // Billing
    billingSubscription: '/api/billing/subscription',
    billingInvoices: '/api/billing/invoices',
    billingSubscribe: '/api/billing/subscribe',
    billingCancel: '/api/billing/cancel',
    billingPlans: '/api/billing/plans',
    
    // Workflows
    workflows: '/api/workflows',
    workflow: (id: string) => `/api/workflows/${id}`,
    
    // Users
    users: '/api/users',
    user: (igId: string) => `/api/users/${igId}`,
    userTags: (igId: string) => `/api/users/${igId}/tags`,
    userTag: (igId: string, tag: string) => `/api/users/${igId}/tags/${tag}`,
    
    // Comments
    comments: (mediaId: string) => `/api/comments/${mediaId}`,
    commentReply: (commentId: string) => `/api/comments/${commentId}/reply`,
    commentHide: (commentId: string) => `/api/comments/${commentId}/hide`,
    commentDelete: (commentId: string) => `/api/comments/${commentId}`,
    
    // Testing
    testAutomation: '/api/test/automation',
    testComment: '/api/test/comment',
    testCommentAutomation: '/api/test/comment-automation',
    
    // Bot
    botStatus: '/api/bot/status',
    
    // Webhooks
    webhook: '/webhook',
    webhookInstagram: '/webhook/instagram',
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function for API headers
export const getApiHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Export configuration status for debugging
export const getApiStatus = () => ({
  apiUrl: API_BASE_URL,
  environment: isProduction ? 'production' : 'development',
});

console.log('🔧 API Configuration:', getApiStatus());
