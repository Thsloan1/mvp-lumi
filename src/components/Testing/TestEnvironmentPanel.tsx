import React, { useState } from 'react';
import { Settings, RefreshCw, Database, Users, BarChart3, Download, Upload, Trash2, Play } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { testDataManager } from '../../data/testData';
import { getCurrentEnvironment, isTestEnvironment } from '../../config/environments';

export const TestEnvironmentPanel: React.FC = () => {
  const { setCurrentView, setCurrentUser, toast } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTestUser, setSelectedTestUser] = useState('');
  
  const currentEnv = getCurrentEnvironment();

  // Only show in test environments
  if (!isTestEnvironment()) {
    return null;
  }

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
        // Simulate invitation URL
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          icon={Settings}
        >
          Test Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="p-6 bg-purple-50 border-purple-200 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900">
              Test Environment
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

        <div className="space-y-6">
          {/* Environment Info */}
          <div className="bg-purple-100 rounded-lg p-3">
            <p className="text-sm font-medium text-purple-900">
              Environment: {currentEnv.name}
            </p>
            <p className="text-xs text-purple-700">
              Mock Data: {currentEnv.features.mockData ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          {/* Quick Login */}
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
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
            <label className="block text-sm font-medium text-purple-900 mb-3">
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
            <label className="block text-sm font-medium text-purple-900 mb-3">
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

          {/* Current Data Stats */}
          <div className="bg-white rounded-lg p-3 border border-purple-200">
            <p className="text-xs font-medium text-purple-900 mb-2">Current Data:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
              <div>User: {currentUser ? '1' : '0'}</div>
              <div>View: {currentView}</div>
              <div>Storage: {Object.keys(localStorage).length} items</div>
              <div>Session: Active</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};