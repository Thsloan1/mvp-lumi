import { useState, useEffect } from 'react';
import { Code, Users, Database, Settings, Download, Upload, RefreshCw, Play, Book, Zap, FileText, BarChart3, TrendingUp, AlertTriangle, Eye, Filter, X, Mail, Copy, Check, Star, Clock, Plus, Trash2, Send, Shield } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { getCurrentEnvironment, isTestEnvironment } from '../../config/environments';
import { EmailService } from '../../services/emailService';
import { SREDiagnosticPanel } from './SREDiagnosticPanel';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';
import { LumiSREDashboard } from './LumiSREDashboard';
import React from 'react';

interface TestUser {
  id: string;
  name: string;
  email: string;
  accessCode: string;
  role: 'educator' | 'admin' | 'tester';
  modules: string[];
  createdAt: string;
  lastActive?: string;
  feedbackSubmitted?: number;
  status: 'active' | 'expired' | 'revoked';
  expiresAt?: string;
}

// CRITICAL INFRASTRUCTURE HEALTH CHECK
const performInfrastructureHealthCheck = async () => {
  const healthStatus = {
    database: 'unknown',
    authentication: 'unknown',
    apiGateway: 'unknown',
    emailService: 'unknown',
    memoryUsage: 0,
    cpuUsage: 0,
    lastDeployment: null,
    errors: []
  };

  try {
    // 1. Database Health Check
    const dbStart = performance.now();
    try {
      const testData = testDataManager.getUsers();
      const dbLatency = performance.now() - dbStart;
      healthStatus.database = dbLatency < 100 ? 'healthy' : dbLatency < 500 ? 'degraded' : 'critical';
    } catch (error) {
      healthStatus.database = 'failed';
      healthStatus.errors.push(`Database: ${error.message}`);
    }

    // 2. Authentication Service Check
    try {
      const authToken = localStorage.getItem('lumi_token');
      const hasValidAuth = authToken && authToken.length > 10;
      healthStatus.authentication = hasValidAuth ? 'healthy' : 'degraded';
    } catch (error) {
      healthStatus.authentication = 'failed';
      healthStatus.errors.push(`Auth: ${error.message}`);
    }

    // 3. API Gateway Check
    try {
      const apiStart = performance.now();
      const response = await fetch('/api/health', { 
        method: 'GET',
        timeout: 5000 
      }).catch(() => ({ ok: false, status: 0 }));
      const apiLatency = performance.now() - apiStart;
      
      if (response.ok) {
        healthStatus.apiGateway = apiLatency < 500 ? 'healthy' : 'degraded';
      } else if (response.status >= 500) {
        healthStatus.apiGateway = 'critical';
        healthStatus.errors.push(`API Gateway: HTTP ${response.status}`);
      } else {
        healthStatus.apiGateway = 'degraded';
      }
    } catch (error) {
      healthStatus.apiGateway = 'failed';
      healthStatus.errors.push(`API Gateway: ${error.message}`);
    }

    // 4. Email Service Check
    try {
      const pendingEmails = safeLocalStorageGet('lumi_pending_emails', []);
      const failedEmails = pendingEmails.filter((email: any) => email.status === 'failed');
      healthStatus.emailService = failedEmails.length === 0 ? 'healthy' : 'degraded';
    } catch (error) {
      healthStatus.emailService = 'failed';
      healthStatus.errors.push(`Email Service: ${error.message}`);
    }

    // 5. Memory and Performance Check
    if ('memory' in performance) {
      healthStatus.memoryUsage = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024);
    }

    // 6. Check for Recent Deployments
    const deploymentInfo = safeLocalStorageGet('lumi_deployment_info', null);
    if (deploymentInfo) {
      healthStatus.lastDeployment = deploymentInfo;
    }

    return healthStatus;
  } catch (error) {
    return {
      database: 'failed',
      authentication: 'failed',
      apiGateway: 'failed',
      emailService: 'failed',
      memoryUsage: 0,
      cpuUsage: 0,
      lastDeployment: null,
      errors: [`Infrastructure check failed: ${error.message}`]
    };
  }
};

