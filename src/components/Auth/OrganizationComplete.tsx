import React from 'react';
import { CheckCircle, ArrowRight, Users, BarChart3, Settings } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const OrganizationComplete: React.FC = () => {
  const { setCurrentView } = useAppContext();

  const nextSteps = [
    {
      icon: Users,
      title: 'Manage Your Team',
      description: 'View invited educators, track onboarding progress, and add more team members',
      action: 'View Team Dashboard'
    },
    {
      icon: BarChart3,
      title: 'Organization Analytics',
      description: 'Access insights across all educators and classrooms in your organization',
      action: 'View Analytics'
    },
    {
      icon: Settings,
      title: 'Organization Settings',
      description: 'Configure organization preferences, billing, and administrative settings',
      action: 'Manage Settings'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
            Welcome to Lumi!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Your organization account is ready. Your educators will receive their invitations shortly.
          </p>
          <p className="text-gray-500">
            You can start exploring your admin dashboard while your team gets set up.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {nextSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-md transition-shadow duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {step.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  {step.action}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="bg-[#F8F6F4] rounded-2xl p-8 border border-[#E6E2DD] mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            What happens next?
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Your invited educators will receive email invitations with setup instructions
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mt-2 mr-3 flex-shrink-0"></div>
              They'll complete their individual onboarding and classroom setup
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mt-2 mr-3 flex-shrink-0"></div>
              You'll see their progress and can access organization-wide insights
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Your dedicated success manager will reach out within 24 hours
            </li>
          </ul>
        </div>

        <div className="text-center">
          <Button
            onClick={() => setCurrentView('admin-dashboard')}
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="px-12"
          >
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};