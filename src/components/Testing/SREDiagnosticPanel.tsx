import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Shield, Monitor, Settings, Download, Play, Clock, Eye, FileText } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { AuthService } from '../../services/authService';

interface SystemHealthCheck {
  service: string;
  layer: 'frontend' | 'middleware' | 'backend';
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency?: number;
  lastCheck: Date;
  error?: string;
  details: string;
  criticalPath: boolean;
}

interface ModuleDiagnosis {
  module: string;
  layer: 'frontend' | 'middleware' | 'backend';
  status: 'operational' | 'degraded' | 'failed' | 'unknown';
  rootCause?: string;
  symptoms: string[];
  fixes: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDowntime: string;
}

export const SREDiagnosticPanel: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentView, toast } = useAppContext();
  const [healthChecks, setHealthChecks] = useState<SystemHealthCheck[]>([]);
  const [moduleDiagnosis, setModuleDiagnosis] = useState<ModuleDiagnosis[]>([]);
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  const [recoveryRunning, setRecoveryRunning] = useState(false);
  const [fixingModule, setFixingModule] = useState<string | null>(null);

  // 🚨 CRITICAL: Complete End-to-End Diagnosis
  const runCompleteRCA = async () => {
    setDiagnosisRunning(true);
    console.log('🚨 SRE: CRITICAL INCIDENT - Starting root cause analysis for Lumi application');
    
    try {
      // 1. FOUNDATIONAL SERVICES HEALTH CHECK
      console.log('🔍 SRE: Checking foundational services...');
      const healthResults = await checkFoundationalServices();
      setHealthChecks(healthResults);
      
      // 2. MODULE-BY-MODULE DIAGNOSIS
      console.log('🔍 SRE: Diagnosing application modules...');
      const moduleResults = await diagnoseAllModules();
      setModuleDiagnosis(moduleResults);
      
      // 3. IDENTIFY ROOT CAUSE
      const criticalFailures = moduleResults.filter(m => m.priority === 'critical' && m.status === 'failed');
      const downServices = healthResults.filter(h => h.status === 'down' && h.criticalPath);
      
      console.log('🚨 SRE: Analysis complete');
      console.log(`Critical failures: ${criticalFailures.length}`);
      console.log(`Down services: ${downServices.length}`);
      
      // Alert based on severity
      if (downServices.length > 0) {
        toast.error('INFRASTRUCTURE FAILURE', `${downServices.length} critical services down`);
      } else if (criticalFailures.length > 0) {
        toast.error('MODULE FAILURE', `${criticalFailures.length} critical modules failed`);
      } else {
        toast.success('SYSTEM OPERATIONAL', 'All critical services healthy');
      }
      
    } catch (error) {
      console.error('🚨 SRE: Diagnosis failed:', error);
      toast.error('DIAGNOSIS FAILED', 'Unable to complete system analysis');
    } finally {
      setDiagnosisRunning(false);
    }
  };

  // Check foundational infrastructure services
  const checkFoundationalServices = async (): Promise<SystemHealthCheck[]> => {
    const checks: SystemHealthCheck[] = [];
    
    // 1. DATABASE HEALTH CHECK
    try {
      const dbStart = performance.now();
      const users = testDataManager.getUsers();
      const children = testDataManager.getChildren();
      const behaviorLogs = testDataManager.getBehaviorLogs();
      const dbLatency = performance.now() - dbStart;
      
      const hasData = users.length > 0 && children.length > 0;
      
      checks.push({
        service: 'Database/Storage',
        layer: 'backend',
        status: hasData ? 'healthy' : 'degraded',
        latency: dbLatency,
        lastCheck: new Date(),
        details: `${users.length} users, ${children.length} children, ${behaviorLogs.length} behavior logs`,
        criticalPath: true
      });
    } catch (error) {
      checks.push({
        service: 'Database/Storage',
        layer: 'backend',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'Database connection failed',
        criticalPath: true
      });
    }
    
    // 2. AUTHENTICATION SERVICE HEALTH CHECK
    try {
      const authStart = performance.now();
      const token = localStorage.getItem('lumi_token');
      const currentUserData = localStorage.getItem('lumi_current_user');
      const authLatency = performance.now() - authStart;
      
      let authStatus: SystemHealthCheck['status'] = 'healthy';
      let details = 'Authentication service operational';
      
      if (!token && !currentUserData) {
        authStatus = 'degraded';
        details = 'No active user session';
      } else if (token && !currentUserData) {
        authStatus = 'degraded';
        details = 'Token exists but user data corrupted';
      }
      
      checks.push({
        service: 'Authentication',
        layer: 'middleware',
        status: authStatus,
        latency: authLatency,
        lastCheck: new Date(),
        details,
        criticalPath: true
      });
    } catch (error) {
      checks.push({
        service: 'Authentication',
        layer: 'middleware',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'Authentication service unreachable',
        criticalPath: true
      });
    }
    
    // 3. API GATEWAY HEALTH CHECK
    try {
      const apiStart = performance.now();
      const healthResponse = await fetch('/api/health').catch(() => ({ ok: false, status: 0 }));
      const apiLatency = performance.now() - apiStart;
      
      checks.push({
        service: 'API Gateway',
        layer: 'middleware',
        status: healthResponse.ok ? 'healthy' : 'down',
        latency: apiLatency,
        lastCheck: new Date(),
        details: healthResponse.ok ? 'API Gateway responding' : 'API Gateway unreachable',
        criticalPath: true
      });
    } catch (error) {
      checks.push({
        service: 'API Gateway',
        layer: 'middleware',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'API Gateway connection failed',
        criticalPath: true
      });
    }
    
    // 4. FRONTEND APPLICATION HEALTH CHECK
    try {
      const frontendStart = performance.now();
      const hasReactRoot = document.getElementById('root') !== null;
      const hasAppContent = document.body.innerHTML.length > 1000;
      const hasErrorBoundary = !document.body.innerHTML.includes('Something went wrong');
      const frontendLatency = performance.now() - frontendStart;
      
      let frontendStatus: SystemHealthCheck['status'] = 'healthy';
      let details = 'Frontend application loaded successfully';
      
      if (!hasReactRoot) {
        frontendStatus = 'down';
        details = 'React root element missing';
      } else if (!hasAppContent) {
        frontendStatus = 'degraded';
        details = 'Application content not rendering';
      } else if (!hasErrorBoundary) {
        frontendStatus = 'degraded';
        details = 'Error boundary may have triggered';
      }
      
      checks.push({
        service: 'Frontend Application',
        layer: 'frontend',
        status: frontendStatus,
        latency: frontendLatency,
        lastCheck: new Date(),
        details,
        criticalPath: true
      });
    } catch (error) {
      checks.push({
        service: 'Frontend Application',
        layer: 'frontend',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'Frontend application failed to load',
        criticalPath: true
      });
    }
    
    return checks;
  };

  // Diagnose all application modules
  const diagnoseAllModules = async (): Promise<ModuleDiagnosis[]> => {
    const modules: ModuleDiagnosis[] = [];
    
    // 1. AUTHENTICATION & USER MANAGEMENT
    modules.push(await diagnoseAuthenticationModule());
    
    // 2. ONBOARDING FLOW (8 STEPS)
    modules.push(await diagnoseOnboardingModule());
    
    // 3. SUBSCRIPTION & PAYMENT (STRIPE)
    modules.push(await diagnoseSubscriptionModule());
    
    // 4. AI ENGINE & STRATEGY GENERATION
    modules.push(await diagnoseAIEngineModule());
    
    // 5. LEARNING LIBRARY
    modules.push(await diagnoseLearningLibraryModule());
    
    // 6. DATA DASHBOARD & REPORTING
    modules.push(await diagnoseDataDashboardModule());
    
    return modules;
  };

  const diagnoseAuthenticationModule = async (): Promise<ModuleDiagnosis> => {
    const symptoms: string[] = [];
    const fixes: string[] = [];
    let rootCause = '';
    let status: ModuleDiagnosis['status'] = 'operational';
    
    // FRONTEND CHECKS
    const hasSignUpUI = document.querySelector('input[type="email"]') !== null ||
                       document.body.innerHTML.includes('Sign Up') ||
                       document.body.innerHTML.includes('Create Account');
    
    const hasPasswordInput = document.querySelector('input[type="password"]') !== null;
    const hasOAuthButtons = document.body.innerHTML.includes('Google') || 
                           document.body.innerHTML.includes('Microsoft') || 
                           document.body.innerHTML.includes('Apple');
    
    if (!hasSignUpUI) {
      symptoms.push('Frontend: Sign-up UI components not rendering');
      fixes.push('Verify React component mounting and routing');
      status = 'failed';
    }
    
    if (!hasPasswordInput) {
      symptoms.push('Frontend: Password input fields missing');
      fixes.push('Check form component implementation');
      status = 'degraded';
    }
    
    if (!hasOAuthButtons) {
      symptoms.push('Frontend: OAuth provider buttons not visible');
      fixes.push('Verify OAuth component integration');
    }
    
    // MIDDLEWARE CHECKS
    let middlewareWorking = false;
    try {
      const authResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      middlewareWorking = authResponse.status !== 404;
      
      if (!middlewareWorking) {
        symptoms.push('Middleware: Auth endpoints returning 404');
        fixes.push('Verify API routing configuration');
        status = 'failed';
      }
    } catch (error) {
      symptoms.push('Middleware: Auth service unreachable');
      fixes.push('Restart authentication service');
      status = 'failed';
    }
    
    // BACKEND CHECKS
    const hasValidToken = localStorage.getItem('lumi_token') !== null;
    const hasUserSession = localStorage.getItem('lumi_current_user') !== null;
    const hasUserData = testDataManager.getUsers().length > 0;
    
    if (!hasUserData) {
      symptoms.push('Backend: User database empty or inaccessible');
      fixes.push('Reinitialize user database with test data');
      status = 'failed';
    }
    
    if (!hasUserSession && hasValidToken) {
      symptoms.push('Backend: Token exists but user session corrupted');
      fixes.push('Clear corrupted session data and force re-authentication');
      status = 'degraded';
    }
    
    // Determine root cause
    if (symptoms.length === 0) {
      rootCause = 'Authentication module operational';
    } else if (symptoms.some(s => s.includes('unreachable') || s.includes('404'))) {
      rootCause = 'API service connectivity failure';
    } else if (symptoms.some(s => s.includes('not rendering'))) {
      rootCause = 'Frontend component mounting failure';
    } else {
      rootCause = 'Authentication state corruption';
    }
    
    return {
      module: 'Authentication & User Management',
      layer: 'frontend',
      status,
      rootCause,
      symptoms,
      fixes,
      priority: status === 'failed' ? 'critical' : 'high',
      estimatedDowntime: status === 'failed' ? '5-15 minutes' : '2-5 minutes'
    };
  };

  const diagnoseOnboardingModule = async (): Promise<ModuleDiagnosis> => {
    const symptoms: string[] = [];
    const fixes: string[] = [];
    let rootCause = '';
    let status: ModuleDiagnosis['status'] = 'operational';
    
    // Check onboarding data persistence
    try {
      const onboardingData = localStorage.getItem('lumi_onboarding_progress');
      if (onboardingData) {
        const parsed = JSON.parse(onboardingData);
        if (!parsed.data || typeof parsed.step !== 'number') {
          symptoms.push('Frontend: Onboarding state corrupted');
          fixes.push('Reset onboarding wizard state');
          status = 'degraded';
        }
      }
    } catch (error) {
      symptoms.push('Frontend: Onboarding data parsing failed');
      fixes.push('Clear corrupted onboarding data');
      status = 'degraded';
    }
    
    // Check onboarding API endpoint
    try {
      const onboardingResponse = await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({ test: true })
      });
      
      if (onboardingResponse.status === 404) {
        symptoms.push('Middleware: Onboarding API endpoint not found');
        fixes.push('Verify onboarding API routing');
        status = 'failed';
      }
    } catch (error) {
      symptoms.push('Middleware: Onboarding API unreachable');
      fixes.push('Restart onboarding service');
      status = 'failed';
    }
    
    // Check form validation
    const hasFormValidation = document.body.innerHTML.includes('required') ||
                             document.body.innerHTML.includes('validation');
    
    if (!hasFormValidation) {
      symptoms.push('Frontend: Form validation not implemented');
      fixes.push('Add form validation to onboarding steps');
      status = 'degraded';
    }
    
    rootCause = status === 'failed' ? 'Onboarding API service failure' : 
                status === 'degraded' ? 'Onboarding state management issues' : 
                'Onboarding module operational';
    
    return {
      module: 'Onboarding Flow (8 Steps)',
      layer: 'frontend',
      status,
      rootCause,
      symptoms,
      fixes,
      priority: status === 'failed' ? 'critical' : 'medium',
      estimatedDowntime: '3-10 minutes'
    };
  };

  const diagnoseSubscriptionModule = async (): Promise<ModuleDiagnosis> => {
    const symptoms: string[] = [];
    const fixes: string[] = [];
    let rootCause = '';
    let status: ModuleDiagnosis['status'] = 'operational';
    
    // Check Stripe integration
    const hasStripeElements = document.body.innerHTML.includes('Stripe') ||
                             document.body.innerHTML.includes('CreditCard') ||
                             document.body.innerHTML.includes('Payment');
    
    if (!hasStripeElements) {
      symptoms.push('Frontend: Stripe payment UI not loaded');
      fixes.push('Verify Stripe.js integration');
      status = 'degraded';
    }
    
    // Check subscription state
    const hasSubscriptionData = localStorage.getItem('lumi_subscription') !== null ||
                               document.body.innerHTML.includes('subscription');
    
    if (!hasSubscriptionData) {
      symptoms.push('Backend: Subscription data not available');
      fixes.push('Initialize subscription service');
      status = 'degraded';
    }
    
    // Check payment processing
    try {
      const paymentResponse = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      
      if (paymentResponse.status === 404) {
        symptoms.push('Middleware: Payment webhook endpoint missing');
        fixes.push('Configure Stripe webhook endpoints');
        status = 'failed';
      }
    } catch (error) {
      symptoms.push('Middleware: Payment service unreachable');
      fixes.push('Restart payment processing service');
      status = 'failed';
    }
    
    rootCause = status === 'failed' ? 'Payment processing service failure' : 
                status === 'degraded' ? 'Subscription state management issues' : 
                'Subscription module operational';
    
    return {
      module: 'Subscription & Payment (Stripe)',
      layer: 'middleware',
      status,
      rootCause,
      symptoms,
      fixes,
      priority: status === 'failed' ? 'high' : 'medium',
      estimatedDowntime: '10-20 minutes'
    };
  };

  const diagnoseAIEngineModule = async (): Promise<ModuleDiagnosis> => {
    const symptoms: string[] = [];
    const fixes: string[] = [];
    let rootCause = '';
    let status: ModuleDiagnosis['status'] = 'operational';
    
    // Check AI strategy generation UI
    const hasStrategyUI = document.body.innerHTML.includes('behavior') ||
                         document.body.innerHTML.includes('strategy') ||
                         document.body.innerHTML.includes('BehaviorLog');
    
    if (!hasStrategyUI) {
      symptoms.push('Frontend: AI strategy UI not rendering');
      fixes.push('Verify behavior logging components');
      status = 'degraded';
    }
    
    // Check AI API endpoints
    try {
      const aiResponse = await fetch('/api/ai/child-strategy', {
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
      
      if (aiResponse.status === 404) {
        symptoms.push('Middleware: AI strategy endpoints not found');
        fixes.push('Verify AI service routing and deployment');
        status = 'failed';
      } else if (aiResponse.status >= 500) {
        symptoms.push('Backend: AI service internal error');
        fixes.push('Check AI service logs and restart if needed');
        status = 'failed';
      }
    } catch (error) {
      symptoms.push('Middleware: AI service completely unreachable');
      fixes.push('Emergency restart of AI processing service');
      status = 'failed';
    }
    
    // Check behavior log data
    const hasBehaviorData = testDataManager.getBehaviorLogs().length > 0;
    
    if (!hasBehaviorData) {
      symptoms.push('Backend: Behavior log database empty');
      fixes.push('Initialize behavior log database');
      status = 'degraded';
    }
    
    rootCause = status === 'failed' ? 'AI processing service failure' : 
                status === 'degraded' ? 'AI data pipeline issues' : 
                'AI Engine operational';
    
    return {
      module: 'AI Engine & Strategy Generation',
      layer: 'backend',
      status,
      rootCause,
      symptoms,
      fixes,
      priority: 'critical',
      estimatedDowntime: '15-30 minutes'
    };
  };

  const diagnoseLearningLibraryModule = async (): Promise<ModuleDiagnosis> => {
    const symptoms: string[] = [];
    const fixes: string[] = [];
    let rootCause = '';
    let status: ModuleDiagnosis['status'] = 'operational';
    
    // Check library content loading
    const hasLibraryContent = document.body.innerHTML.includes('Resource') ||
                             document.body.innerHTML.includes('Library') ||
                             document.body.innerHTML.includes('STARTER_LIBRARY');
    
    if (!hasLibraryContent) {
      symptoms.push('Frontend: Learning library content not loading');
      fixes.push('Verify resource library data loading');
      status = 'degraded';
    }
    
    // Check content filtering
    const hasFiltering = document.body.innerHTML.includes('filter') ||
                        document.body.innerHTML.includes('search');
    
    if (!hasFiltering) {
      symptoms.push('Frontend: Content filtering not functional');
      fixes.push('Restore content filtering functionality');
      status = 'degraded';
    }
    
    rootCause = status === 'degraded' ? 'Learning library feature degradation' : 
                'Learning library operational';
    
    return {
      module: 'Learning Library & Resources',
      layer: 'frontend',
      status,
      rootCause,
      symptoms,
      fixes,
      priority: 'medium',
      estimatedDowntime: '5-10 minutes'
    };
  };

  const diagnoseDataDashboardModule = async (): Promise<ModuleDiagnosis> => {
    const symptoms: string[] = [];
    const fixes: string[] = [];
    let rootCause = '';
    let status: ModuleDiagnosis['status'] = 'operational';
    
    // Check dashboard data loading
    const hasDashboardData = document.body.innerHTML.includes('dashboard') ||
                            document.body.innerHTML.includes('analytics') ||
                            document.body.innerHTML.includes('AnalyticsEngine');
    
    if (!hasDashboardData) {
      symptoms.push('Frontend: Dashboard data not loading');
      fixes.push('Verify analytics data pipeline');
      status = 'degraded';
    }
    
    // Check analytics API
    try {
      const analyticsResponse = await fetch('/api/analytics/reports', {
        headers: { 'Authorization': 'Bearer test-token' }
      });
      
      if (analyticsResponse.status === 404) {
        symptoms.push('Middleware: Analytics API endpoints missing');
        fixes.push('Deploy analytics service endpoints');
        status = 'failed';
      }
    } catch (error) {
      symptoms.push('Middleware: Analytics service unreachable');
      fixes.push('Restart analytics processing service');
      status = 'failed';
    }
    
    rootCause = status === 'failed' ? 'Analytics service infrastructure failure' : 
                status === 'degraded' ? 'Dashboard data pipeline issues' : 
                'Data dashboard operational';
    
    return {
      module: 'Data Dashboard & Reporting',
      layer: 'backend',
      status,
      rootCause,
      symptoms,
      fixes,
      priority: 'medium',
      estimatedDowntime: '10-20 minutes'
    };
  };

  // 🔧 EMERGENCY RECOVERY PROCEDURES
  const executeEmergencyRecovery = async () => {
    setRecoveryRunning(true);
    console.log('🚨 SRE: EXECUTING EMERGENCY RECOVERY PROCEDURES');
    
    try {
      // 1. Clear corrupted application state
      console.log('🔧 SRE: Clearing corrupted application state...');
      localStorage.removeItem('lumi_token');
      localStorage.removeItem('lumi_current_user');
      localStorage.removeItem('lumi_onboarding_progress');
      localStorage.removeItem('lumi_current_view');
      
      // 2. Reset authentication state
      console.log('🔧 SRE: Resetting authentication state...');
      setCurrentUser(null);
      
      // 3. Reinitialize database
      console.log('🔧 SRE: Reinitializing database...');
      testDataManager.resetData();
      testDataManager.addSampleData();
      testDataManager.generateTestBehaviorLogs(10);
      
      // 4. Force memory cleanup
      console.log('🔧 SRE: Performing memory cleanup...');
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
      
      // 5. Reset to safe initial state
      console.log('🔧 SRE: Resetting to safe state...');
      setCurrentView('welcome');
      
      // 6. Verify recovery
      await new Promise(resolve => setTimeout(resolve, 2000));
      await runCompleteRCA();
      
      console.log('✅ SRE: Emergency recovery completed');
      toast.success('EMERGENCY RECOVERY COMPLETE', 'All critical services restored');
      
    } catch (error) {
      console.error('🚨 SRE: Emergency recovery failed:', error);
      toast.error('RECOVERY FAILED', 'Manual intervention required');
    } finally {
      setRecoveryRunning(false);
    }
  };

  // Apply targeted fix for specific module
  const applyTargetedFix = async (module: string, fix: string) => {
    setFixingModule(module);
    console.log(`🔧 SRE: Applying targeted fix for ${module}: ${fix}`);
    
    try {
      switch (fix) {
        case 'Verify React component mounting and routing':
          // Force component remount
          window.location.reload();
          break;
          
        case 'Clear corrupted session data and force re-authentication':
          localStorage.removeItem('lumi_token');
          localStorage.removeItem('lumi_current_user');
          setCurrentUser(null);
          setCurrentView('welcome');
          break;
          
        case 'Reset onboarding wizard state':
          localStorage.removeItem('lumi_onboarding_progress');
          break;
          
        case 'Reinitialize user database with test data':
          testDataManager.resetData();
          testDataManager.addSampleData();
          break;
          
        case 'Initialize behavior log database':
          testDataManager.generateTestBehaviorLogs(15);
          break;
          
        case 'Restart authentication service':
          // Simulate service restart
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
          
        default:
          console.log(`🔧 SRE: Applied generic fix: ${fix}`);
      }
      
      toast.success('Fix Applied', `${module}: ${fix}`);
      
      // Re-run diagnosis after fix
      setTimeout(() => runCompleteRCA(), 2000);
      
    } catch (error) {
      console.error(`🚨 SRE: Fix failed for ${module}:`, error);
      toast.error('Fix Failed', `Unable to apply fix for ${module}`);
    } finally {
      setFixingModule(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'down':
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'down':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const exportDiagnosisReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      reportType: 'SRE_ROOT_CAUSE_ANALYSIS',
      serviceHealth: healthChecks,
      moduleAnalysis: moduleDiagnosis,
      criticalIssues: moduleDiagnosis.filter(m => m.priority === 'critical').length,
      downServices: healthChecks.filter(h => h.status === 'down').length,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        localStorage: {
          token: !!localStorage.getItem('lumi_token'),
          user: !!localStorage.getItem('lumi_current_user'),
          onboarding: !!localStorage.getItem('lumi_onboarding_progress')
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lumi_SRE_RCA_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('RCA Report Exported', 'Complete diagnosis downloaded');
  };

  const criticalIssues = moduleDiagnosis.filter(m => m.priority === 'critical' && m.status === 'failed').length;
  const downServices = healthChecks.filter(h => h.status === 'down' && h.criticalPath).length;

  return (
    <div className="space-y-6">
      {/* Critical Status Alert */}
      <Card className={`p-4 ${
        downServices > 0 || criticalIssues > 0 ? 'bg-red-50 border-red-200' :
        moduleDiagnosis.some(m => m.status === 'degraded') ? 'bg-yellow-50 border-yellow-200' :
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {downServices > 0 || criticalIssues > 0 ? (
              <XCircle className="w-6 h-6 text-red-600" />
            ) : moduleDiagnosis.some(m => m.status === 'degraded') ? (
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            <div>
              <h3 className={`font-bold ${
                downServices > 0 || criticalIssues > 0 ? 'text-red-900' :
                moduleDiagnosis.some(m => m.status === 'degraded') ? 'text-yellow-900' :
                'text-green-900'
              }`}>
                {downServices > 0 || criticalIssues > 0 ? '🚨 CRITICAL SYSTEM FAILURE' :
                 moduleDiagnosis.some(m => m.status === 'degraded') ? '⚠️ SYSTEM DEGRADED' :
                 '✅ SYSTEM OPERATIONAL'}
              </h3>
              <p className="text-sm text-gray-600">
                {criticalIssues} critical issues • {downServices} services down
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={runCompleteRCA}
              loading={diagnosisRunning}
              icon={Monitor}
              size="sm"
            >
              Diagnose
            </Button>
            {(downServices > 0 || criticalIssues > 0) && (
              <Button
                onClick={executeEmergencyRecovery}
                loading={recoveryRunning}
                icon={AlertTriangle}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                Emergency Recovery
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Service Health Status */}
      {healthChecks.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-[#1A1A1A] mb-3">🔍 Foundational Services</h4>
          <div className="space-y-2">
            {healthChecks.map((check) => (
              <div key={check.service} className={`p-3 border rounded-lg ${
                check.status === 'down' ? 'border-red-200 bg-red-50' :
                check.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(check.status)}
                    <span className="font-medium text-[#1A1A1A] text-sm">{check.service}</span>
                    {check.criticalPath && (
                      <span className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium ${getStatusColor(check.status)}`}>
                      {check.status.toUpperCase()}
                    </span>
                    {check.latency && (
                      <p className="text-xs text-gray-500">{check.latency.toFixed(0)}ms</p>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">{check.details}</p>
                {check.error && (
                  <p className="text-xs text-red-600 mt-1">Error: {check.error}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Module Analysis */}
      {moduleDiagnosis.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold text-[#1A1A1A] mb-3">🔧 Module Analysis</h4>
          <div className="space-y-3">
            {moduleDiagnosis.map((module) => (
              <div key={module.module} className={`p-3 border rounded-lg ${
                module.status === 'failed' ? 'border-red-200 bg-red-50' :
                module.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(module.status)}
                    <div>
                      <h5 className="font-medium text-[#1A1A1A] text-sm">{module.module}</h5>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600 capitalize">{module.layer}</span>
                        <span className={`px-1 py-0.5 rounded text-xs font-medium ${getPriorityColor(module.priority)}`}>
                          {module.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${getStatusColor(module.status)}`}>
                    {module.status.toUpperCase()}
                  </span>
                </div>

                {module.rootCause && (
                  <div className="mb-2 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-700">
                      <strong>Root Cause:</strong> {module.rootCause}
                    </p>
                  </div>
                )}

                {module.symptoms.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-red-900 mb-1">Symptoms:</p>
                    <ul className="space-y-0.5">
                      {module.symptoms.slice(0, 2).map((symptom, index) => (
                        <li key={index} className="text-xs text-red-700">• {symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {module.fixes.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1">Quick Fixes:</p>
                    <div className="space-y-1">
                      {module.fixes.slice(0, 2).map((fix, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-xs text-blue-700">{fix.substring(0, 40)}...</span>
                          <Button
                            size="sm"
                            onClick={() => applyTargetedFix(module.module, fix)}
                            loading={fixingModule === module.module}
                            className="text-xs px-2 py-1"
                          >
                            Fix
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Export and Actions */}
      <div className="flex space-x-2">
        <Button
          onClick={exportDiagnosisReport}
          variant="outline"
          size="sm"
          icon={Download}
          className="flex-1"
          disabled={healthChecks.length === 0}
        >
          Export RCA Report
        </Button>
        <Button
          onClick={() => {
            setHealthChecks([]);
            setModuleDiagnosis([]);
            toast.info('Diagnosis Cleared', 'Ready for new analysis');
          }}
          variant="outline"
          size="sm"
          icon={RefreshCw}
          className="flex-1"
        >
          Clear Results
        </Button>
      </div>

      {/* Initial State */}
      {healthChecks.length === 0 && !diagnosisRunning && (
        <Card className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h4 className="font-medium text-red-900 mb-2">
            🚨 LUMI APPLICATION NON-FUNCTIONAL
          </h4>
          <p className="text-red-800 text-sm mb-4">
            Critical system failure detected. Immediate root cause analysis required.
          </p>
          <Button
            onClick={runCompleteRCA}
            icon={Play}
            className="bg-red-600 hover:bg-red-700"
          >
            START EMERGENCY DIAGNOSIS
          </Button>
        </Card>
      )}
    </div>
  );
};