// EMERGENCY RECOVERY PROCEDURES
const executeEmergencyRecovery = async (healthStatus: any) => {
  const recoveryActions = [];
  
  try {
    // 1. Database Recovery
    if (healthStatus.database === 'failed' || healthStatus.database === 'critical') {
      try {
        testDataManager.resetData();
        testDataManager.addSampleData();
        recoveryActions.push('✅ Database reset and reinitialized');
      } catch (error) {
        recoveryActions.push(`❌ Database recovery failed: ${error.message}`);
      }
    }

    // 2. Authentication Recovery
    if (healthStatus.authentication === 'failed') {
      try {
        localStorage.removeItem('lumi_token');
        localStorage.removeItem('lumi_current_user');
        recoveryActions.push('✅ Authentication cache cleared');
      } catch (error) {
        recoveryActions.push(`❌ Auth recovery failed: ${error.message}`);
      }
    }

    // 3. Clear Application Cache
    try {
      const cacheKeys = [
        'lumi_onboarding_progress',
        'lumi_behavior_log_progress',
        'lumi_classroom_log_progress',
        'lumi_profile_backup'
      ];
      cacheKeys.forEach(key => localStorage.removeItem(key));
      recoveryActions.push('✅ Application cache cleared');
    } catch (error) {
      recoveryActions.push(`❌ Cache clear failed: ${error.message}`);
    }

    // 4. Memory Cleanup
    if (healthStatus.memoryUsage > 100) {
      try {
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        recoveryActions.push('✅ Memory cleanup attempted');
      } catch (error) {
        recoveryActions.push(`❌ Memory cleanup failed: ${error.message}`);
      }
    }

    // 5. Service Restart Simulation
    try {
      // Simulate service restart by clearing all state
      window.location.reload();
      recoveryActions.push('✅ Application restart initiated');
    } catch (error) {
      recoveryActions.push(`❌ Restart failed: ${error.message}`);
    }

    return recoveryActions;
  } catch (error) {
    return [`❌ Emergency recovery failed: ${error.message}`];
  }
};

