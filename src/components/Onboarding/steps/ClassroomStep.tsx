import React from 'react';
import { Input } from '../../UI/Input';
import { Select } from '../../UI/Select';
import { Card } from '../../UI/Card';
import { GRADE_BAND_OPTIONS } from '../../../data/constants';

interface ClassroomStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const ClassroomStep: React.FC<ClassroomStepProps> = ({ data, updateData }) => {
  const handleInputChange = (field: string, value: string | number) => {
    updateData((prev: any) => ({ ...prev, [field]: value }));
  };

  const gradeBandOptions = GRADE_BAND_OPTIONS.map(option => ({
    value: option,
    label: option
  }));

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Your Classroom
        </h2>
        <p className="text-gray-600">
          Tell us about your class of students.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <Input
            label="Classroom Name"
            value={data.classroomName}
            onChange={(value) => handleInputChange('classroomName', value)}
            placeholder="e.g., Ms. Johnson's Preschool Class"
            required
          />

          <Select
            label="Grade/Age Band"
            value={data.gradeBand}
            onChange={(value) => handleInputChange('gradeBand', value)}
            options={gradeBandOptions}
            placeholder="Select grade or age range"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Student Count"
              type="number"
              value={data.studentCount}
              onChange={(value) => handleInputChange('studentCount', value)}
              placeholder="Number of students"
              min={1}
              max={50}
              required
            />

            <Input
              label="Teacher:Student Ratio"
              value={data.teacherStudentRatio}
              onChange={(value) => handleInputChange('teacherStudentRatio', value)}
              placeholder="e.g., 1:8 or 2:16"
              required
            />
          </div>
        </div>
      </Card>
    </div>
  );
};