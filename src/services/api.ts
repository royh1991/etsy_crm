// API Client for Etsy CRM Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (!skipAuth && this.getToken()) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers
    });

    if (response.status === 401) {
      this.setToken(null);
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const result = await this.request<{ token: string; user: any; shop: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true
    });
    this.setToken(result.token);
    return result;
  }

  async register(email: string, password: string, name: string, shopName: string) {
    const result = await this.request<{ token: string; user: any; shop: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, shopName }),
      skipAuth: true
    });
    this.setToken(result.token);
    return result;
  }

  async getMe() {
    return this.request<{ user: any; shop: any }>('/auth/me');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  getEtsyConnectUrl() {
    return `${API_URL}/auth/etsy/connect`;
  }

  // Orders
  async getOrders(params?: {
    stage?: string;
    search?: string;
    shipBy?: string;
    hasIssue?: boolean;
    isGift?: boolean;
    tags?: string[];
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.stage) searchParams.set('stage', params.stage);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.shipBy) searchParams.set('shipBy', params.shipBy);
    if (params?.hasIssue) searchParams.set('hasIssue', 'true');
    if (params?.isGift) searchParams.set('isGift', 'true');
    if (params?.tags) searchParams.set('tags', params.tags.join(','));
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request<{ orders: any[]; total: number }>(`/orders${query ? `?${query}` : ''}`);
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async updateOrder(id: string, data: {
    pipelineStage?: string;
    tags?: string[];
    hasIssue?: boolean;
    issueDescription?: string;
    assignedToId?: string | null;
  }) {
    return this.request<any>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async addOrderNote(orderId: string, content: string, isInternal = true) {
    return this.request<any>(`/orders/${orderId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content, isInternal })
    });
  }

  async shipOrder(orderId: string, carrierName: string, trackingNumber: string, trackingUrl?: string) {
    return this.request<any>(`/orders/${orderId}/ship`, {
      method: 'POST',
      body: JSON.stringify({ carrierName, trackingNumber, trackingUrl })
    });
  }

  async addOrderTag(orderId: string, tag: string) {
    return this.request<any>(`/orders/${orderId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tag })
    });
  }

  async removeOrderTag(orderId: string, tag: string) {
    return this.request<any>(`/orders/${orderId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE'
    });
  }

  async batchUpdateOrders(orderIds: string[], updates: {
    pipelineStage?: string;
    addTags?: string[];
    removeTags?: string[];
    assignedToId?: string | null;
  }) {
    return this.request<{ updated: number }>('/orders/batch', {
      method: 'POST',
      body: JSON.stringify({ orderIds, ...updates })
    });
  }

  // Customers
  async getCustomers(params?: {
    search?: string;
    tier?: string;
    isRepeat?: boolean;
    isFlagged?: boolean;
    minSpent?: number;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.tier) searchParams.set('tier', params.tier);
    if (params?.isRepeat) searchParams.set('isRepeat', 'true');
    if (params?.isFlagged) searchParams.set('isFlagged', 'true');
    if (params?.minSpent) searchParams.set('minSpent', params.minSpent.toString());
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request<{ customers: any[]; total: number }>(`/customers${query ? `?${query}` : ''}`);
  }

  async getCustomer(id: string) {
    return this.request<any>(`/customers/${id}`);
  }

  async getCustomerOrders(customerId: string) {
    return this.request<any[]>(`/customers/${customerId}/orders`);
  }

  async addCustomerFlag(customerId: string, type: string, reason: string) {
    return this.request<any>(`/customers/${customerId}/flags`, {
      method: 'POST',
      body: JSON.stringify({ type, reason })
    });
  }

  async removeCustomerFlag(customerId: string, flagId: string) {
    return this.request<any>(`/customers/${customerId}/flags/${flagId}`, {
      method: 'DELETE'
    });
  }

  // Sync
  async syncOrders() {
    return this.request<{
      success: boolean;
      syncLogId: string;
      ordersCreated: number;
      ordersUpdated: number;
      customersCreated: number;
      customersUpdated: number;
    }>('/sync/orders', { method: 'POST' });
  }

  async getSyncStatus() {
    return this.request<{
      etsyConnected: boolean;
      lastSyncAt: string | null;
      autoSyncEnabled: boolean;
      syncIntervalMins: number;
      lastSync: any;
    }>('/sync/status');
  }

  async getSyncLogs(limit = 20, offset = 0) {
    return this.request<{ logs: any[]; total: number }>(`/sync/logs?limit=${limit}&offset=${offset}`);
  }

  // Analytics
  async getDashboardStats() {
    return this.request<any>('/analytics/dashboard');
  }

  async getRevenueData(days = 30) {
    return this.request<any>(`/analytics/revenue?period=${days}`);
  }

  // Settings
  async getShopSettings() {
    return this.request<any>('/settings/shop');
  }

  async updateShopSettings(data: { shopName?: string; defaultFromAddress?: any }) {
    return this.request<any>('/settings/shop', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getMessageTemplates() {
    return this.request<any[]>('/settings/templates');
  }

  async createMessageTemplate(data: { name: string; subject?: string; body: string; category?: string }) {
    return this.request<any>('/settings/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getSavedFilters(type?: 'ORDER' | 'CUSTOMER') {
    const query = type ? `?type=${type}` : '';
    return this.request<any[]>(`/settings/filters${query}`);
  }

  async createSavedFilter(data: { name: string; type: 'ORDER' | 'CUSTOMER'; filters: any; isDefault?: boolean }) {
    return this.request<any>('/settings/filters', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTeamMembers() {
    return this.request<any[]>('/settings/team');
  }
}

export const api = new ApiClient();
