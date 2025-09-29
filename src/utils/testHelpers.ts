import { testDataManager } from '../data/testData';
import { getCurrentEnvironment, isTestEnvironment } from '../config/environments';

// Test Helper Functions
export class TestHelpers {
  // Quick setup for different test scenarios
  static setupFreshEducator() {
    if (!isTestEnvironment()) return;
    
    testDataManager.resetData();
    console.log('🧪 Test Setup: Fresh Educator (no data)');
    return {
      scenario: 'fresh-educator',
      expectedFlow: ['welcome', 'educator-signup', 'onboarding-start', 'dashboard'],
      testPoints: [
        'Signup form validation',
        'Onboarding completion',
        'Empty state handling',
        'First behavior log'
      ]
    };
  }

  static setupExperiencedEducator() {
    if (!isTestEnvironment()) return;
    
    testDataManager.resetData();
    testDataManager.addSampleData();
    testDataManager.generateTestBehaviorLogs(20);
    
    console.log('🧪 Test Setup: Experienced Educator (with data)');
    return {
      scenario: 'experienced-educator',
      expectedFlow: ['signin', 'dashboard', 'behavior-log', 'reports'],
      testPoints: [
        'Dashboard with data',
        'Analytics insights',
        'Pattern recognition',
        'Strategy effectiveness'
      ]
    };
  }

  static setupAdminUser() {
    if (!isTestEnvironment()) return;
    
    testDataManager.resetData();
    testDataManager.addSampleData();
    
    console.log('🧪 Test Setup: Admin User (organization management)');
    return {
      scenario: 'admin-user',
      expectedFlow: ['admin-signup', 'organization-plan', 'admin-dashboard'],
      testPoints: [
        'Organization creation',
        'Educator invitations',
        'Seat management',
        'Analytics overview'
      ]
    };
  }

  static setupInvitedUser() {
    if (!isTestEnvironment()) return;
    
    testDataManager.resetData();
    // Simulate invitation URL
    window.history.pushState({}, '', '?token=test-invite-token-123');
    
    console.log('🧪 Test Setup: Invited User (invitation flow)');
    return {
      scenario: 'invited-user',
      expectedFlow: ['invited-signup', 'invited-onboarding', 'onboarding-start', 'dashboard'],
      testPoints: [
        'Invitation validation',
        'Account creation',
        'Organization context',
        'Team integration'
      ]
    };
  }

  // Performance testing
  static generateLargeDataset() {
    if (!isTestEnvironment()) return;
    
    testDataManager.resetData();
    testDataManager.addSampleData();
    testDataManager.generateTestBehaviorLogs(100);
    
    // Add more children for stress testing
    for (let i = 0; i < 20; i++) {
      testDataManager.addChild({
        id: `stress-child-${i}`,
        name: `Test Child ${i + 1}`,
        age: Math.floor(Math.random() * 3) + 3, // 3-5 years
        gradeBand: 'Preschool (4-5 years old)',
        classroomId: 'classroom-1',
        hasIEP: Math.random() > 0.8,
        hasIFSP: Math.random() > 0.9,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log('🧪 Test Setup: Large Dataset (performance testing)');
    return {
      scenario: 'large-dataset',
      dataPoints: {
        children: 25,
        behaviorLogs: 100,
        classrooms: 2,
        users: 4
      }
    };
  }

  // Error scenario testing
  static simulateErrorScenarios() {
    if (!isTestEnvironment()) return;
    
    console.log('🧪 Test Setup: Error Scenarios');
    return {
      scenarios: [
        'Network timeout simulation',
        'Invalid token handling',
        'Seat limit exceeded',
        'Subscription expired',
        'Permission denied'
      ]
    };
  }

  // Accessibility testing
  static enableAccessibilityTesting() {
    if (!isTestEnvironment()) return;
    
    // Enable keyboard navigation
    document.documentElement.classList.add('keyboard-navigation');
    
    // Add accessibility testing indicators
    const style = document.createElement('style');
    style.textContent = `
      .a11y-test * {
        outline: 2px solid red !important;
      }
      .a11y-test *:focus {
        outline: 3px solid blue !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('🧪 Test Setup: Accessibility Testing Enabled');
    return {
      features: [
        'Keyboard navigation enhanced',
        'Focus indicators visible',
        'Screen reader testing ready',
        'Color contrast validation'
      ]
    };
  }

  // Mobile testing
  static enableMobileTesting() {
    if (!isTestEnvironment()) return;
    
    // Add mobile viewport meta tag if not present
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewport);
    }
    
    console.log('🧪 Test Setup: Mobile Testing Ready');
    return {
      viewports: [
        'iPhone SE (375x667)',
        'iPhone 12 (390x844)',
        'iPad (768x1024)',
        'iPad Pro (1024x1366)'
      ]
    };
  }
}

// Global test utilities
export const runTestSuite = () => {
  if (!isTestEnvironment()) {
    console.warn('Test suite can only run in test environments');
    return;
  }

  console.log('🧪 Running Lumi Test Suite...');
  
  const tests = [
    TestHelpers.setupFreshEducator,
    TestHelpers.setupExperiencedEducator,
    TestHelpers.setupAdminUser,
    TestHelpers.setupInvitedUser,
    TestHelpers.generateLargeDataset
  ];

  tests.forEach((test, index) => {
    setTimeout(() => {
      const result = test();
      console.log(`✅ Test ${index + 1} completed:`, result);
    }, index * 1000);
  });
};

// Environment validation
export const validateEnvironment = () => {
  const env = getCurrentEnvironment();
  const issues: string[] = [];

  if (env.features.payments && !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    issues.push('Stripe key missing for payment features');
  }

  if (env.features.emailDelivery && !import.meta.env.VITE_RESEND_API_KEY) {
    issues.push('Email service key missing');
  }

  if (env.database.type === 'production' && env.features.mockData) {
    issues.push('Production environment should not use mock data');
  }

  return {
    valid: issues.length === 0,
    issues,
    environment: env.name
  };
};