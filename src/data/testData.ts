import { User, Child, Classroom, BehaviorLog, ClassroomLog } from '../types';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/jsonUtils';

// Test Users for different scenarios
export const TEST_USERS: User[] = [
  {
    id: 'educator-1',
    fullName: 'Sarah Johnson',
    email: 'sarah.educator@test.lumi.app',
    role: 'educator',
    preferredLanguage: 'english',
    learningStyle: 'I learn best with visuals',
    teachingStyle: 'We learn together',
    createdAt: new Date('2024-01-15'),
    onboardingStatus: 'complete'
  },
  {
    id: 'educator-2',
    fullName: 'Maria Rodriguez',
    email: 'maria.educator@test.lumi.app',
    role: 'educator',
    preferredLanguage: 'spanish',
    learningStyle: 'I prefer listening to explanations',
    teachingStyle: 'I guide, they explore',
    createdAt: new Date('2024-01-20'),
    onboardingStatus: 'complete'
  },
  {
    id: 'admin-1',
    fullName: 'Dr. Michael Chen',
    email: 'admin@test.lumi.app',
    role: 'admin',
    preferredLanguage: 'english',
    learningStyle: 'A mix of all works for me',
    teachingStyle: 'I set the stage, they take the lead',
    createdAt: new Date('2024-01-10'),
    onboardingStatus: 'complete'
  },
  {
    id: 'educator-new',
    fullName: 'Emma Thompson',
    email: 'emma.new@test.lumi.app',
    role: 'educator',
    preferredLanguage: 'english',
    learningStyle: '',
    teachingStyle: '',
    createdAt: new Date(),
    onboardingStatus: 'incomplete'
  }
];

// Test Children with diverse profiles
export const TEST_CHILDREN: Child[] = [
  {
    id: 'child-1',
    name: 'Alex Martinez',
    age: 4,
    gradeBand: 'Preschool (4-5 years old)',
    classroomId: 'classroom-1',
    developmentalNotes: 'Strong verbal skills, working on emotional regulation during transitions',
    languageAbility: 'Advanced for age',
    selfRegulationSkills: 'Developing',
    sensorySensitivities: ['Loud noises', 'Bright lights'],
    hasIEP: false,
    hasIFSP: false,
    supportPlans: [],
    knownTriggers: ['Unexpected changes', 'Peer conflicts'],
    homeLanguage: 'Spanish',
    familyContext: 'Bilingual household, working parents',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'child-2',
    name: 'Jordan Kim',
    age: 3,
    gradeBand: 'Toddlers (2-3 years old)',
    classroomId: 'classroom-1',
    developmentalNotes: 'Highly social, sometimes overwhelmed in large groups',
    languageAbility: 'Typical for age',
    selfRegulationSkills: 'Emerging',
    sensorySensitivities: ['Crowded spaces'],
    hasIEP: true,
    hasIFSP: false,
    supportPlans: ['Speech therapy', 'Social skills support'],
    knownTriggers: ['Overstimulation', 'Separation anxiety'],
    homeLanguage: 'English',
    familyContext: 'Single parent household, grandmother support',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: 'child-3',
    name: 'Zoe Williams',
    age: 5,
    gradeBand: 'Transitional Kindergarten (4-5 years old)',
    classroomId: 'classroom-1',
    developmentalNotes: 'Strong leadership qualities, working on patience and turn-taking',
    languageAbility: 'Advanced vocabulary',
    selfRegulationSkills: 'Strong',
    sensorySensitivities: [],
    hasIEP: false,
    hasIFSP: false,
    supportPlans: [],
    knownTriggers: ['Waiting for turns', 'Being told no'],
    homeLanguage: 'English',
    familyContext: 'Two-parent household, high academic expectations',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10')
  }
];

