import React, { useState, useEffect } from 'react';
import { safeJsonParse, safeJsonStringify } from '../../utils/jsonUtils';
import { useAppContext } from '../../context/AppContext';
import { ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { ProgressDots } from '../UI/ProgressDots';
import { ErrorLogger } from '../../utils/errorLogger';
import { AboutYouStep } from './steps/AboutYouStep';
import { SchoolInfoStep } from './steps/SchoolInfoStep';
import { EducatorBackgroundStep } from './steps/EducatorBackgroundStep';
import { ClassroomStep } from './steps/ClassroomStep';
import { EnvironmentStep } from './steps/EnvironmentStep';
import { TeachingStyleStep } from './steps/TeachingStyleStep';
import { BehaviorFocusStep } from './BehaviorFocusStep';
import { ReviewStep } from './steps/ReviewStep';

const TOTAL_STEPS = 8;
const STORAGE_KEY = 'lumi_onboarding_progress';

export const OnboardingWizard: React.FC = () => {
  const { setCurrentView, currentUser, updateOnboarding, toast } = useAppContext();

  // 1. Initializing state safely using function-based initialization
  const [currentStep, setCurrentStep] = useState(() => {
    const savedProgress = safeJsonParse(localStorage.getItem(STORAGE_KEY), {});
    return savedProgress.step || 0;
  });

  const [onboardingData, setOnboardingData] = useState(() => {
    const savedProgress = safeJsonParse(localStorage.getItem(STORAGE_KEY), {});
    return savedProgress.data || {
      // Safe defaults for all onboarding fields
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
      classroomInRatioTeachers: '', // Classroom In-Ratio Teacher Count
      hasIEP: false,
      iepCount: 0,
      hasIFSP: false,
      ifspCount: 0,
      stressors: [],
      teachingStyle: '',
      behaviorFocus: [],
      specificBehavior: '',
      behaviorConfidence: ''
    };
  });

  const [loading, setLoading] = useState(false);

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

  // 2. Safe auto-save effect
  useEffect(() => {
    try {
      const dataToSave = { step: currentStep, data: onboardingData };
      const jsonString = safeJsonStringify(dataToSave);
      localStorage.setItem(STORAGE_KEY, jsonString);
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error);
      ErrorLogger.warning('Auto-save failed', { error: error.message, step: currentStep });
    }
  }, [currentStep, onboardingData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
      ErrorLogger.logOnboardingEvent('step_completed', currentStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      ErrorLogger.logOnboardingEvent('completion_initiated', currentStep, { 
        userId: currentUser?.id,
        onboardingData: {
          hasClassroom: !!onboardingData.classroomName,
          stressorCount: onboardingData.stressors?.length || 0,
          gradeBand: onboardingData.gradeBand,
          behaviorFocusCount: onboardingData.behaviorFocus?.length || 0
        }
      });

      console.log('Starting onboarding completion with data:', onboardingData);
      
      // Validate required fields before submission
      if (!onboardingData.firstName || !onboardingData.lastName) {
        throw new Error('Name is required to complete onboarding');
      }
      
      if (!onboardingData.preferredLanguage) {
        throw new Error('Preferred language is required');
      }
      
      if (!onboardingData.classroomName || !onboardingData.gradeBand) {
        throw new Error('Classroom information is required');
      }
      
      // Prepare complete onboarding data with proper validation
      const completeData = {
        // User profile data
        fullName: `${onboardingData.firstName.trim()} ${onboardingData.lastName.trim()}`,
        preferredLanguage: onboardingData.preferredLanguage,
        learningStyle: onboardingData.learningStyle || '',
        teachingStyle: onboardingData.teachingStyle || '',
        profilePhotoUrl: onboardingData.profilePhotoUrl || '',
        
        // Background information
        yearsOfExperience: onboardingData.yearsOfExperience || '',
        highestEducation: onboardingData.highestEducation || '',
        role: onboardingData.role || '',
        
        // School information
        schoolName: onboardingData.schoolName || '',
        roomNumber: onboardingData.roomNumber || '',
        schoolDistrict: onboardingData.schoolDistrict || '',
        county: onboardingData.county || '',
        
        // Behavior focus
        behaviorFocus: Array.isArray(onboardingData.behaviorFocus) ? onboardingData.behaviorFocus : [],
        behaviorConfidence: onboardingData.behaviorConfidence || '',
        specificBehavior: onboardingData.specificBehavior || '',
        
        // Classroom data for creation
        classroomData: onboardingData.classroomName ? {
          name: onboardingData.classroomName.trim(),
          gradeBand: onboardingData.gradeBand,
          studentCount: parseInt(onboardingData.studentCount) || 15,
          teacherStudentRatio: onboardingData.classroomInRatioTeachers ? 
            `1:${Math.floor((parseInt(onboardingData.studentCount) || 15) / (parseInt(onboardingData.classroomInRatioTeachers) || 1))}` : 
            '1:8',
          stressors: Array.isArray(onboardingData.stressors) ? onboardingData.stressors : [],
          iepCount: parseInt(onboardingData.iepCount) || 0,
          ifspCount: parseInt(onboardingData.ifspCount) || 0
        } : null
      };

      console.log('Prepared onboarding data for submission:', completeData);

      // Submit to backend
      await updateOnboarding(completeData);
      
      // Clear saved progress after successful completion
      try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Onboarding progress cleared from localStorage');
      } catch (error) {
        console.warn('Failed to clear onboarding progress:', error);
      }
      
      ErrorLogger.logOnboardingEvent('completed', currentStep, { userId: currentUser?.id });
      
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      ErrorLogger.logOnboardingEvent('completion_error', currentStep, { 
        userId: currentUser?.id, 
        error: error.message 
      });
      
      // Don't clear progress on error so user can retry
      toast.error('Onboarding failed', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
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
               onboardingData.studentCount && onboardingData.classroomInRatioTeachers;
      case 4: // Environment
        return onboardingData.stressors && onboardingData.stressors.length > 0;
      case 5: // Teaching Style
        return onboardingData.teachingStyle;
      case 6: // Behavior Focus
        return true; // Allow skipping behavior focus
      case 7: // Review
        return true;
      default:
        return true;
    }
  };

  const CurrentStepComponent = steps[currentStep]?.component;

  if (!CurrentStepComponent) {
    // Fallback if step is corrupted
    useEffect(() => setCurrentStep(0), []);
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto pt-8 pb-16 px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">
            Complete Your Profile
          </h1>
          <ProgressDots total={steps.length} current={currentStep} />
          <p className="text-sm text-gray-600 mt-4">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
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
              loading={loading}
              size="lg"
              icon={CheckCircle}
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