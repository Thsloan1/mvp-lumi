import React from 'react';
import { Input } from '../../UI/Input';
import { Card } from '../../UI/Card';
import { STRESSOR_OPTIONS } from '../../../data/constants';
import { AutoSaveManager } from '../../../utils/autoSaveManager';

interface EnvironmentStepProps {
  data: any;
  updateData: (data: any) => void;
}

export const EnvironmentStep: React.FC<EnvironmentStepProps> = ({ data, updateData }) => {
  const handleInputChange = (field: string, value: string | boolean | number) => {
    updateData((prev: any) => ({ ...prev, [field]: value }));
    
    // Auto-save when data changes
    AutoSaveManager.autoSave('lumi_onboarding_progress', { ...data, [field]: value });
  };

  const handleStressorToggle = (stressor: string) => {
    const currentStressors = data.stressors || [];
    const isSelected = currentStressors.includes(stressor);
    
    let newStressors;
    if (isSelected) {
      newStressors = currentStressors.filter((s: string) => s !== stressor);
    } else {
      newStressors = [...currentStressors, stressor];
    }
    
    updateData((prev: any) => ({ ...prev, stressors: newStressors }));
    
    // Auto-save stressor changes
    AutoSaveManager.autoSave('lumi_onboarding_progress', { ...data, stressors: newStressors });
  };

  const stressorCategories = [
    {
      title: 'Teacher/Educator Stressors',
      stressors: STRESSOR_OPTIONS.slice(0, 9)
    },
    {
      title: 'Stressors Brought into Classroom by the children',
      stressors: STRESSOR_OPTIONS.slice(9, 18)
    },
    {
      title: 'Family and Community Stressors',
      stressors: STRESSOR_OPTIONS.slice(18, 24)
    },
    {
      title: 'Programmatic and System Factors',
      stressors: STRESSOR_OPTIONS.slice(24)
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-[#1A1A1A] mb-2">
          Classroom Environment
        </h2>
        <p className="text-gray-600">
          This helps Lumi personalize support for your teaching context.
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          {/* IEP/IFSP Section */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] mb-4">
              Special Needs Support
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.hasIEP}
                    onChange={(e) => handleInputChange('hasIEP', e.target.checked)}
                    className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                  />
                  <span className="text-sm">Students with IEPs</span>
                </label>
                {data.hasIEP && (
                  <Input
                    type="number"
                    value={data.iepCount?.toString() || ''}
                    onChange={(value) => handleInputChange('iepCount', parseInt(value) || 0)}
                    placeholder="Count"
                    className="w-20"
                    min={0}
                  />
                )}
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data.hasIFSP}
                    onChange={(e) => handleInputChange('hasIFSP', e.target.checked)}
                    className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                  />
                  <span className="text-sm">Students with IFSPs</span>
                </label>
                {data.hasIFSP && (
                  <Input
                    type="number"
                    value={data.ifspCount?.toString() || ''}
                    onChange={(value) => handleInputChange('ifspCount', parseInt(value) || 0)}
                    placeholder="Count"
                    className="w-20"
                    min={0}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Stressors Section */}
          <div>
            <h3 className="font-medium text-[#1A1A1A] mb-4">
              Stressful Conditions <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              For each list, select as many that represent you, your classroom and families (select at least one):
            </p>
            
            <div className="space-y-6">
              {stressorCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h4 className="font-medium text-[#1A1A1A] mb-3 text-sm">
                    {category.title}
                  </h4>
                  <div className="grid gap-3">
                    {category.stressors.map((stressor, index) => (
                      <label
                        key={index}
                        className="flex items-start space-x-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={data.stressors?.includes(stressor) || false}
                          onChange={() => handleStressorToggle(stressor)}
                          className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#1A1A1A] transition-colors leading-relaxed">
                          {stressor}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {(!data.stressors || data.stressors.length === 0) && (
              <p className="text-sm text-red-500 mt-4">
                Please select at least one stressor to continue
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};