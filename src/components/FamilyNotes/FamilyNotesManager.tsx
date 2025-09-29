import React, { useState } from 'react';
import { MessageCircle, Search, Filter, Download, Globe, Lock, Star } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { FAMILY_COMMUNICATION_SCRIPTS, PREMIUM_FAMILY_SCRIPTS, SCRIPT_CATEGORIES } from '../../data/familyScripts';

export const FamilyNotesManager: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allScripts = [...FAMILY_COMMUNICATION_SCRIPTS, ...PREMIUM_FAMILY_SCRIPTS];

  const filteredScripts = allScripts.filter(script => {
    const matchesSearch = !searchQuery || 
      script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.scenario.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.script.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || script.category === selectedCategory;
    const matchesLanguage = !selectedLanguage || script.language === selectedLanguage || script.language === 'bilingual';
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const categoryOptions = SCRIPT_CATEGORIES.map(cat => ({
    value: cat.id,
    label: cat.label
  }));

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'bilingual', label: 'Bilingual' }
  ];

  const handleScriptAccess = (script: any) => {
    if (script.isPremium) {
      setCurrentView('lumied-upsell');
    } else {
      // In real implementation, this would open the script editor/viewer
      console.log('Accessing script:', script.title);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Family Communication Scripts
              </h1>
              <p className="text-gray-600">
                Ready-to-use scripts for talking with families about child behaviors and development
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#F8F6F4] px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-[#C44E38]">
                  {FAMILY_COMMUNICATION_SCRIPTS.length} Free Scripts
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentView('lumied-upsell')}
              >
                Get Premium Scripts
              </Button>
              <Button
                onClick={() => setCurrentView('family-script-generator')}
                icon={MessageCircle}
              >
                Generate Custom Script
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search scripts by topic, scenario, or content..."
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filters
              </Button>
            </div>

            {showFilters && (
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    options={categoryOptions}
                    placeholder="All categories"
                  />
                  <Select
                    label="Language"
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                    options={languageOptions}
                    placeholder="All languages"
                  />
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                How to Use Family Communication Scripts
              </h3>
              <div className="text-gray-700 space-y-2">
                <p>• <strong>Personalize:</strong> Replace [Child Name] and [Parent Name] with actual names</p>
                <p>• <strong>Adapt:</strong> Modify the language to match your natural speaking style</p>
                <p>• <strong>Context:</strong> Add specific details about what you observed</p>
                <p>• <strong>Follow-up:</strong> Include relevant family handouts when available</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredScripts.length} scripts
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Scripts Grid */}
        <div className="grid gap-6">
          {filteredScripts.map((script) => {
            const category = SCRIPT_CATEGORIES.find(cat => cat.id === script.category);
            
            return (
              <Card key={script.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category?.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A]">
                        {script.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {script.language === 'bilingual' && (
                      <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                        <Globe className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Bilingual</span>
                      </div>
                    )}
                    {script.isPremium && (
                      <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                        <Lock className="w-3 h-3 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-600">Premium</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-2">When to Use:</h4>
                    <p className="text-sm text-gray-700 bg-[#F8F6F4] p-3 rounded-lg">
                      {script.scenario}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-2">Sample Script:</h4>
                    <div className="text-sm text-gray-700 bg-white border border-[#E6E2DD] p-4 rounded-lg">
                      <p className="italic leading-relaxed">
                        {script.isPremium ? 
                          `${script.script.substring(0, 200)}...` : 
                          script.script
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E6E2DD]">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{script.language === 'bilingual' ? 'English & Spanish' : script.language}</span>
                      {script.familyHandoutId && (
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Includes family handout</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {script.isPremium ? (
                        <Button
                          onClick={() => handleScriptAccess(script)}
                          variant="outline"
                          size="sm"
                        >
                          Unlock in LumiEd
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleScriptAccess(script)}
                            size="sm"
                            icon={Download}
                          >
                            Use Script
                          </Button>
                          {script.familyHandoutId && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentView('library')}
                            >
                              Get Handout
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredScripts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F8F6F4] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
              No scripts found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedLanguage('');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Premium Promotion */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-[#F8F6F4] to-white border-[#C44E38] border-2">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              Need More Communication Support?
            </h3>
            <p className="text-gray-600 mb-6">
              Get access to specialized scripts for IEP meetings, trauma-informed communication, and complex family situations with LumiEd
            </p>
            <Button
              onClick={() => setCurrentView('lumied-upsell')}
              size="lg"
            >
              Explore Premium Scripts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};