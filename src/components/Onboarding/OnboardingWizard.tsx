import React, { useState } from 'react';
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { ProgressDots } from '../UI/ProgressDots';
import { useAppContext } from '../../context/AppContext';
import { ErrorLogger } from '../../utils/errorLogger';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../utils/jsonUtils';
import { AboutYouStep } from './steps/AboutYouStep';
import { SchoolInfoStep } from './steps/SchoolInfoStep';
import { EducatorBackgroundStep } from './steps/EducatorBackgroundStep';
import { ClassroomStep } from './steps/ClassroomStep';
import { EnvironmentStep } from './steps/EnvironmentStep';
import { TeachingStyleStep } from './steps/TeachingStyleStep';
import { ReviewStep } from './steps/ReviewStep';
import { BehaviorFocusStep } from './BehaviorFocusStep';

export const OnboardingWizard: React.FC = () => {
  const { setCurrentView, currentUser, updateOnboarding, toast } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Initialize with saved data or defaults
  const [onboardingData, setOnboardingData] = useState(() => {
    const savedData = safeLocalStorageGet('lumi_onboarding_progress', {});
    return {
    firstName: currentUser?.fullName?.split(' ')[0] || '',
    lastName: currentUser?.fullName?.split(' ').slice(1).join(' ') || '',
    profilePhotoUrl: '',
    preferredLanguage: 'english',
    learningStyle: '',
    schoolName: '',
    roomNumber: '',
    schoolDistrict: '',
    county: '',
    yearsOfExperience: '',
    highestEducation: '',
    role: '',
    classroomName: '',
    gradeBand: '',
    studentCount: '',
    classroomInRatioTeachers: '',
    hasIEP: false,
    iepCount: 0,
    hasIFSP: false,
    ifspCount: 0,
    stressors: [] as string[],
    teachingStyle: '',
    behaviorFocus: [] as string[],
    specificBehavior: '',
      behaviorConfidence: '',
      ...savedData
    };
  });

  // Auto-save onboarding progress whenever data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      safeLocalStorageSet('lumi_onboarding_progress', onboardingData);
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [onboardingData]);

  // Load saved step progress
  useEffect(() => {
    const savedStep = safeLocalStorageGet('lumi_onboarding_step', 0);
    if (savedStep > 0 && savedStep < steps.length) {
      setCurrentStep(savedStep);
    }
  }, []);

  // Auto-save current step
  useEffect(() => {
    safeLocalStorageSet('lumi_onboarding_step', currentStep);
  }, [currentStep]);

  const steps = [
    { component: AboutYouStep, title: 'About You' },
    { component: SchoolInfoStep, title: 'School Information' },
    { component: EducatorBackgroundStep, title: 'Your Background' },
    { component: ClassroomStep, title: 'Your Classroom' },
    { component: EnvironmentStep, title: 'Classroom Environment' },
    { component: TeachingStyleStep, title: 'Teaching Style' },
    { component: BehaviorFocusStep, title: 'Behavior Focus' },
    { component: ReviewStep, title: 'Review & Confirm' }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    // Auto-save before moving to next step
    autoSaveProgress();
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    // Auto-save before moving to previous step
    autoSaveProgress();
    
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const autoSaveProgress = () => {
    try {
      safeLocalStorageSet('lumi_onboarding_progress', onboardingData);
      safeLocalStorageSet('lumi_onboarding_step', currentStep);
      
      // Show subtle feedback for auto-save
      toast.info('Progress saved', 'Your information has been saved automatically');
    } catch (error) {
      console.warn('Failed to auto-save onboarding progress:', error);
    }
  };

  const clearSavedProgress = () => {
    try {
      localStorage.removeItem('lumi_onboarding_progress');
      localStorage.removeItem('lumi_onboarding_step');
    } catch (error) {
      console.warn('Failed to clear saved progress:', error);
    }
  };

  const handleComplete = () => {
    ErrorLogger.logOnboardingEvent('completion_initiated', steps.length - 1, { 
      userId: currentUser?.id,
      onboardingData: {
        hasClassroom: !!onboardingData.classroomName,
        stressorCount: onboardingData.stressors?.length || 0,
        gradeBand: onboardingData.gradeBand,
        behaviorFocusCount: onboardingData.behaviorFocus?.length || 0
      }
    });
    
    const updateData = {
      fullName: `${onboardingData.firstName} ${onboardingData.lastName}`,
      preferredLanguage: onboardingData.preferredLanguage,
      learningStyle: onboardingData.learningStyle,
      teachingStyle: onboardingData.teachingStyle,
      behaviorFocus: onboardingData.behaviorFocus,
      behaviorConfidence: onboardingData.behaviorConfidence,
      classroomData: {
        name: onboardingData.classroomName,
        gradeBand: onboardingData.gradeBand,
        studentCount: parseInt(onboardingData.studentCount),
        teacherStudentRatio: onboardingData.teacherStudentRatio,
        stressors: onboardingData.stressors,
        iepCount: onboardingData.iepCount,
        ifspCount: onboardingData.ifspCount
      }
    };
    
    updateOnboarding(updateData)
      .then(() => {
        // Clear saved progress after successful completion
        clearSavedProgress();
        // Success - user will be redirected by updateOnboarding
      })
      .catch((error) => {
        console.error('Onboarding failed:', error);
        // Error toast is shown by updateOnboarding
      });
  };

  // Track step completion
  const handleStepComplete = (stepIndex: number) => {
    // Auto-save when completing a step
    autoSaveProgress();
    ErrorLogger.logOnboardingEvent('step_completed', stepIndex, {
      userId: currentUser?.id,
      stepData: steps[stepIndex].title
    });
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // About You
        return onboardingData.firstName && onboardingData.lastName && 
               onboardingData.preferredLanguage && onboardingData.learningStyle;
      case 1: // School Info
        return onboardingData.schoolName && onboardingData.county;
      case 2: // Educator Background
        return onboardingData.yearsOfExperience && onboardingData.highestEducation && onboardingData.role;
      case 3: // Classroom
        return onboardingData.classroomName && onboardingData.gradeBand && 
               onboardingData.studentCount && onboardingData.teacherStudentRatio;
      case 4: // Environment
        return onboardingData.stressors.length > 0;
      case 5: // Teaching Style
        return onboardingData.teachingStyle;
      case 6: // Behavior Focus
        return onboardingData.behaviorFocus.length > 0;
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
              disabled={!isStepValid()}
              size="lg"
            >
              Complete Setup
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleStepComplete(currentStep);
                handleNext();
              }}
              disabled={!isStepValid()}
              icon={ArrowRight}
              iconPosition="right"
              size="lg"
            >
              Next
            </Button>
          )}
        </div>

        {/* Auto-save indicator */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            Your progress is automatically saved
          </p>
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