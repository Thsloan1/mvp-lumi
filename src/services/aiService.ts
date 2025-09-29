import { AIStrategyResponse } from '../types';

interface ChildBehaviorContext {
  behaviorDescription: string;
  context: string;
  timeOfDay?: string;
  severity: 'low' | 'medium' | 'high';
  ageGroup?: string;
  stressors?: string[];
  educatorMood?: string;
  teachingStyle?: string;
  learningStyle?: string;
  child?: any;
}

interface ClassroomContext {
  challengeDescription: string;
  context: string;
  severity: 'low' | 'medium' | 'high';
  gradeLevel?: string;
  classSize?: number;
  stressors?: string[];
  educatorMood?: string;
  teachingStyle?: string;
}

interface FamilyScriptContext {
  child: any;
  behaviorLog: any;
  parentName?: string;
  language?: 'english' | 'spanish';
  additionalNotes?: string;
}

export class AIService {
  private static async apiRequest(endpoint: string, data: any) {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  static async generateChildBehaviorStrategy(context: ChildBehaviorContext): Promise<AIStrategyResponse> {
    try {
      const response = await this.apiRequest('child-strategy', context);
      return response.aiResponse;
    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate behavior strategy');
    }
  }

  static async generateClassroomStrategy(context: ClassroomContext): Promise<AIStrategyResponse> {
    try {
      const response = await this.apiRequest('classroom-strategy', context);
      return response.aiResponse;
    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate classroom strategy');
    }
  }

  static async generateFamilyScript(context: FamilyScriptContext): Promise<string> {
    try {
      const response = await this.apiRequest('family-script', context);
      return response.familyScript;
    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate family script');
    }
  }
}