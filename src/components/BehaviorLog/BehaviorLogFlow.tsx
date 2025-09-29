import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Mic, Send, User, Plus } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Card } from '../UI/Card';
import { ProgressDots } from '../UI/ProgressDots';
import { useAppContext } from '../../context/AppContext';
import { BehaviorLog, Child } from '../../types';
import { 
  CONTEXT_OPTIONS, 
  SEVERITY_DESCRIPTORS, 
  TIME_OF_DAY_OPTIONS,
  INTENSITY_OPTIONS,
  DURATION_OPTIONS,
  FREQUENCY_OPTIONS,
  ADULT_RESPONSE_OPTIONS,
  OUTCOME_OPTIONS,
  CONTEXT_TRIGGER_OPTIONS
} from '../../data/constants';
import { generateChildBehaviorStrategy } from '../../utils/mockAI';
import { BehaviorStrategyResponse } from './BehaviorStrategyResponse';

export const BehaviorLogFlow: React.FC = () => {
  const { setCurrentView, currentUser, behaviorLogs, setBehaviorLogs, children, setChildren } = useAppContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showNewChildForm, setShowNewChildForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [skippedSteps, setSkippedSteps] = useState<Set<number>>(new Set());
  const [behaviorData, setBehaviorData] = useState({
    childId: '',
    behaviorDescription: '',
    context: '',
    timeOfDay: '',
    severity: '',
    educatorMood: '',
    intensity: '',
    duration: '',
    frequency: '',
    adultResponse: [] as string[],
    outcome: [] as string[],
    contextTrigger: [] as string[]
  });
  const [aiResponse, setAiResponse] = useState(null);

  const steps = [
    { title: "Which child?", field: 'childId' },
    { title: "What's happening?", field: 'behaviorDescription' },
    { title: "Where did it happen?", field: 'context' },
    { title: "What time of day?", field: 'timeOfDay' },
    { title: "How intense was it?", field: 'severity' },
    { title: "How are your emotions during this behavior?", field: 'educatorMood' }
  ];

  const contextOptions = CONTEXT_OPTIONS.map(option => ({
    value: option.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    label: option
  }));

  const severityOptions = [
    { value: 'low', label: 'Low - Minor disruption, easily managed' },
    { value: 'medium', label: 'Medium - Moderate challenge, required attention' },
    { value: 'high', label: 'High - Significant disruption, immediate intervention needed' }
  ];

  const moodOptions = [
    { value: 'overwhelmed', label: 'Overwhelmed' },
    { value: 'frustrated', label: 'Frustrated' },
    { value: 'angry', label: 'Angry' },
    { value: 'frustrated', label: 'Frustrated' },
    { value: 'angry', label: 'Angry' },
    { value: 'managing', label: 'Managing' },
    { value: 'okay', label: 'Okay' },
    { value: 'calm', label: 'Calm' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setBehaviorData(prev => ({ ...prev, [field]: value }));
    
    // If this is the behavior description, parse it for auto-filled information
    if (field === 'behaviorDescription') {
      parseAndAutoFill(value);
    }
  };

  const parseAndAutoFill = (description: string) => {
    const lowerDesc = description.toLowerCase();
    const newSkippedSteps = new Set<number>();
    const updates: Partial<typeof behaviorData> = {};
    
    // Parse context (step 2)
    if (lowerDesc.includes('circle time') || lowerDesc.includes('circle')) {
      updates.context = 'circle_time';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('transition') || lowerDesc.includes('transitioning')) {
      updates.context = 'transition';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('free play') || lowerDesc.includes('play time')) {
      updates.context = 'free_play';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('meal') || lowerDesc.includes('lunch') || lowerDesc.includes('snack')) {
      updates.context = 'meal_time';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('cleanup') || lowerDesc.includes('clean up')) {
      updates.context = 'cleanup';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('arrival') || lowerDesc.includes('drop off') || lowerDesc.includes('drop-off')) {
      updates.context = 'arrival_drop_off';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('outdoor') || lowerDesc.includes('playground')) {
      updates.context = 'outdoor_play';
      newSkippedSteps.add(2);
    } else if (lowerDesc.includes('nap') || lowerDesc.includes('rest')) {
      updates.context = 'rest_nap_time';
      newSkippedSteps.add(2);
    }
    
    // Parse time of day (step 3)
    if (lowerDesc.includes('morning') || lowerDesc.includes('early')) {
      updates.timeOfDay = 'morning';
      newSkippedSteps.add(3);
    } else if (lowerDesc.includes('afternoon') || lowerDesc.includes('late')) {
      updates.timeOfDay = 'afternoon';
      newSkippedSteps.add(3);
    } else if (lowerDesc.includes('midday') || lowerDesc.includes('noon') || lowerDesc.includes('lunch time')) {
      updates.timeOfDay = 'midday';
      newSkippedSteps.add(3);
    }
    
    // Parse severity (step 4)
    if (lowerDesc.includes('meltdown') || lowerDesc.includes('aggressive') || lowerDesc.includes('violent') || lowerDesc.includes('screaming')) {
      updates.severity = 'high';
      newSkippedSteps.add(4);
    } else if (lowerDesc.includes('frustrated') || lowerDesc.includes('upset') || lowerDesc.includes('crying')) {
      updates.severity = 'medium';
      newSkippedSteps.add(4);
    } else if (lowerDesc.includes('minor') || lowerDesc.includes('small') || lowerDesc.includes('brief')) {
      updates.severity = 'low';
      newSkippedSteps.add(4);
    }
    
    // Parse educator mood (step 5)
    if (lowerDesc.includes('overwhelmed') || lowerDesc.includes('overwhelming')) {
      updates.educatorMood = 'overwhelmed';
      newSkippedSteps.add(5);
    } else if (lowerDesc.includes('frustrated') || lowerDesc.includes('frustrating')) {
      updates.educatorMood = 'frustrated';
      newSkippedSteps.add(5);
    } else if (lowerDesc.includes('angry') || lowerDesc.includes('mad')) {
      updates.educatorMood = 'angry';
      newSkippedSteps.add(5);
    } else if (lowerDesc.includes('calm') || lowerDesc.includes('peaceful')) {
      updates.educatorMood = 'calm';
      newSkippedSteps.add(5);
    }
    
    // Update state with parsed information
    if (Object.keys(updates).length > 0) {
      setBehaviorData(prev => ({ ...prev, ...updates }));
    }
    
    setSkippedSteps(newSkippedSteps);
  };

  const handleCreateNewChild = () => {
    if (newChildName.trim()) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: newChildName.trim(),
        gradeBand: 'Preschool (4-5 years old)', // Default, can be updated later
        classroomId: 'default-classroom',
        hasIEP: false,
        hasIFSP: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setChildren([...children, newChild]);
      setBehaviorData(prev => ({ ...prev, childId: newChild.id }));
      setNewChildName('');
      setShowNewChildForm(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Find the next non-skipped step
      let nextStep = currentStep + 1;
      while (nextStep < steps.length && skippedSteps.has(nextStep)) {
        nextStep++;
      }
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Find the previous non-skipped step
      let prevStep = currentStep - 1;
      while (prevStep >= 0 && skippedSteps.has(prevStep)) {
        prevStep--;
      }
      setCurrentStep(prevStep);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isStepValid()) {
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        handleNext();
      }
    }
  };

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    
    setLoading(true);
    
    try {
      // Generate AI strategy
      const selectedChild = children.find(c => c.id === behaviorData.childId);
      const response = await generateChildBehaviorStrategy(
        behaviorData.behaviorDescription,
        behaviorData.context,
        behaviorData.timeOfDay,
        behaviorData.severity,
        [], // stressors would come from classroom context
        currentUser?.teachingStyle,
        'preschool', // would come from classroom context
        behaviorData.educatorMood,
        currentUser?.learningStyle,
        selectedChild
      );
      
      setAiResponse(response);
      setCurrentStep(steps.length); // Move to response screen
    } catch (error) {
      console.error('Error generating strategy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStrategySelect = (strategy: string, confidence: number) => {
    const newBehaviorLog: BehaviorLog = {
      id: Date.now().toString(),
      childId: behaviorData.childId,
      educatorId: currentUser?.id || '',
      behaviorDescription: behaviorData.behaviorDescription,
      context: behaviorData.context,
      timeOfDay: behaviorData.timeOfDay,
      severity: behaviorData.severity as 'low' | 'medium' | 'high',
      educatorMood: behaviorData.educatorMood as any,
      stressors: [], // This would be populated from classroom context
      aiResponse: aiResponse,
      selectedStrategy: strategy,
      confidenceRating: confidence,
      createdAt: new Date()
    };

    setBehaviorLogs([...behaviorLogs, newBehaviorLog]);
    setCurrentView('dashboard');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return behaviorData.childId.length > 0;
      case 1:
        return behaviorData.behaviorDescription.length >= 5;
      case 2:
        return behaviorData.context.length > 0;
      case 3:
        return behaviorData.timeOfDay.length > 0;
      case 4:
        return behaviorData.severity.length > 0;
      case 5:
        return true; // Mood is optional
      default:
        return true;
    }
  };

  if (aiResponse) {
    return (
      <BehaviorStrategyResponse
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
              Behavior Strategy Lookup
            </h1>
            <ProgressDots total={steps.length} current={currentStep} />
            <p className="text-sm text-gray-600 mt-4">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8" onKeyPress={handleKeyPress}>
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
              {steps[currentStep].title}
            </h2>
          </div>

          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
                  Select Child
                </label>
                <div className="grid gap-3">
                  {children.map((child) => (
                    <Card
                      key={child.id}
                      hoverable
                      selected={behaviorData.childId === child.id}
                      onClick={() => handleInputChange('childId', child.id)}
                      className="p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{child.name}</p>
                          <p className="text-sm text-gray-600">{child.gradeBand}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  
                  {!showNewChildForm ? (
                    <Card
                      hoverable
                      onClick={() => setShowNewChildForm(true)}
                      className="p-4 border-dashed border-2 border-[#C44E38] bg-[#C44E38] bg-opacity-5"
                    >
                      <div className="flex items-center justify-center space-x-3 text-[#C44E38]">
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add New Child</span>
                      </div>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        value={newChildName}
                        onChange={setNewChildName}
                        placeholder="Enter child's name"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <Button onClick={handleCreateNewChild} size="sm">Add Child</Button>
                        <Button variant="ghost" onClick={() => setShowNewChildForm(false)} size="sm">Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              {skippedSteps.size > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-700">
                    ✓ Great! I found some details in your description and filled them in automatically.
                  </p>
                </div>
              )}
              <Input
                type="textarea"
                value={behaviorData.behaviorDescription}
                onChange={(value) => handleInputChange('behaviorDescription', value)}
                placeholder="Describe what you observed... (e.g., 'Child threw blocks when asked to clean up')"
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

          {currentStep === 2 && (
            <div className="space-y-4">
              {behaviorData.context && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    ✓ Auto-detected: {contextOptions.find(opt => opt.value === behaviorData.context)?.label}
                  </p>
                </div>
              )}
            <Select
              value={behaviorData.context}
              onChange={(value) => handleInputChange('context', value)}
              options={contextOptions}
              placeholder="Select when this happened"
              required
            />
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {behaviorData.timeOfDay && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700">
                    ✓ Auto-detected: {TIME_OF_DAY_OPTIONS.find(opt => opt.value === behaviorData.timeOfDay)?.label}
                  </p>
                </div>
              )}
            <Select
              value={behaviorData.timeOfDay}
              onChange={(value) => handleInputChange('timeOfDay', value)}
              options={TIME_OF_DAY_OPTIONS}
              placeholder="Select time of day"
              required
            />
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              {behaviorData.severity && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm text-blue-700">
                    ✓ Auto-detected severity: {behaviorData.severity.charAt(0).toUpperCase() + behaviorData.severity.slice(1)}
                  </p>
                </div>
              )}
              {severityOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  selected={behaviorData.severity === option.value}
                  onClick={() => handleInputChange('severity', option.value)}
                  className="p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      w-3 h-3 rounded-full
                      ${option.value === 'low' ? 'bg-green-500' :
                        option.value === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                    `} />
                    <span className="font-medium text-[#1A1A1A]">
                      {option.label}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {currentStep === 5 && (
            <div>
              {behaviorData.educatorMood && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-700">
                    ✓ Auto-detected mood: {behaviorData.educatorMood.charAt(0).toUpperCase() + behaviorData.educatorMood.slice(1)}
                  </p>
                </div>
              )}
              <p className="text-center text-gray-600 mb-6">
                This is optional, but helps us provide better support.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {moodOptions.map((option) => (
                  <Card
                    key={option.value}
                    hoverable
                    selected={behaviorData.educatorMood === option.value}
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
              {currentStep === 0 ? 'Please select a child to continue' :
               currentStep === 1 ? 'Please describe what happened (at least 5 characters)' :
               currentStep === 2 ? 'Please select where this happened' :
               currentStep === 3 ? 'Please select the time of day' :
               currentStep === 4 ? 'Please select the intensity level' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};