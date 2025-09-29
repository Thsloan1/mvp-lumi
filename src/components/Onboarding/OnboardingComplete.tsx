import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAppContext } from '../../context/AppContext';

export const OnboardingComplete: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
            Welcome to Lumi!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You're ready to begin. Let's start with your first behavior entry.
          </p>
        </div>

        <div className="bg-[#F8F6F4] rounded-2xl p-8 border border-[#E6E2DD] mb-8">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
            What you can do now:
          </h2>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mr-3"></div>
              Log individual child behaviors and get instant strategies
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mr-3"></div>
              Address classroom-wide challenges with group strategies
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mr-3"></div>
              Generate family communication notes
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-[#C44E38] rounded-full mr-3"></div>
              Track your reflections and mood over time
            </li>
          </ul>
        </div>

        <Button
          onClick={() => setCurrentView('dashboard')}
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          className="px-12"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};