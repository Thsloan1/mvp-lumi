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
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signin failed');
    }

    const result = await response.json();
    this.setToken(result.token);
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
      console.log('AuthService: Sending onboarding data:', data);
      
      const response = await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify(data)
      });

      console.log('AuthService: Response status:', response.status);
      console.log('AuthService: Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        let errorData = {};
        try {
          const responseText = await response.text();
          console.log('AuthService: Error response text:', responseText);
          
          if (responseText.trim()) {
            errorData = JSON.parse(responseText);
          } else {
            throw new Error('Empty response from server');
          }
        } catch (parseError) {
          console.error('AuthService: Failed to parse error response:', parseError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || 'Update failed');
      }

      let result = {};
      try {
        const responseText = await response.text();
        console.log('AuthService: Success response text:', responseText);
        
        if (responseText.trim()) {
          result = JSON.parse(responseText);
        } else {
          throw new Error('Empty success response from server');
        }
      } catch (parseError) {
        console.error('Failed to parse onboarding response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (!result || !result.user) {
        console.error('AuthService: Invalid result structure:', result);
        throw new Error('Invalid response format');
      }
      
      console.log('AuthService: Onboarding completed successfully:', result.user);
      return result.user;
    } catch (error) {
      console.error('Onboarding API error:', error);
      throw error;
    }
  }

  static signout(): void {
    this.removeToken();
    window.location.href = '/';
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // API helper for authenticated requests
  static async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }
}