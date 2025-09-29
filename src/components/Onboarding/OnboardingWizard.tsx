import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { ProgressDots } from '../UI/ProgressDots';
import { useAppContext } from '../../context/AppContext';
import { AboutYouStep } from './steps/AboutYouStep';
import { ClassroomStep } from './steps/ClassroomStep';
import { EnvironmentStep } from './steps/EnvironmentStep';
import { TeachingStyleStep } from './steps/TeachingStyleStep';
import { ReviewStep } from './steps/ReviewStep';
import { User } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const { setCurrentView, user, toast } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    firstName: '',
    lastName: '',
    preferredLanguage: 'english',
    learningStyle: '',
    classroomName: '',
    gradeBand: '',
    studentCount: '',
    teacherStudentRatio: '',
    hasIEP: false,
    iepCount: 0,
    hasIFSP: false,
    ifspCount: 0,
    stressors: [] as string[],
    teachingStyle: ''
  });

  const steps = [
    { component: AboutYouStep, title: 'About You' },
    { component: ClassroomStep, title: 'Your Classroom' },
    { component: EnvironmentStep, title: 'Classroom Environment' },
    { component: TeachingStyleStep, title: 'Teaching Style' },
    { component: ReviewStep, title: 'Review & Confirm' }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Complete onboarding via API
    fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferredLanguage: onboardingData.preferredLanguage,
        learningStyle: onboardingData.learningStyle,
        teachingStyle: onboardingData.teachingStyle,
        classroomData: {
          name: onboardingData.classroomName,
          gradeBand: onboardingData.gradeBand,
          studentCount: parseInt(onboardingData.studentCount),
          teacherStudentRatio: onboardingData.teacherStudentRatio,
          stressors: onboardingData.stressors,
          iepCount: onboardingData.iepCount,
          ifspCount: onboardingData.ifspCount
        }
      })
    }).then(async (response) => {
      if (response.ok) {
        toast.success('Welcome to Lumi!', 'Your account is ready to use');
        setCurrentView('dashboard');
      } else {
        const error = await response.json();
        toast.error('Setup failed', error.error || 'Please try again');
      }
    }).catch(() => {
      toast.error('Setup failed', 'Please check your connection and try again');
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // About You
        return onboardingData.firstName && onboardingData.lastName && 
               onboardingData.preferredLanguage && onboardingData.learningStyle;
      case 1: // Classroom
        return onboardingData.classroomName && onboardingData.gradeBand && 
               onboardingData.studentCount && onboardingData.teacherStudentRatio;
      case 2: // Environment
        return onboardingData.stressors.length > 0;
      case 3: // Teaching Style
        return onboardingData.teachingStyle;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto pt-8 pb-16 px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">
            Onboarding Wizard
          </h1>
          <ProgressDots total={steps.length} current={currentStep} />
          <p className="text-sm text-gray-600 mt-4">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          <CurrentStepComponent 
            data={onboardingData}
            updateData={setOnboardingData}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            icon={ArrowLeft}
          >
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              size="lg"
            >
              Complete Setup
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              icon={ArrowRight}
              iconPosition="right"
              size="lg"
            >
              Next
            </Button>
          )}
        </div>

        {!isStepValid() && currentStep < steps.length - 1 && (
          <div className="text-center mt-4">
            <p className="text-sm text-red-500">
              Please complete all required fields to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};