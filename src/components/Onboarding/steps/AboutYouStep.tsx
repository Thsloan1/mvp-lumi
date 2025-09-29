import React from 'react';
import { User } from 'lucide-react';
import { Input } from '../../UI/Input';
import { Select } from '../../UI/Select';
import { Card } from '../../UI/Card';
import { LEARNING_STYLE_OPTIONS } from '../../../data/constants';
import { ProfilePhotoUpload } from '../../Profile/ProfilePhotoUpload';

interface AboutYouStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const AboutYouStep: React.FC<AboutYouStepProps> = ({ data, updateData }) => {
  const handleInputChange = (field: string, value: string | boolean) => {
    updateData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    updateData((prev: any) => ({ ...prev, profilePhotoUrl: photoUrl }));
  };
  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
  ];

  const learningStyleOptions = LEARNING_STYLE_OPTIONS.map(option => ({
    value: option,
    label: option
  }));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          About You
        </h2>
        <p className="text-gray-600">
          Just a few details so Lumi fits you.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
              Profile Photo (Optional)
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Add a photo after onboarding
                  </p>
                  <p className="text-xs text-blue-700">
                    You can upload a profile photo from your dashboard settings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={data.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
              placeholder="Enter your first name"
              required
            />
            <Input
              label="Last Name"
              value={data.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
              placeholder="Enter your last name"
              required
            />
          </div>

          <Select
            label="Preferred Platform Language"
            value={data.preferredLanguage}
            onChange={(value) => handleInputChange('preferredLanguage', value)}
            options={languageOptions}
            required
          />

          <Select
            label="Learning Style"
            value={data.learningStyle}
            onChange={(value) => handleInputChange('learningStyle', value)}
            options={learningStyleOptions}
            placeholder="How do you learn best?"
            required
          />
        </div>
      </Card>
    </div>
  );
};