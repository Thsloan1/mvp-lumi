import React from 'react';
import { User, School } from 'lucide-react';
import { Input } from '../../UI/Input';
import { Select } from '../../UI/Select';
import { Card } from '../../UI/Card';
import { ProfilePhotoUpload } from '../../Profile/ProfilePhotoUpload';
import { useAppContext } from '../../../context/AppContext';

interface AboutYouStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const AboutYouStep: React.FC<AboutYouStepProps> = ({ data, updateData }) => {
  const { toast } = useAppContext();

  const handleInputChange = (field: string, value: string | boolean) => {
    updateData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    updateData((prev: any) => ({ ...prev, profilePhotoUrl: photoUrl }));
    if (photoUrl) {
      toast.success('Photo uploaded!', 'Your profile photo has been added');
    }
  };

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
  ];


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
            <ProfilePhotoUpload
              currentPhotoUrl={data.profilePhotoUrl}
              onPhotoUpdate={handlePhotoUpdate}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={data.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
            required
          />
        </div>
      </Card>
    </div>
  );
};

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