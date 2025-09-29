const { TEST_USERS, TEST_CHILDREN, TEST_CLASSROOMS, TEST_BEHAVIOR_LOGS, TEST_CLASSROOM_LOGS } = require('./testData.cjs');

class TestDataManager {
  constructor() {
    this.users = [...TEST_USERS];
    this.children = [...TEST_CHILDREN];
    this.classrooms = [...TEST_CLASSROOMS];
    this.behaviorLogs = [...TEST_BEHAVIOR_LOGS];
    this.classroomLogs = [...TEST_CLASSROOM_LOGS];
    this.organizations = [
      {
        id: 'org-1',
        name: 'Sunshine Elementary School',
        type: 'school',
        ownerId: 'admin-1',
        maxSeats: 15,
        activeSeats: 12,
        plan: 'organization_annual',
        status: 'active',
        createdAt: new Date('2024-01-01').toISOString()
      }
    ];
    this.invitations = [
      {
        id: 'invite-1',
        email: 'new.educator@test.lumi.app',
        organizationId: 'org-1',
        organizationName: 'Sunshine Elementary School',
        inviterName: 'Dr. Michael Chen',
        token: 'test-invite-token-123',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date('2024-02-01').toISOString()
      }
    ];
  }

  getAllData() {
    return {
      users: this.users,
      children: this.children,
      classrooms: this.classrooms,
      behaviorLogs: this.behaviorLogs,
      classroomLogs: this.classroomLogs,
      organizations: this.organizations,
      invitations: this.invitations
    };
  }

  resetData() {
    this.users = [...TEST_USERS];
    this.children = [...TEST_CHILDREN];
    this.classrooms = [...TEST_CLASSROOMS];
    this.behaviorLogs = [...TEST_BEHAVIOR_LOGS];
    this.classroomLogs = [...TEST_CLASSROOM_LOGS];
    console.log('🔄 Test data reset to initial state');
  }

  addSampleData() {
    // Add more children for testing
    const additionalChildren = [
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
        createdAt: new Date('2024-02-05').toISOString(),
        updatedAt: new Date('2024-02-05').toISOString()
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
        createdAt: new Date('2024-02-03').toISOString(),
        updatedAt: new Date('2024-02-03').toISOString()
      }
    ];

    this.children.push(...additionalChildren);
    console.log('📊 Sample data added for comprehensive testing');
  }

  generateTestBehaviorLogs(count = 10) {
    const contexts = ['Circle Time', 'Free Play', 'Meal Time', 'Transition', 'Outdoor Play'];
    const severities = ['low', 'medium', 'high'];
    const moods = ['calm', 'managing', 'frustrated', 'overwhelmed'];
    
    for (let i = 0; i < count; i++) {
      const randomChild = this.children[Math.floor(Math.random() * this.children.length)];
      const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      
      const behaviorLog = {
        id: `test-behavior-${Date.now()}-${i}`,
        educatorId: randomChild.classroomId === 'classroom-1' ? 'educator-1' : 'educator-2',
        childId: randomChild.id,
        classroomId: randomChild.classroomId,
        behaviorDescription: this.generateRandomBehaviorDescription(randomContext, randomSeverity),
        context: randomContext.toLowerCase().replace(/\s+/g, '_'),
        timeOfDay: ['morning', 'midday', 'afternoon'][Math.floor(Math.random() * 3)],
        severity: randomSeverity,
        educatorMood: randomMood,
        stressors: this.getRandomStressors(),
        confidenceLevel: Math.floor(Math.random() * 5) + 6,
        selectedStrategy: 'Connection Before Direction approach',
        confidenceRating: Math.floor(Math.random() * 4) + 7,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      this.behaviorLogs.push(behaviorLog);
    }
    
    console.log(`📈 Generated ${count} test behavior logs`);
  }

  generateRandomBehaviorDescription(context, severity) {
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

    return descriptions[context]?.[severity] || 'Child had challenging moment during classroom activity';
  }

  getRandomStressors() {
    const allStressors = [
      'High ratios or large group sizes',
      'Strong emotional expressions',
      'Limited self-regulation',
      'Peer conflict',
      'Transition pressures'
    ];
    
    const count = Math.floor(Math.random() * 3) + 1;
    return allStressors.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}

const testDataManager = new TestDataManager();

module.exports = { testDataManager };