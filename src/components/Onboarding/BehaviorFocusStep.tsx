import React from 'react';
import { Target, Plus } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';

interface BehaviorFocusStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const BehaviorFocusStep: React.FC<BehaviorFocusStepProps> = ({ data, updateData }) => {
  const behaviorOptions = [
    'Disruptive behavior',
    'Aggression',
    'Tantrums',
    'Social challenges',
    'Emotional dysregulation',
    'Transitions',
    'Withdrawal',
    'Language challenges',
    'Attention',
    'Sensitivities'
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
        <div className="grid grid-cols-2 gap-3 mb-6">
          {behaviorOptions.map((behavior, index) => (
            <Card
              key={index}
              hoverable
              selected={(data.behaviorFocus || []).includes(behavior)}
              onClick={() => handleBehaviorToggle(behavior)}
              className="p-4 text-center cursor-pointer"
            >
              <span className="text-sm font-medium text-[#1A1A1A]">
                {behavior}
              </span>
            </Card>
          ))}
        </div>

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

      {(!data.behaviorFocus || data.behaviorFocus.length === 0) && (
        <div className="text-center">
          <p className="text-sm text-red-500">
            Please select at least one behavior area to continue
          </p>
        </div>
      )}
    </div>
  );
};