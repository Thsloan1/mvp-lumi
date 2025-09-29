import React from 'react';
import { Heart, Users, MessageCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

interface UserTypeOption {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  description: string;
}

export const WelcomeScreen: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [selectedType, setSelectedType] = React.useState<string>('');

  const userTypes: UserTypeOption[] = [
    {
      id: 'educator',
      title: "I'm an Educator",
      subtitle: 'Individual teacher or classroom professional',
      icon: Heart,
      description: 'Get personalized strategies and support for your classroom challenges'
    },
    {
      id: 'organization',
      title: "I'm Signing Up My Organization",
      subtitle: 'School, center, or district administrator',
      icon: Users,
      description: 'Manage multiple educators and track insights across your organization'
    },
    {
      id: 'invited',
      title: "I've Been Invited",
      subtitle: 'Join an existing organization account',
      icon: MessageCircle,
      description: 'Use your invitation code to join your team'
    }
  ];

  const handleContinue = () => {
    if (selectedType === 'educator') {
      setCurrentView('educator-signup');
    } else if (selectedType === 'organization') {
      setCurrentView('admin-signup');
    } else if (selectedType === 'invited') {
      setCurrentView('invited-signup');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-[#C44E38] rounded-2xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="mb-6">
            <Button
              onClick={() => setCurrentView('landing')}
              variant="ghost"
              className="text-[#B2C6E5] hover:text-[#C44E38]"
            >
              ← Back to Landing Page
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-4">
            Welcome to Lumi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hi there! Let's get you started. Choose the path that fits you best.
          </p>
          <p className="text-sm text-gray-500 mt-3">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('signin')}
              className="text-[#C44E38] font-medium hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {userTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card
                key={type.id}
                hoverable
                selected={selectedType === type.id}
                onClick={() => setSelectedType(type.id)}
                className="p-8 text-center h-full"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200
                    ${selectedType === type.id ? 'bg-[#C44E38] text-white' : 'bg-[#E6E2DD] text-[#C44E38]'}
                  `}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {type.subtitle}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedType}
            size="lg"
            className="px-12"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};