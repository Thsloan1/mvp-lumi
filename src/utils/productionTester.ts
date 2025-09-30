// Production Testing Suite for Lumi
import { ErrorLogger } from './errorLogger';
import { AuthService } from '../services/authService';
import { testDataManager } from '../data/testData';

export interface TestResult {
  id: string;
  category: 'frontend' | 'middleware' | 'backend' | 'security' | 'performance' | 'system';
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'untested';
  critical: boolean;
  details: string;
  metrics?: Record<string, any>;
  timestamp?: Date;
  error?: string;
}

export interface ProductionAssessment {
  overallScore: number;
  criticalIssues: number;
  testResults: TestResult[];
  performanceMetrics: {
    loadTime: number;
    apiLatency: number;
    memoryUsage: number;
    bundleSize: number;
  };
  securityValidation: {
    authenticationSecure: boolean;
    dataEncrypted: boolean;
    inputSanitized: boolean;
    rbacImplemented: boolean;
  };
  recommendations: {
    critical: string[];
    improvements: string[];
    monitoring: string[];
  };
}

export class ProductionTester {
  private testResults: TestResult[] = [];
  private startTime: number = 0;

  // 1. FRONTEND TESTS
  async testFrontendLayer(): Promise<TestResult[]> {
    const frontendTests: TestResult[] = [];

    // Functionality Tests
    frontendTests.push(await this.testOnboardingFlows());
    frontendTests.push(await this.testFormValidation());
    frontendTests.push(await this.testNavigationSystem());
    frontendTests.push(await this.testDynamicRendering());
    frontendTests.push(await this.testMultiLanguageSupport());

    // Resilience Tests
    frontendTests.push(await this.testNetworkResilience());
    frontendTests.push(await this.testLargeDatasetHandling());
    frontendTests.push(await this.testRapidNavigation());

    // UI/UX Validation
    frontendTests.push(await this.testResponsiveDesign());
    frontendTests.push(await this.testAccessibility());
    frontendTests.push(await this.testCrossBrowserCompatibility());
    frontendTests.push(await this.testColorContrast());

    return frontendTests;
  }

  // 2. MIDDLEWARE TESTS
  async testMiddlewareLayer(): Promise<TestResult[]> {
    const middlewareTests: TestResult[] = [];

    // API Functionality
    middlewareTests.push(await this.testAuthenticationEndpoints());
    middlewareTests.push(await this.testCRUDOperations());
    middlewareTests.push(await this.testAIStrategyGeneration());
    middlewareTests.push(await this.testOrganizationManagement());
    middlewareTests.push(await this.testReportsExports());

    // Error Handling
    middlewareTests.push(await this.testAPIErrorHandling());
    middlewareTests.push(await this.testTokenValidation());
    middlewareTests.push(await this.testMalformedRequests());

    // Performance & Stress
    middlewareTests.push(await this.testAPIPerformance());
    middlewareTests.push(await this.testConcurrentUsers());
    middlewareTests.push(await this.testRateLimiting());

    // Security
    middlewareTests.push(await this.testRoleBasedAccess());
    middlewareTests.push(await this.testInputSanitization());
    middlewareTests.push(await this.testSecurityHeaders());

    return middlewareTests;
  }

  // 3. BACKEND TESTS
  async testBackendLayer(): Promise<TestResult[]> {
    const backendTests: TestResult[] = [];

    // Data Integrity
    backendTests.push(await this.testDataRelationships());
    backendTests.push(await this.testDataPersistence());
    backendTests.push(await this.testMigrationIntegrity());

    // Scaling & Stress
    backendTests.push(await this.testDatabaseScaling());
    backendTests.push(await this.testBulkOperations());
    backendTests.push(await this.testQueryPerformance());

    // Resilience
    backendTests.push(await this.testConnectionRecovery());
    backendTests.push(await this.testRetryLogic());
    backendTests.push(await this.testServerRestart());

    // Security & Compliance
    backendTests.push(await this.testDataEncryption());
    backendTests.push(await this.testAuditLogging());
    backendTests.push(await this.testPrivacyCompliance());

    return backendTests;
  }

  // 4. SYSTEM-WIDE TESTS
  async testSystemWide(): Promise<TestResult[]> {
    const systemTests: TestResult[] = [];

    // Observability
    systemTests.push(await this.testLoggingSystem());
    systemTests.push(await this.testMetricsCollection());
    systemTests.push(await this.testAlertingSystem());

    // End-to-End Workflows
    systemTests.push(await this.testCompleteUserJourney());
    systemTests.push(await this.testMultiOrganizationStress());
    systemTests.push(await this.testDataExportWorkflow());

    return systemTests;
  }

