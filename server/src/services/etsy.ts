import crypto from 'crypto';

const ETSY_API_URL = 'https://api.etsy.com/v3';
const ETSY_OAUTH_URL = 'https://www.etsy.com/oauth';

interface EtsyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user_id?: number;
}

// Generate PKCE code verifier and challenge
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

// Generate random state for CSRF protection
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

// Store code verifier in memory (in production, use Redis or session)
const codeVerifiers = new Map<string, string>();

export function getEtsyAuthUrl(): { url: string; state: string; codeVerifier: string } {
  const apiKey = process.env.ETSY_API_KEY;
  const redirectUri = process.env.ETSY_REDIRECT_URI;

  if (!apiKey || !redirectUri) {
    throw new Error('Etsy API credentials not configured');
  }

  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = generateState();

  // Store code verifier for later use
  codeVerifiers.set(state, codeVerifier);

  // Etsy OAuth scopes
  const scopes = [
    'transactions_r',  // Read receipts/transactions
    'profile_r',       // Read shop profile
    'email_r',         // Read email
    'address_r',       // Read addresses
    'shops_r',         // Read shop info
    'feedback_r'       // Read reviews
  ].join('%20');

  const params = new URLSearchParams({
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scopes,
    client_id: apiKey,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return {
    url: `${ETSY_OAUTH_URL}/connect?${params.toString()}`,
    state,
    codeVerifier
  };
}

export async function exchangeCodeForTokens(code: string, state: string): Promise<EtsyTokenResponse> {
  const apiKey = process.env.ETSY_API_KEY;
  const redirectUri = process.env.ETSY_REDIRECT_URI;

  if (!apiKey || !redirectUri) {
    throw new Error('Etsy API credentials not configured');
  }

  // Retrieve stored code verifier
  const codeVerifier = codeVerifiers.get(state);
  if (!codeVerifier) {
    throw new Error('Invalid state parameter');
  }

  // Clean up
  codeVerifiers.delete(state);

  const response = await fetch(`${ETSY_API_URL}/public/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: apiKey,
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<EtsyTokenResponse> {
  const apiKey = process.env.ETSY_API_KEY;

  if (!apiKey) {
    throw new Error('Etsy API key not configured');
  }

  const response = await fetch(`${ETSY_API_URL}/public/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: apiKey,
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh token: ${error}`);
  }

  return response.json();
}

// Etsy API Client
export class EtsyApiClient {
  private accessToken: string;
  private apiKey: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.apiKey = process.env.ETSY_API_KEY || '';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${ETSY_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Etsy API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  // Get shop receipts (orders)
  async getReceipts(shopId: string, params: {
    minCreated?: number;
    maxCreated?: number;
    minLastModified?: number;
    limit?: number;
    offset?: number;
    wasShipped?: boolean;
    wasPaid?: boolean;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.minCreated) searchParams.set('min_created', params.minCreated.toString());
    if (params.maxCreated) searchParams.set('max_created', params.maxCreated.toString());
    if (params.minLastModified) searchParams.set('min_last_modified', params.minLastModified.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());
    if (params.wasShipped !== undefined) searchParams.set('was_shipped', params.wasShipped.toString());
    if (params.wasPaid !== undefined) searchParams.set('was_paid', params.wasPaid.toString());

    const query = searchParams.toString();
    return this.request(`/application/shops/${shopId}/receipts${query ? `?${query}` : ''}`);
  }

  // Get single receipt with transactions
  async getReceipt(shopId: string, receiptId: string): Promise<any> {
    return this.request(`/application/shops/${shopId}/receipts/${receiptId}`);
  }

  // Get transactions for a receipt
  async getReceiptTransactions(shopId: string, receiptId: string): Promise<any> {
    return this.request(`/application/shops/${shopId}/receipts/${receiptId}/transactions`);
  }

  // Update receipt (mark as shipped, etc.)
  async updateReceipt(shopId: string, receiptId: string, data: {
    wasShipped?: boolean;
    wasPaid?: boolean;
    trackingCode?: string;
    carrierName?: string;
    shipNote?: string;
  }): Promise<any> {
    return this.request(`/application/shops/${shopId}/receipts/${receiptId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Get shop reviews
  async getReviews(shopId: string, limit = 25): Promise<any> {
    return this.request(`/application/shops/${shopId}/reviews?limit=${limit}`);
  }

  // Get buyer by user ID
  async getBuyer(userId: string): Promise<any> {
    return this.request(`/application/users/${userId}`);
  }

  // Get shop info
  async getShop(shopId: string): Promise<any> {
    return this.request(`/application/shops/${shopId}`);
  }

  // Get my shops
  async getMyShops(): Promise<any> {
    return this.request('/application/users/me/shops');
  }
}