// Test Classrooms
export const TEST_CLASSROOMS: Classroom[] = [
  {
    id: 'classroom-1',
    name: "Sarah's Preschool Class",
    gradeBand: 'Preschool (4-5 years old)',
    studentCount: 18,
    teacherStudentRatio: '1:9',
    iepCount: 2,
    ifspCount: 1,
    stressors: [
      'High ratios or large group sizes',
      'Limited planning and preparation time',
      'Strong emotional expressions',
      'Transition pressures'
    ],
    educatorId: 'educator-1'
  },
  {
    id: 'classroom-2',
    name: "Maria's Toddler Room",
    gradeBand: 'Toddlers (2-3 years old)',
    studentCount: 12,
    teacherStudentRatio: '1:6',
    iepCount: 0,
    ifspCount: 2,
    stressors: [
      'Separation challenges',
      'Limited self-regulation',
      'Communication differences',
      'Toileting struggles'
    ],
    educatorId: 'educator-2'
  }
];

// Test Behavior Logs with realistic scenarios
export const TEST_BEHAVIOR_LOGS: BehaviorLog[] = [
  {
    id: 'behavior-1',
    educatorId: 'educator-1',
    childId: 'child-1',
    classroomId: 'classroom-1',
    behaviorDescription: 'Alex threw blocks when asked to clean up during transition to circle time',
    context: 'Transition',
    timeOfDay: 'morning',
    severity: 'medium',
    educatorMood: 'managing',
    stressors: ['Transition pressures', 'Strong emotional expressions'],
    intensity: 'moderate',
    duration: 'short',
    frequency: 'recurring',
    adultResponse: ['Redirected activity', 'Set/Enforced limit'],
    outcome: ['Calmed down'],
    developmentalNotes: 'Working on emotional regulation during changes',
    supports: ['Visual timer', 'Two-minute warning'],
    classroomRatio: '1:9',
    resourcesAvailable: ['Visual supports', 'Calm down space'],
    educatorStressLevel: 'medium',
    confidenceLevel: 7,
    aiResponse: {
      warmAcknowledgment: "Thank you for sharing this with me. Alex needs your support, and I'm glad they have you to help. I can see this was challenging for you too.",
      observedBehavior: 'Alex threw blocks when asked to clean up during transition to circle time',
      contextTrigger: 'Transition, morning',
      conceptualization: 'This behavior is a normal part of child development. When children throw objects during cleanup, they\'re often communicating important needs or working through developmental challenges.',
      coreNeedsAndDevelopment: '**Core Needs:** Based on what you\'ve described, Alex needs safety and emotional regulation support, connection and reassurance from trusted adults, and opportunities to practice the skills they\'re still developing.',
      attachmentSupport: 'To help Alex feel safe and connected, you can get down to their eye level and use a calm, warm voice. Acknowledge their feelings with simple words like "I see you\'re having a hard time."',
      practicalStrategies: [
        '**Connection First**: Get down to Alex\'s eye level and acknowledge their feelings with simple, warm words like "I see you\'re having a hard time." Then, offer two simple choices that both lead to the same positive outcome.',
        '**First-Then Structure**: Use clear, visual "first-then" language: "First we clean up the blocks, then we go to circle time." Consider using pictures or gestures to support understanding.',
        '**Quiet Partnership**: Stand or sit near Alex without immediately speaking. Sometimes your calm, supportive presence alone can help them regulate.'
      ],
      implementationGuidance: 'Start with connection and safety first. Once Alex is calm, then try the practical strategies. Try one strategy at a time and give it a few days to see if it\'s working.',
      whyStrategiesWork: '**Why These Strategies Work:** These approaches are grounded in attachment theory and developmental neuroscience. They address Alex\'s underlying needs for safety and connection rather than just the surface behavior.',
      futureReadinessBenefit: 'These strategies help Alex develop emotional regulation skills, problem-solving abilities, and trust in adult relationships - all essential for future learning and social success.'
    },
    selectedStrategy: 'Connection First: Get down to Alex\'s eye level and acknowledge their feelings',
    confidenceRating: 8,
    reflectionNotes: 'Strategy worked well - Alex responded to the calm approach and was able to help with cleanup after connecting.',
    createdAt: new Date('2024-02-10T09:30:00')
  },
  {
    id: 'behavior-2',
    educatorId: 'educator-1',
    childId: 'child-2',
    classroomId: 'classroom-1',
    behaviorDescription: 'Jordan had difficulty separating from parent at drop-off, crying for 15 minutes',
    context: 'Arrival/Drop-off',
    timeOfDay: 'morning',
    severity: 'high',
    educatorMood: 'calm',
    stressors: ['Separation challenges', 'Strong emotional expressions'],
    intensity: 'severe',
    duration: 'extended',
    frequency: 'recurring',
    adultResponse: ['Comforted/soothed'],
    outcome: ['Calmed down'],
    confidenceLevel: 9,
    selectedStrategy: 'Quiet Partnership with gradual engagement',
    confidenceRating: 9,
    createdAt: new Date('2024-02-09T08:15:00')
  },
  {
    id: 'behavior-3',
    educatorId: 'educator-2',
    childId: 'child-3',
    classroomId: 'classroom-2',
    behaviorDescription: 'Zoe refused to share toys during free play, pushing peers away',
    context: 'Free Play',
    timeOfDay: 'midday',
    severity: 'medium',
    educatorMood: 'frustrated',
    stressors: ['Peer conflict', 'Limited self-regulation'],
    intensity: 'moderate',
    duration: 'brief',
    frequency: 'escalating',
    adultResponse: ['Redirected activity', 'Set/Enforced limit'],
    outcome: ['Disengaged/withdrew'],
    confidenceLevel: 6,
    selectedStrategy: 'Choice Within Structure for sharing',
    confidenceRating: 7,
    createdAt: new Date('2024-02-08T12:45:00')
  }
];