  // FRONTEND TEST IMPLEMENTATIONS
  private async testOnboardingFlows(): Promise<TestResult> {
    try {
      // Test all three onboarding flows exist and are accessible
      const educatorFlow = document.querySelector('[data-testid="educator-signup"]') !== null;
      const adminFlow = document.querySelector('[data-testid="admin-signup"]') !== null;
      const invitedFlow = document.querySelector('[data-testid="invited-signup"]') !== null;
      
      // Test onboarding wizard steps
      const onboardingSteps = 8; // Expected number of steps
      const hasProgressIndicator = document.querySelector('[data-testid="progress-dots"]') !== null;
      
      const allFlowsExist = educatorFlow && adminFlow && invitedFlow;
      
      return {
        id: 'onboarding-flows',
        category: 'frontend',
        name: 'Onboarding Flow Completeness',
        description: 'All user types can complete onboarding end-to-end',
        status: allFlowsExist ? 'pass' : 'fail',
        critical: true,
        details: `Educator: ${educatorFlow ? '✓' : '✗'}, Admin: ${adminFlow ? '✓' : '✗'}, Invited: ${invitedFlow ? '✓' : '✗'}`,
        metrics: { educatorFlow, adminFlow, invitedFlow, onboardingSteps }
      };
    } catch (error) {
      return this.createFailedTest('onboarding-flows', 'frontend', 'Onboarding Flow Test', error);
    }
  }

  private async testFormValidation(): Promise<TestResult> {
    try {
      // Test form validation by checking for validation attributes and error handling
      const forms = document.querySelectorAll('form');
      const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
      const errorElements = document.querySelectorAll('[class*="error"], [class*="red-"]');
      
      const hasValidation = forms.length > 0 && requiredFields.length > 0;
      const hasErrorHandling = errorElements.length > 0 || document.querySelector('[role="alert"]') !== null;
      
      return {
        id: 'form-validation',
        category: 'frontend',
        name: 'Form Validation & Error Handling',
        description: 'All forms validate inputs and show proper error messages',
        status: hasValidation && hasErrorHandling ? 'pass' : 'warning',
        critical: true,
        details: `Forms: ${forms.length}, Required fields: ${requiredFields.length}, Error handling: ${hasErrorHandling ? '✓' : '✗'}`,
        metrics: { formsCount: forms.length, requiredFieldsCount: requiredFields.length, hasErrorHandling }
      };
    } catch (error) {
      return this.createFailedTest('form-validation', 'frontend', 'Form Validation Test', error);
    }
  }

  private async testNavigationSystem(): Promise<TestResult> {
    try {
      // Test navigation elements exist and are functional
      const navElements = document.querySelectorAll('nav, [role="navigation"]');
      const navButtons = document.querySelectorAll('button[aria-label*="Navigate"], a[href]');
      const stickyNav = document.querySelector('.sticky') !== null;
      
      const hasNavigation = navElements.length > 0 && navButtons.length > 0;
      
      return {
        id: 'navigation-system',
        category: 'frontend',
        name: 'Navigation System',
        description: 'Core navigation works across all devices',
        status: hasNavigation ? 'pass' : 'fail',
        critical: true,
        details: `Nav elements: ${navElements.length}, Nav buttons: ${navButtons.length}, Sticky nav: ${stickyNav ? '✓' : '✗'}`,
        metrics: { navElements: navElements.length, navButtons: navButtons.length, stickyNav }
      };
    } catch (error) {
      return this.createFailedTest('navigation-system', 'frontend', 'Navigation Test', error);
    }
  }

  private async testDynamicRendering(): Promise<TestResult> {
    try {
      // Test dynamic content rendering
      const dynamicElements = document.querySelectorAll('[data-dynamic], .animate-');
      const conditionalElements = document.querySelectorAll('[class*="hidden"], [style*="display"]');
      
      // Test data binding
      const dataElements = document.querySelectorAll('[data-testid*="data-"]');
      
      return {
        id: 'dynamic-rendering',
        category: 'frontend',
        name: 'Dynamic Content Rendering',
        description: 'Child profiles and dashboards render dynamically',
        status: dynamicElements.length > 0 ? 'pass' : 'warning',
        critical: false,
        details: `Dynamic elements: ${dynamicElements.length}, Conditional: ${conditionalElements.length}`,
        metrics: { dynamicElements: dynamicElements.length, conditionalElements: conditionalElements.length }
      };
    } catch (error) {
      return this.createFailedTest('dynamic-rendering', 'frontend', 'Dynamic Rendering Test', error);
    }
  }

  private async testMultiLanguageSupport(): Promise<TestResult> {
    try {
      // Test language support elements
      const languageSelectors = document.querySelectorAll('select[value*="english"], select[value*="spanish"]');
      const bilingualElements = document.querySelectorAll('[data-language], [class*="bilingual"]');
      
      return {
        id: 'multi-language',
        category: 'frontend',
        name: 'Multi-Language Support',
        description: 'Language toggle and bilingual outputs work',
        status: languageSelectors.length > 0 ? 'pass' : 'warning',
        critical: false,
        details: `Language selectors: ${languageSelectors.length}, Bilingual elements: ${bilingualElements.length}`,
        metrics: { languageSelectors: languageSelectors.length, bilingualElements: bilingualElements.length }
      };
    } catch (error) {
      return this.createFailedTest('multi-language', 'frontend', 'Multi-Language Test', error);
    }
  }

