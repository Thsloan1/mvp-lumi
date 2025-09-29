import React, { useState } from 'react';
import { BookOpen, Download, Search, Filter, Globe, Lock, FileText, Users } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';

interface LibraryResource {
  id: string;
  title: string;
  description: string;
  category: 'child_behavior' | 'classroom_management';
  audience: 'teacher' | 'parent' | 'both';
  language: 'english' | 'spanish' | 'bilingual';
  isPremium: boolean;
  downloadUrl?: string;
  content?: string;
}

export const LearningLibraryComplete: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // 13 Child-Related Topics + 12 Classroom Management Topics
  const libraryResources: LibraryResource[] = [
    // Child Behavior Topics (13)
    {
      id: 'crying',
      title: 'Understanding Crying',
      description: 'Gentle approaches for supporting children through tears and emotional expression',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: false
    },
    {
      id: 'biting',
      title: 'Addressing Biting Behaviors',
      description: 'Developmental understanding and practical strategies for biting incidents',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: false
    },
    {
      id: 'tantrums',
      title: 'Supporting Big Feelings (Tantrums)',
      description: 'Connection-first approaches for emotional meltdowns and big feelings',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: false
    },
    {
      id: 'hitting',
      title: 'Gentle Responses to Hitting',
      description: 'Teaching gentle touches and managing aggressive behaviors',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: false
    },
    {
      id: 'toileting',
      title: 'Toileting Support & Accidents',
      description: 'Dignified approaches to toileting challenges and accidents',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'sleep',
      title: 'Rest Time & Sleep Challenges',
      description: 'Creating calm environments and supporting rest needs',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'diaper_changing',
      title: 'Respectful Diaper Changing',
      description: 'Maintaining dignity and connection during care routines',
      category: 'child_behavior',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'food_eating',
      title: 'Food & Eating Challenges',
      description: 'Supporting healthy relationships with food (refusal, gorging, hiding)',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'hiding',
      title: 'When Children Hide',
      description: 'Understanding withdrawal and supporting re-engagement',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'running_away',
      title: 'Running Away Behaviors',
      description: 'Safety strategies and understanding flight responses',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'climbing',
      title: 'Unsafe Climbing Behaviors',
      description: 'Redirecting climbing needs while maintaining safety',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'circle_time',
      title: 'Circle Time Difficulties',
      description: 'Engaging reluctant participants and managing group dynamics',
      category: 'child_behavior',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'peer_conflicts',
      title: 'Getting Along with Peers',
      description: 'Building social skills and resolving peer conflicts',
      category: 'child_behavior',
      audience: 'both',
      language: 'bilingual',
      isPremium: true
    },

    // Classroom Management Topics (12)
    {
      id: 'transitions',
      title: 'Smooth Transitions',
      description: 'Visual cues, countdowns, and predictable routines for seamless transitions',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: false
    },
    {
      id: 'group_management',
      title: 'Large Group Management',
      description: 'Strategies for managing energy and attention in large groups',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'morning_routines',
      title: 'Calm Morning Routines',
      description: 'Setting positive tone with welcoming arrival and circle time',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'cleanup_strategies',
      title: 'Engaging Cleanup Time',
      description: 'Making cleanup collaborative and fun for all children',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'noise_management',
      title: 'Managing Classroom Noise',
      description: 'Creating calm environments and managing sound levels',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'attention_strategies',
      title: 'Gaining Group Attention',
      description: 'Positive methods for redirecting group focus and energy',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'space_organization',
      title: 'Classroom Space Organization',
      description: 'Environmental design for behavior support and learning',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'schedule_flexibility',
      title: 'Flexible Scheduling',
      description: 'Adapting daily schedules to meet group needs and energy',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'conflict_resolution',
      title: 'Group Conflict Resolution',
      description: 'Mediating peer conflicts and teaching problem-solving skills',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'inclusive_practices',
      title: 'Inclusive Classroom Practices',
      description: 'Supporting diverse learners and creating belonging for all',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'family_engagement',
      title: 'Family Engagement Strategies',
      description: 'Building partnerships with families and cultural responsiveness',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    },
    {
      id: 'assessment_observation',
      title: 'Observation & Assessment',
      description: 'Documenting growth and development through observation',
      category: 'classroom_management',
      audience: 'teacher',
      language: 'bilingual',
      isPremium: true
    }
  ];

  const filteredResources = libraryResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesAudience = !selectedAudience || resource.audience === selectedAudience || resource.audience === 'both';
    const matchesLanguage = !selectedLanguage || resource.language === selectedLanguage || resource.language === 'bilingual';
    
    return matchesSearch && matchesCategory && matchesAudience && matchesLanguage;
  });

  const categoryOptions = [
    { value: 'child_behavior', label: 'Child Behavior (13 topics)' },
    { value: 'classroom_management', label: 'Classroom Management (12 topics)' }
  ];

  const audienceOptions = [
    { value: 'teacher', label: 'For Teachers' },
    { value: 'parent', label: 'For Parents/Families' },
    { value: 'both', label: 'Both Versions Available' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'bilingual', label: 'Bilingual' }
  ];

  const handleResourceAccess = (resource: LibraryResource) => {
    if (resource.isPremium) {
      setCurrentView('lumied-upsell');
    } else {
      // In real implementation, this would download or view the resource
      console.log('Accessing resource:', resource.title);
    }
  };

  const downloadPDF = (resource: LibraryResource, audience: 'teacher' | 'parent', language: 'english' | 'spanish') => {
    // In real implementation, this would generate and download PDF
    console.log('Downloading PDF:', { 
      resource: resource.title, 
      audience, 
      language 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Learning Library
              </h1>
              <p className="text-gray-600">
                Comprehensive guides for child behavior and classroom management
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-[#F8F6F4] px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-[#C44E38]">
                  {libraryResources.filter(r => !r.isPremium).length} Free • {libraryResources.filter(r => r.isPremium).length} Premium
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentView('lumied-upsell')}
              >
                Upgrade to LumiEd
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search topics..."
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="All categories"
            />
            <Select
              value={selectedAudience}
              onChange={setSelectedAudience}
              options={audienceOptions}
              placeholder="All audiences"
            />
            <Select
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              options={languageOptions}
              placeholder="All languages"
            />
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {resource.category === 'child_behavior' ? '👶' : '🏫'}
                  </span>
                  <span className="text-xs font-medium text-[#C44E38] uppercase tracking-wide">
                    {resource.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {resource.language === 'bilingual' && (
                    <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                      <Globe className="w-3 h-3 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Bilingual</span>
                    </div>
                  )}
                  {resource.isPremium && (
                    <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-yellow-600" />
                      <span className="text-xs font-medium text-yellow-600">Premium</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {resource.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>
                      {resource.audience === 'both' ? 'Teacher & Parent versions' : 
                       resource.audience === 'teacher' ? 'Teacher version' : 'Parent version'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Globe className="w-3 h-3" />
                    <span>
                      {resource.language === 'bilingual' ? 'English & Spanish' : 
                       resource.language.charAt(0).toUpperCase() + resource.language.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6E2DD]">
                {resource.isPremium ? (
                  <Button
                    onClick={() => handleResourceAccess(resource)}
                    variant="outline"
                    className="w-full"
                  >
                    Unlock with LumiEd
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {resource.audience === 'both' ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => downloadPDF(resource, 'teacher', 'english')}
                          size="sm"
                          variant="outline"
                          icon={Download}
                        >
                          Teacher
                        </Button>
                        <Button
                          onClick={() => downloadPDF(resource, 'parent', 'english')}
                          size="sm"
                          variant="outline"
                          icon={Download}
                        >
                          Parent
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => downloadPDF(resource, resource.audience as 'teacher' | 'parent', 'english')}
                        className="w-full"
                        icon={Download}
                      >
                        Download PDF
                      </Button>
                    )}
                    
                    {resource.language === 'bilingual' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          onClick={() => downloadPDF(resource, 'teacher', 'spanish')}
                          size="sm"
                          variant="ghost"
                        >
                          🇪🇸 Español
                        </Button>
                        <Button
                          onClick={() => downloadPDF(resource, 'parent', 'spanish')}
                          size="sm"
                          variant="ghost"
                        >
                          🇪🇸 Familia
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedAudience('');
              setSelectedLanguage('');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* LumiEd Upgrade Promotion */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-[#F8F6F4] to-white border-[#C44E38] border-2">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              Unlock All 25 Topics with LumiEd
            </h3>
            <p className="text-gray-600 mb-6">
              Get access to all child behavior and classroom management resources, plus advanced toolkits and family companions
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setCurrentView('lumied-upsell')}
                size="lg"
              >
                Upgrade to LumiEd
              </Button>
              <Button
                variant="outline"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};