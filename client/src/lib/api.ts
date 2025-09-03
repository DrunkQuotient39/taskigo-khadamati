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
    
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: { ...headers, ...options.headers },
      credentials: 'include',
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    
    // Check for claims-updated header
    const actionHeader = response.headers.get('X-Action');
    if (actionHeader === 'claims-updated') {
      // Refresh Firebase ID token to get updated claims
      await auth.currentUser?.getIdToken(true);
    }

    // Capture request ID for debugging
    const requestId = response.headers.get('X-Request-Id');
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
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


