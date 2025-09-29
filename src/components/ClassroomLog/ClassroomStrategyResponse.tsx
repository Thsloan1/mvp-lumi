import React, { useState } from 'react';
import { ArrowLeft, Users, Target, Lightbulb, Star, TrendingUp, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { AIStrategyResponse } from '../../types';

interface ClassroomStrategyResponseProps {
  response: AIStrategyResponse;
  onStrategySelect: (strategy: string, selfConfidence: number, strategyConfidence: number) => void;
  onBack: () => void;
}

export const ClassroomStrategyResponse: React.FC<ClassroomStrategyResponseProps> = ({
  response,
  onStrategySelect,
  onBack
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [selfConfidence, setSelfConfidence] = useState<number>(5);
  const [strategyConfidence, setStrategyConfidence] = useState<number>(5);
  const [doabilityRating, setDoabilityRating] = useState<number>(5);
  const { setCurrentView } = useAppContext();

  const strategies = [
    {
      id: 'aligned',
      title: 'Recommended Strategy',
      content: response.alignedStrategy || response.conceptualization,
      icon: Target,
      primary: true
    },
    {
      id: 'test',
      title: "Alternative Approach",
      content: response.testOption || response.futureReadinessBenefit,
      icon: Lightbulb,
      primary: false
    }
  ];

  const handleStrategySelect = (strategyId: string) => {
    setSelectedStrategy(strategyId);
  };

  const handleConfirm = () => {
    if (selectedStrategy) {
      const strategy = strategies.find(s => s.id === selectedStrategy);
      onStrategySelect(strategy?.content || '', selfConfidence, strategyConfidence);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto pt-8 pb-16 px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
              Here's a calm way forward
            </h1>
            <p className="text-gray-600">
              Choose the approach that feels right for your classroom
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Conceptualization */}
          <Card className="p-8">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  Understanding Your Classroom Dynamic
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {response.conceptualization || "Group challenges often reflect the collective needs of developing children navigating social learning together."}
                </p>
              </div>
            </div>
          </Card>

          {/* Strategies */}
          <div className="grid md:grid-cols-2 gap-6">
            {strategies.map((strategy) => {
              const IconComponent = strategy.icon;
              return (
                <Card
                  key={strategy.id}
                  hoverable
                  selected={selectedStrategy === strategy.id}
                  onClick={() => handleStrategySelect(strategy.id)}
                  className={`p-8 ${strategy.primary ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
                >
                  {strategy.primary && (
                    <div className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium mb-4">
                      Recommended
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                      ${selectedStrategy === strategy.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-[#E6E2DD] text-blue-500'}
                    `}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                        {strategy.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {strategy.content}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Future-Readiness Benefit */}
          <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  Building Future-Ready Skills
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {response.futureReadinessBenefit || "These strategies build classroom community and teach children to be aware of collective energy."}
                </p>
              </div>
            </div>
          </Card>

          {/* Confidence Ratings */}
          {selectedStrategy && (
            <Card className="p-8 bg-[#F8F6F4]">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Rate Your Confidence & Doability
              </h3>
              
              <div className="space-y-8">
                {/* Self Confidence */}
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-4">
                    How confident are you in your ability to use this strategy?
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Not confident</span>
                      <span className="text-sm text-gray-600">Very confident</span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={selfConfidence}
                        onChange={(e) => setSelfConfidence(parseInt(e.target.value))}
                        className="w-full h-2 bg-[#E6E2DD] rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${selfConfidence * 10}%, #E6E2DD ${selfConfidence * 10}%, #E6E2DD 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-2">
                        {Array.from({length: 10}).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${i < selfConfidence ? 'bg-blue-500' : 'bg-[#E6E2DD]'}`} />
                            <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-lg font-medium text-[#1A1A1A]">
                        {selfConfidence}/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Strategy Confidence */}
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-4">
                    How confident are you that this strategy will work with your class?
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Won't work</span>
                      <span className="text-sm text-gray-600">Will definitely work</span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={strategyConfidence}
                        onChange={(e) => setStrategyConfidence(parseInt(e.target.value))}
                        className="w-full h-2 bg-[#E6E2DD] rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #10B981 0%, #10B981 ${strategyConfidence * 10}%, #E6E2DD ${strategyConfidence * 10}%, #E6E2DD 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-2">
                        {Array.from({length: 10}).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${i < strategyConfidence ? 'bg-green-500' : 'bg-[#E6E2DD]'}`} />
                            <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-lg font-medium text-[#1A1A1A]">
                        {strategyConfidence}/10
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Doability Rating */}
                <div>
                  <h4 className="font-medium text-[#1A1A1A] mb-4">
                    How doable is this strategy in your current classroom context?
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Very difficult</span>
                      <span className="text-sm text-gray-600">Very easy</span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={doabilityRating}
                        onChange={(e) => setDoabilityRating(parseInt(e.target.value))}
                        className="w-full h-2 bg-[#E6E2DD] rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${doabilityRating * 10}%, #E6E2DD ${doabilityRating * 10}%, #E6E2DD 100%)`
                        }}
                      />
                      <div className="flex justify-between mt-2">
                        {Array.from({length: 10}).map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-2 h-2 rounded-full ${i < doabilityRating ? 'bg-orange-500' : 'bg-[#E6E2DD]'}`} />
                            <span className="text-xs text-gray-500 mt-1">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <span className="text-lg font-medium text-[#1A1A1A]">
                        {doabilityRating}/10
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-6">
                  <Button
                    onClick={handleConfirm}
                    size="lg"
                    className="px-12"
                    icon={CheckCircle}
                  >
                    I'll Try This Strategy
                  </Button>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    Good call — you're giving your class a tool for teamwork.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {!selectedStrategy && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Choose a strategy above to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};