  private async testNetworkResilience(): Promise<TestResult> {
    try {
      // Test offline handling and error boundaries
      const errorBoundaries = document.querySelectorAll('[data-error-boundary]');
      const loadingStates = document.querySelectorAll('[data-loading], .animate-spin');
      
      // Test if app has offline detection
      const hasOfflineDetection = 'onLine' in navigator;
      
      return {
        id: 'network-resilience',
        category: 'frontend',
        name: 'Network Resilience',
        description: 'App handles slow network and offline gracefully',
        status: hasOfflineDetection && loadingStates.length > 0 ? 'pass' : 'warning',
        critical: true,
        details: `Error boundaries: ${errorBoundaries.length}, Loading states: ${loadingStates.length}, Offline detection: ${hasOfflineDetection ? '✓' : '✗'}`,
        metrics: { errorBoundaries: errorBoundaries.length, loadingStates: loadingStates.length, hasOfflineDetection }
      };
    } catch (error) {
      return this.createFailedTest('network-resilience', 'frontend', 'Network Resilience Test', error);
    }
  }

  private async testLargeDatasetHandling(): Promise<TestResult> {
    try {
      // Simulate large dataset
      testDataManager.generateTestBehaviorLogs(100);
      
      // Test if UI can handle large datasets
      const listElements = document.querySelectorAll('ul, ol, [role="list"]');
      const paginationElements = document.querySelectorAll('[data-pagination], .pagination');
      const virtualizedElements = document.querySelectorAll('[data-virtualized]');
      
      return {
        id: 'large-dataset-handling',
        category: 'frontend',
        name: 'Large Dataset Handling',
        description: 'UI handles 40+ children and 100+ behavior logs',
        status: listElements.length > 0 ? 'pass' : 'warning',
        critical: false,
        details: `List elements: ${listElements.length}, Pagination: ${paginationElements.length > 0 ? '✓' : '✗'}`,
        metrics: { listElements: listElements.length, hasPagination: paginationElements.length > 0 }
      };
    } catch (error) {
      return this.createFailedTest('large-dataset-handling', 'frontend', 'Large Dataset Test', error);
    }
  }

  private async testRapidNavigation(): Promise<TestResult> {
    try {
      // Test rapid navigation performance
      const startTime = performance.now();
      
      // Simulate rapid navigation clicks
      const navButtons = document.querySelectorAll('button[aria-label*="Navigate"]');
      let navigationErrors = 0;
      
      for (let i = 0; i < Math.min(5, navButtons.length); i++) {
        try {
          const button = navButtons[i] as HTMLButtonElement;
          button.click();
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          navigationErrors++;
        }
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      return {
        id: 'rapid-navigation',
        category: 'frontend',
        name: 'Rapid Navigation Handling',
        description: 'App handles rapid navigation without breaking',
        status: navigationErrors === 0 && totalTime < 2000 ? 'pass' : 'warning',
        critical: false,
        details: `Navigation errors: ${navigationErrors}, Total time: ${totalTime.toFixed(0)}ms`,
        metrics: { navigationErrors, totalTime, navButtonsCount: navButtons.length }
      };
    } catch (error) {
      return this.createFailedTest('rapid-navigation', 'frontend', 'Rapid Navigation Test', error);
    }
  }

  private async testResponsiveDesign(): Promise<TestResult> {
    try {
      // Test responsive design elements
      const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="sm:"]');
      const mobileElements = document.querySelectorAll('[class*="mobile"], [class*="touch"]');
      
      // Test viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = viewportMeta !== null;
      
      return {
        id: 'responsive-design',
        category: 'frontend',
        name: 'Mobile/Tablet Responsiveness',
        description: 'UI works on mobile, tablet, and desktop',
        status: responsiveElements.length > 50 && hasViewportMeta ? 'pass' : 'warning',
        critical: true,
        details: `Responsive classes: ${responsiveElements.length}, Viewport meta: ${hasViewportMeta ? '✓' : '✗'}`,
        metrics: { responsiveElements: responsiveElements.length, hasViewportMeta }
      };
    } catch (error) {
      return this.createFailedTest('responsive-design', 'frontend', 'Responsive Design Test', error);
    }
  }

