import React from 'react';
import { Target, Plus, CheckCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';

interface BehaviorFocusStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const BehaviorFocusStep: React.FC<BehaviorFocusStepProps> = ({ data, updateData }) => {
  const behaviorOptions = [
    'Hitting, biting, kicking, throwing',
    'Tantrums',
    'Kids not getting along',
    'Out of control emotions',
    'Chaotic routines/transitions',
    'Staying away from others',
    'Hard to use words to express',
    'Not paying attention'
  ];

  const handleBehaviorToggle = (behavior: string) => {
    const currentBehaviors = data.behaviorFocus || [];
    const isSelected = currentBehaviors.includes(behavior);
    
    let newBehaviors;
    if (isSelected) {
      newBehaviors = currentBehaviors.filter((b: string) => b !== behavior);
    } else {
      newBehaviors = [...currentBehaviors, behavior];
    }
    
    updateData((prev: any) => ({ ...prev, behaviorFocus: newBehaviors }));
  };

  const handleSpecificBehaviorChange = (value: string) => {
    updateData((prev: any) => ({ ...prev, specificBehavior: value }));
  };

  const handleConfidenceChange = (confidence: string) => {
    updateData((prev: any) => ({ ...prev, behaviorConfidence: confidence }));
  };

  const confidenceOptions = [
    { value: 'not_confident', label: 'Not confident' },
    { value: 'somewhat_confident', label: 'Somewhat confident' },
    { value: 'mostly', label: 'Mostly' },
    { value: 'very_confident', label: 'Very confident' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          What behaviors are you focused on right now?
        </h2>
        <p className="text-gray-600 mb-4">
          Choose the areas you most want help with. You can always change these later.
        </p>
        <p className="text-sm text-gray-500">
          Select all that apply.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {behaviorOptions.map((behavior, index) => (
            <div
              key={index}
              className={`
                p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                ${(data.behaviorFocus || []).includes(behavior)
                  ? 'border-[#C44E38] bg-[#C44E38] bg-opacity-5 text-[#C44E38]'
                  : 'border-[#E6E2DD] hover:border-[#C44E38] hover:bg-[#F8F6F4]'
                }
              `}
              onClick={() => handleBehaviorToggle(behavior)}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  ${(data.behaviorFocus || []).includes(behavior)
                    ? 'border-[#C44E38] bg-[#C44E38]'
                    : 'border-gray-300'
                  }
                `}>
                  {(data.behaviorFocus || []).includes(behavior) && (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium flex-1">
                  {behavior}
                </span>
              </div>
            </div>
          ))}
        </div>

        {(data.behaviorFocus || []).length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm font-medium text-green-900 mb-2">
              Selected behaviors ({(data.behaviorFocus || []).length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {(data.behaviorFocus || []).map((behavior, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#C44E38] text-white text-xs rounded-full"
                >
                {behavior}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Describe a specific behavior you're seeing (optional)
            </label>
            <Input
              type="textarea"
              value={data.specificBehavior || ''}
              onChange={handleSpecificBehaviorChange}
              placeholder="e.g., A child is having daily tantrums when asked to clean up"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-4">
              How confident do you feel in handling behavior challenges?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {confidenceOptions.map((option) => (
                <Card
                  key={option.value}
                  hoverable
                  selected={data.behaviorConfidence === option.value}
                  onClick={() => handleConfidenceChange(option.value)}
                  className="p-3 text-center cursor-pointer"
                >
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {option.label}
                  </span>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export { BehaviorFocusStep }