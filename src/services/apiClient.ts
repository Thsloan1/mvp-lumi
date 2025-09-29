import { AppError } from '../hooks/useErrorHandler';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
}

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  onError?: (error: AppError) => void;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private onError?: (error: AppError) => void;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || '/api';
    this.timeout = config.timeout || 10000;
    this.onError = config.onError;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError: AppError = {
          id: Date.now().toString(),
          type: 'network',
          message: 'Request timed out. Please try again.',
          timestamp: new Date(),
          context: { endpoint, timeout: this.timeout }
        };
        this.onError?.(timeoutError);
        throw timeoutError;
      }

      const apiError: AppError = {
        id: Date.now().toString(),
        type: this.getErrorType(error),
        message: this.getErrorMessage(error),
        details: error.message,
        timestamp: new Date(),
        context: { endpoint, options }
      };

      this.onError?.(apiError);
      throw apiError;
    }
  }

  private getErrorType(error: any): AppError['type'] {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return 'auth';
    }
    if (error.message?.includes('403') || error.message?.includes('permission')) {
      return 'permission';
    }
    if (error.message?.includes('400') || error.message?.includes('validation')) {
      return 'validation';
    }
    if (error.message?.includes('subscription') || error.message?.includes('seats')) {
      return 'subscription';
    }
    if (error.name === 'TypeError' || error.message?.includes('fetch')) {
      return 'network';
    }
    return 'unknown';
  }

  private getErrorMessage(error: any): string {
    // Extract user-friendly messages from common error patterns
    if (error.message?.includes('subscription allows only')) {
      return error.message;
    }
    if (error.message?.includes('seats available')) {
      return error.message;
    }
    if (error.message?.includes('Unauthorized')) {
      return 'Please sign in to continue';
    }
    if (error.message?.includes('permission')) {
      return 'You don\'t have permission to perform this action';
    }
    if (error.message?.includes('validation')) {
      return 'Please check your input and try again';
    }
    if (error.name === 'TypeError') {
      return 'Network error. Please check your connection';
    }
    
    return error.message || 'An unexpected error occurred';
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Organization-specific API methods
export class OrganizationApi extends ApiClient {
  async createOrganization(data: {
    name: string;
    type: string;
    plan: string;
    maxSeats: number;
  }) {
    return this.post('/organizations', data);
  }

  async getOrganization() {
    return this.get('/organizations');
  }

  async inviteEducators(emails: string[]) {
    return this.post('/organizations/invitations', { emails });
  }

  async getMembers() {
    return this.get('/organizations/members');
  }

  async removeMember(memberId: string) {
    return this.delete(`/organizations/members?memberId=${memberId}`);
  }

  async transferOwnership(newOwnerId: string, reason?: string) {
    return this.post('/organizations/ownership', { newOwnerId, reason });
  }

  async checkSeatAvailability(requestedSeats: number = 1) {
    return this.get(`/subscriptions/check-seats?requestedSeats=${requestedSeats}`);
  }
}

// Invitation-specific API methods
export class InvitationApi extends ApiClient {
  async validateInvitation(token: string) {
    return this.get(`/invitations/validate?token=${token}`);
  }

  async acceptInvitation(token: string) {
    return this.post('/invitations/accept', { token });
  }

  async cancelInvitation(invitationId: string) {
    return this.delete(`/organizations/invitations?invitationId=${invitationId}`);
  }
}