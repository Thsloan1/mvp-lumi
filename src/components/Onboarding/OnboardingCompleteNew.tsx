import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const OnboardingCompleteNew: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        <Card className="p-12 bg-white border border-[#E6E2DD] shadow-lg">
          {/* Headline */}
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            You're all set!
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            Your classroom setup is complete. Lumi is ready to support you with personalized strategies, insights, and emotional care.
          </p>

          {/* Lumi Leaf Icon */}
          <div className="w-24 h-24 mx-auto mb-12 flex items-center justify-center">
            <div className="relative">
              {/* Soft circular background */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#C3D4B7] to-[#A8C49A] rounded-full flex items-center justify-center shadow-lg">
                {/* Stylized leaf icon matching the wireframe */}
                <svg viewBox="0 0 48 48" className="w-12 h-12">
                  {/* Main leaf shape */}
                  <path
                    d="M24 8C16 8 10 16 10 24C10 32 16 40 24 40C28 36 32 28 32 20C32 16 28 12 24 8Z"
                    fill="#7FB069"
                    className="drop-shadow-sm"
                  />
                  {/* Leaf vein detail */}
                  <path
                    d="M24 12C20 16 18 20 18 24C18 28 20 32 24 36C26 32 28 28 28 24C28 20 26 16 24 12Z"
                    fill="#9BC53D"
                    className="drop-shadow-sm"
                  />
                  {/* Highlight accent */}
                  <path
                    d="M22 14C20 18 19 22 19 24C19 26 20 30 22 34C24 30 25 26 25 24C25 22 24 18 22 14Z"
                    fill="#B8E6B8"
                    className="drop-shadow-sm"
                  />
                </svg>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 w-20 h-20 bg-[#C3D4B7] rounded-full opacity-20 blur-xl"></div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4 mb-12">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 bg-[#C44E38] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700">Classroom info saved</span>
            </div>
            
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 bg-[#C44E38] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700">Behavior goals set</span>
            </div>
            
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 bg-[#C44E38] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700">Support system ready</span>
            </div>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={() => setCurrentView('dashboard')}
            size="lg"
            className="w-full bg-[#C44E38] hover:bg-[#A63D2A] text-white py-4 text-lg font-semibold rounded-2xl mb-4"
            icon={ArrowRight}
            iconPosition="right"
          >
            Go to My Dashboard
          </Button>

          {/* Secondary Action */}
          <button
            onClick={() => setCurrentView('behavior-log')}
            className="text-sm text-gray-500 hover:text-[#C44E38] transition-colors"
          >
            Log my first behavior
          </button>
        </Card>
      </div>
    </div>
  );
};