// Test Classroom Logs
export const TEST_CLASSROOM_LOGS: ClassroomLog[] = [
  {
    id: 'classroom-1',
    educatorId: 'educator-1',
    classroomId: 'classroom-1',
    challengeDescription: 'Multiple children having difficulty during cleanup time, taking 20+ minutes to transition',
    context: 'Cleanup',
    severity: 'medium',
    educatorMood: 'overwhelmed',
    stressors: [
      'High ratios or large group sizes',
      'Limited planning and preparation time',
      'Simultaneous behavior needs'
    ],
    selectedStrategy: 'Calm Down Together routine with visual cues',
    confidenceSelfRating: 7,
    confidenceStrategyRating: 8,
    reflectionNotes: 'The group breathing helped reset the energy. Will implement daily.',
    createdAt: new Date('2024-02-09T15:30:00')
  },
  {
    id: 'classroom-2',
    educatorId: 'educator-2',
    classroomId: 'classroom-2',
    challengeDescription: 'Circle time disrupted by multiple children needing bathroom, water, and attention',
    context: 'Circle Time',
    severity: 'low',
    educatorMood: 'managing',
    stressors: [
      'Short attention spans',
      'Communication differences',
      'Limited self-regulation'
    ],
    selectedStrategy: 'Silent Signals system for common needs',
    confidenceSelfRating: 8,
    confidenceStrategyRating: 9,
    createdAt: new Date('2024-02-07T10:15:00')
  }
];

// Test Organizations
export const TEST_ORGANIZATIONS = [
  {
    id: 'org-1',
    name: 'Sunshine Elementary School',
    type: 'school',
    ownerId: 'admin-1',
    maxSeats: 15,
    activeSeats: 12,
    plan: 'organization_annual',
    status: 'active',
    settings: {
      defaultLanguage: 'english',
      requireOnboarding: true,
      allowEducatorInvites: false
    },
    createdAt: new Date('2024-01-01')
  }
];

