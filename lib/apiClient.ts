interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  details?: string;
}

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  onError?: (error: any) => void;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private onError?: (error: any) => void;

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
      
      if (this.onError) {
        this.onError(error);
      }
      
      throw error;
    }
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

// Behavior Log API Client
export class BehaviorLogApi extends ApiClient {
  async getBehaviorLogs() {
    return this.get('/behavior-logs');
  }

  async createBehaviorLog(data: any) {
    return this.post('/behavior-logs', data);
  }

  async updateBehaviorLog(id: string, data: any) {
    return this.put(`/behavior-logs/${id}`, data);
  }

  async deleteBehaviorLog(id: string) {
    return this.delete(`/behavior-logs/${id}`);
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

  async updateClassroomLog(id: string, data: any) {
    return this.put(`/classroom-logs/${id}`, data);
  }

  async deleteClassroomLog(id: string) {
    return this.delete(`/classroom-logs/${id}`);
  }
}

// Child Profile API Client
export class ChildApi extends ApiClient {
  async getChildren() {
    return this.get('/children');
  }

  async createChild(data: any) {
    return this.post('/children', data);
  }

  async updateChild(id: string, data: any) {
    return this.put(`/children/${id}`, data);
  }

  async deleteChild(id: string) {
    return this.delete(`/children/${id}`);
  }

  async getChild(id: string) {
    return this.get(`/children/${id}`);
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

  async updateClassroom(id: string, data: any) {
    return this.put(`/classrooms/${id}`, data);
  }

  async deleteClassroom(id: string) {
    return this.delete(`/classrooms/${id}`);
  }

  async getClassroom(id: string) {
    return this.get(`/classrooms/${id}`);
  }
}

// Analytics API Client
export class AnalyticsApi extends ApiClient {
  async getChildInsights(childId: string) {
    return this.get(`/analytics/child/${childId}`);
  }

  async getClassroomInsights(classroomId: string) {
    return this.get(`/analytics/classroom/${classroomId}`);
  }

  async getOrganizationInsights() {
    return this.get('/analytics/organization');
  }

  async getUnifiedInsights() {
    return this.get('/analytics/unified');
  }
}