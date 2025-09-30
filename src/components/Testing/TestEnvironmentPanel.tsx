import React, { useState, useEffect } from 'react';
import { Code, Users, Database, Settings, Download, Upload, RefreshCw, Play, Book, Zap, FileText, ArrowLeft, BarChart3, TrendingUp, AlertTriangle, Eye, Filter, X, Mail, Copy, Check, Star, Clock, Plus, Trash2, Send } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { getCurrentEnvironment, isTestEnvironment } from '../../config/environments';
import { EmailService } from '../../services/emailService';
import { EmailDeliveryPanel } from './EmailDeliveryPanel';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

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

interface TestFeedback {
  id: string;
  testUserId: string;
  module: string;
  rating: number;
  feedback: string;
  category: string;
  priority: string;
  submittedAt: string;
  userAgent: string;
  url: string;
}

export const TestEnvironmentPanel: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentView, toast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'scenarios' | 'data' | 'analytics' | 'email' | 'feedback'>('users');
  const [testUsers, setTestUsers] = useState<TestUser[]>(() => 
    safeLocalStorageGet('lumi_test_users', [])
  );
  const [testFeedback, setTestFeedback] = useState<TestFeedback[]>(() => 
    safeLocalStorageGet('lumi_test_feedback', [])
  );
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'educator' as 'educator' | 'admin' | 'tester',
    modules: ['all'] as string[]
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const currentEnv = getCurrentEnvironment();

  // Only show in test environments
  if (!isTestEnvironment()) {
    return null;
  }

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

  const handleQuickLogin = (testUser: TestUser) => {
    try {
      // Find or create corresponding user data
      let userData = testDataManager.findUserByEmail(testUser.email);
      
      if (!userData) {
        // Create user data for test user
        userData = {
          id: testUser.id,
          fullName: testUser.name,
          email: testUser.email,
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
          toast.success('Fresh Educator Ready', 'Clean environment for new user testing');
          break;
        case 'experienced-educator':
          testDataManager.resetData();
          testDataManager.addSampleData();
          testDataManager.generateTestBehaviorLogs(20);
          toast.success('Experienced Educator Ready', 'Environment loaded with sample data');
          break;
        case 'admin-setup':
          testDataManager.resetData();
          toast.success('Admin Setup Ready', 'Clean environment for organization testing');
          break;
        case 'invited-user':
          testDataManager.resetData();
          window.history.pushState({}, '', '?token=test-invite-token-123');
          toast.success('Invited User Ready', 'Invitation flow ready for testing');
          break;
        default:
          toast.warning('Unknown Scenario', 'Scenario not implemented');
      }
    } catch (error) {
      console.error('Failed to run test scenario:', error);
      toast.error('Scenario Failed', 'Could not set up test scenario');
    }
  };

  const exportTestUsers = () => {
    try {
      const exportData = {
        testUsers,
        testFeedback,
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

  const renderUserManagement = () => (
    <div className="space-y-6">
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
    </div>
  );

  const renderTestScenarios = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
          Quick Test Scenarios
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              id: 'fresh-educator',
              name: 'Fresh Educator',
              description: 'New user with no data - test onboarding flow',
              icon: Users,
              color: 'text-blue-600'
            },
            {
              id: 'experienced-educator',
              name: 'Experienced Educator',
              description: 'Educator with children and behavior logs',
              icon: BarChart3,
              color: 'text-green-600'
            },
            {
              id: 'admin-setup',
              name: 'Admin Setup',
              description: 'Organization management testing',
              icon: Settings,
              color: 'text-purple-600'
            },
            {
              id: 'invited-user',
              name: 'Invited User',
              description: 'Test invitation acceptance flow',
              icon: Mail,
              color: 'text-orange-600'
            }
          ].map((scenario) => {
            const IconComponent = scenario.icon;
            return (
              <Card
                key={scenario.id}
                hoverable
                onClick={() => runTestScenario(scenario.id)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
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
    </div>
  );

  const renderDataManagement = () => (
    <div className="space-y-6">
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

  const renderFeedbackManagement = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Test User Feedback ({testFeedback.length})
          </h3>
          <Button
            onClick={() => {
              const feedback = safeLocalStorageGet('lumi_test_feedback', []);
              setTestFeedback(feedback);
              toast.info('Feedback Refreshed', `Loaded ${feedback.length} feedback entries`);
            }}
            size="sm"
            variant="outline"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>

        {testFeedback.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No feedback submitted yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Test users can submit feedback using the green feedback button
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {testFeedback.slice(0, 10).map((feedback) => (
              <div key={feedback.id} className="p-4 border border-[#E6E2DD] rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
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
                      <span className="text-sm font-medium text-[#1A1A1A]">
                        {feedback.rating}/5
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {feedback.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        feedback.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        feedback.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        feedback.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {feedback.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Module: {feedback.module} • {new Date(feedback.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">
                  {feedback.feedback}
                </p>
                
                {feedback.suggestions && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Suggestions:</strong> {feedback.suggestions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'scenarios', label: 'Test Scenarios', icon: Play },
    { id: 'data', label: 'Data Management', icon: Database },
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                Developer Portal
              </h2>
              <p className="text-gray-600">
                Test environment management and user testing tools
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              icon={X}
            />
          </div>

          {/* Environment Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <div>
                <p className="font-medium text-purple-900">
                  Environment: {currentEnv.name}
                </p>
                <p className="text-sm text-purple-700">
                  Mock data enabled • Test panel active • Email delivery configured
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[#E6E2DD] mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors
                      ${activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {activeTab === 'users' && renderUserManagement()}
            {activeTab === 'scenarios' && renderTestScenarios()}
            {activeTab === 'data' && renderDataManagement()}
            {activeTab === 'email' && <EmailDeliveryPanel />}
            {activeTab === 'feedback' && renderFeedbackManagement()}
          </div>
        </div>
      </Card>
    </div>
  );
};