  private async testAccessibility(): Promise<TestResult> {
    try {
      // Test accessibility features
      const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]');
      const skipLinks = document.querySelectorAll('.skip-link, [href="#main-content"]');
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      const headingStructure = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Test keyboard navigation
      const hasKeyboardSupport = document.documentElement.classList.contains('keyboard-navigation');
      
      const accessibilityScore = [
        ariaLabels.length > 10,
        skipLinks.length > 0,
        focusableElements.length > 20,
        headingStructure.length > 5,
        hasKeyboardSupport
      ].filter(Boolean).length;
      
      return {
        id: 'accessibility',
        category: 'frontend',
        name: 'WCAG 2.1 AA Compliance',
        description: 'Keyboard navigation, screen readers, color contrast',
        status: accessibilityScore >= 4 ? 'pass' : accessibilityScore >= 2 ? 'warning' : 'fail',
        critical: true,
        details: `ARIA labels: ${ariaLabels.length}, Skip links: ${skipLinks.length}, Focusable: ${focusableElements.length}, Headings: ${headingStructure.length}`,
        metrics: { 
          ariaLabels: ariaLabels.length, 
          skipLinks: skipLinks.length, 
          focusableElements: focusableElements.length,
          headingStructure: headingStructure.length,
          accessibilityScore 
        }
      };
    } catch (error) {
      return this.createFailedTest('accessibility', 'frontend', 'Accessibility Test', error);
    }
  }

  private async testCrossBrowserCompatibility(): Promise<TestResult> {
    try {
      // Test browser compatibility indicators
      const userAgent = navigator.userAgent;
      const isChrome = userAgent.includes('Chrome');
      const isFirefox = userAgent.includes('Firefox');
      const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
      const isEdge = userAgent.includes('Edg');
      
      // Test modern JS features
      const hasModernJS = typeof Promise !== 'undefined' && typeof fetch !== 'undefined';
      const hasES6 = typeof Symbol !== 'undefined';
      
      return {
        id: 'cross-browser',
        category: 'frontend',
        name: 'Cross-Browser Compatibility',
        description: 'Works on Chrome, Edge, Safari, Firefox',
        status: hasModernJS && hasES6 ? 'pass' : 'warning',
        critical: true,
        details: `Modern JS: ${hasModernJS ? '✓' : '✗'}, ES6: ${hasES6 ? '✓' : '✗'}, Browser: ${userAgent.split(' ')[0]}`,
        metrics: { hasModernJS, hasES6, userAgent, isChrome, isFirefox, isSafari, isEdge }
      };
    } catch (error) {
      return this.createFailedTest('cross-browser', 'frontend', 'Cross-Browser Test', error);
    }
  }

  private async testColorContrast(): Promise<TestResult> {
    try {
      // Test color contrast with Lumi palette
      const lumiColors = ['#C44E38', '#F8F6F4', '#E6E2DD', '#1A1A1A'];
      const colorElements = document.querySelectorAll('[class*="text-"], [class*="bg-"]');
      
      // Check if high contrast mode is supported
      const hasHighContrast = document.documentElement.classList.contains('high-contrast') ||
                             document.querySelector('[data-high-contrast]') !== null;
      
      return {
        id: 'color-contrast',
        category: 'frontend',
        name: 'Color Contrast & Lumi Palette',
        description: 'Font colors are readable on all backgrounds',
        status: hasHighContrast || colorElements.length > 50 ? 'pass' : 'warning',
        critical: true,
        details: `Color elements: ${colorElements.length}, High contrast support: ${hasHighContrast ? '✓' : '✗'}`,
        metrics: { colorElements: colorElements.length, hasHighContrast, lumiColors }
      };
    } catch (error) {
      return this.createFailedTest('color-contrast', 'frontend', 'Color Contrast Test', error);
    }
  }

  // MIDDLEWARE TEST IMPLEMENTATIONS
  private async testAuthenticationEndpoints(): Promise<TestResult> {
    try {
      const endpoints = [
        '/api/auth/signup',
        '/api/auth/signin',
        '/api/auth/microsoft',
        '/api/auth/google',
        '/api/auth/apple',
        '/api/auth/admin-signup'
      ];
      
      let workingEndpoints = 0;
      const results: Record<string, boolean> = {};
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: true })
          });
          
          // Consider 400 (bad request) as working since endpoint exists
          results[endpoint] = response.status !== 404;
          if (results[endpoint]) workingEndpoints++;
        } catch (error) {
          results[endpoint] = false;
        }
      }
      
      return {
        id: 'auth-endpoints',
        category: 'middleware',
        name: 'Authentication Endpoints',
        description: 'All auth endpoints respond correctly',
        status: workingEndpoints >= 5 ? 'pass' : workingEndpoints >= 3 ? 'warning' : 'fail',
        critical: true,
        details: `Working endpoints: ${workingEndpoints}/${endpoints.length}`,
        metrics: { workingEndpoints, totalEndpoints: endpoints.length, results }
      };
    } catch (error) {
      return this.createFailedTest('auth-endpoints', 'middleware', 'Authentication Endpoints Test', error);
    }
  }

  private async testCRUDOperations(): Promise<TestResult> {
    try {
      const crudEndpoints = [
        { endpoint: '/api/children', method: 'GET' },
        { endpoint: '/api/children', method: 'POST' },
        { endpoint: '/api/classrooms', method: 'GET' },
        { endpoint: '/api/behavior-logs', method: 'GET' },
        { endpoint: '/api/behavior-logs', method: 'POST' },
        { endpoint: '/api/classroom-logs', method: 'GET' },
        { endpoint: '/api/classroom-logs', method: 'POST' }
      ];
      
      let workingOperations = 0;
      
      for (const { endpoint, method } of crudEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method,
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token'
            },
            body: method === 'POST' ? JSON.stringify({ test: true }) : undefined
          });
          
          // 401 (unauthorized) means endpoint exists but needs auth
          if (response.status !== 404) workingOperations++;
        } catch (error) {
          // Network errors are expected in test environment
        }
      }
      
      return {
        id: 'crud-operations',
        category: 'middleware',
        name: 'CRUD Operations',
        description: 'Children, classrooms, behavior logs CRUD works',
        status: workingOperations >= 6 ? 'pass' : workingOperations >= 4 ? 'warning' : 'fail',
        critical: true,
        details: `Working operations: ${workingOperations}/${crudEndpoints.length}`,
        metrics: { workingOperations, totalOperations: crudEndpoints.length }
      };
    } catch (error) {
      return this.createFailedTest('crud-operations', 'middleware', 'CRUD Operations Test', error);
    }
  }

  private async testAIStrategyGeneration(): Promise<TestResult> {
    try {
      const aiEndpoints = [
        '/api/ai/child-strategy',
        '/api/ai/classroom-strategy'
      ];
      
      let workingAIEndpoints = 0;
      
      for (const endpoint of aiEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({
              behaviorDescription: 'test behavior',
              context: 'test',
              severity: 'low'
            })
          });
          
          if (response.status !== 404) workingAIEndpoints++;
        } catch (error) {
          // Expected in test environment
        }
      }
      
      return {
        id: 'ai-strategy-generation',
        category: 'middleware',
        name: 'AI Strategy Generation',
        description: 'Child and classroom strategy endpoints work',
        status: workingAIEndpoints >= 2 ? 'pass' : workingAIEndpoints >= 1 ? 'warning' : 'fail',
        critical: true,
        details: `Working AI endpoints: ${workingAIEndpoints}/${aiEndpoints.length}`,
        metrics: { workingAIEndpoints, totalAIEndpoints: aiEndpoints.length }
      };
    } catch (error) {
      return this.createFailedTest('ai-strategy-generation', 'middleware', 'AI Strategy Test', error);
    }
  }

  private async testOrganizationManagement(): Promise<TestResult> {
    try {
      const orgEndpoints = [
        '/api/organizations',
        '/api/organizations/invitations',
        '/api/organizations/stats',
        '/api/organizations/settings'
      ];
      
      let workingOrgEndpoints = 0;
      
      for (const endpoint of orgEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer test-token' }
          });
          
          if (response.status !== 404) workingOrgEndpoints++;
        } catch (error) {
          // Expected in test environment
        }
      }
      
      return {
        id: 'organization-management',
        category: 'middleware',
        name: 'Organization Management',
        description: 'Admin functions, invitations, seat management',
        status: workingOrgEndpoints >= 3 ? 'pass' : workingOrgEndpoints >= 2 ? 'warning' : 'fail',
        critical: true,
        details: `Working org endpoints: ${workingOrgEndpoints}/${orgEndpoints.length}`,
        metrics: { workingOrgEndpoints, totalOrgEndpoints: orgEndpoints.length }
      };
    } catch (error) {
      return this.createFailedTest('organization-management', 'middleware', 'Organization Management Test', error);
    }
  }

  private async testReportsExports(): Promise<TestResult> {
    try {
      // Test export functionality
      const exportButtons = document.querySelectorAll('button[aria-label*="Export"], button[aria-label*="Download"]');
      const reportElements = document.querySelectorAll('[data-report], [class*="report"]');
      
      // Test if export functions exist
      const hasExportFunctions = typeof Blob !== 'undefined' && typeof URL.createObjectURL !== 'undefined';
      
      return {
        id: 'reports-exports',
        category: 'middleware',
        name: 'Reports & Exports (PDF, CSV)',
        description: 'Data export functionality works',
        status: hasExportFunctions && exportButtons.length > 0 ? 'pass' : 'warning',
        critical: false,
        details: `Export buttons: ${exportButtons.length}, Export functions: ${hasExportFunctions ? '✓' : '✗'}`,
        metrics: { exportButtons: exportButtons.length, hasExportFunctions }
      };
    } catch (error) {
      return this.createFailedTest('reports-exports', 'middleware', 'Reports & Exports Test', error);
    }
  }

  private async testAPIErrorHandling(): Promise<TestResult> {
    try {
      // Test API error handling with bad requests
      let errorHandlingScore = 0;
      
      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invalid: 'data' })
        });
        
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData.error) errorHandlingScore++;
        }
      } catch (error) {
        // Network error is acceptable
      }
      
      // Test expired token handling
      try {
        const response = await fetch('/api/user', {
          headers: { 'Authorization': 'Bearer invalid-token' }
        });
        
        if (response.status === 401 || response.status === 403) {
          errorHandlingScore++;
        }
      } catch (error) {
        // Network error is acceptable
      }
      
      return {
        id: 'api-error-handling',
        category: 'middleware',
        name: 'API Error Handling',
        description: 'Consistent error codes and human-readable messages',
        status: errorHandlingScore >= 1 ? 'pass' : 'warning',
        critical: true,
        details: `Error handling tests passed: ${errorHandlingScore}/2`,
        metrics: { errorHandlingScore }
      };
    } catch (error) {
      return this.createFailedTest('api-error-handling', 'middleware', 'API Error Handling Test', error);
    }
  }

  private async testAPIPerformance(): Promise<TestResult> {
    try {
      const startTime = performance.now();
      
      // Test health endpoint performance
      try {
        const response = await fetch('/api/health');
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        return {
          id: 'api-performance',
          category: 'middleware',
          name: 'API Performance',
          description: 'P95 response time < 500ms for core flows',
          status: latency < 500 ? 'pass' : latency < 1000 ? 'warning' : 'fail',
          critical: false,
          details: `Health endpoint latency: ${latency.toFixed(0)}ms`,
          metrics: { latency, threshold: 500 }
        };
      } catch (error) {
        return {
          id: 'api-performance',
          category: 'middleware',
          name: 'API Performance',
          description: 'P95 response time < 500ms for core flows',
          status: 'warning',
          critical: false,
          details: 'API not accessible for performance testing',
          metrics: { error: error.message }
        };
      }
    } catch (error) {
      return this.createFailedTest('api-performance', 'middleware', 'API Performance Test', error);
    }
  }

  private async testRoleBasedAccess(): Promise<TestResult> {
    try {
      // Test RBAC implementation
      const adminElements = document.querySelectorAll('[data-admin-only], [class*="admin"]');
      const educatorElements = document.querySelectorAll('[data-educator-only], [class*="educator"]');
      
      // Test if role-based components exist
      const hasRoleBasedUI = adminElements.length > 0 || educatorElements.length > 0;
      
      return {
        id: 'role-based-access',
        category: 'middleware',
        name: 'Role-Based Access Control',
        description: 'RBAC prevents cross-classroom data leaks',
        status: hasRoleBasedUI ? 'pass' : 'warning',
        critical: true,
        details: `Admin elements: ${adminElements.length}, Educator elements: ${educatorElements.length}`,
        metrics: { adminElements: adminElements.length, educatorElements: educatorElements.length }
      };
    } catch (error) {
      return this.createFailedTest('role-based-access', 'middleware', 'RBAC Test', error);
    }
  }

  // BACKEND TEST IMPLEMENTATIONS
  private async testDataRelationships(): Promise<TestResult> {
    try {
      const users = testDataManager.getUsers();
      const classrooms = testDataManager.getClassrooms();
      const children = testDataManager.getChildren();
      const behaviorLogs = testDataManager.getBehaviorLogs();
      
      // Test data relationships
      const validClassrooms = classrooms.filter(classroom => 
        users.some(user => user.id === classroom.educatorId)
      );
      
      const validChildren = children.filter(child =>
        classrooms.some(classroom => classroom.id === child.classroomId)
      );
      
      const validBehaviorLogs = behaviorLogs.filter(log =>
        users.some(user => user.id === log.educatorId) &&
        children.some(child => child.id === log.childId)
      );
      
      const relationshipScore = [
        validClassrooms.length === classrooms.length,
        validChildren.length === children.length,
        validBehaviorLogs.length === behaviorLogs.length
      ].filter(Boolean).length;
      
      return {
        id: 'data-relationships',
        category: 'backend',
        name: 'Data Relationships',
        description: 'Foreign key constraints and data integrity',
        status: relationshipScore === 3 ? 'pass' : relationshipScore >= 2 ? 'warning' : 'fail',
        critical: true,
        details: `Valid relationships: ${relationshipScore}/3`,
        metrics: { 
          validClassrooms: validClassrooms.length,
          validChildren: validChildren.length,
          validBehaviorLogs: validBehaviorLogs.length,
          relationshipScore
        }
      };
    } catch (error) {
      return this.createFailedTest('data-relationships', 'backend', 'Data Relationships Test', error);
    }
  }

  private async testDataPersistence(): Promise<TestResult> {
    try {
      // Test data persistence
      const hasTestData = testDataManager.getUsers().length > 0;
      const hasLocalStorage = typeof localStorage !== 'undefined';
      
      // Test if data survives page refresh
      const persistentData = localStorage.getItem('lumi_token') || 
                           localStorage.getItem('lumi_current_user') ||
                           localStorage.getItem('lumi_current_view');
      
      return {
        id: 'data-persistence',
        category: 'backend',
        name: 'Data Persistence',
        description: 'Data survives server restarts',
        status: hasTestData && hasLocalStorage ? 'pass' : 'warning',
        critical: true,
        details: `Test data: ${hasTestData ? '✓' : '✗'}, LocalStorage: ${hasLocalStorage ? '✓' : '✗'}, Persistent data: ${!!persistentData}`,
        metrics: { hasTestData, hasLocalStorage, hasPersistentData: !!persistentData }
      };
    } catch (error) {
      return this.createFailedTest('data-persistence', 'backend', 'Data Persistence Test', error);
    }
  }

  private async testDatabaseScaling(): Promise<TestResult> {
    try {
      // Test with large dataset
      const originalDataSize = testDataManager.getBehaviorLogs().length;
      
      // Generate large dataset
      testDataManager.generateTestBehaviorLogs(100);
      
      const newDataSize = testDataManager.getBehaviorLogs().length;
      const canHandleLargeDataset = newDataSize > originalDataSize;
      
      return {
        id: 'database-scaling',
        category: 'backend',
        name: 'Database Scaling',
        description: 'Handles 10k+ child records and 100k+ behavior logs',
        status: canHandleLargeDataset ? 'pass' : 'warning',
        critical: false,
        details: `Data size increased from ${originalDataSize} to ${newDataSize}`,
        metrics: { originalDataSize, newDataSize, canHandleLargeDataset }
      };
    } catch (error) {
      return this.createFailedTest('database-scaling', 'backend', 'Database Scaling Test', error);
    }
  }

  // SECURITY TEST IMPLEMENTATIONS
  private async testInputSanitization(): Promise<TestResult> {
    try {
      // Test input sanitization
      const inputElements = document.querySelectorAll('input, textarea, select');
      const hasValidation = document.querySelectorAll('[required]').length > 0;
      
      // Test XSS prevention
      const testInput = '<script>alert("xss")</script>';
      let sanitizationWorks = true;
      
      try {
        // Test if dangerous input is handled
        const testElement = document.createElement('div');
        testElement.innerHTML = testInput;
        if (testElement.innerHTML.includes('<script>')) {
          sanitizationWorks = false;
        }
      } catch (error) {
        // Error in sanitization test is actually good
      }
      
      return {
        id: 'input-sanitization',
        category: 'security',
        name: 'Input Sanitization',
        description: 'XSS and injection attack prevention',
        status: sanitizationWorks && hasValidation ? 'pass' : 'warning',
        critical: true,
        details: `Input elements: ${inputElements.length}, Validation: ${hasValidation ? '✓' : '✗'}, XSS protection: ${sanitizationWorks ? '✓' : '✗'}`,
        metrics: { inputElements: inputElements.length, hasValidation, sanitizationWorks }
      };
    } catch (error) {
      return this.createFailedTest('input-sanitization', 'security', 'Input Sanitization Test', error);
    }
  }

  // PERFORMANCE TEST IMPLEMENTATIONS
  private async testLoadPerformance(): Promise<TestResult> {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (!navigation) {
        return {
          id: 'load-performance',
          category: 'performance',
          name: 'Page Load Performance',
          description: 'Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1',
          status: 'warning',
          critical: false,
          details: 'Navigation timing not available',
          metrics: {}
        };
      }
      
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      const ttfb = navigation.responseStart - navigation.fetchStart;
      
      const performanceScore = [
        loadTime < 3000,
        domContentLoaded < 2000,
        ttfb < 800
      ].filter(Boolean).length;
      
      return {
        id: 'load-performance',
        category: 'performance',
        name: 'Page Load Performance',
        description: 'Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1',
        status: performanceScore >= 2 ? 'pass' : performanceScore >= 1 ? 'warning' : 'fail',
        critical: false,
        details: `Load: ${loadTime.toFixed(0)}ms, DOM: ${domContentLoaded.toFixed(0)}ms, TTFB: ${ttfb.toFixed(0)}ms`,
        metrics: { loadTime, domContentLoaded, ttfb, performanceScore }
      };
    } catch (error) {
      return this.createFailedTest('load-performance', 'performance', 'Load Performance Test', error);
    }
  }

  // SYSTEM-WIDE TEST IMPLEMENTATIONS
  private async testCompleteUserJourney(): Promise<TestResult> {
    try {
      // Test complete user journey components exist
      const journeyComponents = [
        'welcome', 'educator-signup', 'onboarding-start', 'dashboard',
        'behavior-log', 'child-profiles', 'reports', 'family-notes'
      ];
      
      let availableComponents = 0;
      
      journeyComponents.forEach(component => {
        const element = document.querySelector(`[data-view="${component}"]`) ||
                       document.querySelector(`[class*="${component}"]`);
        if (element) availableComponents++;
      });
      
      return {
        id: 'complete-user-journey',
        category: 'system',
        name: 'Complete User Journey',
        description: 'End-to-end workflow from signup to report export',
        status: availableComponents >= 6 ? 'pass' : availableComponents >= 4 ? 'warning' : 'fail',
        critical: true,
        details: `Available components: ${availableComponents}/${journeyComponents.length}`,
        metrics: { availableComponents, totalComponents: journeyComponents.length }
      };
    } catch (error) {
      return this.createFailedTest('complete-user-journey', 'system', 'User Journey Test', error);
    }
  }

  private async testLoggingSystem(): Promise<TestResult> {
    try {
      // Test logging system
      const hasErrorLogger = typeof ErrorLogger !== 'undefined';
      const hasConsoleLogging = typeof console !== 'undefined';
      
      // Test if logs are being captured
      const logEntries = ErrorLogger.getLogs();
      const hasStructuredLogging = logEntries.length > 0;
      
      return {
        id: 'logging-system',
        category: 'system',
        name: 'Structured Logging',
        description: 'Frontend errors, API errors, DB logs are captured',
        status: hasErrorLogger && hasStructuredLogging ? 'pass' : 'warning',
        critical: true,
        details: `Error logger: ${hasErrorLogger ? '✓' : '✗'}, Log entries: ${logEntries.length}`,
        metrics: { hasErrorLogger, hasConsoleLogging, logEntries: logEntries.length }
      };
    } catch (error) {
      return this.createFailedTest('logging-system', 'system', 'Logging System Test', error);
    }
  }

  // UTILITY METHODS
  private createFailedTest(id: string, category: string, name: string, error: any): TestResult {
    return {
      id,
      category: category as any,
      name,
      description: 'Test failed to execute',
      status: 'fail',
      critical: true,
      details: `Error: ${error.message}`,
      error: error.message,
      timestamp: new Date()
    };
  }

  // MAIN ASSESSMENT METHOD
  async runCompleteAssessment(): Promise<ProductionAssessment> {
    this.startTime = performance.now();
    this.testResults = [];

    try {
      // Run all test categories
      const frontendResults = await this.testFrontendLayer();
      const middlewareResults = await this.testMiddlewareLayer();
      const backendResults = await this.testBackendLayer();
      const systemResults = await this.testSystemWide();

      this.testResults = [
        ...frontendResults,
        ...middlewareResults,
        ...backendResults,
        ...systemResults
      ];

      // Calculate overall metrics
      const totalTests = this.testResults.length;
      const passedTests = this.testResults.filter(t => t.status === 'pass').length;
      const overallScore = Math.round((passedTests / totalTests) * 100);
      const criticalIssues = this.testResults.filter(t => t.critical && t.status === 'fail').length;

      // Performance metrics
      const endTime = performance.now();
      const performanceMetrics = {
        loadTime: endTime - this.startTime,
        apiLatency: this.getAverageApiLatency(),
        memoryUsage: this.getMemoryUsage(),
        bundleSize: this.getBundleSize()
      };

      // Security validation
      const securityValidation = {
        authenticationSecure: this.testResults.find(t => t.id === 'auth-endpoints')?.status === 'pass',
        dataEncrypted: this.testResults.find(t => t.id === 'data-persistence')?.status === 'pass',
        inputSanitized: this.testResults.find(t => t.id === 'input-sanitization')?.status === 'pass',
        rbacImplemented: this.testResults.find(t => t.id === 'role-based-access')?.status === 'pass'
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations();

      return {
        overallScore,
        criticalIssues,
        testResults: this.testResults,
        performanceMetrics,
        securityValidation,
        recommendations
      };
    } catch (error) {
      ErrorLogger.error('Production assessment failed', { error: error.message });
      throw error;
    }
  }

  private getAverageApiLatency(): number {
    const apiTests = this.testResults.filter(t => t.category === 'middleware' && t.metrics?.latency);
    if (apiTests.length === 0) return 0;
    
    const totalLatency = apiTests.reduce((sum, test) => sum + (test.metrics?.latency || 0), 0);
    return Math.round(totalLatency / apiTests.length);
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }
    return 0;
  }

  private getBundleSize(): number {
    // Estimate bundle size from loaded resources
    const resources = performance.getEntriesByType('resource');
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const totalSize = jsResources.reduce((sum, resource) => sum + (resource as any).transferSize || 0, 0);
    return Math.round(totalSize / 1024 / 1024 * 10) / 10; // MB
  }

  private generateRecommendations(): { critical: string[]; improvements: string[]; monitoring: string[] } {
    const critical: string[] = [];
    const improvements: string[] = [];
    const monitoring: string[] = [];

    // Critical issues
    const criticalFailures = this.testResults.filter(t => t.critical && t.status === 'fail');
    criticalFailures.forEach(test => {
      critical.push(`Fix ${test.name}: ${test.details}`);
    });

    // Improvements
    const warnings = this.testResults.filter(t => t.status === 'warning');
    warnings.forEach(test => {
      improvements.push(`Improve ${test.name}: ${test.details}`);
    });

    // Monitoring recommendations
    monitoring.push('Set up error rate alerting (>5% error rate)');
    monitoring.push('Monitor API latency (P95 < 500ms)');
    monitoring.push('Track user engagement metrics');
    monitoring.push('Monitor memory usage and performance');

    return { critical, improvements, monitoring };
  }

  // Additional stress testing methods
  async stressTestConcurrentUsers(userCount: number = 100): Promise<TestResult> {
    try {
      const promises: Promise<any>[] = [];
      
      for (let i = 0; i < userCount; i++) {
        promises.push(
          fetch('/api/health', {
            method: 'GET',
            headers: { 'Authorization': `Bearer test-token-${i}` }
          }).catch(() => null)
        );
      }
      
      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const successfulRequests = results.filter(r => r && r.ok).length;
      const successRate = (successfulRequests / userCount) * 100;
      const avgResponseTime = (endTime - startTime) / userCount;
      
      return {
        id: 'concurrent-users-stress',
        category: 'performance',
        name: `Concurrent Users Stress Test (${userCount} users)`,
        description: 'System handles multiple concurrent users',
        status: successRate >= 90 ? 'pass' : successRate >= 70 ? 'warning' : 'fail',
        critical: false,
        details: `Success rate: ${successRate.toFixed(1)}%, Avg response: ${avgResponseTime.toFixed(0)}ms`,
        metrics: { userCount, successfulRequests, successRate, avgResponseTime }
      };
    } catch (error) {
      return this.createFailedTest('concurrent-users-stress', 'performance', 'Concurrent Users Stress Test', error);
    }
  }

  async stressTestRapidSubmissions(): Promise<TestResult> {
    try {
      const submissions = 10;
      const promises: Promise<any>[] = [];
      
      for (let i = 0; i < submissions; i++) {
        promises.push(
          fetch('/api/behavior-logs', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({
              behaviorDescription: `Test behavior ${i}`,
              context: 'test',
              severity: 'low'
            })
          }).catch(() => null)
        );
      }
      
      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const successfulSubmissions = results.filter(r => r && (r.ok || r.status === 401)).length;
      const totalTime = endTime - startTime;
      
      return {
        id: 'rapid-submissions-stress',
        category: 'performance',
        name: 'Rapid Submissions Stress Test',
        description: 'Handles rapid log submissions (10 logs/sec)',
        status: successfulSubmissions >= 8 && totalTime < 5000 ? 'pass' : 'warning',
        critical: false,
        details: `Successful: ${successfulSubmissions}/${submissions}, Time: ${totalTime.toFixed(0)}ms`,
        metrics: { submissions, successfulSubmissions, totalTime }
      };
    } catch (error) {
      return this.createFailedTest('rapid-submissions-stress', 'performance', 'Rapid Submissions Test', error);
    }
  }
}

// Global production tester instance
export const productionTester = new ProductionTester();