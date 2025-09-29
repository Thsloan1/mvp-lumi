import React from 'react';
import { CheckCircle, ArrowRight, BookOpen, Download, Users, Star } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const LumiEdWelcome: React.FC = () => {
  const { setCurrentView, currentUser } = useAppContext();

  const quickStartActions = [
    {
      title: 'Browse Resource Library',
      description: 'Explore 100+ comprehensive toolkits and guides',
      icon: BookOpen,
      action: () => setCurrentView('library'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Download Your First Toolkit',
      description: 'Start with our most popular behavior support resources',
      icon: Download,
      action: () => setCurrentView('library'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Generate Family Communication',
      description: 'Create comprehensive family notes with integrated resources',
      icon: Users,
      action: () => setCurrentView('family-script-generator'),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const integrationBenefits = [
    'Resource recommendations appear automatically in your behavior strategies',
    'Family communications now include relevant toolkit references',
    'Enhanced analytics track resource usage alongside behavior patterns',
    'Seamless workflow between strategy generation and resource access'
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
            Welcome to LumiEd!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Your comprehensive resource library is now active and integrated with Lumi Core.
          </p>
          <p className="text-gray-500">
            You now have access to 100+ premium resources, advanced toolkits, and family engagement materials.
          </p>
        </div>

        {/* Integration Benefits */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6 text-center">
            🎉 Enhanced Lumi Experience
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-3">What's New:</h3>
              <ul className="space-y-2">
                {integrationBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Star className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <h4 className="font-medium text-[#1A1A1A] mb-2">Your LumiEd Subscription:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan:</span>
                  <span className="font-medium text-[#1A1A1A]">Lumi + LumiEd Bundle</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-[#1A1A1A]">$39/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resources:</span>
                  <span className="font-medium text-[#1A1A1A]">100+ Available</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Start Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {quickStartActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-md transition-shadow duration-200">
                <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className={`w-6 h-6 ${action.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {action.description}
                </p>
                <Button
                  onClick={action.action}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Get Started
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <Button
            onClick={() => setCurrentView('dashboard')}
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="px-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Go to Enhanced Dashboard
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Your LumiEd tab is now unlocked in the navigation bar
          </p>
        </div>
      </div>
    </div>
  );
};