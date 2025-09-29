import React, { useState } from 'react';
import { Heart, TrendingUp, MessageCircle, Star, CheckCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';
import { ReflectionPrompt } from '../../types';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';

interface ReflectionPromptsProps {
  behaviorLogId?: string;
  classroomLogId?: string;
  onComplete?: () => void;
}

export const ReflectionPrompts: React.FC<ReflectionPromptsProps> = ({
  behaviorLogId,
  classroomLogId,
  onComplete
}) => {
  const { currentUser } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [reflectionData, setReflectionData] = useState({
    stressLevel: 5,
    confidenceLevel: 5,
    doabilityRating: 5,
    notes: '',
    followUpNeeded: false
  });

  const steps = [
    {
      title: "How are you feeling right now?",
      subtitle: "Check in with your stress level",
      field: 'stressLevel',
      type: 'slider',
      min: 1,
      max: 10,
      labels: ['Very Stressed', 'Completely Calm'],
      icon: Heart
    },
    {
      title: "How confident do you feel about the strategy you tried?",
      subtitle: "Rate your confidence in the approach",
      field: 'confidenceLevel',
      type: 'slider',
      min: 1,
      max: 10,
      labels: ['Not Confident', 'Very Confident'],
      icon: TrendingUp
    },
    {
      title: "How doable was this strategy in your classroom?",
      subtitle: "Consider your real classroom context",
      field: 'doabilityRating',
      type: 'slider',
      min: 1,
      max: 10,
      labels: ['Very Difficult', 'Very Easy'],
      icon: Star
    },
    {
      title: "What happened when you tried it?",
      subtitle: "Share any observations or thoughts (optional)",
      field: 'notes',
      type: 'textarea',
      icon: MessageCircle
    }
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const handleSliderChange = (value: number) => {
    setReflectionData(prev => ({
      ...prev,
      [currentStepData.field]: value
    }));
  };

  const handleTextChange = (value: string) => {
    setReflectionData(prev => ({
      ...prev,
      [currentStepData.field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const reflection: ReflectionPrompt = {
      id: Date.now().toString(),
      behaviorLogId,
      classroomLogId,
      stressLevel: reflectionData.stressLevel,
      confidenceLevel: reflectionData.confidenceLevel,
      doabilityRating: reflectionData.doabilityRating,
      notes: reflectionData.notes,
      followUpNeeded: reflectionData.stressLevel <= 3 || reflectionData.confidenceLevel <= 3,
      createdAt: new Date()
    };

    // Save reflection to localStorage for demo
    try {
      const existingReflections = safeLocalStorageGet('lumi_reflections', []);
      existingReflections.push(reflection);
      safeLocalStorageSet('lumi_reflections', existingReflections);
    } catch (error) {
      console.error('Failed to save reflection:', error);
    }
    
    // Show encouraging message based on ratings
    const encouragement = getEncouragementMessage();
    if (encouragement) {
      // Could show a final encouragement screen or toast
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  const getEncouragementMessage = () => {
    const { stressLevel, confidenceLevel, doabilityRating } = reflectionData;
    
    if (stressLevel <= 3) {
      return "It sounds like this was a challenging moment. That's completely normal - you're doing important work.";
    } else if (confidenceLevel >= 8 && doabilityRating >= 8) {
      return "Wonderful! It sounds like you found a strategy that really works for your classroom.";
    } else if (confidenceLevel >= 6) {
      return "Great job trying something new. Every small step builds your toolkit.";
    } else {
      return "Thank you for reflecting. Remember, building new skills takes time and practice.";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C44E38] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="w-8 h-8 text-[#C44E38]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600">
            {currentStepData.subtitle}
          </p>
        </div>

        <div className="space-y-8">
          {currentStepData.type === 'slider' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">{currentStepData.labels?.[0]}</span>
                <span className="text-sm text-gray-600">{currentStepData.labels?.[1]}</span>
              </div>
              
              <div className="relative">
                <input
                  type="range"
                  min={currentStepData.min}
                  max={currentStepData.max}
                  value={reflectionData[currentStepData.field as keyof typeof reflectionData] as number}
                  onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-[#E6E2DD] rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #C44E38 0%, #C44E38 ${((reflectionData[currentStepData.field as keyof typeof reflectionData] as number) - 1) * 11.11}%, #E6E2DD ${((reflectionData[currentStepData.field as keyof typeof reflectionData] as number) - 1) * 11.11}%, #E6E2DD 100%)`
                  }}
                />
                <div className="flex justify-between mt-2">
                  {Array.from({length: 10}).map((_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${i < (reflectionData[currentStepData.field as keyof typeof reflectionData] as number) ? 'bg-[#C44E38]' : 'bg-[#E6E2DD]'}`} />
                      <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center mt-6">
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {Array.from({length: Math.floor((reflectionData[currentStepData.field as keyof typeof reflectionData] as number) / 2)}).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-lg font-medium text-[#1A1A1A] ml-2">
                    {reflectionData[currentStepData.field as keyof typeof reflectionData]}/10
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStepData.type === 'textarea' && (
            <div>
              <Input
                type="textarea"
                value={reflectionData.notes}
                onChange={handleTextChange}
                placeholder="Share what you noticed, how it went, or any thoughts you have..."
                rows={4}
              />
              <p className="text-sm text-gray-500 mt-2">
                This helps us improve Lumi's suggestions for you and other educators.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-[#C44E38]' : 'bg-[#E6E2DD]'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={handleNext}
            size="lg"
            icon={currentStep === steps.length - 1 ? CheckCircle : undefined}
          >
            {currentStep === steps.length - 1 ? 'Complete Reflection' : 'Next'}
          </Button>
        </div>

        {currentStep === steps.length - 1 && (
          <div className="mt-6 p-4 bg-[#F8F6F4] rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              {getEncouragementMessage()}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};