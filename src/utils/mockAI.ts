import { AIStrategyResponse } from '../types';
import { lumiAIEngine } from './aiEngine';

// Enhanced AI service using knowledge library
export const generateChildBehaviorStrategy = async (
  behaviorDescription: string,
  context: string,
  timeOfDay: string,
  severity: string,
  stressors: string[],
  teachingStyle?: string,
  ageGroup: string = 'preschool',
  educatorMood?: string,
  learningStyle?: string,
  child?: any
): Promise<AIStrategyResponse> => {
  return lumiAIEngine.generateChildBehaviorStrategy({
    behaviorDescription,
    context,
    timeOfDay,
    severity: severity as 'low' | 'medium' | 'high',
    ageGroup,
    stressors,
    educatorMood,
    teachingStyle,
    learningStyle,
    child
  });
};

export const generateClassroomStrategy = async (
  challengeDescription: string,
  context: string,
  severity: string,
  stressors: string[],
  gradeLevel: string = 'preschool',
  classSize: number = 15,
  educatorMood?: string,
  teachingStyle?: string
): Promise<AIStrategyResponse> => {
  return lumiAIEngine.generateClassroomStrategy({
    challengeDescription,
    context,
    severity: severity as 'low' | 'medium' | 'high',
    gradeLevel,
    classSize,
    stressors,
    educatorMood,
    teachingStyle
  });
};