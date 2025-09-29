// Test data for backend consistency
const TEST_USERS = [
  {
    id: 'educator-1',
    fullName: 'Sarah Johnson',
    email: 'sarah.educator@test.lumi.app',
    role: 'educator',
    preferredLanguage: 'english',
    learningStyle: 'I learn best with visuals',
    teachingStyle: 'We learn together',
    createdAt: new Date('2024-01-15').toISOString(),
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
    createdAt: new Date('2024-01-20').toISOString(),
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
    createdAt: new Date('2024-01-10').toISOString(),
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
    createdAt: new Date().toISOString(),
    onboardingStatus: 'incomplete'
  }
];

const TEST_CHILDREN = [
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
    createdAt: new Date('2024-01-20').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
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
    createdAt: new Date('2024-01-25').toISOString(),
    updatedAt: new Date('2024-02-05').toISOString()
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
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-10').toISOString()
  }
];

const TEST_CLASSROOMS = [
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

const TEST_BEHAVIOR_LOGS = [
  {
    id: 'behavior-1',
    educatorId: 'educator-1',
    childId: 'child-1',
    classroomId: 'classroom-1',
    behaviorDescription: 'Alex threw blocks when asked to clean up during transition to circle time',
    context: 'transition',
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
    selectedStrategy: 'Connection Before Direction approach',
    confidenceRating: 8,
    reflectionNotes: 'Strategy worked well - Alex responded to the calm approach and was able to help with cleanup after connecting.',
    createdAt: new Date('2024-02-10T09:30:00').toISOString()
  }
];

const TEST_CLASSROOM_LOGS = [
  {
    id: 'classroom-1',
    educatorId: 'educator-1',
    classroomId: 'classroom-1',
    challengeDescription: 'Multiple children having difficulty during cleanup time, taking 20+ minutes to transition',
    context: 'cleanup',
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
    createdAt: new Date('2024-02-09T15:30:00').toISOString()
  }
];

module.exports = {
  TEST_USERS,
  TEST_CHILDREN,
  TEST_CLASSROOMS,
  TEST_BEHAVIOR_LOGS,
  TEST_CLASSROOM_LOGS
};