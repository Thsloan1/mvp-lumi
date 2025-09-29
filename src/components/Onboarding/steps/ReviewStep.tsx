import React from 'react';
import { CreditCard as Edit } from 'lucide-react';
import { Card } from '../../UI/Card';

interface ReviewStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
  const sections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Name', value: `${data.firstName} ${data.lastName}` },
        { label: 'Preferred Language', value: data.preferredLanguage },
        { label: 'Learning Style', value: data.learningStyle }
      ]
    },
    {
      title: 'Classroom Details',
      items: [
        { label: 'Classroom Name', value: data.classroomName },
        { label: 'Grade/Age Band', value: data.gradeBand },
        { label: 'Student Count', value: data.studentCount },
        { label: 'Classroom In-Ratio Teachers', value: data.classroomInRatioTeachers }
      ]
    },
    {
      title: 'Environment & Support',
      items: [
        { 
          label: 'Special Needs', 
          value: [
            data.hasIEP ? `${data.iepCount} IEPs` : null,
            data.hasIFSP ? `${data.ifspCount} IFSPs` : null
          ].filter(Boolean).join(', ') || 'None'
        },
        { 
          label: 'Selected Stressors', 
          value: `${data.stressors?.length || 0} selected` 
        }
      ]
    },
    {
      title: 'Teaching Approach',
      items: [
        { label: 'Teaching Style', value: data.teachingStyle }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Review & Confirm
        </h2>
        <p className="text-gray-600">
          Please review your information before completing setup.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[#1A1A1A]">
                {section.title}
              </h3>
              <button className="text-[#C44E38] hover:text-[#A63D2A] transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between">
                  <span className="text-sm text-gray-600">{item.label}:</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};