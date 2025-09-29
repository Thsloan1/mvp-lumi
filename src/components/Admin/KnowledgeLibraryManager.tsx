import React, { useState } from 'react';
import { Book, Plus, CreditCard as Edit, Save, X, Download, Upload } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { knowledgeLibrary, TheoreticalFramework, StrategyTemplate } from '../../data/knowledgeLibrary';

export const KnowledgeLibraryManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'frameworks' | 'strategies' | 'guidelines'>('frameworks');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState(knowledgeLibrary.exportKnowledgeBase().frameworks);
  const [strategies, setStrategies] = useState(knowledgeLibrary.exportKnowledgeBase().templates);

  const tabs = [
    { id: 'frameworks', label: 'Theoretical Frameworks', icon: Book },
    { id: 'strategies', label: 'Strategy Templates', icon: Plus },
    { id: 'guidelines', label: 'Language Guidelines', icon: Edit }
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
          setFrameworks(data.frameworks || []);
          setStrategies(data.templates || []);
        } catch (error) {
          console.error('Error importing knowledge base:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const renderFrameworks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Theoretical Frameworks</h3>
        <Button icon={Plus} size="sm">Add Framework</Button>
      </div>
      
      <div className="grid gap-6">
        {frameworks.map((framework) => (
          <Card key={framework.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">{framework.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{framework.coreIdea}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Edit}
                onClick={() => setEditingItem(framework.id)}
              >
                Edit
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
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
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStrategies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Strategy Templates</h3>
        <Button icon={Plus} size="sm">Add Strategy</Button>
      </div>
      
      <div className="grid gap-6">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="p-6">
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
                icon={Edit}
                onClick={() => setEditingItem(strategy.id)}
              >
                Edit
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h5 className="font-medium text-[#1A1A1A] mb-2">Template</h5>
                <p className="text-sm text-gray-700 bg-[#F8F6F4] p-3 rounded-lg">
                  {strategy.template}
                </p>
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
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGuidelines = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#1A1A1A]">Language Guidelines</h3>
        <Button icon={Plus} size="sm">Add Guideline</Button>
      </div>
      
      <Card className="p-6">
        <h4 className="font-semibold text-[#1A1A1A] mb-4">Core Language Principles</h4>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-green-600 mb-2">✓ Use This Language</h5>
              <ul className="space-y-2 text-sm">
                <li className="bg-green-50 p-2 rounded">"had a hard time with"</li>
                <li className="bg-green-50 p-2 rounded">"was working on"</li>
                <li className="bg-green-50 p-2 rounded">"needed support with"</li>
                <li className="bg-green-50 p-2 rounded">"let's help them feel safe"</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-red-600 mb-2">✗ Avoid This Language</h5>
              <ul className="space-y-2 text-sm">
                <li className="bg-red-50 p-2 rounded">"refused to"</li>
                <li className="bg-red-50 p-2 rounded">"wouldn't listen"</li>
                <li className="bg-red-50 p-2 rounded">"being defiant"</li>
                <li className="bg-red-50 p-2 rounded">"acting out"</li>
              </ul>
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
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Knowledge Library Manager
              </h1>
              <p className="text-gray-600">
                Manage the theoretical frameworks, strategies, and language guidelines that power Lumi's AI engine.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                icon={Download}
                onClick={handleExportKnowledgeBase}
              >
                Export
              </Button>
              <label className="cursor-pointer">
                <Button variant="outline" icon={Upload}>
                  Import
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
                      ? 'border-[#C44E38] text-[#C44E38]'
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
          {activeTab === 'frameworks' && renderFrameworks()}
          {activeTab === 'strategies' && renderStrategies()}
          {activeTab === 'guidelines' && renderGuidelines()}
        </div>
      </div>
    </div>
  );
};