import { auth } from './firebase';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Vite exposes import.meta.env at build/runtime; during TS check, allow string fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env: any = (import.meta as any).env || {};
    this.baseUrl = env.VITE_API_URL || '';
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const idToken = await user.getIdToken(true);
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    };
  }

  private async makeRequest(endpoint: string, options: ApiOptions = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.getAuthHeaders();
    // Correlate client <-> server logs
    const clientRequestId = (globalThis as any).crypto?.randomUUID?.() 
      ? (globalThis as any).crypto.randomUUID()
      : `${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: { 'X-Request-Id': clientRequestId, ...headers, ...options.headers },
      credentials: 'include',
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const start = performance.now();
    console.debug('[api] →', options.method || 'GET', endpoint, { clientRequestId });
    const response = await fetch(url, config);
    const durationMs = Math.round(performance.now() - start);
    
    // Check for claims-updated header
    const actionHeader = response.headers.get('X-Action');
    if (actionHeader === 'claims-updated') {
      // Refresh Firebase ID token to get updated claims
      await auth.currentUser?.getIdToken(true);
      console.debug('[api] ↺ claims-updated, refreshed ID token', { clientRequestId });
      
      // Trigger a custom event to notify useAuth to refetch user data
      window.dispatchEvent(new CustomEvent('auth-claims-updated'));
    }

    // Capture request ID for debugging
    const requestId = response.headers.get('X-Request-Id') || clientRequestId;
    console.debug('[api] ←', response.status, endpoint, { requestId, durationMs });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = '';
      try {
        const json = JSON.parse(errorText);
        errorMessage = json?.message || json?.error || '';
      } catch {
        errorMessage = errorText || '';
      }
      console.error('[api] ✖', endpoint, { status: response.status, requestId, error: errorMessage });
      throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      data: await response.json(),
      requestId,
      actionHeader
    };
  }

  async get(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
    return this.makeRequest(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method'>) {
    return this.makeRequest(endpoint, { ...options, method: 'POST', body });
  }

  async put(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method'>) {
    return this.makeRequest(endpoint, { ...options, method: 'PUT', body });
  }

  async delete(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
    return this.makeRequest(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();


