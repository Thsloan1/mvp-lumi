import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Send, Users } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Card } from '../UI/Card';
import { ProgressDots } from '../UI/ProgressDots';
import { useAppContext } from '../../context/AppContext';
import { ClassroomLog, AIStrategyResponse } from '../../types';
import { STRESSOR_OPTIONS } from '../../data/constants';
import { AuthService } from '../../services/authService';
import { ClassroomStrategyResponse } from './ClassroomStrategyResponse';
import { ReflectionPrompts } from '../Reflection/ReflectionPrompts';
import { ErrorLogger } from '../../utils/errorLogger';

export const ClassroomLogFlow: React.FC = () => {
  const { setCurrentView, currentUser, createClassroomLog, classrooms, toast } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [savedClassroomLogId, setSavedClassroomLogId] = useState<string | null>(null);
  const [classroomData, setClassroomData] = useState({
    challengeDescription: '',
    context: '',
    severity: '',
    educatorMood: '',
    stressors: [] as string[]
  });
  const [aiResponse, setAiResponse] = useState<AIStrategyResponse | null>(null);

  const steps = [
    { title: "What's happening with your class?", field: 'challengeDescription' },
    { title: "When and where did this happen?", field: 'context' },
    { title: "How intense was the disruption?", field: 'severity' },
    { title: "How are you feeling right now?", field: 'educatorMood' },
    { title: "What stressors are affecting your class?", field: 'stressors' }
  ];

  const contextOptions = [
    { value: 'transition', label: 'Transition' },
    { value: 'circle_time', label: 'Circle Time' },
    { value: 'group_work', label: 'Group Work' },
    { value: 'meal_time', label: 'Meal Time' },
    { value: 'play_time', label: 'Play Time' },
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'routine', label: 'Routine' },
    { value: 'other', label: 'Other' }
  ];

  const severityOptions = [
    { 
      value: 'low', 
      label: 'Low', 
      description: 'Minor disruption, class resumes quickly' 
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Learning slowed, multiple children affected' 
    },
    { 
      value: 'high', 
      label: 'High', 
      description: 'Classroom halted, significant distress' 
    }
  ];

  const moodOptions = [
    { value: 'overwhelmed', label: 'Overwhelmed' },
    { value: 'frustrated', label: 'Frustrated' },
    { value: 'angry', label: 'Angry' },
    { value: 'managing', label: 'Managing' },
    { value: 'okay', label: 'Okay' },
    { value: 'calm', label: 'Calm' }
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    setClassroomData(prev => ({ ...prev, [field]: value }));
  };

  const handleStressorToggle = (stressor: string) => {
    const currentStressors = classroomData.stressors || [];
    const isSelected = currentStressors.includes(stressor);
    
    let newStressors;
    if (isSelected) {
      newStressors = currentStressors.filter(s => s !== stressor);
    } else {
      newStressors = [...currentStressors, stressor];
    }
    
    handleInputChange('stressors', newStressors);
  };

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

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    
    setLoading(true);
    
    try {
      const response = await AuthService.apiRequest('/api/ai/classroom-strategy', {
        method: 'POST',
        body: JSON.stringify({
          challengeDescription: classroomData.challengeDescription,
          context: classroomData.context,
          severity: classroomData.severity as 'low' | 'medium' | 'high',
          stressors: classroomData.stressors,
          educatorMood: classroomData.educatorMood
        })
      });
      
      setAiResponse(response.aiResponse);
      setCurrentStep(steps.length);
    } catch (error) {
      console.error('Error generating strategy:', error);
      ErrorLogger.error('Failed to generate classroom strategy', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStrategySelect = (strategy: string, selfConfidence: number, strategyConfidence: number) => {
    createClassroomLog({
      classroomId: classrooms[0]?.id || 'default-classroom',
      challengeDescription: classroomData.challengeDescription,
      context: classroomData.context,
      severity: classroomData.severity,
      educatorMood: classroomData.educatorMood,
      stressors: classroomData.stressors,
      aiResponse: aiResponse,
      selectedStrategy: strategy,
      confidenceSelfRating: selfConfidence,
      confidenceStrategyRating: strategyConfidence
    }).then((result) => {
        setSavedClassroomLogId(result.id);
        setShowReflection(true);
    }).catch(() => {
        ErrorLogger.error('Failed to save classroom log');
      });
  };

  const handleReflectionComplete = () => {
    setCurrentView('dashboard');
  };

  if (showReflection && savedClassroomLogId) {
    return (
      <ReflectionPrompts
        classroomLogId={savedClassroomLogId}
        onComplete={handleReflectionComplete}
      />
    );
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return classroomData.challengeDescription.length >= 5;
      case 1:
        return classroomData.context.length > 0;
      case 2:
        return classroomData.severity.length > 0;
      case 3:
        return true; // Mood is optional
      case 4:
        return classroomData.stressors.length > 0;
      default:
        return true;
    }
  };

  if (aiResponse) {
    return (
      <ClassroomStrategyResponse
        response={aiResponse}
        onStrategySelect={handleStrategySelect}
        onBack={() => {
          setAiResponse(null);
          setCurrentStep(steps.length - 1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto pt-8 pb-16 px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">
              Classroom Management Strategy
            </h1>
            <ProgressDots total={steps.length} current={currentStep} />
            <p className="text-sm text-gray-600 mt-4">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              {steps[currentStep].title}
            </h2>
          </div>

          {currentStep === 0 && (
            <div className="space-y-6">
              <Input
                type="textarea"
                value={classroomData.challengeDescription}
                onChange={(value) => handleInputChange('challengeDescription', value)}
                placeholder="Describe what's happening with your group right now... (e.g., 'Children are having trouble sharing materials during center time')"
                rows={4}
                required
              />
              <div className="flex items-center justify-center">
                <Button variant="outline" icon={Mic}>
                  Use Voice Input
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <Select
              value={classroomData.context}
              onChange={(value) => handleInputChange('context', value)}
              options={contextOptions}
              placeholder="Select when this happened"
              required
            />
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              {severityOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  selected={classroomData.severity === option.value}
                  onClick={() => handleInputChange('severity', option.value)}
                  className="p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`
                      w-4 h-4 rounded-full mt-1 flex-shrink-0
                      ${option.value === 'low' ? 'bg-green-500' :
                        option.value === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                    `} />
                    <div>
                      <p className="font-semibold text-[#1A1A1A] mb-1">
                        {option.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <p className="text-center text-gray-600 mb-6">
                This is optional, but helps us provide better support.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {moodOptions.map((option) => (
                  <Card
                    key={option.value}
                    hoverable
                    selected={classroomData.educatorMood === option.value}
                    onClick={() => handleInputChange('educatorMood', option.value)}
                    className="p-4 text-center"
                  >
                    <span className="font-medium text-[#1A1A1A]">
                      {option.label}
                    </span>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  onClick={() => handleInputChange('educatorMood', '')}
                >
                  Skip this step
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <p className="text-center text-gray-600 mb-6">
                Select the stressors currently affecting your classroom:
              </p>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {STRESSOR_OPTIONS.map((stressor, index) => (
                  <label
                    key={index}
                    className="flex items-start space-x-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={classroomData.stressors.includes(stressor)}
                      onChange={() => handleStressorToggle(stressor)}
                      className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-[#1A1A1A] transition-colors leading-relaxed">
                      {stressor}
                    </span>
                  </label>
                ))}
              </div>
              {classroomData.stressors.length === 0 && (
                <p className="text-sm text-red-500 mt-4 text-center">
                  Please select at least one stressor to continue
                </p>
              )}
            </div>
          )}
        </Card>

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
              onClick={handleSubmit}
              disabled={!isStepValid()}
              loading={loading}
              icon={Send}
              iconPosition="right"
              size="lg"
            >
              Get Strategy
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

        {!isStepValid() && (
          <div className="text-center mt-4">
            <p className="text-sm text-red-500">
              {currentStep === 0 ? 'Please describe what happened (at least 5 characters)' :
               currentStep === 1 ? 'Please select when this happened' :
               currentStep === 2 ? 'Please select the disruption level' :
               currentStep === 4 ? 'Please select at least one stressor' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};