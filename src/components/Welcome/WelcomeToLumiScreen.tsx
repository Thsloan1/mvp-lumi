import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const WelcomeToLumiScreen: React.FC = () => {
  const { setCurrentView } = useAppContext();

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        {/* Main Content Card */}
        <Card className="p-12 bg-white border border-[#E6E2DD] shadow-lg">
          {/* Headline */}
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-8">
            Welcome to Lumi
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-gray-600 mb-12 leading-relaxed">
            We're here to support your classroom journey with calm, clarity, and confidence.
          </p>

          {/* Lumi Icon - Stylized Leaf */}
          <div className="w-24 h-24 mx-auto mb-12 flex items-center justify-center">
            <div className="relative">
              {/* Main leaf shape */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#C3D4B7] to-[#A8C49A] rounded-full flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 60 60" className="w-14 h-14">
                  {/* Leaf shape */}
                  <path
                    d="M30 10C20 10 12 20 12 30C12 40 20 50 30 50C35 45 40 35 40 25C40 20 35 15 30 10Z"
                    fill="#7FB069"
                    className="drop-shadow-sm"
                  />
                  {/* Leaf vein */}
                  <path
                    d="M30 15C25 20 22 25 22 30C22 35 25 40 30 45C32 40 35 35 35 30C35 25 32 20 30 15Z"
                    fill="#9BC53D"
                    className="drop-shadow-sm"
                  />
                  {/* Highlight */}
                  <path
                    d="M28 18C26 22 24 26 24 30C24 34 26 38 28 42C30 38 32 34 32 30C32 26 30 22 28 18Z"
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
              <div className="w-6 h-6 bg-[#C3D4B7] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <span className="text-gray-700">Set up your classroom</span>
            </div>
            
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 bg-[#C3D4B7] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="text-gray-700">Understand your students' behavior</span>
            </div>
            
            <div className="flex items-center space-x-3 text-left">
              <div className="w-6 h-6 bg-[#C3D4B7] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <span className="text-gray-700">Get real-time strategies</span>
            </div>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={() => setCurrentView('onboarding-start')}
            size="lg"
            className="w-full bg-[#C44E38] hover:bg-[#A63D2A] text-white py-4 text-lg font-semibold rounded-2xl"
            icon={ArrowRight}
            iconPosition="right"
          >
            Get Started
          </Button>
        </Card>
      </div>
    </div>
  );
};