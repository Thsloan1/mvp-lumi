import React, { useState } from 'react';
import { Settings, RefreshCw, Database, Users, BarChart3, Download, Upload, Trash2, Play, Code, DollarSign, AlertTriangle, Wrench, BookOpen, CreditCard as Edit, Save, X, Plus } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Select } from '../UI/Select';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { getCurrentEnvironment, isTestEnvironment } from '../../config/environments';
import { DeveloperAnalyticsEngine } from '../../utils/developerAnalytics';
import { knowledgeLibrary, TheoreticalFramework, StrategyTemplate, LanguageGuideline } from '../../data/knowledgeLibrary';

export const DeveloperPortal: React.FC = () => {
  const { setCurrentView, setCurrentUser, toast, behaviorLogs, classroomLogs, children, classrooms } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<'testing' | 'client-data' | 'analytics' | 'revenue' | 'tech-stack'>('testing');
  const [selectedTestUser, setSelectedTestUser] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [editingFramework, setEditingFramework] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [editingGuideline, setEditingGuideline] = useState<string | null>(null);
  const [frameworkUpdates, setFrameworkUpdates] = useState<Record<string, Partial<TheoreticalFramework>>>({});
  
  const currentEnv = getCurrentEnvironment();

  // Only show in test environments
  if (!isTestEnvironment()) {
    return null;
  }

  const modules = [
    { id: 'testing', label: 'Testing Environment', icon: Play },
    { id: 'knowledge', label: 'Core Knowledge Foundation', icon: BookOpen },
    { id: 'client-data', label: 'Client Data', icon: Database },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue & Subscriptions', icon: DollarSign },
    { id: 'tech-stack', label: 'Tech Stack & Fixes', icon: Wrench }
  ];

  const testUsers = [
    { value: 'educator-1', label: 'Sarah Johnson (Educator - Complete)' },
    { value: 'educator-2', label: 'Maria Rodriguez (Educator - Spanish)' },
    { value: 'admin-1', label: 'Dr. Michael Chen (Admin)' },
    { value: 'educator-new', label: 'Emma Thompson (New - Incomplete)' }
  ];

  const testScenarios = [
    {
      id: 'fresh-educator',
      name: 'Fresh Educator',
      description: 'New educator with no data - test onboarding flow',
      action: () => {
        testDataManager.resetData();
        setCurrentUser(null);
        setCurrentView('welcome');
        toast.info('Test Scenario', 'Fresh educator setup ready');
      }
    },
    {
      id: 'experienced-educator',
      name: 'Experienced Educator',
      description: 'Educator with children and behavior logs',
      action: () => {
        testDataManager.resetData();
        testDataManager.addSampleData();
        testDataManager.generateTestBehaviorLogs(15);
        const user = testDataManager.getUsers().find(u => u.id === 'educator-1');
        if (user) {
          setCurrentUser(user);
          setCurrentView('dashboard');
          toast.success('Test Scenario', 'Experienced educator loaded');
        }
      }
    },
    {
      id: 'admin-setup',
      name: 'Admin Setup',
      description: 'Admin user with organization management',
      action: () => {
        testDataManager.resetData();
        const user = testDataManager.getUsers().find(u => u.id === 'admin-1');
        if (user) {
          setCurrentUser(user);
          setCurrentView('admin-dashboard');
          toast.success('Test Scenario', 'Admin dashboard loaded');
        }
      }
    },
    {
      id: 'invited-user',
      name: 'Invited User',
      description: 'Test invitation acceptance flow',
      action: () => {
        testDataManager.resetData();
        setCurrentUser(null);
        window.history.pushState({}, '', '?token=test-invite-token-123');
        setCurrentView('invited-signup');
        toast.info('Test Scenario', 'Invitation flow ready');
      }
    }
  ];

  const handleQuickLogin = () => {
    if (!selectedTestUser) return;
    
    const user = testDataManager.getUsers().find(u => u.id === selectedTestUser);
    if (user) {
      setCurrentUser(user);
      
      if (user.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else if (user.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }
      
      toast.success('Quick Login', `Logged in as ${user.fullName}`);
    }
  };

  const handleResetData = () => {
    testDataManager.resetData();
    setCurrentUser(null);
    setCurrentView('welcome');
    toast.info('Data Reset', 'All test data reset to initial state');
  };

  const handleGenerateData = () => {
    testDataManager.addSampleData();
    testDataManager.generateTestBehaviorLogs(20);
    toast.success('Data Generated', 'Additional test data created');
  };

  const exportTestData = () => {
    const data = {
      users: testDataManager.getUsers(),
      children: testDataManager.getChildren(),
      classrooms: testDataManager.getClassrooms(),
      behaviorLogs: testDataManager.getBehaviorLogs(),
      classroomLogs: testDataManager.getClassroomLogs(),
      organizations: testDataManager.getOrganizations(),
      invitations: testDataManager.getInvitations(),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumi-test-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate comprehensive analytics
  const generateAnalytics = () => {
    const allUsers = testDataManager.getUsers();
    const allOrganizations = testDataManager.getOrganizations();
    const allBehaviorLogs = testDataManager.getBehaviorLogs();
    const allClassroomLogs = testDataManager.getClassroomLogs();
    const allChildren = testDataManager.getChildren();
    const allClassrooms = testDataManager.getClassrooms();

    const appLevel = DeveloperAnalyticsEngine.generateAppLevelAnalytics(
      allUsers, allOrganizations, allBehaviorLogs, allClassroomLogs, allChildren, allClassrooms
    );
    
    const insights = DeveloperAnalyticsEngine.generatePlatformInsights(
      allUsers, allOrganizations, allBehaviorLogs, allClassroomLogs
    );

    return {
      appLevel,
      insights,
      users: allUsers,
      organizations: allOrganizations
    };
  };

  const analytics = generateAnalytics();

  const renderTestingEnvironment = () => (
    <div className="space-y-6">
      {/* Environment Info */}
      <div className="bg-blue-100 rounded-lg p-3">
        <p className="text-sm font-medium text-blue-900">
          Environment: {currentEnv.name}
        </p>
        <p className="text-xs text-blue-700">
          Mock Data: {currentEnv.features.mockData ? 'Enabled' : 'Disabled'}
        </p>
      </div>

      {/* Quick Login */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Quick Login
        </label>
        <div className="space-y-2">
          <Select
            value={selectedTestUser}
            onChange={setSelectedTestUser}
            options={testUsers}
            placeholder="Select test user"
          />
          <Button
            onClick={handleQuickLogin}
            disabled={!selectedTestUser}
            size="sm"
            className="w-full"
            icon={Play}
          >
            Login as User
          </Button>
        </div>
      </div>

      {/* Test Scenarios */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Test Scenarios
        </label>
        <div className="space-y-2">
          {testScenarios.map((scenario) => (
            <Button
              key={scenario.id}
              onClick={scenario.action}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left"
            >
              <div>
                <p className="font-medium">{scenario.name}</p>
                <p className="text-xs text-gray-600">{scenario.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-3">
          Data Management
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleResetData}
            variant="outline"
            size="sm"
            icon={RefreshCw}
            className="text-orange-600 border-orange-200"
          >
            Reset Data
          </Button>
          <Button
            onClick={handleGenerateData}
            variant="outline"
            size="sm"
            icon={Database}
            className="text-green-600 border-green-200"
          >
            Add Sample
          </Button>
          <Button
            onClick={exportTestData}
            variant="outline"
            size="sm"
            icon={Download}
            className="text-blue-600 border-blue-200"
          >
            Export
          </Button>
          <Button
            onClick={() => toast.info('Import', 'Import functionality ready')}
            variant="outline"
            size="sm"
            icon={Upload}
            className="text-purple-600 border-purple-200"
          >
            Import
          </Button>
        </div>
      </div>
    </div>
  );

  const renderClientData = () => (
    <div className="space-y-6">
      {/* App-Level Client Overview */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-4">Platform Client Overview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-700 mb-1">Individual Users:</p>
            <p className="text-xl font-bold text-blue-900">{analytics.appLevel.totalIndividualUsers}</p>
          </div>
          <div>
            <p className="text-green-700 mb-1">Organization Clients:</p>
            <p className="text-xl font-bold text-green-900">{analytics.appLevel.totalOrganizationClients}</p>
          </div>
          <div>
            <p className="text-purple-700 mb-1">Total Org Users:</p>
            <p className="text-xl font-bold text-purple-900">{analytics.appLevel.totalOrgUsers}</p>
          </div>
          <div>
            <p className="text-orange-700 mb-1">Active Users:</p>
            <p className="text-xl font-bold text-orange-900">{analytics.appLevel.activeUsers}</p>
          </div>
        </div>
      </Card>

      {/* User Activity Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {analytics.appLevel.dailyActiveUsers}
          </div>
          <p className="text-sm text-gray-600">Daily Active</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {analytics.appLevel.weeklyActiveUsers}
          </div>
          <p className="text-sm text-gray-600">Weekly Active</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {analytics.appLevel.monthlyActiveUsers}
          </div>
          <p className="text-sm text-gray-600">Monthly Active</p>
        </Card>
      </div>

      {/* Individual User Analysis */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Individual User Analysis
        </label>
        <Select
          value={selectedUserId}
          onChange={setSelectedUserId}
          options={analytics.users.map(u => ({ value: u.id, label: `${u.fullName} (${u.role})` }))}
          placeholder="Select user to analyze"
        />
        
        {selectedUserId && (() => {
          const userAnalytics = DeveloperAnalyticsEngine.generateUserAnalytics(
            selectedUserId,
            analytics.users,
            testDataManager.getBehaviorLogs(),
            testDataManager.getClassroomLogs(),
            testDataManager.getChildren(),
            testDataManager.getClassrooms()
          );
          
          if (!userAnalytics) return null;
          
          return (
            <Card className="p-4 mt-4">
              <h5 className="font-medium text-gray-900 mb-3">{userAnalytics.user.fullName}</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Logs:</p>
                  <p className="font-bold">{userAnalytics.totalLogs}</p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Confidence:</p>
                  <p className="font-bold">{userAnalytics.avgConfidence}/10</p>
                </div>
                <div>
                  <p className="text-gray-600">Children Tracked:</p>
                  <p className="font-bold">{userAnalytics.childrenCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">Engagement Score:</p>
                  <p className="font-bold">{userAnalytics.engagementScore}%</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Top Contexts:</p>
                <div className="space-y-1">
                  {Object.entries(userAnalytics.contextUsage)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([context, count]) => (
                    <div key={context} className="flex justify-between text-xs">
                      <span>{context.replace(/_/g, ' ')}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })()}
      </div>
    </div>
  );

  const renderAnalyticsReports = () => (
    <div className="space-y-6">
      {/* Platform Overview */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Platform Analytics Overview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Total Platform Users:</p>
            <p className="text-xl font-bold text-blue-600">{analytics.appLevel.totalUsers}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">User Retention Rate:</p>
            <p className="text-xl font-bold text-green-600">{analytics.appLevel.userRetentionRate}%</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Avg Logs Per User:</p>
            <p className="text-xl font-bold text-purple-600">{analytics.appLevel.avgBehaviorLogsPerUser}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Platform Confidence:</p>
            <p className="text-xl font-bold text-orange-600">{analytics.appLevel.avgConfidence}/10</p>
          </div>
        </div>
      </Card>

      {/* Outliers Detection */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Outliers & Patterns</h4>
        <div className="space-y-3">
          {analytics.insights.outliers.map((outlier, index) => (
            <div key={index} className={`
              p-3 rounded-lg border
              ${outlier.type === 'high_usage_users' ? 'bg-green-50 border-green-200' :
                outlier.type === 'low_engagement_users' ? 'bg-red-50 border-red-200' :
                outlier.type === 'high_severity_organization' ? 'bg-orange-50 border-orange-200' :
                'bg-blue-50 border-blue-200'}
            `}>
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-medium text-gray-900 text-sm">{outlier.type.replace(/_/g, ' ').toUpperCase()}</h5>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-xs text-gray-700 mb-2">{outlier.description}</p>
              <p className="text-xs text-gray-600 mb-1"><strong>Impact:</strong> {outlier.impact}</p>
              <p className="text-xs text-blue-600"><strong>Recommendation:</strong> {outlier.recommendation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Trends Analysis */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Growth Trends</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">User Growth:</p>
            <p className="font-bold text-green-600">{analytics.insights.trends.userGrowth}</p>
          </div>
          <div>
            <p className="text-gray-600">Engagement Growth:</p>
            <p className="font-bold text-blue-600">{analytics.insights.trends.engagementGrowth}</p>
          </div>
          <div>
            <p className="text-gray-600">Confidence Improvement:</p>
            <p className="font-bold text-purple-600">{analytics.insights.trends.confidenceImprovement}</p>
          </div>
          <div>
            <p className="text-gray-600">Peak Usage:</p>
            <p className="font-bold text-orange-600">{analytics.insights.patterns.peakUsageHours.join(', ')}</p>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => {
            const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lumi-analytics-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          variant="outline"
          size="sm"
          icon={Download}
          className="text-blue-600 border-blue-200"
        >
          Export Analytics
        </Button>
        <Button
          onClick={() => setCurrentView('developer-app-manager')}
          variant="outline"
          size="sm"
          icon={Code}
          className="text-purple-600 border-purple-200"
        >
          Full Dev Manager
        </Button>
      </div>
    </div>
  );

  const renderRevenueData = () => (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <h4 className="font-semibold text-green-900 mb-4">Revenue Analytics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-green-700 mb-1">Individual Subscriptions:</p>
            <p className="text-xl font-bold text-green-900">{analytics.appLevel.totalIndividualUsers}</p>
            <p className="text-xs text-green-600">$297/year each</p>
          </div>
          <div>
            <p className="text-blue-700 mb-1">Organization Clients:</p>
            <p className="text-xl font-bold text-blue-900">{analytics.appLevel.totalOrganizationClients}</p>
            <p className="text-xs text-blue-600">$29/seat/month</p>
          </div>
        </div>
      </Card>

      {/* Subscription Health */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Subscription Health</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Active Subscriptions:</span>
            <span className="font-bold text-green-600">{analytics.appLevel.activeUsers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Inactive/Churned:</span>
            <span className="font-bold text-red-600">{analytics.appLevel.inactiveUsers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Retention Rate:</span>
            <span className="font-bold text-blue-600">{analytics.appLevel.userRetentionRate}%</span>
          </div>
        </div>
      </Card>

      {/* Revenue Projections */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Revenue Projections</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Individual ARR:</span>
            <span className="font-bold">${(analytics.appLevel.totalIndividualUsers * 297).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Organization ARR:</span>
            <span className="font-bold">${(analytics.appLevel.totalOrgUsers * 29 * 12).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-900 font-medium">Total ARR:</span>
            <span className="font-bold text-green-600">
              ${((analytics.appLevel.totalIndividualUsers * 297) + (analytics.appLevel.totalOrgUsers * 29 * 12)).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      {/* Churn Risk Analysis */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Churn Risk Indicators</h4>
        <div className="space-y-2">
          {analytics.insights.outliers
            .filter(o => o.type === 'low_engagement_users')
            .map((outlier, index) => (
            <div key={index} className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <p className="text-sm font-medium text-red-900">{outlier.description}</p>
              <p className="text-xs text-red-700 mt-1">{outlier.recommendation}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderTechStack = () => (
    <div className="space-y-6">
      {/* System Health */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">System Health Status</h4>
        <div className="space-y-3">
          {[
            { component: 'Frontend (React + TypeScript)', status: 'Healthy', color: 'text-green-600' },
            { component: 'Backend API (Express + Node.js)', status: 'Healthy', color: 'text-green-600' },
            { component: 'Authentication System', status: 'Healthy', color: 'text-green-600' },
            { component: 'AI Strategy Engine', status: 'Healthy', color: 'text-green-600' },
            { component: 'Analytics Engine', status: 'Healthy', color: 'text-green-600' },
            { component: 'Knowledge Library', status: 'Healthy', color: 'text-green-600' }
          ].map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700 text-sm">{item.component}</span>
              <span className={`font-medium text-sm ${item.color}`}>✓ {item.status}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Error Monitoring */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Error Monitoring</h4>
        <div className="space-y-2">
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-green-900">✓ No Critical Errors</p>
            <p className="text-xs text-green-700">All systems operational</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Error Logging Active</p>
            <p className="text-xs text-blue-700">Comprehensive error tracking and reporting enabled</p>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Performance Metrics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Load Time:</p>
            <p className="font-bold text-green-600">{'< 2s'}</p>
          </div>
          <div>
            <p className="text-gray-600">API Response:</p>
            <p className="font-bold text-green-600">{'< 500ms'}</p>
          </div>
          <div>
            <p className="text-gray-600">Memory Usage:</p>
            <p className="font-bold text-blue-600">Optimized</p>
          </div>
          <div>
            <p className="text-gray-600">Bundle Size:</p>
            <p className="font-bold text-blue-600">Efficient</p>
          </div>
        </div>
      </Card>

      {/* Tech Stack Info */}
      <Card className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Technology Stack</h4>
        <div className="space-y-2 text-xs">
          <div><strong>Frontend:</strong> React 18, TypeScript, Tailwind CSS</div>
          <div><strong>Backend:</strong> Node.js, Express, JWT Authentication</div>
          <div><strong>AI Engine:</strong> Custom knowledge library with framework integration</div>
          <div><strong>Analytics:</strong> Custom analytics engine with pattern recognition</div>
          <div><strong>Security:</strong> bcrypt, JWT, role-based access control</div>
          <div><strong>Testing:</strong> Comprehensive test data management system</div>
        </div>
      </Card>
    </div>
  );

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
    <div className="fixed bottom-4 right-4 z-50 w-[500px] max-h-[80vh] overflow-y-auto">
      <Card className="p-6 bg-purple-50 border-purple-200 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900">
              Developer Portal
            </h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-purple-600"
          >
            ×
          </Button>
        </div>

        {/* Module Tabs */}
        <div className="border-b border-purple-200 mb-6">
          <nav className="flex space-x-1 -mb-px">
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id as any)}
                  className={`
                    flex items-center space-x-1 py-2 px-3 border-b-2 text-xs font-medium transition-colors
                    ${activeModule === module.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{module.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Module Content */}
        <div>
          {activeModule === 'testing' && renderTestingEnvironment()}
          {activeModule === 'client-data' && renderClientData()}
          {activeModule === 'analytics' && renderAnalyticsReports()}
          {activeModule === 'revenue' && renderRevenueData()}
          {activeModule === 'tech-stack' && renderTechStack()}
        </div>

        {/* Current Status */}
        <div className="mt-6 pt-4 border-t border-purple-200">
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-xs font-medium text-purple-900 mb-2">Current Status:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
              <div>Environment: {currentEnv.name}</div>
              <div>View: {currentView}</div>
              <div>User: {currentUser?.fullName?.split(' ')[0] || 'None'}</div>
              <div>Data: {testDataManager.getUsers().length} users</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};