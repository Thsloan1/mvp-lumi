import React from 'react';
import { Card } from '../../UI/Card';
import { TEACHING_STYLE_OPTIONS } from '../../../data/constants';

interface TeachingStyleStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const TeachingStyleStep: React.FC<TeachingStyleStepProps> = ({ data, updateData }) => {
  const handleStyleSelect = (style: string) => {
    updateData((prev: any) => ({ ...prev, teachingStyle: style }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Teaching Style
        </h2>
        <p className="text-gray-600">
          What's your teaching style? This helps Lumi tailor strategies to fit how you lead your class.
        </p>
      </div>

      <div className="grid gap-4">
        {TEACHING_STYLE_OPTIONS.map((style, index) => (
          <Card
            key={index}
            hoverable
            selected={data.teachingStyle === style}
            onClick={() => handleStyleSelect(style)}
            className="p-6"
          >
            <div className="text-center">
              <p className="font-medium text-[#1A1A1A]">
                {style}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {!data.teachingStyle && (
        <div className="text-center">
          <p className="text-sm text-red-500">
            Please choose your teaching style to continue
          </p>
        </div>
      )}
    </div>
  );
};