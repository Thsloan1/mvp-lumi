interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API request failed:', error);
      throw error;
    }
  }

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

// Behavior Log API Client
export class BehaviorLogApi extends ApiClient {
  async getBehaviorLogs() {
    return this.get('/behavior-logs');
  }

  async createBehaviorLog(data: any) {
    return this.post('/behavior-logs', data);
  }
}

// Classroom Log API Client
export class ClassroomLogApi extends ApiClient {
  async getClassroomLogs() {
    return this.get('/classroom-logs');
  }

  async createClassroomLog(data: any) {
    return this.post('/classroom-logs', data);
  }
}

// Child API Client
export class ChildApi extends ApiClient {
  async getChildren() {
    return this.get('/children');
  }

  async createChild(data: any) {
    return this.post('/children', data);
  }
}

// Classroom API Client
export class ClassroomApi extends ApiClient {
  async getClassrooms() {
    return this.get('/classrooms');
  }

  async createClassroom(data: any) {
    return this.post('/classrooms', data);
  }
}

// AI Strategy API Client
export class AIApi extends ApiClient {
  async generateChildStrategy(data: any) {
    return this.post('/ai/child-strategy', data);
  }

  async generateClassroomStrategy(data: any) {
    return this.post('/ai/classroom-strategy', data);
  }
}