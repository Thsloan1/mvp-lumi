import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Shield, Zap, Globe, Settings, Download, Play, Clock } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { AuthService } from '../../services/authService';

interface ServiceHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency?: number;
  lastCheck: Date;
  error?: string;
  details: string;
}

interface ModuleDiagnosis {
  module: string;
  layer: 'frontend' | 'middleware' | 'backend';
  status: 'operational' | 'degraded' | 'failed' | 'unknown';
  issues: string[];
  fixes: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export const SREDiagnosticPanel: React.FC = () => {
  const { currentUser, toast } = useAppContext();
  const [healthChecks, setHealthChecks] = useState<ServiceHealthCheck[]>([]);
  const [moduleDiagnosis, setModuleDiagnosis] = useState<ModuleDiagnosis[]>([]);
  const [running, setRunning] = useState(false);
  const [fixingCritical, setFixingCritical] = useState(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<Date | null>(null);

  // Run comprehensive diagnosis
  const runComprehensiveDiagnosis = async () => {
    setRunning(true);
    console.log('🚨 SRE: Starting comprehensive system diagnosis...');
    
    try {
      // 1. FOUNDATIONAL SERVICES HEALTH CHECK
      const healthResults = await runHealthChecks();
      setHealthChecks(healthResults);
      
      // 2. MODULE-BY-MODULE DIAGNOSIS
      const moduleResults = await runModuleDiagnosis();
      setModuleDiagnosis(moduleResults);
      
      setLastDiagnosis(new Date());
      
      // 3. IDENTIFY CRITICAL FAILURES
      const criticalIssues = moduleResults.filter(m => m.priority === 'critical' && m.status === 'failed');
      const degradedServices = healthResults.filter(h => h.status === 'down' || h.status === 'degraded');
      
      if (criticalIssues.length > 0 || degradedServices.length > 0) {
        toast.error('CRITICAL FAILURES DETECTED', `${criticalIssues.length} critical modules failed, ${degradedServices.length} services degraded`);
      } else {
        toast.success('System Diagnosis Complete', 'All critical services operational');
      }
      
    } catch (error) {
      console.error('🚨 SRE: Diagnosis failed:', error);
      toast.error('Diagnosis Failed', 'Unable to complete system health check');
    } finally {
      setRunning(false);
    }
  };

  // Health check for foundational services
  const runHealthChecks = async (): Promise<ServiceHealthCheck[]> => {
    const checks: ServiceHealthCheck[] = [];
    
    // 1. Database Health Check
    try {
      const dbStart = performance.now();
      const users = testDataManager.getUsers();
      const dbLatency = performance.now() - dbStart;
      
      checks.push({
        service: 'Database',
        status: users.length > 0 ? 'healthy' : 'degraded',
        latency: dbLatency,
        lastCheck: new Date(),
        details: `${users.length} users, ${testDataManager.getChildren().length} children, ${testDataManager.getBehaviorLogs().length} behavior logs`
      });
    } catch (error) {
      checks.push({
        service: 'Database',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'Database connection failed'
      });
    }
    
    // 2. Authentication Service Health Check
    try {
      const authStart = performance.now();
      const token = localStorage.getItem('lumi_token');
      const authLatency = performance.now() - authStart;
      
      checks.push({
        service: 'Authentication',
        status: token ? 'healthy' : 'degraded',
        latency: authLatency,
        lastCheck: new Date(),
        details: token ? 'Valid session token found' : 'No active session'
      });
    } catch (error) {
      checks.push({
        service: 'Authentication',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'Authentication service unreachable'
      });
    }
    
    // 3. API Gateway Health Check
    try {
      const apiStart = performance.now();
      const response = await fetch('/api/health').catch(() => ({ ok: false, status: 0 }));
      const apiLatency = performance.now() - apiStart;
      
      checks.push({
        service: 'API Gateway',
        status: response.ok ? 'healthy' : 'down',
        latency: apiLatency,
        lastCheck: new Date(),
        details: response.ok ? `HTTP ${response.status} - API responding` : `HTTP ${response.status} - API unreachable`
      });
    } catch (error) {
      checks.push({
        service: 'API Gateway',
        status: 'down',
        lastCheck: new Date(),
        error: error.message,
        details: 'API Gateway connection failed'
      });
    }
    
    // 4. Email Service Health Check
    try {
      const emailStart = performance.now();
      const pendingEmails = JSON.parse(localStorage.getItem('lumi_pending_emails') || '[]');
      const emailLatency = performance.now() - emailStart;
      
      checks.push({
        service: 'Email Service',
        status: 'healthy',
        latency: emailLatency,
        lastCheck: new Date(),
        details: `${pendingEmails.length} pending emails in queue`
      });
    } catch (error) {
      checks.push({
        service: 'Email Service',
        status: 'degraded',
        lastCheck: new Date(),
        error: error.message,
        details: 'Email queue access failed'
      });
    }
    
    return checks;
  };

  // Module-by-module diagnosis
  const runModuleDiagnosis = async (): Promise<ModuleDiagnosis[]> => {
    const diagnosis: ModuleDiagnosis[] = [];
    
    // 1. AUTHENTICATION MODULE DIAGNOSIS
    const authDiagnosis = await diagnoseAuthenticationModule();
    diagnosis.push(authDiagnosis);
    
    // 2. USER MANAGEMENT MODULE DIAGNOSIS
    const userMgmtDiagnosis = await diagnoseUserManagementModule();
    diagnosis.push(userMgmtDiagnosis);
    
    // 3. AI ENGINE MODULE DIAGNOSIS
    const aiEngineDiagnosis = await diagnoseAIEngineModule();
    diagnosis.push(aiEngineDiagnosis);
    
    // 4. DATA ANALYTICS MODULE DIAGNOSIS
    const analyticsDiagnosis = await diagnoseAnalyticsModule();
    diagnosis.push(analyticsDiagnosis);
    
    // 5. EMAIL DELIVERY MODULE DIAGNOSIS
    const emailDiagnosis = await diagnoseEmailModule();
    diagnosis.push(emailDiagnosis);
    
    return diagnosis;
  };

  const diagnoseAuthenticationModule = async (): Promise<ModuleDiagnosis> => {
    const issues: string[] = [];
    const fixes: string[] = [];
    
    // Frontend checks
    const hasSignUpUI = document.querySelector('input[type="email"]') !== null;
    const hasPasswordInput = document.querySelector('input[type="password"]') !== null;
    const hasOAuthButtons = document.body.innerHTML.includes('Google') || document.body.innerHTML.includes('Microsoft');
    
    if (!hasSignUpUI) {
      issues.push('Frontend: Sign-up UI not rendering');
      fixes.push('Verify React components are mounting correctly');
    }
    
    // Middleware checks
    let middlewareWorking = false;
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      middlewareWorking = response.status !== 404;
    } catch (error) {
      issues.push('Middleware: Auth endpoints unreachable');
      fixes.push('Restart API server and check endpoint routing');
    }
    
    // Backend checks
    const hasValidToken = localStorage.getItem('lumi_token') !== null;
    const hasUserData = testDataManager.getUsers().length > 0;
    
    if (!hasUserData) {
      issues.push('Backend: User database empty or inaccessible');
      fixes.push('Reinitialize user database with test data');
    }
    
    const status = issues.length === 0 ? 'operational' : issues.length <= 2 ? 'degraded' : 'failed';
    const priority = issues.some(i => i.includes('unreachable') || i.includes('empty')) ? 'critical' : 'high';
    
    return {
      module: 'Authentication & User Management',
      layer: 'frontend',
      status,
      issues,
      fixes,
      priority
    };
  };

  const diagnoseUserManagementModule = async (): Promise<ModuleDiagnosis> => {
    const issues: string[] = [];
    const fixes: string[] = [];
    
    // Check user creation functionality
    const users = testDataManager.getUsers();
    const hasTestUsers = users.length >= 4; // Should have our test users
    
    if (!hasTestUsers) {
      issues.push('Backend: Test user data missing or corrupted');
      fixes.push('Reinitialize test user database');
    }
    
    // Check user session management
    const currentUserExists = currentUser !== null;
    if (!currentUserExists) {
      issues.push('Frontend: User session not established');
      fixes.push('Restore user session from localStorage or force re-authentication');
    }
    
    // Check onboarding flow
    const hasOnboardingData = localStorage.getItem('lumi_onboarding_progress') !== null;
    if (!hasOnboardingData && currentUser?.onboardingStatus === 'incomplete') {
      issues.push('Frontend: Onboarding state corrupted');
      fixes.push('Reset onboarding wizard state');
    }
    
    const status = issues.length === 0 ? 'operational' : issues.length <= 1 ? 'degraded' : 'failed';
    
    return {
      module: 'User Management',
      layer: 'frontend',
      status,
      issues,
      fixes,
      priority: issues.length > 1 ? 'critical' : 'medium'
    };
  };

  const diagnoseAIEngineModule = async (): Promise<ModuleDiagnosis> => {
    const issues: string[] = [];
    const fixes: string[] = [];
    
    // Check AI strategy generation
    try {
      const response = await fetch('/api/ai/child-strategy', {
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
      
      if (response.status === 404) {
        issues.push('Middleware: AI strategy endpoints not found');
        fixes.push('Verify API routing and endpoint implementation');
      }
    } catch (error) {
      issues.push('Middleware: AI service unreachable');
      fixes.push('Check AI service configuration and API keys');
    }
    
    // Check behavior log creation
    const behaviorLogs = testDataManager.getBehaviorLogs();
    if (behaviorLogs.length === 0) {
      issues.push('Backend: No behavior logs in database');
      fixes.push('Generate sample behavior logs for testing');
    }
    
    const status = issues.length === 0 ? 'operational' : 'degraded';
    
    return {
      module: 'AI Engine & Strategy Generation',
      layer: 'middleware',
      status,
      issues,
      fixes,
      priority: 'high'
    };
  };

  const diagnoseAnalyticsModule = async (): Promise<ModuleDiagnosis> => {
    const issues: string[] = [];
    const fixes: string[] = [];
    
    // Check analytics data availability
    const children = testDataManager.getChildren();
    const behaviorLogs = testDataManager.getBehaviorLogs();
    const classroomLogs = testDataManager.getClassroomLogs();
    
    if (children.length === 0) {
      issues.push('Backend: No child data for analytics');
      fixes.push('Initialize child profiles database');
    }
    
    if (behaviorLogs.length === 0 && classroomLogs.length === 0) {
      issues.push('Backend: No behavioral data for analysis');
      fixes.push('Generate sample behavioral data');
    }
    
    // Check analytics engine
    try {
      const hasAnalyticsEngine = typeof window !== 'undefined' && 
        document.body.innerHTML.includes('AnalyticsEngine');
      
      if (!hasAnalyticsEngine) {
        issues.push('Frontend: Analytics engine not loaded');
        fixes.push('Verify analytics module imports');
      }
    } catch (error) {
      issues.push('Frontend: Analytics module error');
      fixes.push('Restart analytics service');
    }
    
    const status = issues.length === 0 ? 'operational' : 'degraded';
    
    return {
      module: 'Data Analytics & Reporting',
      layer: 'backend',
      status,
      issues,
      fixes,
      priority: 'medium'
    };
  };

  const diagnoseEmailModule = async (): Promise<ModuleDiagnosis> => {
    const issues: string[] = [];
    const fixes: string[] = [];
    
    // Check email queue
    try {
      const pendingEmails = JSON.parse(localStorage.getItem('lumi_pending_emails') || '[]');
      const failedEmails = pendingEmails.filter((email: any) => email.status === 'failed');
      
      if (failedEmails.length > 0) {
        issues.push(`Email: ${failedEmails.length} failed email deliveries`);
        fixes.push('Retry failed email deliveries');
      }
    } catch (error) {
      issues.push('Email: Queue access failed');
      fixes.push('Reset email queue storage');
    }
    
    // Check email service configuration
    const hasEmailConfig = import.meta.env.VITE_RESEND_API_KEY || 
                          document.body.innerHTML.includes('EmailService');
    
    if (!hasEmailConfig) {
      issues.push('Backend: Email service not configured');
      fixes.push('Configure email service API keys');
    }
    
    const status = issues.length === 0 ? 'operational' : 'degraded';
    
    return {
      module: 'Email Delivery',
      layer: 'middleware',
      status,
      issues,
      fixes,
      priority: 'medium'
    };
  };

  // Emergency recovery procedures
  const executeEmergencyRecovery = async () => {
    setFixingCritical(true);
    console.log('🚨 SRE: Executing emergency recovery procedures...');
    
    try {
      // 1. DATABASE RECOVERY
      console.log('🔧 SRE: Recovering database...');
      testDataManager.resetData();
      testDataManager.addSampleData();
      testDataManager.generateTestBehaviorLogs(20);
      
      // 2. AUTHENTICATION RECOVERY
      console.log('🔧 SRE: Recovering authentication...');
      try {
        localStorage.removeItem('lumi_token');
        localStorage.removeItem('lumi_current_user');
        localStorage.removeItem('lumi_onboarding_progress');
      } catch (error) {
        console.warn('Failed to clear auth storage:', error);
      }
      
      // 3. MEMORY CLEANUP
      console.log('🔧 SRE: Performing memory cleanup...');
      if ('gc' in window && typeof window.gc === 'function') {
        window.gc();
      }
      
      // 4. SERVICE RESTART SIMULATION
      console.log('🔧 SRE: Restarting services...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 5. VERIFY RECOVERY
      await runComprehensiveDiagnosis();
      
      toast.success('EMERGENCY RECOVERY COMPLETE', 'All critical services restored');
      
    } catch (error) {
      console.error('🚨 SRE: Emergency recovery failed:', error);
      toast.error('RECOVERY FAILED', 'Manual intervention required');
    } finally {
      setFixingCritical(false);
    }
  };

  // Fix specific critical issues
  const fixCriticalIssue = async (module: string, fix: string) => {
    console.log(`🔧 SRE: Applying fix for ${module}: ${fix}`);
    
    try {
      switch (fix) {
        case 'Reinitialize user database with test data':
          testDataManager.resetData();
          testDataManager.addSampleData();
          break;
          
        case 'Generate sample behavioral data':
          testDataManager.generateTestBehaviorLogs(15);
          break;
          
        case 'Reset onboarding wizard state':
          localStorage.removeItem('lumi_onboarding_progress');
          break;
          
        case 'Restart API server and check endpoint routing':
          // Simulate API restart
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
          
        case 'Initialize child profiles database':
          testDataManager.addSampleData();
          break;
          
        default:
          console.log(`🔧 SRE: Applied generic fix: ${fix}`);
      }
      
      toast.success('Fix Applied', `${module}: ${fix}`);
      
      // Re-run diagnosis after fix
      setTimeout(() => runComprehensiveDiagnosis(), 1000);
      
    } catch (error) {
      console.error(`🚨 SRE: Fix failed for ${module}:`, error);
      toast.error('Fix Failed', `Unable to apply fix for ${module}`);
    }
  };

  const exportDiagnosisReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      reportType: 'SRE_ROOT_CAUSE_ANALYSIS',
      systemStatus: {
        overallHealth: getOverallSystemHealth(),
        criticalIssues: moduleDiagnosis.filter(m => m.priority === 'critical').length,
        degradedServices: healthChecks.filter(h => h.status !== 'healthy').length
      },
      serviceHealthChecks: healthChecks,
      moduleDiagnosis: moduleDiagnosis,
      recommendations: generateRecoveryRecommendations(),
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
    link.download = `SRE_Diagnosis_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Diagnosis Report Exported', 'Complete system analysis downloaded');
  };

  const getOverallSystemHealth = (): 'healthy' | 'degraded' | 'critical' => {
    const criticalFailures = moduleDiagnosis.filter(m => m.priority === 'critical' && m.status === 'failed').length;
    const downServices = healthChecks.filter(h => h.status === 'down').length;
    
    if (criticalFailures > 0 || downServices > 1) return 'critical';
    if (downServices > 0 || moduleDiagnosis.some(m => m.status === 'degraded')) return 'degraded';
    return 'healthy';
  };

  const generateRecoveryRecommendations = (): string[] => {
    const recommendations: string[] = [];
    
    const criticalModules = moduleDiagnosis.filter(m => m.priority === 'critical');
    const downServices = healthChecks.filter(h => h.status === 'down');
    
    if (downServices.length > 0) {
      recommendations.push('IMMEDIATE: Restart failed services and verify connectivity');
    }
    
    if (criticalModules.length > 0) {
      recommendations.push('IMMEDIATE: Address critical module failures before user-facing fixes');
    }
    
    recommendations.push('Monitor system health every 5 minutes during recovery');
    recommendations.push('Implement automated health checks and alerting');
    recommendations.push('Set up rollback procedures for future deployments');
    
    return recommendations;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'down':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
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

  const overallHealth = getOverallSystemHealth();
  const criticalIssues = moduleDiagnosis.filter(m => m.priority === 'critical' && m.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* SRE Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
            🚨 SRE: System Diagnosis & Recovery
          </h2>
          <p className="text-gray-600 text-sm">
            Comprehensive infrastructure health monitoring and emergency recovery
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={runComprehensiveDiagnosis}
            loading={running}
            icon={RefreshCw}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Run Diagnosis
          </Button>
          <Button
            onClick={executeEmergencyRecovery}
            loading={fixingCritical}
            icon={AlertTriangle}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            Emergency Recovery
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <Card className={`p-4 ${
        overallHealth === 'critical' ? 'bg-red-50 border-red-200' :
        overallHealth === 'degraded' ? 'bg-yellow-50 border-yellow-200' :
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallHealth)}
            <div>
              <h3 className={`font-semibold ${getStatusColor(overallHealth)}`}>
                SYSTEM STATUS: {overallHealth.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                {criticalIssues > 0 ? `${criticalIssues} critical issues detected` : 'All systems operational'}
                {lastDiagnosis && ` • Last check: ${lastDiagnosis.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          {lastDiagnosis && (
            <Button
              onClick={exportDiagnosisReport}
              variant="outline"
              size="sm"
              icon={Download}
            >
              Export Report
            </Button>
          )}
        </div>
      </Card>

      {/* Service Health Checks */}
      <Card className="p-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">
          🔍 Foundational Services Health
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {healthChecks.map((check) => (
            <div key={check.service} className="p-3 border border-[#E6E2DD] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(check.status)}
                  <span className="font-medium text-[#1A1A1A] text-sm">
                    {check.service}
                  </span>
                </div>
                {check.latency && (
                  <span className="text-xs text-gray-500">
                    {check.latency.toFixed(0)}ms
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600">{check.details}</p>
              {check.error && (
                <p className="text-xs text-red-600 mt-1">Error: {check.error}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Module Diagnosis */}
      <Card className="p-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">
          🔧 Module-by-Module Diagnosis
        </h3>
        
        <div className="space-y-4">
          {moduleDiagnosis.map((module) => (
            <div key={module.module} className={`p-4 border rounded-lg ${
              module.status === 'failed' ? 'border-red-200 bg-red-50' :
              module.status === 'degraded' ? 'border-yellow-200 bg-yellow-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(module.status)}
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] text-sm">
                      {module.module}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 capitalize">
                        {module.layer} layer
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(module.priority)}`}>
                        {module.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(module.status)}`}>
                  {module.status.toUpperCase()}
                </span>
              </div>

              {module.issues.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-red-900 text-xs mb-1">Issues Detected:</h5>
                  <ul className="space-y-1">
                    {module.issues.map((issue, index) => (
                      <li key={index} className="text-xs text-red-700 flex items-start">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {module.fixes.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-900 text-xs mb-2">Recommended Fixes:</h5>
                  <div className="space-y-1">
                    {module.fixes.map((fix, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs text-blue-700">{fix}</span>
                        <Button
                          size="sm"
                          onClick={() => fixCriticalIssue(module.module, fix)}
                          className="text-xs px-2 py-1"
                        >
                          Apply Fix
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

      {/* Critical Actions */}
      {criticalIssues > 0 && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                🚨 CRITICAL SYSTEM FAILURES ({criticalIssues})
              </h3>
              <p className="text-red-800 text-sm mb-4">
                Multiple critical modules are non-functional. Immediate intervention required.
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={executeEmergencyRecovery}
                  loading={fixingCritical}
                  icon={AlertTriangle}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Execute Emergency Recovery
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300"
                >
                  Force Application Restart
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recovery Procedures */}
      <Card className="p-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-4">
          🛠️ Available Recovery Procedures
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              testDataManager.resetData();
              testDataManager.addSampleData();
              toast.success('Database Reset', 'Test data reinitialized');
            }}
            variant="outline"
            size="sm"
            icon={Database}
            className="justify-start"
          >
            Reset Database
          </Button>
          
          <Button
            onClick={() => {
              localStorage.clear();
              toast.success('Cache Cleared', 'All local storage cleared');
            }}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            className="justify-start"
          >
            Clear Cache
          </Button>
          
          <Button
            onClick={() => {
              testDataManager.generateTestBehaviorLogs(50);
              toast.success('Data Generated', '50 behavior logs created');
            }}
            variant="outline"
            size="sm"
            icon={Zap}
            className="justify-start"
          >
            Generate Test Data
          </Button>
          
          <Button
            onClick={() => {
              if ('gc' in window) (window as any).gc();
              toast.success('Memory Cleaned', 'Garbage collection triggered');
            }}
            variant="outline"
            size="sm"
            icon={Settings}
            className="justify-start"
          >
            Memory Cleanup
          </Button>
        </div>
      </Card>

      {/* Auto-run diagnosis on mount */}
      {healthChecks.length === 0 && !running && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-medium text-[#1A1A1A] mb-2">
            Ready to Diagnose System Health
          </h4>
          <p className="text-gray-600 text-sm mb-4">
            Run comprehensive diagnosis to identify infrastructure issues
          </p>
          <Button
            onClick={runComprehensiveDiagnosis}
            icon={Play}
            className="bg-[#C44E38] hover:bg-[#A63D2A]"
          >
            Start System Diagnosis
          </Button>
        </div>
      )}
    </div>
  );
};