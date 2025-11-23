// API service for backend communication
import { apiConfig, buildApiUrl, getApiHeaders } from './api-config';

// Type definitions
interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

interface AutomationData {
  comment?: string;
  dm?: string;
  schedule?: string | null;
  followBefore?: boolean;
  triggerWords?: string[];
  delay?: number;
  conditions?: {
    minFollowers?: number;
    maxFollowers?: number;
    hasBio?: boolean;
    verified?: boolean;
  };
  workflow?: {
    name: string;
    steps: Array<{
      message: string;
      delay: number;
      followBefore: boolean;
    }>;
    triggerWords: string[];
    active: boolean;
  };
}

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    automation: boolean;
    billing: boolean;
  };
  privacy?: {
    profileVisible: boolean;
    dataSharing: boolean;
    analytics: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Workflow {
  id: string;
  name: string;
  steps: Array<{
    message: string;
    delay: number;
    followBefore: boolean;
  }>;
  triggerWords?: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BillingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  limits: {
    automations: number;
    accounts: number;
    templates: number;
    apiCalls: number;
  };
  popular?: boolean;
}

interface Subscription {
  id?: string;
  currentPlan?: string;
  planId?: string;
  nextBilling?: string;
  amount?: number;
  status?: string;
  paymentMethod?: {
    type: string;
    last4: string;
    brand: string;
  };
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: string;
  downloadUrl: string;
}

interface PaymentMethod {
  type: string;
  token?: string;
  [key: string]: unknown;
}

interface Reel {
  id: string;
  thumbnail: string;
  caption: string;
  owner: string;
  duration?: number;
  timestamp?: string;
  likes?: number;
  comments?: number;
  permalink?: string;
  mediaType?: string;
  mediaProductType?: string;
  isRealData?: boolean;
}

interface Story {
  id: string;
  thumbnail: string;
  caption: string;
  owner: string;
  expires_at: string;
  permalink?: string;
  media_url?: string;
  isRealData?: boolean;
}

interface Automations {
  reels: Record<string, AutomationData>;
  stories: Record<string, AutomationData>;
  dm_automations?: DmAutomation;
}

interface DmAutomation {
  welcome_message?: {
    enabled: boolean;
    message: string;
    delay: number;
  };
  story_reply?: {
    enabled: boolean;
    message: string;
  };
  keyword_responses?: Array<{
    keywords: string[];
    response: string;
  }>;
  updatedAt?: string;
}

interface InstagramAccount {
  id: string;
  username: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

interface PageInfo {
  id: string;
  name: string;
  access_token: string;
}

interface Conversation {
  id: string;
  updated_time: string;
  messages?: {
    data: Array<{
      message: string;
      from: { id: string; name?: string };
      created_time: string;
    }>;
  };
}

interface MessageAttachment {
  type: string;
  payload?: {
    url?: string;
    sticker_id?: string;
    [key: string]: unknown;
  };
}

interface ThreadMessage {
  message: string;
  from: { id: string; name?: string };
  created_time: string;
  attachments?: MessageAttachment[];
}

interface PagingInfo {
  cursors?: {
    before?: string;
    after?: string;
  };
  next?: string;
  previous?: string;
}

interface AnalyticsSummary {
  summary: {
    totalReach: number;
    totalImpressions: number;
    totalEngagement: number;
    newFollowers: number;
    automationSuccessRate: number;
  };
  dailyStats: Array<{
    date: string;
    reach: number;
    impressions: number;
    engagement: number;
    newFollowers: number;
  }>;
  topAutomations: Array<{
    id: string;
    name: string;
    engagement: number;
    successRate: number;
  }>;
  followerGrowth: Array<{
    date: string;
    followers: number;
  }>;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('instaauto-token', token);
    } else {
      localStorage.removeItem('instaauto-token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('instaauto-token');
    }
    return this.token;
  }

  // Generic fetch wrapper
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = buildApiUrl(endpoint);
    const headers = getApiHeaders(this.getToken() || undefined);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async getInstagramAuthUrl(): Promise<{ authUrl: string }> {
    return this.fetchApi(apiConfig.endpoints.authInstagram);
  }

  async handleAuthCallback(code: string): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.authCallback, {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async mockConnect(): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.mockConnect, {
      method: 'POST',
    });
  }

  // Content methods
  async getReels(): Promise<Reel[]> {
    return this.fetchApi(apiConfig.endpoints.reels);
  }

  async getStories(): Promise<Story[]> {
    return this.fetchApi(apiConfig.endpoints.stories);
  }

  // Automation methods
  async getAutomations(): Promise<Automations> {
    return this.fetchApi(apiConfig.endpoints.automation);
  }

  async saveReelAutomation(id: string, data: AutomationData): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.reelAutomation(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async saveStoryAutomation(id: string, data: AutomationData): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.storyAutomation(id), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteReelAutomation(id: string): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.reelAutomation(id), {
      method: 'DELETE',
    });
  }

  async deleteStoryAutomation(id: string): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.storyAutomation(id), {
      method: 'DELETE',
    });
  }

  async saveBulkAutomation(type: string, ids: string[], automation: AutomationData): Promise<ApiResponse<{
    success: string[];
    failed: Array<{ id: string; error: string }>;
  }>> {
    return this.fetchApi(apiConfig.endpoints.bulkAutomation, {
      method: 'POST',
      body: JSON.stringify({ type, ids, automation }),
    });
  }

  // Analytics methods
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return this.fetchApi(apiConfig.endpoints.analyticsSummary);
  }

  // User profile methods
  async getUserProfile(): Promise<UserProfile> {
    return this.fetchApi(apiConfig.endpoints.userProfile);
  }

  async updateUserProfile(data: Partial<UserProfile>): Promise<ApiResponse<{ profile: UserProfile }>> {
    return this.fetchApi(apiConfig.endpoints.userProfile, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Template methods
  async getTemplates(type: string): Promise<Template[]> {
    return this.fetchApi(apiConfig.endpoints.templates(type));
  }

  async createTemplate(data: Partial<Template>): Promise<ApiResponse<{ template: Template }>> {
    return this.fetchApi('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(id: string, data: Partial<Template>): Promise<ApiResponse<{ template: Template }>> {
    return this.fetchApi(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse> {
    return this.fetchApi(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow methods
  async getWorkflows(): Promise<Workflow[]> {
    return this.fetchApi(apiConfig.endpoints.workflows);
  }

  async createWorkflow(data: Partial<Workflow>): Promise<ApiResponse<{ workflow: Workflow }>> {
    return this.fetchApi(apiConfig.endpoints.workflows, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<ApiResponse<{ workflow: Workflow }>> {
    return this.fetchApi(apiConfig.endpoints.workflow(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.workflow(id), {
      method: 'DELETE',
    });
  }

  // Billing methods
  async getBillingPlans(): Promise<BillingPlan[]> {
    return this.fetchApi(apiConfig.endpoints.billingPlans);
  }

  async getBillingSubscription(): Promise<Subscription> {
    return this.fetchApi(apiConfig.endpoints.billingSubscription);
  }

  async getBillingInvoices(): Promise<Invoice[]> {
    return this.fetchApi(apiConfig.endpoints.billingInvoices);
  }

  async subscribeToPlan(planId: string, paymentMethod: PaymentMethod): Promise<ApiResponse<{ subscription: Subscription }>> {
    return this.fetchApi(apiConfig.endpoints.billingSubscribe, {
      method: 'POST',
      body: JSON.stringify({ planId, paymentMethod }),
    });
  }

  async cancelSubscription(): Promise<ApiResponse> {
    return this.fetchApi(apiConfig.endpoints.billingCancel, {
      method: 'POST',
    });
  }

  // Instagram Graph API methods
  async getInstagramAccount(): Promise<{
    success: boolean;
    instagram_business_account: InstagramAccount;
    page: PageInfo;
  }> {
    return this.fetchApi('/api/instagram/account');
  }

  // DM Automation methods
  async getDmAutomation(): Promise<{
    success: boolean;
    dm_automations: DmAutomation;
  }> {
    return this.fetchApi('/api/automation/dm');
  }

  async saveDmAutomation(data: DmAutomation): Promise<ApiResponse<{
    dm_automations: DmAutomation;
  }>> {
    return this.fetchApi('/api/automation/dm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Message/Conversation methods
  async sendMessage(recipientId: string, message: string, igAccountId?: string, pageToken?: string): Promise<ApiResponse<{
    message_id: string;
    recipient_id: string;
  }>> {
    return this.fetchApi('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify({
        recipient_id: recipientId,
        message: message,
        ig_account_id: igAccountId,
        page_token: pageToken
      }),
    });
  }

  async getConversations(igAccountId?: string, pageToken?: string): Promise<{
    success: boolean;
    conversations: Conversation[];
    paging?: PagingInfo;
  }> {
    const params = new URLSearchParams();
    if (igAccountId) params.append('ig_account_id', igAccountId);
    if (pageToken) params.append('page_token', pageToken);
    
    return this.fetchApi(`/api/messages/conversations${params.toString() ? '?' + params.toString() : ''}`);
  }

  async getThreadMessages(threadId: string, pageToken?: string): Promise<{
    success: boolean;
    thread_id: string;
    messages: ThreadMessage[];
    paging?: PagingInfo;
  }> {
    const params = pageToken ? `?page_token=${pageToken}` : '';
    return this.fetchApi(`/api/messages/thread/${threadId}${params}`);
  }

  // Bot status check
  async getBotStatus(): Promise<{
    hasBotToken: boolean;
    tokenPreview: string;
    message: string;
  }> {
    return this.fetchApi('/api/bot/status');
  }
}

// Create and export a singleton instance
export const api = new ApiService();

// Export the class for testing purposes
export { ApiService };

// Export types for use in other files
export type {
  ApiResponse,
  AutomationData,
  UserProfile,
  Template,
  Workflow,
  BillingPlan,
  Subscription,
  Invoice,
  PaymentMethod,
  Reel,
  Story,
  Automations,
  AnalyticsSummary
};
