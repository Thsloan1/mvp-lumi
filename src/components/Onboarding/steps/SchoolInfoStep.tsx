import React from 'react';
import { School } from 'lucide-react';
import { Input } from '../../UI/Input';
import { Card } from '../../UI/Card';
import { AutoSaveManager } from '../../../utils/autoSaveManager';

interface SchoolInfoStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const SchoolInfoStep: React.FC<SchoolInfoStepProps> = ({ data, updateData }) => {
  const handleInputChange = (field: string, value: string) => {
    updateData((prev: any) => ({ ...prev, [field]: value }));
    
    // Auto-save when data changes
    AutoSaveManager.autoSave('lumi_onboarding_progress', { ...data, [field]: value });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          School Information
        </h2>
        <p className="text-gray-600">
          Tell us about your school and classroom location.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
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

          <Input
            label="School Name"
            value={data.schoolName}
            onChange={(value) => handleInputChange('schoolName', value)}
            placeholder="Enter your school name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Number"
              value={data.roomNumber}
              onChange={(value) => handleInputChange('roomNumber', value)}
              placeholder="e.g., Room 12, Classroom A"
            />
            <Input
              label="School District"
              value={data.schoolDistrict}
              onChange={(value) => handleInputChange('schoolDistrict', value)}
              placeholder="Enter school district"
            />
          </div>

          <Input
            label="County"
            value={data.county}
            onChange={(value) => handleInputChange('county', value)}
            placeholder="Enter county"
            required
          />
        </div>
      </Card>
    </div>
  );
};