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
      
      // Return fallback strategy if API fails
      return {
        warmAcknowledgment: "Thank you for sharing this with me. This child needs your support, and I'm glad they have you to help.",
        observedBehavior: context.behaviorDescription,
        contextTrigger: `${context.context}, ${context.timeOfDay || 'during the day'}`,
        conceptualization: "This behavior is a normal part of child development. The child is working through important developmental tasks.",
        coreNeedsAndDevelopment: "This child is expressing a need for connection, predictability, and support. This aligns with typical development for their age.",
        attachmentSupport: "Get down to their eye level, use a calm voice, and acknowledge their feelings with simple words like 'I see you're having a hard time.'",
        practicalStrategies: [
          "**Connection First**: Prioritize emotional safety before any directions",
          "**Choice Within Structure**: Offer two good choices that both lead to positive outcomes",
          "**Calm Partnership**: Stay physically close and breathe calmly yourself"
        ],
        implementationGuidance: "Start with connection and safety first. Once the child is calm, then try the practical strategies.",
        whyStrategiesWork: "These approaches address the child's underlying needs for safety and connection rather than just the surface behavior.",
        futureReadinessBenefit: "These strategies help develop emotional regulation, problem-solving skills, and trust in relationships."
      };
    }
  }

  static async generateClassroomStrategy(context: ClassroomContext): Promise<AIStrategyResponse> {
    try {
      const response = await this.apiRequest('classroom-strategy', context);
      return response.aiResponse;
    } catch (error) {
      console.error('AI Service error:', error);
      
      // Return fallback strategy if API fails
      return {
        conceptualization: "Group challenges often reflect the collective needs of developing children navigating social learning together.",
        alignedStrategy: "Implement a 'Calm Down Together' routine: Use a visual cue to signal the whole group to take three deep breaths together.",
        testOption: "Try 'Silent Signals': Develop hand gestures for common needs to reduce verbal disruptions.",
        futureReadinessBenefit: "These strategies build classroom community and teach children to be aware of collective energy."
      };
    }
  }
}