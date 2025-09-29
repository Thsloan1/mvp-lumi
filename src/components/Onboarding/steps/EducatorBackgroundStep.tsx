import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Select } from '../../UI/Select';
import { Card } from '../../UI/Card';

interface EducatorBackgroundStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const EducatorBackgroundStep: React.FC<EducatorBackgroundStepProps> = ({ data, updateData }) => {
  const handleInputChange = (field: string, value: string) => {
    updateData((prev: any) => ({ ...prev, [field]: value }));
  };

  const yearsOfExperienceOptions = [
    { value: '1_or_less', label: '1 year or less' },
    { value: '2_to_5', label: '2–5 years' },
    { value: '6_to_9', label: '6–9 years' },
    { value: '10_to_15', label: '10–15 years' },
    { value: '16_to_20', label: '16–20 years' },
    { value: '21_to_25', label: '21–25 years' },
    { value: '26_to_30', label: '26–30 years' },
    { value: '31_plus', label: '31+ years' }
  ];

  const highestEducationOptions = [
    { value: 'high_school', label: 'High school' },
    { value: 'some_college', label: 'Some college' },
    { value: 'associate_degree', label: 'Associate degree' },
    { value: 'bachelor_degree', label: 'Bachelor degree' },
    { value: 'master_degree', label: 'Master\'s degree' },
    { value: 'doctorate_degree', label: 'Doctorate degree' }
  ];

  const roleOptions = [
    { value: 'lead_teacher', label: 'Lead Teacher' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'associate_teacher', label: 'Associate Teacher' },
    { value: 'teacher_aide', label: 'Teacher Aide' },
    { value: 'site_director', label: 'Site Director' },
    { value: 'administrator', label: 'Administrator' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Tell Us About Your Background
        </h2>
        <p className="text-gray-600">
          This helps Lumi personalize strategies and resources for your classroom.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <Select
            label="Years of Experience"
            value={data.yearsOfExperience}
            onChange={(value) => handleInputChange('yearsOfExperience', value)}
            options={yearsOfExperienceOptions}
            placeholder="Select your years of experience"
            required
          />

          <Select
            label="Highest Education"
            value={data.highestEducation}
            onChange={(value) => handleInputChange('highestEducation', value)}
            options={highestEducationOptions}
            placeholder="Select your highest education level"
            required
          />

          <Select
            label="Role"
            value={data.role}
            onChange={(value) => handleInputChange('role', value)}
            options={roleOptions}
            placeholder="Select your current role"
            required
          />
        </div>
      </Card>
    </div>
  );
};