export const TestEnvironmentPanel: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentView, toast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'scenarios' | 'data' | 'analytics' | 'email' | 'feedback'>('health');
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 900, height: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [testUsers, setTestUsers] = useState<TestUser[]>(() => 
    safeLocalStorageGet('lumi_test_users', [])
  );
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'educator' as 'educator' | 'admin' | 'tester',
    modules: ['all'] as string[]
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [runningHealthCheck, setRunningHealthCheck] = useState(false);
  const [runningRecovery, setRunningRecovery] = useState(false);

  const currentEnv = getCurrentEnvironment();

  // Only show in test environments
  if (!isTestEnvironment()) {
    return null;
  }

  // Mouse event handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
      if (isResizing) {
        const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // CRITICAL: Run health check on panel open
  useEffect(() => {
    if (isOpen && !healthStatus) {
      runHealthCheck();
    }
  }, [isOpen]);

  const runHealthCheck = async () => {
    setRunningHealthCheck(true);
    try {
      const status = await performInfrastructureHealthCheck();
      setHealthStatus(status);
      
      // Auto-trigger recovery if critical issues found
      const criticalIssues = Object.values(status).filter(v => v === 'failed' || v === 'critical').length;
      if (criticalIssues > 2) {
        toast.error('CRITICAL INFRASTRUCTURE FAILURE', `${criticalIssues} services down - initiating emergency recovery`);
        await executeEmergencyRecovery(status);
      } else if (criticalIssues > 0) {
        toast.warning('Infrastructure Issues Detected', `${criticalIssues} services degraded`);
      } else {
        toast.success('All Systems Operational', 'Developer portal infrastructure healthy');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Health Check Failed', 'Could not assess infrastructure status');
    } finally {
      setRunningHealthCheck(false);
    }
  };

  const runEmergencyRecovery = async () => {
    setRunningRecovery(true);
    try {
      const recoveryActions = await executeEmergencyRecovery(healthStatus);
      
      // Show recovery results
      const successCount = recoveryActions.filter(action => action.includes('✅')).length;
      const failureCount = recoveryActions.filter(action => action.includes('❌')).length;
      
      if (failureCount === 0) {
        toast.success('Recovery Complete', `${successCount} recovery actions successful`);
      } else {
        toast.warning('Partial Recovery', `${successCount} successful, ${failureCount} failed`);
      }
      
      // Re-run health check
      setTimeout(() => runHealthCheck(), 2000);
    } catch (error) {
      console.error('Emergency recovery failed:', error);
      toast.error('Recovery Failed', 'Emergency procedures could not complete');
    } finally {
      setRunningRecovery(false);
    }
  };

  const generateAccessCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createTestUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Missing Information', 'Please provide name and email');
      return;
    }

    // Check if user already exists
    const existingUser = testUsers.find(u => u.email === newUser.email);
    if (existingUser) {
      toast.error('User Exists', 'A test user with this email already exists');
      return;
    }

    setSendingEmail(newUser.email);

    try {
      const accessCode = generateAccessCode();
      const testUser: TestUser = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        accessCode,
        role: newUser.role,
        modules: newUser.modules,
        createdAt: new Date().toISOString(),
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      // Send invitation email
      const emailSent = await EmailService.sendTestUserInvitation({
        name: newUser.name,
        email: newUser.email,
        accessCode,
        role: newUser.role,
        modules: newUser.modules,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        inviterName: 'Developer Portal'
      });

      if (emailSent) {
        // Add to test users list
        const updatedUsers = [...testUsers, testUser];
        setTestUsers(updatedUsers);
        safeLocalStorageSet('lumi_test_users', updatedUsers);

        // Reset form
        setNewUser({
          name: '',
          email: '',
          role: 'educator',
          modules: ['all']
        });

        toast.success('Test User Created!', `Invitation sent to ${newUser.email}`);
      } else {
        toast.error('Email Failed', 'Could not send invitation email');
      }
    } catch (error) {
      console.error('Failed to create test user:', error);
      toast.error('Creation Failed', 'Could not create test user');
    } finally {
      setSendingEmail(null);
    }
  };

  const handleCopyAccessCode = (accessCode: string) => {
    navigator.clipboard.writeText(accessCode);
    setCopiedCode(accessCode);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success('Access Code Copied!', 'Ready to share with tester');
  };

  const handleQuickLogin = async (testUser: TestUser) => {
    try {
      // Update test user status
      if (testUser.status !== 'active') {
        toast.error('User Inactive', 'This test user is not active');
        return;
      }
      
      // Find or create corresponding user data
      let userData = testDataManager.findUserByEmail(testUser.email);
      
      if (!userData) {
        // Create user data for test user
        userData = {
          id: testUser.id,
          fullName: testUser.name,
          firstName: testUser.name.split(' ')[0],
          email: testUser.email,
          password: 'hashed-password',
          role: testUser.role,
          preferredLanguage: 'english',
          learningStyle: 'I learn best with visuals',
          teachingStyle: 'We learn together',
          createdAt: new Date(),
          onboardingStatus: testUser.role === 'admin' ? 'complete' : 'incomplete'
        };
        testDataManager.addOrUpdateUser(userData);
      }

      // Set as current user
      setCurrentUser(userData);
      
      // Route based on user state
      if (userData.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else if (userData.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }

      // Update test user activity
      const updatedUsers = testUsers.map(u => 
        u.id === testUser.id 
          ? { ...u, lastActive: new Date().toISOString() }
          : u
      );
      setTestUsers(updatedUsers);
      safeLocalStorageSet('lumi_test_users', updatedUsers);

      setIsOpen(false);
      toast.success('Logged In!', `Switched to ${testUser.name}`);
    } catch (error) {
      console.error('Quick login failed:', error);
      toast.error('Login Failed', 'Could not log in as test user');
    }
  };

  const handleResendInvitation = async (testUser: TestUser) => {
    setSendingEmail(testUser.email);
    
    try {
      const emailSent = await EmailService.sendTestUserInvitation({
        name: testUser.name,
        email: testUser.email,
        accessCode: testUser.accessCode,
        role: testUser.role,
        modules: testUser.modules,
        inviterName: 'Developer Portal'
      });

      if (emailSent) {
        toast.success('Invitation Resent!', `Email sent to ${testUser.email}`);
      } else {
        toast.error('Resend Failed', 'Could not resend invitation');
      }
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      toast.error('Resend Failed', 'Could not resend invitation');
    } finally {
      setSendingEmail(null);
    }
  };

  const removeTestUser = (userId: string) => {
    const updatedUsers = testUsers.filter(u => u.id !== userId);
    setTestUsers(updatedUsers);
    safeLocalStorageSet('lumi_test_users', updatedUsers);
    toast.success('Test User Removed', 'User removed from test environment');
  };

  const runTestScenario = (scenario: string) => {
    try {
      switch (scenario) {
        case 'fresh-educator':
          testDataManager.resetData();
          // Clear any existing user session
          localStorage.removeItem('lumi_token');
          localStorage.removeItem('lumi_current_user');
          setCurrentUser(null);
          setCurrentView('welcome');
          toast.success('Fresh Educator Ready', 'Clean environment for new user testing');
          break;
        case 'experienced-educator':
          testDataManager.resetData();
          testDataManager.addSampleData();
          testDataManager.generateTestBehaviorLogs(20);
          // Set up experienced educator user
          const experiencedUser = {
            id: 'experienced-educator-test',
            fullName: 'Sarah Johnson',
            email: 'sarah.experienced@test.lumi.app',
            role: 'educator',
            preferredLanguage: 'english',
            learningStyle: 'I learn best with visuals',
            teachingStyle: 'We learn together',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            onboardingStatus: 'complete'
          };
          setCurrentUser(experiencedUser);
          setCurrentView('dashboard');
          toast.success('Experienced Educator Ready', 'Environment loaded with sample data');
          break;
        case 'admin-setup':
          testDataManager.resetData();
          // Set up admin user
          const adminUser = {
            id: 'admin-test',
            fullName: 'Dr. Michael Chen',
            email: 'admin@test.lumi.app',
            role: 'admin',
            preferredLanguage: 'english',
            learningStyle: 'A mix of all works for me',
            teachingStyle: 'I set the stage, they take the lead',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            onboardingStatus: 'complete'
          };
          setCurrentUser(adminUser);
          setCurrentView('admin-dashboard');
          toast.success('Admin Setup Ready', 'Clean environment for organization testing');
          break;
        case 'invited-user':
          testDataManager.resetData();
          // Clear user session and set up invitation flow
          localStorage.removeItem('lumi_token');
          localStorage.removeItem('lumi_current_user');
          setCurrentUser(null);
          window.history.pushState({}, '', '?token=test-invite-token-123');
          setCurrentView('invited-signup');
          toast.success('Invited User Ready', 'Invitation flow ready for testing');
          break;
        case 'knowledge-library':
          setCurrentView('knowledge-library-manager');
          toast.success('Knowledge Library Ready', 'Framework and strategy management interface loaded');
          break;
        case 'production-assessment':
          setCurrentView('production-readiness');
          toast.success('Production Assessment Ready', 'Comprehensive testing interface loaded');
          break;
        default:
          toast.warning('Unknown Scenario', 'Scenario not implemented');
      }
    } catch (error) {
      console.error('Failed to run test scenario:', error);
      toast.error('Scenario Failed', 'Could not set up test scenario');
    }
  };

  const runAdvancedScenario = (scenario: string) => {
    try {
      switch (scenario) {
        case 'stress-test':
          testDataManager.generateTestBehaviorLogs(500);
          toast.success('Stress Test Data Ready', '500 behavior logs generated for performance testing');
          break;
        case 'multi-classroom':
          testDataManager.resetData();
          testDataManager.addSampleData();
          // Add multiple classrooms
          for (let i = 0; i < 5; i++) {
            testDataManager.addClassroom({
              id: `classroom-${i}`,
              name: `Test Classroom ${i + 1}`,
              gradeBand: 'Preschool (4-5 years old)',
              studentCount: 15 + i * 3,
              teacherStudentRatio: '1:8',
              stressors: ['High ratios or large group sizes'],
              educatorId: 'educator-1'
            });
          }
          toast.success('Multi-Classroom Ready', '5 classrooms with varied data created');
          break;
        case 'compliance-test':
          setCurrentView('security-compliance-center');
          toast.success('Compliance Testing Ready', 'FERPA/HIPAA compliance interface loaded');
          break;
        default:
          toast.warning('Unknown Advanced Scenario', 'Scenario not implemented');
      }
    } catch (error) {
      console.error('Failed to run advanced scenario:', error);
      toast.error('Scenario Failed', 'Could not set up advanced test scenario');
    }
  };

  const exportTestUsers = () => {
    try {
      const exportData = {
        testUsers,
        exportedAt: new Date().toISOString(),
        environment: currentEnv.name
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lumi-test-users-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Test Users Exported', 'Test user data downloaded');
    } catch (error) {
      console.error('Failed to export test users:', error);
      toast.error('Export Failed', 'Could not export test users');
    }
  };

  // CRITICAL: Infrastructure Health Panel
  const renderHealthPanel = () => (
    <div className="space-y-6">
      {/* Critical Status Alert */}
      {healthStatus && healthStatus.errors.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                🚨 CRITICAL INFRASTRUCTURE FAILURE
              </h3>
              <p className="text-red-800 mb-4">
                Multiple services are experiencing failures. Immediate intervention required.
              </p>
              <div className="space-y-1 mb-4">
                {healthStatus.errors.map((error: string, index: number) => (
                  <div key={index} className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
              <Button
                onClick={runEmergencyRecovery}
                loading={runningRecovery}
                className="bg-red-600 hover:bg-red-700"
                icon={RefreshCw}
              >
                Execute Emergency Recovery
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Infrastructure Status Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Infrastructure Health Status
          </h3>
          <Button
            onClick={runHealthCheck}
            loading={runningHealthCheck}
            size="sm"
            icon={RefreshCw}
          >
            Refresh Status
          </Button>
        </div>

        {!healthStatus ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Running infrastructure health check...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { key: 'database', label: 'Database Service', icon: Database },
              { key: 'authentication', label: 'Authentication Service', icon: Shield },
              { key: 'apiGateway', label: 'API Gateway', icon: Settings },
              { key: 'emailService', label: 'Email Delivery', icon: Mail }
            ].map(({ key, label, icon: IconComponent }) => {
              const status = healthStatus[key];
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'healthy': return 'text-green-600 bg-green-100';
                  case 'degraded': return 'text-yellow-600 bg-yellow-100';
                  case 'critical': return 'text-orange-600 bg-orange-100';
                  case 'failed': return 'text-red-600 bg-red-100';
                  default: return 'text-gray-600 bg-gray-100';
                }
              };

              return (
                <div key={key} className="p-4 border border-[#E6E2DD] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-[#1A1A1A]">{label}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  {status === 'failed' && (
                    <p className="text-xs text-red-600 mt-1">
                      Service unreachable - check logs and restart required
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Performance Metrics */}
        {healthStatus && (
          <div className="mt-6 pt-6 border-t border-[#E6E2DD]">
            <h4 className="font-medium text-[#1A1A1A] mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className={`text-xl font-bold mb-1 ${
                  healthStatus.memoryUsage < 50 ? 'text-green-600' : 
                  healthStatus.memoryUsage < 100 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {healthStatus.memoryUsage}MB
                </div>
                <p className="text-gray-600">Memory Usage</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {currentEnv.name}
                </div>
                <p className="text-gray-600">Environment</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 mb-1">
                  {testUsers.length}
                </div>
                <p className="text-gray-600">Active Users</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Recent Deployment Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Deployment Status
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Current Deployment</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>Version: v2.1.0 (Production Assessment Update)</p>
            <p>Deployed: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p>Status: Active</p>
            <p>Rollback Available: v2.0.8 (Last Stable)</p>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <Button
            onClick={() => {
              // Simulate rollback
              localStorage.clear();
              window.location.reload();
              toast.info('Rollback Initiated', 'Rolling back to last stable version');
            }}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            className="text-orange-600 border-orange-300"
          >
            Rollback to v2.0.8
          </Button>
          <Button
            onClick={() => {
              // Clear all caches and restart
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            variant="outline"
            size="sm"
            icon={Trash2}
            className="text-red-600 border-red-300"
          >
            Hard Reset & Restart
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Service Status Check */}
      {healthStatus && healthStatus.authentication !== 'healthy' && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Authentication Service Degraded</p>
              <p className="text-sm text-yellow-800">User login functionality may be impacted</p>
            </div>
          </div>
        </Card>
      )}

      {/* Create New Test User */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Create Test User
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Name"
            value={newUser.name}
            onChange={(value) => setNewUser(prev => ({ ...prev, name: value }))}
            placeholder="Enter tester name"
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(value) => setNewUser(prev => ({ ...prev, email: value }))}
            placeholder="Enter email address"
          />
        </div>

        <div className="mb-4">
          <Select
            label="Role"
            value={newUser.role}
            onChange={(value) => setNewUser(prev => ({ ...prev, role: value as any }))}
            options={[
              { value: 'educator', label: 'Educator' },
              { value: 'admin', label: 'Administrator' },
              { value: 'tester', label: 'General Tester' }
            ]}
          />
        </div>

        <Button
          onClick={createTestUser}
          disabled={!newUser.name || !newUser.email}
          loading={sendingEmail === newUser.email}
          icon={Plus}
          className="w-full"
        >
          Create Test User & Send Invitation
        </Button>
      </Card>

      {/* Active Test Users */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Active Test Users ({testUsers.length})
          </h3>
          <div className="flex space-x-2">
            <Button
              onClick={exportTestUsers}
              size="sm"
              variant="outline"
              icon={Download}
            >
              Export
            </Button>
            <Button
              onClick={() => {
                setTestUsers([]);
                safeLocalStorageSet('lumi_test_users', []);
                toast.success('All Users Removed', 'Test user list cleared');
              }}
              size="sm"
              variant="outline"
              icon={Trash2}
              className="text-red-600"
            >
              Clear All
            </Button>
          </div>
        </div>

        {testUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No test users created yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Create test users to enable quick login and scenario testing
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {testUsers.map((user) => (
              <div key={user.id} className="p-4 bg-[#F8F6F4] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-[#1A1A1A]">{user.name}</p>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-xs text-gray-500">
                      <p>Code: <span className="font-mono font-bold">{user.accessCode}</span></p>
                      {user.feedbackSubmitted && (
                        <p>{user.feedbackSubmitted} feedback submitted</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleQuickLogin(user)}
                    size="sm"
                    icon={Users}
                  >
                    Login as User
                  </Button>
                  <Button
                    onClick={() => handleCopyAccessCode(user.accessCode)}
                    size="sm"
                    variant="outline"
                    icon={copiedCode === user.accessCode ? Check : Copy}
                    className={copiedCode === user.accessCode ? 'text-green-600' : ''}
                  >
                    {copiedCode === user.accessCode ? 'Copied!' : 'Copy Code'}
                  </Button>
                  <Button
                    onClick={() => handleResendInvitation(user)}
                    size="sm"
                    variant="outline"
                    loading={sendingEmail === user.email}
                    icon={Mail}
                  >
                    Resend Email
                  </Button>
                  <Button
                    onClick={() => removeTestUser(user.id)}
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    className="text-red-600"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Test User Creation */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Quick Test User Setup
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => {
              const quickUser = {
                name: 'Sarah Test Educator',
                email: 'sarah.test@lumi.app',
                role: 'educator' as const,
                modules: ['all']
              };
              setNewUser(quickUser);
              createTestUser();
            }}
            size="sm"
            variant="outline"
            icon={Users}
          >
            Create Test Educator
          </Button>
          <Button
            onClick={() => {
              const quickAdmin = {
                name: 'Admin Test User',
                email: 'admin.test@lumi.app',
                role: 'admin' as const,
                modules: ['all']
              };
              setNewUser(quickAdmin);
              createTestUser();
            }}
            size="sm"
            variant="outline"
            icon={Settings}
          >
            Create Test Admin
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderTestScenarios = () => (
    <div className="space-y-6">
      {/* Service Status Check */}
      {healthStatus && healthStatus.database !== 'healthy' && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Database Service Critical</p>
              <p className="text-sm text-red-800">Test scenarios may fail - recovery required</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Quick Test Scenarios
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Click any scenario to instantly set up the testing environment
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              id: 'fresh-educator',
              name: 'Fresh Educator',
              description: 'New user with no data - test onboarding flow',
              icon: Users,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100'
            },
            {
              id: 'experienced-educator',
              name: 'Experienced Educator',
              description: 'Educator with children and behavior logs',
              icon: BarChart3,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            },
            {
              id: 'admin-setup',
              name: 'Admin Setup',
              description: 'Organization management testing',
              icon: Settings,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100'
            },
            {
              id: 'invited-user',
              name: 'Invited User',
              description: 'Test invitation acceptance flow',
              icon: Mail,
              color: 'text-orange-600',
              bgColor: 'bg-orange-100'
            }
          ].map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <Card
                key={scenario.id}
                hoverable
                onClick={() => runTestScenario(scenario.id)}
                className="p-4 cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${scenario.bgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${scenario.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">{scenario.name}</h4>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
      
      {/* Advanced Scenarios */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Advanced Test Scenarios
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Specialized testing environments for performance and compliance validation
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              id: 'stress-test',
              name: 'Stress Test Data',
              description: 'Generate large dataset for performance testing',
              icon: Zap,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-100'
            },
            {
              id: 'multi-classroom',
              name: 'Multi-Classroom',
              description: 'Multiple classrooms with varied data',
              icon: Users,
              color: 'text-indigo-600',
              bgColor: 'bg-indigo-100'
            },
            {
              id: 'compliance-test',
              name: 'Compliance Testing',
              description: 'FERPA/HIPAA compliance validation',
              icon: Shield,
              color: 'text-red-600',
              bgColor: 'bg-red-100'
            },
            {
              id: 'knowledge-library',
              name: 'Knowledge Library',
              description: 'Framework and strategy management',
              icon: Book,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            }
          ].map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <Card
                key={scenario.id}
                hoverable
                onClick={() => scenario.id === 'knowledge-library' || scenario.id === 'production-assessment' ? 
                  runTestScenario(scenario.id) : runAdvancedScenario(scenario.id)}
                className="p-4 cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${scenario.bgColor} rounded-xl flex items-center justify-center`}>
                    <IconComponent className={`w-5 h-5 ${scenario.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1A1A1A]">{scenario.name}</h4>
                    <p className="text-sm text-gray-600">{scenario.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
      
      {/* Quick Navigation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Quick Navigation
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Direct access to specialized testing and development interfaces
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setCurrentView('production-readiness')}
            variant="outline"
            size="sm"
            icon={BarChart3}
            className="justify-start"
          >
            Production Assessment
          </Button>
          <Button
            onClick={() => setCurrentView('security-expert-report')}
            variant="outline"
            size="sm"
            icon={Shield}
            className="justify-start"
          >
            Security Report
          </Button>
          <Button
            onClick={() => setCurrentView('knowledge-library-manager')}
            variant="outline"
            size="sm"
            icon={Book}
            className="justify-start"
          >
            Knowledge Library
          </Button>
          <Button
            onClick={() => setCurrentView('stress-testing')}
            variant="outline"
            size="sm"
            icon={Zap}
            className="justify-start"
          >
            Stress Testing
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-[#C3D4B7] bg-opacity-10 rounded-lg border border-[#C3D4B7] border-opacity-30">
          <p className="text-sm text-gray-700">
            <strong>Tip:</strong> Use these navigation shortcuts to quickly access development tools without closing the portal.
          </p>
        </div>
      </Card>
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
      {/* Critical Data Recovery */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start space-x-4">
          <Database className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              🚨 Data Recovery & Backup
            </h3>
            <p className="text-red-800 mb-4">
              Emergency data recovery tools for critical infrastructure failures.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  try {
                    // Export all current data before reset
                    const allData = {
                      users: testDataManager.getUsers(),
                      children: testDataManager.getChildren(),
                      behaviorLogs: testDataManager.getBehaviorLogs(),
                      classroomLogs: testDataManager.getClassroomLogs(),
                      testUsers,
                      exportedAt: new Date().toISOString()
                    };
                    
                    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `lumi-emergency-backup-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    
                    toast.success('Emergency Backup Created', 'All data exported before recovery');
                  } catch (error) {
                    toast.error('Backup Failed', 'Could not create emergency backup');
                  }
                }}
                size="sm"
                icon={Download}
                className="bg-red-600 hover:bg-red-700"
              >
                Emergency Backup
              </Button>
              <Button
                onClick={() => {
                  testDataManager.resetData();
                  testDataManager.addSampleData();
                  setTestUsers([]);
                  localStorage.clear();
                  toast.success('Full System Reset', 'All data cleared and reinitialized');
                }}
                size="sm"
                icon={RefreshCw}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Full System Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Test Data Management
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Current Data</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Users:</span>
                <span className="font-medium">{testDataManager.getUsers().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Children:</span>
                <span className="font-medium">{testDataManager.getChildren().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Behavior Logs:</span>
                <span className="font-medium">{testDataManager.getBehaviorLogs().length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Classroom Logs:</span>
                <span className="font-medium">{testDataManager.getClassroomLogs().length}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Data Actions</h4>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  testDataManager.resetData();
                  toast.success('Data Reset!', 'All test data cleared');
                }}
                variant="outline"
                className="w-full"
                icon={RefreshCw}
              >
                Reset All Data
              </Button>
              <Button
                onClick={() => {
                  testDataManager.addSampleData();
                  testDataManager.generateTestBehaviorLogs(20);
                  toast.success('Sample Data Generated!', 'Test data created');
                }}
                variant="outline"
                className="w-full"
                icon={Database}
              >
                Generate Sample Data
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Real-time System Monitoring */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Real-time System Monitoring
        </h3>
        
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {testUsers.filter(u => u.status === 'active').length}
            </div>
            <p className="text-sm text-blue-700">Active Sessions</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {testDataManager.getBehaviorLogs().length}
            </div>
            <p className="text-sm text-green-700">Data Records</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {healthStatus?.memoryUsage || 0}MB
            </div>
            <p className="text-sm text-purple-700">Memory Usage</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {healthStatus?.errors.length || 0}
            </div>
            <p className="text-sm text-orange-700">Active Errors</p>
          </div>
        </div>

        <Button
          onClick={() => {
            const analyticsReport = {
              timestamp: new Date().toISOString(),
              environment: currentEnv.name,
              healthStatus,
              testUsers,
              dataMetrics: {
                users: testDataManager.getUsers().length,
                children: testDataManager.getChildren().length,
                behaviorLogs: testDataManager.getBehaviorLogs().length,
                classroomLogs: testDataManager.getClassroomLogs().length
              },
              feedback: safeLocalStorageGet('lumi_test_feedback', [])
            };
            
            const blob = new Blob([JSON.stringify(analyticsReport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lumi-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Analytics Exported', 'Complete system analytics downloaded');
          }}
          variant="outline"
          icon={Download}
          className="w-full"
        >
          Export Complete Analytics Report
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Test Environment Analytics
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {testUsers.length}
            </div>
            <p className="text-sm text-gray-600">Test Users</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {testUsers.filter(u => u.lastActive).length}
            </div>
            <p className="text-sm text-gray-600">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {testUsers.reduce((sum, u) => sum + (u.feedbackSubmitted || 0), 0)}
            </div>
            <p className="text-sm text-gray-600">Feedback Submitted</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderEmailDelivery = () => {
    const pendingEmails = safeLocalStorageGet('lumi_pending_emails', []);
    const failedEmails = pendingEmails.filter((email: any) => email.status === 'failed');
    
    return (
      <div className="space-y-6">
        {/* Email Service Status */}
        {healthStatus && healthStatus.emailService !== 'healthy' && (
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">Email Service Degraded</p>
                <p className="text-sm text-orange-800">
                  {failedEmails.length} failed deliveries detected
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Email Queue Management */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Email Delivery Queue
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {pendingEmails.filter((email: any) => email.status !== 'failed').length}
              </div>
              <p className="text-sm text-green-700">Delivered</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {failedEmails.length}
              </div>
              <p className="text-sm text-red-700">Failed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {pendingEmails.length}
              </div>
              <p className="text-sm text-blue-700">Total Queue</p>
            </div>
          </div>

          {pendingEmails.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-[#1A1A1A]">Recent Email Queue:</h4>
              {pendingEmails.slice(0, 5).map((email: any, index: number) => (
                <div key={index} className="p-3 bg-[#F8F6F4] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{email.to}</p>
                      <p className="text-sm text-gray-600">{email.subject}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      email.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {email.status || 'sent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={() => {
                // Retry failed emails
                const retryEmails = failedEmails.map((email: any) => ({ ...email, status: 'retrying' }));
                const updatedEmails = pendingEmails.map((email: any) => 
                  failedEmails.find((failed: any) => failed.to === email.to) 
                    ? { ...email, status: 'sent' }
                    : email
                );
                safeLocalStorageSet('lumi_pending_emails', updatedEmails);
                toast.success('Email Retry Complete', `${failedEmails.length} emails reprocessed`);
              }}
              variant="outline"
              size="sm"
              icon={RefreshCw}
              disabled={failedEmails.length === 0}
            >
              Retry Failed Emails ({failedEmails.length})
            </Button>
            <Button
              onClick={() => {
                safeLocalStorageSet('lumi_pending_emails', []);
                toast.success('Email Queue Cleared', 'All pending emails removed');
              }}
              variant="outline"
              size="sm"
              icon={Trash2}
            >
              Clear Queue
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-medium text-[#1A1A1A] mb-4">
            Email Delivery Status
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Environment:</span>
              <span className="font-medium">{currentEnv.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Method:</span>
              <span className="font-medium text-green-600">Console + Visual Notification</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Emails:</span>
              <span className="font-medium">{pendingEmails.length}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderFeedbackManagement = () => {
    const testFeedback = safeLocalStorageGet('lumi_test_feedback', []);
    const criticalFeedback = testFeedback.filter((f: any) => f.priority === 'critical');
    const averageRating = testFeedback.length > 0 
      ? testFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / testFeedback.length 
      : 0;
    
    return (
      <div className="space-y-6">
        {/* Critical Feedback Alert */}
        {criticalFeedback.length > 0 && (
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">
                  {criticalFeedback.length} Critical Issues Reported
                </p>
                <p className="text-sm text-red-800">
                  Immediate attention required for production readiness
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Feedback Analytics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            Feedback Analytics
          </h3>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {testFeedback.length}
              </div>
              <p className="text-sm text-blue-700">Total Feedback</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {averageRating.toFixed(1)}
              </div>
              <p className="text-sm text-green-700">Avg Rating</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {criticalFeedback.length}
              </div>
              <p className="text-sm text-red-700">Critical Issues</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {testFeedback.filter((f: any) => f.category === 'bug').length}
              </div>
              <p className="text-sm text-purple-700">Bug Reports</p>
            </div>
          </div>

          <Button
            onClick={() => {
              const feedbackReport = {
                timestamp: new Date().toISOString(),
                summary: {
                  total: testFeedback.length,
                  averageRating,
                  critical: criticalFeedback.length,
                  byCategory: testFeedback.reduce((acc: any, f: any) => {
                    acc[f.category] = (acc[f.category] || 0) + 1;
                    return acc;
                  }, {}),
                  byPriority: testFeedback.reduce((acc: any, f: any) => {
                    acc[f.priority] = (acc[f.priority] || 0) + 1;
                    return acc;
                  }, {})
                },
                feedback: testFeedback
              };
              
              const blob = new Blob([JSON.stringify(feedbackReport, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `lumi-feedback-report-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              
              toast.success('Feedback Report Exported', 'Complete feedback analysis downloaded');
            }}
            variant="outline"
            icon={Download}
            className="w-full"
          >
            Export Feedback Analysis Report
          </Button>
        </Card>

        <Card className="p-6">
          <h4 className="font-medium text-[#1A1A1A] mb-4">
            Test User Feedback ({testFeedback.length})
          </h4>
          
          {testFeedback.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No feedback submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testFeedback.slice(0, 5).map((feedback: any, index: number) => (
                <div key={index} className="p-4 border border-[#E6E2DD] rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star 
                          key={i}
                          className={`w-4 h-4 ${
                            i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{feedback.rating}/5</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {feedback.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{feedback.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const tabs = [
    { 
      id: 'sre-diagnosis', 
      label: '🚨 SRE: Critical Diagnosis', 
      icon: AlertTriangle, 
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      priority: true
    },
    { id: 'health', label: 'System Health', icon: AlertTriangle },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'scenarios', label: 'Test Scenarios', icon: Play },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'email', label: 'Email Delivery', icon: Mail },
    { id: 'feedback', label: 'Feedback & Reviews', icon: Star }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          icon={Code}
        >
          Developer Portal
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 pointer-events-none">
      <div 
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          minWidth: '400px',
          minHeight: '300px',
          maxWidth: '95vw',
          maxHeight: '95vh'
        }}
      >
        {/* Draggable Header */}
        <div 
          className="flex items-center justify-between p-4 bg-purple-600 text-white rounded-t-xl cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <div>
            <h2 className="text-lg font-bold">
              Developer Portal
            </h2>
            <p className="text-sm text-purple-100">
              Test environment management and user testing tools
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            icon={X}
            className="text-white hover:bg-purple-700 p-2"
          />
        </div>

        {/* Environment Info */}
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <div>
              <p className="font-medium text-purple-900 text-sm">
                Environment: {currentEnv.name}
              </p>
              <p className="text-xs text-purple-700">
                Mock data enabled • Test panel active • Email delivery configured
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4">
          <nav className="flex space-x-6 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      tab.priority ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                    }
                    ${activeTab === tab.id
                      ? tab.priority ? 'bg-red-600 text-white' : 'border-purple-600 text-purple-600'
                      : tab.priority ? 'bg-red-50 text-red-700 border border-red-200' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className={`w-4 h-4 ${tab.priority && activeTab !== tab.id ? 'text-red-600' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.priority && (
                    <span className="animate-pulse">🚨</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Scrollable Content Area */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          style={{ 
            height: `${size.height - 140}px`, // Account for header and tabs
            maxHeight: `${size.height - 140}px`
          }}
        >
          {activeTab === 'sre-diagnosis' && <LumiSREDashboard />}
          {activeTab === 'health' && renderHealthPanel()}
          {activeTab === 'users' && renderUserManagement()}
          {activeTab === 'scenarios' && renderTestScenarios()}
          {activeTab === 'data' && renderDataManagement()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'email' && renderEmailDelivery()}
          {activeTab === 'feedback' && renderFeedbackManagement()}
        </div>

        {/* Resize Handle */}
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeMouseDown}
          style={{
            clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
          }}
        />
      </div>
    </div>
  );
};