import React, { useState } from 'react';
import { Lock, BookOpen, Download, Users, Star, ArrowRight, ExternalLink, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';

interface PreviewResource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'toolkit' | 'guide' | 'strategy' | 'family_companion';
  ageGroups: string[];
  isPremium: boolean;
  previewContent?: string;
  fullPageCount?: number;
}

export const LumiEdPreview: React.FC = () => {
  const { setCurrentView, currentUser } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Teaser resources with preview content
  const teaserResources: PreviewResource[] = [
    {
      id: 'complete-toddler-toolkit',
      title: 'Complete Toddler Behavior Toolkit',
      description: 'Comprehensive 20-page toolkit with strategies, visual supports, and family resources for all toddler behaviors.',
      category: 'behavior',
      type: 'toolkit',
      ageGroups: ['Toddlers (2-3 years old)'],
      isPremium: true,
      fullPageCount: 20,
      previewContent: 'This comprehensive toolkit includes: • 15 evidence-based strategies for common toddler behaviors • Visual support cards for transitions and routines • Family handouts in English and Spanish • Implementation checklists for classroom setup...'
    },
    {
      id: 'transition-mastery-advanced',
      title: 'Transition Mastery: Advanced Strategies',
      description: 'Deep-dive toolkit for complex transition challenges with visual supports and implementation guides.',
      category: 'transitions',
      type: 'toolkit',
      ageGroups: ['Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
      isPremium: true,
      fullPageCount: 16,
      previewContent: 'Advanced transition strategies including: • Visual countdown systems • Sensory regulation techniques • Group transition protocols • Crisis de-escalation methods...'
    },
    {
      id: 'trauma-informed-classroom',
      title: 'Trauma-Informed Classroom Environment Guide',
      description: 'Comprehensive guide for creating healing-centered classroom environments with practical setup instructions.',
      category: 'environment',
      type: 'guide',
      ageGroups: ['All ages'],
      isPremium: true,
      fullPageCount: 24,
      previewContent: 'Create healing spaces with: • Environmental design principles • Safety and choice integration • Sensory considerations • Cultural responsiveness frameworks...'
    },
    {
      id: 'family-partnership-toolkit',
      title: 'Family Partnership & Communication Toolkit',
      description: 'Advanced scripts, conversation frameworks, and cultural responsiveness guides for family engagement.',
      category: 'communication',
      type: 'toolkit',
      ageGroups: ['All ages'],
      isPremium: true,
      fullPageCount: 18,
      previewContent: 'Build strong partnerships with: • 25+ conversation scripts • Cultural responsiveness guides • Difficult conversation frameworks • Home-school collaboration tools...'
    },
    {
      id: 'sensory-regulation-guide',
      title: 'Sensory Regulation Classroom Guide',
      description: 'Practical strategies for supporting children with sensory processing needs in classroom settings.',
      category: 'behavior',
      type: 'guide',
      ageGroups: ['Toddlers (2-3 years old)', 'Preschool (4-5 years old)'],
      isPremium: true,
      fullPageCount: 14,
      previewContent: 'Support sensory needs with: • Sensory diet activities • Classroom modifications • Regulation tools and techniques • Family collaboration strategies...'
    },
    {
      id: 'conflict-resolution-playbook',
      title: 'Peer Conflict Resolution Playbook',
      description: 'Step-by-step protocols for mediating peer conflicts and teaching social problem-solving skills.',
      category: 'social',
      type: 'guide',
      ageGroups: ['Preschool (4-5 years old)', 'Transitional Kindergarten (4-5 years old)'],
      isPremium: true,
      fullPageCount: 12,
      previewContent: 'Resolve conflicts peacefully with: • Mediation scripts and protocols • Social problem-solving frameworks • Restorative justice approaches • Peer support systems...'
    }
  ];

  const categoryOptions = [
    { value: 'behavior', label: 'Behavior Support' },
    { value: 'transitions', label: 'Transitions' },
    { value: 'environment', label: 'Environment' },
    { value: 'communication', label: 'Family Communication' },
    { value: 'social', label: 'Social Skills' }
  ];

  const filteredResources = teaserResources.filter(resource => {
    const matchesSearch = !searchQuery || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const subscriptionOptions = [
    {
      name: 'LumiEd Only',
      price: '$19',
      period: 'per month',
      description: 'Resource library access only',
      features: [
        '100+ downloadable resources',
        'Advanced toolkits and guides', 
        'Family companion materials',
        'Bilingual content (English & Spanish)',
        'Search and filter tools',
        'PDF downloads and printing'
      ]
    },
    {
      name: 'Lumi + LumiEd Bundle',
      price: '$39',
      period: 'per month',
      originalPrice: '$48',
      savings: 'Save $9/month',
      description: 'Complete behavior coaching ecosystem',
      features: [
        'Everything in Lumi Core',
        'Full LumiEd resource library',
        'Integrated resource recommendations',
        'Advanced analytics and reporting',
        'Priority support',
        'Exclusive webinars and training'
      ],
      popular: true,
      integrated: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1A1A1A]">
                    LumiEd Resource Library
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Premium Content</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 max-w-2xl">
                Your comprehensive resource hub for evidence-based classroom strategies, family engagement tools, and professional development materials.
              </p>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-xl border border-purple-200 mb-3">
                <p className="text-sm font-medium text-purple-900">100+ Premium Resources</p>
                <p className="text-xs text-purple-700">Comprehensive toolkits & guides</p>
              </div>
              <Button
                onClick={() => setCurrentView('lumied-upsell')}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Unlock LumiEd
              </Button>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Comprehensive Toolkits</h3>
              <p className="text-sm text-gray-700">20+ page deep-dive guides with implementation checklists</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Family Companions</h3>
              <p className="text-sm text-gray-700">Every resource paired with bilingual family materials</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Print & Share Ready</h3>
              <p className="text-sm text-gray-700">Downloadable PDFs for offline use and team sharing</p>
            </div>
          </div>
        </Card>

        {/* Search and Browse */}
        <div className="mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search premium resources..."
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="All categories"
            />
          </div>
        </div>

        {/* Teaser Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="p-6 relative overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full">
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-medium">Premium</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg">
                    {resource.category === 'behavior' ? '🤗' :
                     resource.category === 'transitions' ? '🔄' :
                     resource.category === 'environment' ? '🏫' :
                     resource.category === 'communication' ? '💬' : '🤝'}
                  </span>
                  <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    {resource.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {resource.description}
                </p>

                {/* Preview Content */}
                <div className="bg-[#F8F6F4] p-4 rounded-xl mb-4 relative">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {resource.previewContent}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F8F6F4] to-transparent"></div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{resource.ageGroups.join(', ')}</span>
                  <span>{resource.fullPageCount} pages</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentView('lumied-upsell')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  icon={Lock}
                >
                  Unlock Full Resource
                </Button>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Preview only • Full access with LumiEd
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Integration Benefits */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
              Seamless Integration with Lumi Core
            </h3>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              When you use both Lumi Core and LumiEd together, you get intelligent resource recommendations based on your behavior logs, integrated family communication tools, and a unified dashboard experience.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">Smart Recommendations</h4>
                <p className="text-sm text-gray-700">Get resource suggestions based on your logged behaviors</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">Integrated Family Tools</h4>
                <p className="text-sm text-gray-700">Family communications auto-link to relevant resources</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-[#1A1A1A] mb-2">Unified Analytics</h4>
                <p className="text-sm text-gray-700">Track resource usage alongside behavior strategies</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Options */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8 text-center">
            Choose Your LumiEd Experience
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subscriptionOptions.map((option, index) => (
              <Card
                key={index}
                className={`p-8 relative ${option.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-[#1A1A1A] mb-2">
                    {option.name}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {option.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#1A1A1A]">
                        {option.price}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {option.period}
                      </span>
                    </div>
                    {option.originalPrice && (
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <span className="text-gray-500 line-through text-sm">
                          {option.originalPrice}
                        </span>
                        <span className="text-green-600 font-medium text-sm">
                          {option.savings}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {option.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${option.popular ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}`}
                  size="lg"
                  onClick={() => setCurrentView('lumied-subscription')}
                >
                  {option.integrated ? 'Upgrade Bundle' : 'Subscribe to LumiEd'}
                </Button>
                
                {option.integrated && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Seamlessly integrated with your current Lumi account
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
              What Makes LumiEd Different?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">Evidence-Based Content</p>
                  <p className="text-sm text-gray-600">All resources grounded in attachment theory, developmental science, and trauma-informed care</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">Culturally Responsive</p>
                  <p className="text-sm text-gray-600">Bilingual resources that honor diverse family practices and home languages</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">Immediately Actionable</p>
                  <p className="text-sm text-gray-600">Ready-to-use strategies with step-by-step implementation guides</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
              Perfect for Your Role
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-[#1A1A1A] mb-2">👩‍🏫 Classroom Teachers</h4>
                <p className="text-sm text-gray-600">Comprehensive behavior toolkits, transition strategies, and family communication scripts</p>
              </div>
              <div>
                <h4 className="font-medium text-[#1A1A1A] mb-2">👥 Program Directors</h4>
                <p className="text-sm text-gray-600">Staff training materials, policy templates, and program-wide implementation guides</p>
              </div>
              <div>
                <h4 className="font-medium text-[#1A1A1A] mb-2">🏫 Administrators</h4>
                <p className="text-sm text-gray-600">Professional development resources, family engagement frameworks, and quality improvement tools</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Continue with Free Resources */}
        <Card className="p-8 bg-[#F8F6F4] border-[#E6E2DD]">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
              Want to Continue with Free Resources?
            </h3>
            <p className="text-gray-600 mb-6">
              Access our curated collection of basic strategies and guides while you explore LumiEd.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={() => setCurrentView('library')}
                variant="outline"
                size="lg"
                icon={BookOpen}
              >
                Browse Free Library
              </Button>
              <Button
                onClick={() => setCurrentView('dashboard')}
                variant="ghost"
                size="lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};