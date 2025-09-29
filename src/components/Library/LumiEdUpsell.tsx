import React from 'react';
import { ArrowLeft, Check, ExternalLink, BookOpen, Users, Download, Zap } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const LumiEdUpsell: React.FC = () => {
  const { setCurrentView } = useAppContext();

  const features = [
    {
      icon: BookOpen,
      title: '100+ Comprehensive Resources',
      description: 'Deep-dive toolkits, implementation guides, and research-backed strategies'
    },
    {
      icon: Users,
      title: 'Complete Family Companions',
      description: 'Every educator resource paired with bilingual family handouts and home strategies'
    },
    {
      icon: Download,
      title: 'Downloadable & Printable',
      description: 'All resources available for offline use, printing, and sharing with your team'
    },
    {
      icon: Zap,
      title: 'Advanced Search & Filtering',
      description: 'Find exactly what you need with detailed metadata and smart recommendations'
    }
  ];

  const sampleResources = [
    'Complete Toddler Behavior Toolkit (20 pages)',
    'Trauma-Informed Classroom Environment Guide',
    'Advanced Transition Strategies with Visual Supports',
    'Multilingual Family Communication Templates',
    'Sensory Regulation Toolkit',
    'Conflict Resolution Playbook'
  ];

  const pricingOptions = [
    {
      name: 'LumiEd Only',
      price: '$19',
      period: 'per month',
      description: 'Resource library access only',
      features: ['100+ downloadable resources', 'Family companions', 'Search & filter tools']
    },
    {
      name: 'Lumi + LumiEd Bundle',
      price: '$39',
      period: 'per month',
      originalPrice: '$48',
      savings: 'Save $9/month',
      description: 'Complete behavior coaching ecosystem',
      features: ['Everything in Lumi Core', 'Full LumiEd resource library', 'Integrated recommendations', 'Priority support'],
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('library')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Library
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Introducing LumiEd
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your comprehensive resource hub for evidence-based classroom strategies, family engagement tools, and professional development materials.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#C44E38] bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-[#C44E38]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Sample Resources */}
        <Card className="p-8 mb-12">
          <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6 text-center">
            What You'll Get Access To
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {sampleResources.map((resource, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{resource}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Pricing Options */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-8 text-center">
            Choose Your Plan
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {pricingOptions.map((option, index) => (
              <Card
                key={index}
                className={`p-8 relative ${option.popular ? 'ring-2 ring-[#C44E38]' : ''}`}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#C44E38] text-white px-4 py-1 rounded-full text-sm font-medium">
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
                      <Check className="w-5 h-5 text-[#C44E38] mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  size="lg"
                  variant={option.popular ? 'primary' : 'outline'}
                >
                  Get Started
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Benefits */}
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
              Seamless Integration with Lumi Core
            </h3>
            <p className="text-gray-600 mb-6">
              When you use both Lumi Core and LumiEd together, you get intelligent resource recommendations based on your behavior logs, integrated family communication tools, and a unified dashboard experience.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" icon={ExternalLink}>
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg">
                Schedule Demo
              </Button>
            </div>
          </div>
        </Card>

        {/* Back to Core */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Want to continue with just the free resources for now?
          </p>
          <Button
            variant="ghost"
            onClick={() => setCurrentView('library')}
          >
            Back to Free Library
          </Button>
        </div>
      </div>
    </div>
  );
};