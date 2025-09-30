import { EncryptionService } from '../services/encryptionService';
import { AuditService } from '../services/auditService';
interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  preferredLanguage: string;
  learningStyle?: string;
  teachingStyle?: string;
  onboardingStatus: string;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  private static getToken(): string | null {
    return localStorage.getItem('lumi_token');
  }

  private static setToken(token: string): void {
    localStorage.setItem('lumi_token', token);
  }

  private static removeToken(): void {
    localStorage.removeItem('lumi_token');
  }

  private static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  static async signup(data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    const result = await response.json();
    this.setToken(result.token);
    return result;
  }

  static async signin(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    // Log authentication attempt
    await AuditService.logAuthEvent('login', false, { email: data.email });
    
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      // Log failed authentication
      await AuditService.logAuthEvent('failed_login', false, { 
        email: data.email, 
        error: error.error 
      });
      throw new Error(error.error || 'Signin failed');
    }

    const result = await response.json();
    this.setToken(result.token);
    
    // Log successful authentication
    await AuditService.logAuthEvent('login', true, { 
      userId: result.user.id,
      email: result.user.email 
    });
    
    return result;
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        this.removeToken();
        return null;
      }

      const result = await response.json();
      return result.user;
    } catch (error) {
      this.removeToken();
      return null;
    }
  }

  static async updateOnboarding(data: any): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      console.log('=== AUTH SERVICE ONBOARDING START ===');
      console.log('Data being sent to API:', JSON.stringify(data, null, 2));
      console.log('Request headers:', this.getAuthHeaders());
      
      const response = await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      });

      console.log('=== API RESPONSE DETAILS ===');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('Content-Type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        console.log('=== ERROR RESPONSE HANDLING ===');
        let errorData: any = {};
        try {
          const responseText = await response.text();
          console.log('Error response text:', responseText);
          
          if (responseText && responseText.trim()) {
            errorData = JSON.parse(responseText);
          } else {
            throw new Error(`Empty error response from server (${response.status})`);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || errorData.details || 'Onboarding update failed');
      }

      console.log('=== SUCCESS RESPONSE HANDLING ===');
      let result: any = {};
      try {
        const responseText = await response.text();
        console.log('Success response text length:', responseText.length);
        console.log('Success response text:', responseText);
        
        if (responseText && responseText.trim()) {
          result = JSON.parse(responseText);
          console.log('Parsed result:', JSON.stringify(result, null, 2));
        } else {
          throw new Error('Empty success response from server');
        }
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        console.error('Parse error details:', parseError.message);
        throw new Error(`Invalid JSON response from server: ${parseError.message}`);
      }
      
      if (!result || !result.user) {
        console.error('Invalid result structure:', result);
        throw new Error('Server response missing user data');
      }
      
      console.log('=== ONBOARDING SUCCESS ===');
      console.log('User data received:', result.user.fullName, result.user.onboardingStatus);
      return result.user;
    } catch (error) {
      console.error('=== AUTH SERVICE ERROR ===');
      console.error('Error in updateOnboarding:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  static signout(): void {
    // Log signout event
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      AuditService.logAuthEvent('logout', true, { userId: currentUser.id });
    }
    
    this.removeToken();
    window.location.href = '/';
  }

  // Microsoft OAuth authentication
  static async microsoftSignin(accessToken: string, userInfo: any): Promise<AuthResponse> {
    const response = await fetch('/api/auth/microsoft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, userInfo })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Microsoft authentication failed');
    }

    const result = await response.json();
    this.setToken(result.token);
    return result;
  }

  // Google OAuth authentication
  static async googleSignin(accessToken: string, userInfo: any): Promise<AuthResponse> {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, userInfo })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google authentication failed');
    }

    const result = await response.json();
    this.setToken(result.token);
    return result;
  }

  // Apple OAuth authentication
  static async appleSignin(identityToken: string, userInfo: any): Promise<AuthResponse> {
    const response = await fetch('/api/auth/apple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identityToken, userInfo })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Apple authentication failed');
    }

    const result = await response.json();
    this.setToken(result.token);
    return result;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // API helper for authenticated requests
  static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required. Please sign in again.');
    }
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log API access
      await AuditService.logDataAccess(
        this.getResourceTypeFromEndpoint(endpoint),
        this.getResourceIdFromEndpoint(endpoint),
        endpoint,
        this.getActionFromMethod(options.method as string || 'GET'),
        {
          endpoint,
          method: options.method || 'GET',
          duration,
          statusCode: response.status
        }
      );
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Handle specific error cases
        if (response.status === 401) {
          this.removeToken();
          throw new Error('Session expired. Please sign in again.');
        }
        
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint}`);
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (networkError: any) {
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      throw networkError;
    }
  }
  
  private static getResourceTypeFromEndpoint(endpoint: string): string {
    if (endpoint.includes('/children')) return 'children';
    if (endpoint.includes('/behavior-logs')) return 'behavior_logs';
    if (endpoint.includes('/classroom-logs')) return 'classroom_logs';
    if (endpoint.includes('/classrooms')) return 'classrooms';
    if (endpoint.includes('/user')) return 'user_profile';
    if (endpoint.includes('/organizations')) return 'organizations';
    return 'api_endpoint';
  }
  
  private static getResourceIdFromEndpoint(endpoint: string): string {
    const matches = endpoint.match(/\/([a-f0-9-]{36}|\d+)(?:\/|$)/);
    return matches ? matches[1] : '';
  }
  
  private static getActionFromMethod(method: string): 'read' | 'create' | 'update' | 'delete' {
    switch (method.toUpperCase()) {
      case 'GET': return 'read';
      case 'POST': return 'create';
      case 'PUT':
      case 'PATCH': return 'update';
      case 'DELETE': return 'delete';
      default: return 'read';
    }
  }
}