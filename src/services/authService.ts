import { EncryptionService } from '../services/encryptionService';
import { AuditService } from '../services/auditService';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  preferredLanguage: string;
  learningStyle?: string;
  teachingStyle?: string;
  onboardingStatus: string;
  createdAt: Date;
  organizationId?: string;
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
    try {
      // For demo/development, create mock user
      const mockUser: User = {
        id: Date.now().toString(),
        fullName: data.fullName,
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' '),
        email: data.email,
        role: 'educator',
        preferredLanguage: 'english',
        learningStyle: '',
        teachingStyle: '',
        onboardingStatus: 'incomplete',
        createdAt: new Date()
      };

      const mockToken = btoa(JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }));

      this.setToken(mockToken);
      
      // Store user data
      localStorage.setItem('lumi_current_user', JSON.stringify(mockUser));
      
      return {
        user: mockUser,
        token: mockToken
      };
    } catch (error) {
      throw new Error('Signup failed: ' + (error?.message || 'Unknown error'));
    }
  }

  static async signin(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      // Log authentication attempt
      await AuditService.logAuthEvent('login', false, { email: data.email });
      
      // Check for existing user in localStorage or test data
      const existingUser = localStorage.getItem('lumi_current_user');
      if (existingUser) {
        const user = JSON.parse(existingUser);
        if (user.email === data.email) {
          const mockToken = btoa(JSON.stringify({
            id: user.id,
            email: user.email,
            role: user.role,
            exp: Date.now() + 24 * 60 * 60 * 1000
          }));

          this.setToken(mockToken);
          
          // Log successful authentication
          await AuditService.logAuthEvent('login', true, { 
            userId: user.id,
            email: user.email 
          });
          
          return { user, token: mockToken };
        }
      }

      // Check test users
      const testUsers = [
        {
          id: 'educator-1',
          fullName: 'Sarah Johnson',
          email: 'sarah.educator@test.lumi.app',
          role: 'educator',
          preferredLanguage: 'english',
          learningStyle: 'I learn best with visuals',
          teachingStyle: 'We learn together',
          onboardingStatus: 'complete',
          createdAt: new Date()
        },
        {
          id: 'admin-1',
          fullName: 'Dr. Michael Chen',
          email: 'admin@test.lumi.app',
          role: 'admin',
          preferredLanguage: 'english',
          learningStyle: 'A mix of all works for me',
          onboardingStatus: 'complete',
          createdAt: new Date()
        }
      ];

      const testUser = testUsers.find(u => u.email === data.email);
      if (testUser) {
        const mockToken = btoa(JSON.stringify({
          id: testUser.id,
          email: testUser.email,
          role: testUser.role,
          exp: Date.now() + 24 * 60 * 60 * 1000
        }));

        this.setToken(mockToken);
        localStorage.setItem('lumi_current_user', JSON.stringify(testUser));
        
        await AuditService.logAuthEvent('login', true, { 
          userId: testUser.id,
          email: testUser.email 
        });
        
        return { user: testUser, token: mockToken };
      }

      // If no user found, throw error
      await AuditService.logAuthEvent('failed_login', false, { 
        email: data.email, 
        error: 'User not found' 
      });
      throw new Error('Invalid email or password');
      
    } catch (error) {
      throw new Error('Signin failed: ' + (error?.message || 'Unknown error'));
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('lumi_current_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        
        // Verify token is still valid
        try {
          const tokenData = JSON.parse(atob(token));
          if (tokenData.exp > Date.now()) {
            return user;
          } else {
            // Token expired
            await AuditService.logAuthEvent('token_expired', false, { userId: user.id });
            this.removeToken();
            localStorage.removeItem('lumi_current_user');
            return null;
          }
        } catch (tokenError) {
          // Invalid token format
          this.removeToken();
          localStorage.removeItem('lumi_current_user');
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
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
      
      // For demo, simulate successful onboarding update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentUserData = JSON.parse(localStorage.getItem('lumi_current_user') || '{}');
      const updatedUser = {
        ...currentUserData,
        fullName: data.fullName || currentUserData.fullName,
        preferredLanguage: data.preferredLanguage || currentUserData.preferredLanguage,
        learningStyle: data.learningStyle || currentUserData.learningStyle,
        teachingStyle: data.teachingStyle || currentUserData.teachingStyle,
        onboardingStatus: 'complete'
      };
      
      localStorage.setItem('lumi_current_user', JSON.stringify(updatedUser));
      
      console.log('=== ONBOARDING SUCCESS ===');
      console.log('User data updated:', updatedUser.fullName, updatedUser.onboardingStatus);
      return updatedUser;

    } catch (error) {
      console.error('=== AUTH SERVICE ERROR ===');
      console.error('Error in updateOnboarding:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error?.message || 'Unknown error');
      throw error;
    }
  }

  static signout(): void {
    // Log signout event
    try {
      const currentUserData = localStorage.getItem('lumi_current_user');
      if (currentUserData) {
        const user = JSON.parse(currentUserData);
        AuditService.logAuthEvent('logout', true, { userId: user.id });
      }
    } catch (error) {
      console.warn('Failed to log signout event:', error);
    }
    
    this.removeToken();
    localStorage.removeItem('lumi_current_user');
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
      try {
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
      } catch (auditError) {
        console.warn('Failed to log API access:', auditError);
      }
      
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
          localStorage.removeItem('lumi_current_user');
          throw new Error('Session expired. Please sign in again.');
        }
        
        if (response.status === 404) {
          // For demo, return mock data for missing endpoints
          return this.getMockResponse(endpoint, options.method as string || 'GET');
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (networkError: any) {
      if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
        // For demo, return mock data when network is unavailable
        return this.getMockResponse(endpoint, options.method as string || 'GET');
      }
      throw networkError;
    }
  }
  
  private static getMockResponse(endpoint: string, method: string): any {
    // Return mock responses for demo when API is not available
    if (endpoint.includes('/children') && method === 'GET') {
      return { children: [] };
    }
    if (endpoint.includes('/classrooms') && method === 'GET') {
      return { classrooms: [] };
    }
    if (endpoint.includes('/behavior-logs') && method === 'GET') {
      return { behaviorLogs: [] };
    }
    if (endpoint.includes('/classroom-logs') && method === 'GET') {
      return { classroomLogs: [] };
    }
    if (method === 'POST') {
      return { success: true, id: Date.now().toString() };
    }
    return { success: true };
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