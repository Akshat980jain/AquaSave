const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(username: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Sample methods
  async getSamples(params: {
    page?: number;
    limit?: number;
    status?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    hmpiMin?: number;
    hmpiMax?: number;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();

    return this.request(`/samples?${queryString}`);
  }

  async getSample(id: string) {
    return this.request(`/samples/${id}`);
  }

  async createSample(sampleData: any) {
    return this.request('/samples', {
      method: 'POST',
      body: JSON.stringify(sampleData),
    });
  }

  async updateSample(id: string, sampleData: any) {
    return this.request(`/samples/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sampleData),
    });
  }

  async deleteSample(id: string) {
    return this.request(`/samples/${id}`, {
      method: 'DELETE',
    });
  }

  async getStatistics() {
    return this.request('/samples/statistics');
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;