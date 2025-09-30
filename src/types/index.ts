export interface User {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: 'educator' | 'admin';
  preferredLanguage: 'english' | 'spanish';
  learningStyle: string;
  teachingStyle?: string;
  authProvider?: 'email' | 'google' | 'microsoft' | 'apple';
  googleId?: string;
  microsoftId?: string;
  appleId?: string;
  profilePhotoUrl?: string;
  createdAt: Date;
  onboardingStatus: 'incomplete' | 'complete';
}

export interface Classroom {
  id: string;
  name: string;
  gradeBand: string;
  studentCount: number;
  teacherStudentRatio: string;
  iepCount?: number;
  ifspCount?: number;
  stressors: string[];
  educatorId: string;
}

export interface BehaviorLog {
  id: string;
  educatorId: string;
  childId?: string;
  classroomId?: string;
  behaviorDescription: string;
  context: string;
  timeOfDay?: string;
  severity: 'low' | 'medium' | 'high';
  educatorMood?: 'overwhelmed' | 'managing' | 'okay' | 'calm' | 'frustrated' | 'angry';
  stressors: string[];
  intensity?: string;
  duration?: string;
  frequency?: string;
  adultResponse?: string[];
  outcome?: string[];
  developmentalNotes?: string;
  supports?: string[];
  classroomRatio?: string;
  resourcesAvailable?: string[];
  educatorStressLevel?: string;
  confidenceLevel?: number;
  aiResponse?: AIStrategyResponse;
  selectedStrategy?: string;
  confidenceRating?: number;
  reflectionNotes?: string;
  createdAt: Date;
}

export interface Child {
  id: string;
  name: string;
  age?: number;
  gradeBand: string;
  classroomId: string;
  developmentalNotes?: string;
  languageAbility?: string;
  selfRegulationSkills?: string;
  sensorySensitivities?: string[];
  hasIEP: boolean;
  hasIFSP: boolean;
  supportPlans?: string[];
  knownTriggers?: string[];
  homeLanguage?: string;
  familyContext?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface ClassroomLog {
  id: string;
  educatorId: string;
  classroomId: string;
  challengeDescription: string;
  context: string;
  severity: 'low' | 'medium' | 'high';
  educatorMood?: 'overwhelmed' | 'managing' | 'okay' | 'calm';
  stressors: string[];
  aiResponse?: AIStrategyResponse;
  selectedStrategy?: string;
  confidenceSelfRating?: number;
  confidenceStrategyRating?: number;
  reflectionNotes?: string;
  createdAt: Date;
}

export interface AIStrategyResponse {
  warmAcknowledgment: string;
  observedBehavior: string;
  contextTrigger: string;
  conceptualization: string;
  coreNeedsAndDevelopment: string;
  attachmentSupport: string;
  practicalStrategies: string[];
  implementationGuidance: string;
  whyStrategiesWork: string;
  futureReadinessBenefit: string;
  familyScript?: string;
}

export interface FamilyCommunicationScript {
  id: string;
  title: string;
  category: 'behavior_explanation' | 'strengths_challenges' | 'stress_regulation' | 'collaborative_problem_solving' | 'descriptive_feedback' | 'resource_introduction';
  scenario: string;
  script: string;
  familyHandoutId?: string;
  language: 'english' | 'spanish' | 'bilingual';
  isPremium: boolean;
  createdAt: Date;
}

export interface BehaviorPattern {
  id: string;
  childId: string;
  patternType: 'context' | 'time' | 'trigger' | 'severity';
  description: string;
  frequency: number;
  lastOccurrence: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface OnboardingStep {
  id: string;
  title: string;
  microcopy: string;
  field: string;
  type: 'text' | 'select' | 'multi-select' | 'radio' | 'number';
  options?: string[];
  required: boolean;
  validation?: string;
}

export type UserType = 'educator' | 'admin' | 'invited';
export type SubscriptionPlan = 'individual_monthly' | 'individual_annual' | 'organization';

// Resource Library Types
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'handout' | 'toolkit' | 'strategy' | 'family_companion';
  category: 'behavior' | 'transitions' | 'routines' | 'communication' | 'development';
  ageGroups: string[];
  settings: string[];
  language: 'english' | 'spanish' | 'bilingual';
  isPremium: boolean;
  downloadUrl?: string;
  familyCompanionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceSearch {
  query: string;
  ageGroup?: string;
  category?: string;
  type?: string;
  setting?: string;
  language?: string;
}

export interface EngagementMetrics {
  id: string;
  userId: string;
  resourceId?: string;
  action: 'view' | 'download' | 'search' | 'strategy_use' | 'reflection';
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ReflectionPrompt {
  id: string;
  behaviorLogId?: string;
  classroomLogId?: string;
  stressLevel: number; // 1-10
  confidenceLevel: number; // 1-10
  doabilityRating: number; // 1-10
  notes?: string;
  followUpNeeded: boolean;
  createdAt: Date;
}