import React, { useState } from 'react';
import { Code, Database, Settings, Download, Upload, RefreshCw, Play, Book, Zap, FileText, ArrowLeft, BarChart3, Users, TrendingUp, AlertTriangle, Eye, Filter, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { knowledgeLibrary, TheoreticalFramework, StrategyTemplate, LanguageGuideline } from '../../data/knowledgeLibrary';
import { testDataManager } from '../../data/testData';
import { getCurrentEnvironment, ENVIRONMENTS } from '../../config/environments';
import { AnalyticsEngine, DeveloperAnalyticsEngine } from '../../utils/analyticsEngine';
import { useAppContext } from '../../context/AppContext';

export const DeveloperAppManager: React.FC = () => {
  const { behaviorLogs, classroomLogs, children, classrooms } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'knowledge' | 'testing' | 'config'>('overview');
  const [analyticsView, setAnalyticsView] = useState<'app' | 'individual' | 'organization' | 'patterns'>('app');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [editingFramework, setEditingFramework] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [newFramework, setNewFramework] = useState<Partial<TheoreticalFramework>>({
    id: '',
    name: '',
    coreIdea: '',
    productPrinciples: [],
    aiHooks: [],
    languagePatterns: [],
    avoidancePatterns: []
  });

  const currentEnv = getCurrentEnvironment();
  const knowledgeBase = knowledgeLibrary.exportKnowledgeBase();

  const tabs = [
    { id: 'overview', label: 'App Overview', icon: Code },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'knowledge', label: 'Knowledge Library', icon: Book },
    { id: 'testing', label: 'Test Management', icon: Play },
    { id: 'config', label: 'Configuration', icon: Settings }
  ];

  const handleExportKnowledgeBase = () => {
    try {
    const data = knowledgeLibrary.exportKnowledgeBase();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-knowledge-base-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleImportKnowledgeBase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          knowledgeLibrary.importKnowledgeBase(data);
          alert('Knowledge base imported successfully!');
        } catch (error) {
          console.error('Import failed:', error);
          alert('Error importing knowledge base. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateFramework = (id: string, updates: Partial<TheoreticalFramework>) => {
    // Implementation for updating framework
    console.log('Updating framework:', id, updates);
  };

  const generateAnalytics = () => {
    const allUsers = testDataManager.getUsers();
    const allOrganizations = testDataManager.getOrganizations();
    const allBehaviorLogs = testDataManager.getBehaviorLogs();
    const allClassroomLogs = testDataManager.getClassroomLogs();
    const allChildren = testDataManager.getChildren();
    const allClassrooms = testDataManager.getClassrooms();

    // Use the comprehensive analytics engine
    const appLevel = DeveloperAnalyticsEngine.generateAppLevelAnalytics(
      allUsers, allOrganizations, allBehaviorLogs, allClassroomLogs, allChildren, allClassrooms
    );
    
    const insights = DeveloperAnalyticsEngine.generatePlatformInsights(
      allUsers, allOrganizations, allBehaviorLogs, allClassroomLogs
    );

    return {
      appLevel,
      frameworkUsage: insights.trends.frameworkAdoption,
      outliers: insights.outliers,
      trends: insights.trends,
      patterns: insights.patterns,
      benchmarks: insights.benchmarks
    };
  };

  const generateOrganizationAnalytics = (orgId: string) => {
    return DeveloperAnalyticsEngine.generateOrganizationAnalytics(
      orgId,
      testDataManager.getOrganizations(),
      testDataManager.getUsers(),
      testDataManager.getBehaviorLogs(),
      testDataManager.getClassroomLogs()
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* App Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Application Status
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Code className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-medium text-[#1A1A1A] mb-1">Environment</h4>
            <p className="text-sm text-gray-600">{currentEnv.name}</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-[#1A1A1A] mb-1">Data Status</h4>
            <p className="text-sm text-gray-600">Connected</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-medium text-[#1A1A1A] mb-1">AI Engine</h4>
            <p className="text-sm text-gray-600">Active</p>
          </div>
        </div>
      </Card>

      {/* Knowledge Base Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Knowledge Base Statistics
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theoretical Frameworks:</span>
              <span className="font-medium text-[#1A1A1A]">{knowledgeBase.frameworks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategy Templates:</span>
              <span className="font-medium text-[#1A1A1A]">{knowledgeBase.templates.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Language Guidelines:</span>
              <span className="font-medium text-[#1A1A1A]">{knowledgeBase.guidelines.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Production Readiness */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Production Readiness Checklist
        </h3>
        
        <div className="space-y-4">
          {[
            { item: 'Authentication System', status: 'complete', color: 'text-green-600' },
            { item: 'AI Strategy Generation', status: 'complete', color: 'text-green-600' },
            { item: 'Knowledge Library', status: 'complete', color: 'text-green-600' },
            { item: 'Analytics Engine', status: 'complete', color: 'text-green-600' },
            { item: 'Organization Management', status: 'complete', color: 'text-green-600' },
            { item: 'Error Handling', status: 'complete', color: 'text-green-600' },
            { item: 'Accessibility', status: 'complete', color: 'text-green-600' },
            { item: 'Mobile Responsive', status: 'complete', color: 'text-green-600' }
          ].map((check, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-700">{check.item}</span>
              <span className={`font-medium ${check.color}`}>✓ {check.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderKnowledgeLibrary = () => (
    <div className="space-y-8">
      {/* Knowledge Base Actions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Knowledge Base Management
          </h3>
          <div className="flex space-x-3">
            <Button
              onClick={handleExportKnowledgeBase}
              variant="outline"
              icon={Download}
              size="sm"
            >
              Export Knowledge Base
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" icon={Upload} size="sm">
                Import Knowledge Base
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportKnowledgeBase}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2">Clinical Foundation</h4>
          <p className="text-sm text-blue-800">
            Lumi's AI is powered by evidence-based theoretical frameworks from developmental science, 
            attachment theory, trauma-informed care, and social-emotional learning research.
          </p>
        </div>
      </Card>

      {/* Theoretical Frameworks */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Theoretical Frameworks ({knowledgeBase.frameworks.length})
          </h3>
          <Button icon={Book} size="sm">
            Add New Framework
          </Button>
        </div>
        
        <div className="space-y-6">
          {knowledgeBase.frameworks.map((framework) => (
            <div key={framework.id} className="border border-[#E6E2DD] rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">{framework.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{framework.coreIdea}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={editingFramework === framework.id ? X : FileText}
                  onClick={() => setEditingFramework(editingFramework === framework.id ? null : framework.id)}
                >
                  {editingFramework === framework.id ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              
              {editingFramework === framework.id ? (
                <div className="space-y-4">
                  <Input
                    label="Core Idea"
                    value={framework.coreIdea}
                    onChange={(value) => {
                      const updatedFramework = { ...framework, coreIdea: value };
                      handleUpdateFramework(framework.id, { coreIdea: value });
                    }}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        Product Principles
                      </label>
                      <div className="space-y-2">
                        {framework.productPrinciples.map((principle, index) => (
                          <Input
                            key={index}
                            value={principle}
                            onChange={(value) => {
                              const newPrinciples = [...framework.productPrinciples];
                              newPrinciples[index] = value;
                              handleUpdateFramework(framework.id, { productPrinciples: newPrinciples });
                            }}
                            placeholder="Product principle..."
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                        AI Hooks
                      </label>
                      <div className="space-y-2">
                        {framework.aiHooks.map((hook, index) => (
                          <Input
                            key={index}
                            value={hook}
                            onChange={(value) => {
                              const newHooks = [...framework.aiHooks];
                              newHooks[index] = value;
                              handleUpdateFramework(framework.id, { aiHooks: newHooks });
                            }}
                            placeholder="AI hook..."
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-[#1A1A1A] mb-2">Product Principles</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {framework.productPrinciples.map((principle, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-[#C44E38] rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-[#1A1A1A] mb-2">AI Hooks</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {framework.aiHooks.map((hook, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {hook}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Strategy Templates */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Strategy Templates ({knowledgeBase.templates.length})
          </h3>
          <Button icon={Zap} size="sm">
            Add New Strategy
          </Button>
        </div>
        
        <div className="space-y-6">
          {knowledgeBase.templates.map((strategy) => (
            <div key={strategy.id} className="border border-[#E6E2DD] rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-[#1A1A1A] mb-2">{strategy.name}</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {strategy.frameworks.map((framework) => (
                      <span
                        key={framework}
                        className="px-2 py-1 bg-[#C44E38] bg-opacity-10 text-[#C44E38] text-xs rounded-full"
                      >
                        {framework.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={editingStrategy === strategy.id ? X : FileText}
                  onClick={() => setEditingStrategy(editingStrategy === strategy.id ? null : strategy.id)}
                >
                  {editingStrategy === strategy.id ? 'Cancel' : 'Edit'}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-[#1A1A1A] mb-2">Template</h5>
                  <div className="text-sm text-gray-700 bg-[#F8F6F4] p-4 rounded-lg">
                    {strategy.template}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-[#1A1A1A] mb-1">Age Groups</h5>
                    <p className="text-gray-600">{strategy.ageGroups.join(', ')}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-[#1A1A1A] mb-1">Contexts</h5>
                    <p className="text-gray-600">{strategy.contexts.join(', ')}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-[#1A1A1A] mb-1">Severity</h5>
                    <p className="text-gray-600">{strategy.severity.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Language Guidelines */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Language Guidelines ({knowledgeBase.guidelines.length})
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-green-600 mb-3">✓ Preferred Language Patterns</h4>
            <div className="space-y-2">
              {[
                "had a hard time with",
                "was working on", 
                "needed support with",
                "let's help them feel safe",
                "this is common for children this age",
                "we can work on this together"
              ].map((pattern, index) => (
                <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-800">
                  "{pattern}"
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-red-600 mb-3">✗ Avoided Language Patterns</h4>
            <div className="space-y-2">
              {[
                "refused to",
                "wouldn't listen",
                "being defiant", 
                "acting out",
                "this behavior is concerning",
                "they need to learn"
              ].map((pattern, index) => (
                <div key={index} className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                  "{pattern}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTestManagement = () => (
    <div className="space-y-8">
      {/* Test Data Management */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Test Data Management
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Current Test Data</h4>
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
            <div className="space-y-3">
              <Button
                onClick={() => {
                  testDataManager.resetData();
                  alert('Test data reset successfully!');
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
                  alert('Sample data generated successfully!');
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

      {/* Test Scenarios */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Test Scenarios
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              name: 'Fresh Educator',
              description: 'New user with no data - test onboarding flow',
              action: () => {
                testDataManager.resetData();
                alert('Fresh educator scenario ready! Navigate to welcome screen.');
              }
            },
            {
              name: 'Experienced Educator',
              description: 'Educator with children and behavior logs',
              action: () => {
                testDataManager.resetData();
                testDataManager.addSampleData();
                testDataManager.generateTestBehaviorLogs(15);
                alert('Experienced educator scenario ready with sample data!');
              }
            },
            {
              name: 'Admin User',
              description: 'Organization management testing',
              action: () => {
                testDataManager.resetData();
                alert('Admin scenario ready! Use admin test credentials.');
              }
            },
            {
              name: 'Large Dataset',
              description: 'Performance testing with lots of data',
              action: () => {
                testDataManager.resetData();
                testDataManager.addSampleData();
                testDataManager.generateTestBehaviorLogs(100);
                alert('Large dataset generated for performance testing!');
              }
            }
          ].map((scenario, index) => (
            <Card key={index} hoverable onClick={scenario.action} className="p-4 cursor-pointer">
              <h4 className="font-medium text-[#1A1A1A] mb-2">{scenario.name}</h4>
              <p className="text-sm text-gray-600">{scenario.description}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-8">
      {/* Environment Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Environment Configuration
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Available Environments</h4>
            <div className="grid gap-4">
              {Object.entries(ENVIRONMENTS).map(([key, env]) => (
                <div key={key} className={`
                  p-4 border rounded-xl
                  ${currentEnv.name === env.name ? 'border-[#C44E38] bg-[#C44E38] bg-opacity-5' : 'border-[#E6E2DD]'}
                `}>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-[#1A1A1A]">{env.name}</h5>
                    {currentEnv.name === env.name && (
                      <span className="px-2 py-1 bg-[#C44E38] text-white text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{env.description}</p>
                  <div className="text-xs text-gray-500">
                    API: {env.apiUrl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F6F4]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Developer App Manager
          </h1>
          <p className="text-gray-600">
            Comprehensive development tools for Lumi's AI-powered behavior support platform
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-[#E6E2DD]">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
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

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'knowledge' && renderKnowledgeLibrary()}
          {activeTab === 'testing' && renderTestManagement()}
          {activeTab === 'config' && renderConfiguration()}
        </div>
      </div>
    </div>
  );
};