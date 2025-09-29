import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const InvitedOnboarding: React.FC = () => {
  const { setCurrentView } = useAppContext();

  const organizationInfo = {
    name: "Sunshine Elementary School",
    plan: "Organization Plan",
    schoolDistrict: "Sunshine School District",
    county: "Orange County",
    features: [
      "Full access to Lumi's behavior coaching platform",
      "Organization-wide analytics and insights",
      "Collaboration tools with your team",
      "Priority support and training resources"
    ]
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
            Welcome to {organizationInfo.name}!
          </h1>
          <p className="text-xl text-gray-600">
            Your account has been created successfully. Let's get you set up.
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Organization Details</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>School:</strong> {organizationInfo.name}</p>
              <p><strong>District:</strong> {organizationInfo.schoolDistrict}</p>
              <p><strong>County:</strong> {organizationInfo.county}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">
            What you have access to:
          </h2>
          
          <div className="space-y-4 mb-8">
            {organizationInfo.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-[#C44E38] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F8F6F4] rounded-xl p-6 border border-[#E6E2DD]">
            <h3 className="font-semibold text-[#1A1A1A] mb-2">
              Next: Complete Your Profile
            </h3>
            <p className="text-gray-600 text-sm">
              We'll ask you a few questions about your background, teaching style and classroom to personalize your Lumi experience. This takes about 5-7 minutes.
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => setCurrentView('onboarding-start')}
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="px-12"
          >
            Start Onboarding
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            You can always update your preferences later in settings
          </p>
          
          <div className="mt-6">
            <Button
              onClick={() => setCurrentView('dashboard')}
              variant="ghost"
            >
              Skip onboarding for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};