// Test Invitations
export const TEST_INVITATIONS = [
  {
    id: 'invite-1',
    email: 'new.educator@test.lumi.app',
    organizationId: 'org-1',
    organizationName: 'Sunshine Elementary School',
    inviterName: 'Dr. Michael Chen',
    token: 'test-invite-token-123',
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-02-01')
  }
];

// Test Data Manager
export class TestDataManager {
  private static instance: TestDataManager;
  private users: User[] = [...TEST_USERS];
  private children: Child[] = [...TEST_CHILDREN];
  private classrooms: Classroom[] = [...TEST_CLASSROOMS];
  private behaviorLogs: BehaviorLog[] = [...TEST_BEHAVIOR_LOGS];
  private classroomLogs: ClassroomLog[] = [...TEST_CLASSROOM_LOGS];
  private organizations = [...TEST_ORGANIZATIONS];
  private invitations = [...TEST_INVITATIONS];

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  // Reset all data to initial state
  resetData(): void {
    this.users = [...TEST_USERS];
    this.children = [...TEST_CHILDREN];
    this.classrooms = [...TEST_CLASSROOMS];
    this.behaviorLogs = [...TEST_BEHAVIOR_LOGS];
    this.classroomLogs = [...TEST_CLASSROOM_LOGS];
    this.organizations = [...TEST_ORGANIZATIONS];
    this.invitations = [...TEST_INVITATIONS];
    
    // Clear localStorage
    try {
      localStorage.removeItem('lumi_token');
      localStorage.removeItem('lumi_current_view');
      localStorage.removeItem('lumi_current_user');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    
    console.log('🔄 Test data reset to initial state');
  }

  // Add sample data for testing
  addSampleData(): void {
    // Add more children for testing
    const additionalChildren: Child[] = [
      {
        id: 'child-4',
        name: 'Aiden Foster',
        age: 4,
        gradeBand: 'Preschool (4-5 years old)',
        classroomId: 'classroom-1',
        developmentalNotes: 'Highly creative, needs movement breaks',
        hasIEP: true,
        hasIFSP: false,
        supportPlans: ['Occupational therapy', 'Sensory breaks'],
        knownTriggers: ['Sitting too long', 'Loud environments'],
        homeLanguage: 'English',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05')
      },
      {
        id: 'child-5',
        name: 'Sofia Gonzalez',
        age: 3,
        gradeBand: 'Toddlers (2-3 years old)',
        classroomId: 'classroom-2',
        developmentalNotes: 'Bilingual learner, very observant',
        hasIEP: false,
        hasIFSP: true,
        supportPlans: ['Language development', 'Cultural bridge support'],
        knownTriggers: ['Language confusion', 'Cultural misunderstandings'],
        homeLanguage: 'Spanish',
        familyContext: 'Recent immigrant family, extended family support',
        createdAt: new Date('2024-02-03'),
        updatedAt: new Date('2024-02-03')
      }
    ];

    this.children.push(...additionalChildren);
    console.log('📊 Sample data added for comprehensive testing');
  }

  // Generate realistic behavior logs for testing
  generateTestBehaviorLogs(count: number = 10): void {
    const contexts = ['Circle Time', 'Free Play', 'Meal Time', 'Transition', 'Outdoor Play'];
    const severities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const moods = ['calm', 'managing', 'frustrated', 'overwhelmed'];
    
    for (let i = 0; i < count; i++) {
      const randomChild = this.children[Math.floor(Math.random() * this.children.length)];
      const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      
      const behaviorLog: BehaviorLog = {
        id: `test-behavior-${Date.now()}-${i}`,
        educatorId: randomChild.classroomId === 'classroom-1' ? 'educator-1' : 'educator-2',
        childId: randomChild.id,
        classroomId: randomChild.classroomId,
        behaviorDescription: this.generateRandomBehaviorDescription(randomContext, randomSeverity),
        context: randomContext,
        timeOfDay: ['morning', 'midday', 'afternoon'][Math.floor(Math.random() * 3)],
        severity: randomSeverity,
        educatorMood: randomMood,
        stressors: this.getRandomStressors(),
        confidenceLevel: Math.floor(Math.random() * 5) + 6, // 6-10 range
        selectedStrategy: 'Connection Before Direction approach',
        confidenceRating: Math.floor(Math.random() * 4) + 7, // 7-10 range
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
      };
      
      this.behaviorLogs.push(behaviorLog);
    }
    
    console.log(`📈 Generated ${count} test behavior logs`);
  }

  private generateRandomBehaviorDescription(context: string, severity: string): string {
    const descriptions = {
      'Circle Time': {
        low: 'Child had difficulty sitting still during story time',
        medium: 'Child disrupted circle time by talking over teacher',
        high: 'Child had meltdown during circle time, screaming and leaving the area'
      },
      'Free Play': {
        low: 'Child needed reminders about sharing toys',
        medium: 'Child grabbed toys from peers and refused to share',
        high: 'Child hit peer when toy was taken, escalated to throwing materials'
      },
      'Transition': {
        low: 'Child needed extra time to finish activity before transitioning',
        medium: 'Child resisted cleanup time and hid under table',
        high: 'Child had complete meltdown during transition, throwing materials and crying'
      },
      'Meal Time': {
        low: 'Child played with food instead of eating',
        medium: 'Child refused to sit at table and wandered around room',
        high: 'Child threw food and had tantrum when asked to try new foods'
      },
      'Outdoor Play': {
        low: 'Child had minor conflict over playground equipment',
        medium: 'Child pushed peer off swing and refused to take turns',
        high: 'Child became aggressive on playground, hitting multiple peers'
      }
    };

    return descriptions[context as keyof typeof descriptions]?.[severity as keyof typeof descriptions['Circle Time']] || 
           'Child had challenging moment during classroom activity';
  }

  private getRandomStressors(): string[] {
    const allStressors = [
      'High ratios or large group sizes',
      'Strong emotional expressions',
      'Limited self-regulation',
      'Peer conflict',
      'Transition pressures'
    ];
    
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 stressors
    return allStressors.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  // Getters for test data
  getUsers(): User[] { return [...this.users]; }
  getChildren(): Child[] { return [...this.children]; }
  getClassrooms(): Classroom[] { return [...this.classrooms]; }
  getBehaviorLogs(): BehaviorLog[] { return [...this.behaviorLogs]; }
  getClassroomLogs(): ClassroomLog[] { return [...this.classroomLogs]; }
  getOrganizations() { return [...this.organizations]; }
  getInvitations() { return [...this.invitations]; }

  // Add new data
  addUser(user: User): void { this.users.push(user); }
  addChild(child: Child): void { this.children.push(child); }
  addClassroom(classroom: Classroom): void { this.classrooms.push(classroom); }
  addBehaviorLog(log: BehaviorLog): void { this.behaviorLogs.push(log); }
  addClassroomLog(log: ClassroomLog): void { this.classroomLogs.push(log); }

  // Update data
  updateUser(id: string, updates: Partial<User>): void {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
    }
  }

  // Find user by email
  findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  // Add or update user
  addOrUpdateUser(user: User): void {
    const existingIndex = this.users.findIndex(u => u.id === user.id || u.email === user.email);
    if (existingIndex !== -1) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user };
    } else {
      this.users.push(user);
    }
  }
  updateChild(id: string, updates: Partial<Child>): void {
    const index = this.children.findIndex(c => c.id === id);
    if (index !== -1) {
      this.children[index] = { ...this.children[index], ...updates };
    }
  }

  updateClassroom(id: string, updates: Partial<Classroom>): void {
    const index = this.classrooms.findIndex(c => c.id === id);
    if (index !== -1) {
      this.classrooms[index] = { ...this.classrooms[index], ...updates };
    }
  }
}

// Global test data instance
export const testDataManager = TestDataManager.getInstance();