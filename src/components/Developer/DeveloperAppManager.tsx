import React, { useState } from 'react';
import { Code, Database, Settings, Download, Upload, RefreshCw, Play, Book, Zap, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { knowledgeLibrary, TheoreticalFramework, StrategyTemplate, LanguageGuideline } from '../../data/knowledgeLibrary';
import { testDataManager } from '../../data/testData';
import { getCurrentEnvironment, ENVIRONMENTS } from '../../config/environments';

export const DeveloperAppManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'knowledge' | 'testing' | 'config'>('overview');
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
    { id: 'knowledge', label: 'Knowledge Library', icon: Book },
    { id: 'testing', label: 'Test Management', icon: Play },
    { id: 'config', label: 'Configuration', icon: Settings }
  ];

  const handleExportKnowledgeBase = () => {
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
  };

  const handleImportKnowledgeBase = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          knowledgeLibrary.importKnowledgeBase(data);
          console.log('📚 Knowledge base imported successfully');
          alert('Knowledge base imported successfully!');
        } catch (error) {
          console.error('Error importing knowledge base:', error);
          alert('Error importing knowledge base. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUpdateFramework = (id: string, updates: Partial<TheoreticalFramework>) => {
    const success = knowledgeLibrary.updateFramework(id, updates);
    if (success) {
      setEditingFramework(null);
      alert('Framework updated successfully!');
    }
  };

  const handleAddFramework = () => {
    if (newFramework.id && newFramework.name && newFramework.coreIdea) {
      const framework: TheoreticalFramework = {
        id: newFramework.id,
        name: newFramework.name,
        coreIdea: newFramework.coreIdea,
        productPrinciples: newFramework.productPrinciples || [],
        aiHooks: newFramework.aiHooks || [],
        languagePatterns: newFramework.languagePatterns || [],
        avoidancePatterns: newFramework.avoidancePatterns || []
      };
      
      knowledgeLibrary.addFramework(framework);
      setNewFramework({
        id: '',
        name: '',
        coreIdea: '',
        productPrinciples: [],
        aiHooks: [],
        languagePatterns: [],
        avoidancePatterns: []
      });
      alert('Framework added successfully!');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* App Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Lumi Application Status
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Environment</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current:</span>
                <span className="font-medium text-[#1A1A1A]">{currentEnv.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mock Data:</span>
                <span className={`font-medium ${currentEnv.features.mockData ? 'text-green-600' : 'text-red-600'}`}>
                  {currentEnv.features.mockData ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analytics:</span>
                <span className={`font-medium ${currentEnv.features.analytics ? 'text-green-600' : 'text-red-600'}`}>
                  {currentEnv.features.analytics ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Knowledge Base Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Frameworks:</span>
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Mock Data: {env.features.mockData ? '✓' : '✗'}</p>
                      <p className="text-gray-600">Analytics: {env.features.analytics ? '✓' : '✗'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Payments: {env.features.payments ? '✓' : '✗'}</p>
                      <p className="text-gray-600">Email: {env.features.emailDelivery ? '✓' : '✗'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Feature Flags */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Feature Flags & Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="bg-[#F8F6F4] rounded-xl p-4">
            <h4 className="font-medium text-[#1A1A1A] mb-3">Environment Variables</h4>
            <div className="space-y-2 text-sm font-mono">
              <div>VITE_ENVIRONMENT={currentEnv.name.toLowerCase()}</div>
              <div>VITE_ENABLE_MOCK_DATA={currentEnv.features.mockData.toString()}</div>
              <div>VITE_ENABLE_ANALYTICS={currentEnv.features.analytics.toString()}</div>
              <div>VITE_ENABLE_PAYMENTS={currentEnv.features.payments.toString()}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]">
                  Developer App Manager
                </h1>
              </div>
              <p className="text-gray-600">
                Manage Lumi's core clinical foundations, AI knowledge base, and development tools
              </p>
            </div>
            <div className="bg-purple-100 px-4 py-2 rounded-xl">
              <span className="text-sm font-medium text-purple-800">
                Environment: {currentEnv.name}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E6E2DD] mb-8">
          <nav className="flex space-x-8">
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