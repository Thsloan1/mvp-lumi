import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const OnboardingCompleteNew: React.FC = () => {
  const { setCurrentView } = useAppContext();

  const completedItems = [
    { label: 'Classroom info saved', icon: '✓' },
    { label: 'Behavior goals set', icon: '✓' },
    { label: 'Support system ready', icon: '✓' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          {/* Lumi Logo/Icon */}
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg viewBox="0 0 80 80" className="w-full h-full">
              {/* Stylized leaf/flame icon */}
              <path
                d="M40 10C25 10 15 25 15 40C15 55 25 70 40 70C45 65 50 55 50 45C50 35 45 25 40 20C42 15 45 10 40 10Z"
                fill="#C44E38"
                className="drop-shadow-sm"
              />
              <path
                d="M35 15C30 20 25 30 25 40C25 50 30 60 35 65C40 60 45 50 45 40C45 30 40 20 35 15Z"
                fill="#E88B6F"
                className="drop-shadow-sm"
              />
              <path
                d="M30 25C28 30 26 35 26 40C26 45 28 50 30 55C32 50 34 45 34 40C34 35 32 30 30 25Z"
                fill="#F7D56F"
                className="drop-shadow-sm"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
            You're all set!
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Your classroom setup is complete. Lumi is ready to support you with personalized strategies, insights, and emotional care.
          </p>
        </div>

        <Card className="p-6 mb-8 bg-white">
          <div className="space-y-4">
            {completedItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-[#C44E38] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-[#1A1A1A] font-medium">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Button
          onClick={() => setCurrentView('dashboard')}
          size="lg"
          className="w-full bg-[#C44E38] hover:bg-[#A63D2A] text-white mb-4"
        >
          Go to My Dashboard
        </Button>

        <button
          onClick={() => setCurrentView('behavior-log')}
          className="text-sm text-gray-500 hover:text-[#C44E38] transition-colors"
        >
          Log my first behavior
        </button>
      </div>
    </div>
  );
};