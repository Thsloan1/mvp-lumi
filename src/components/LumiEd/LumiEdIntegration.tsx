import React from 'react';
import { BookOpen, ExternalLink, Star, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

interface LumiEdIntegrationProps {
  context: 'behavior-strategy' | 'family-communication' | 'child-profile' | 'classroom-profile';
  relatedTopics?: string[];
  className?: string;
}

export const LumiEdIntegration: React.FC<LumiEdIntegrationProps> = ({
  context,
  relatedTopics = [],
  className = ''
}) => {
  const { setCurrentView, hasLumiEdAccess } = useAppContext();

  const getContextualContent = () => {
    switch (context) {
      case 'behavior-strategy':
        return {
          title: 'Deepen Your Strategy Toolkit',
          description: 'Access comprehensive behavior toolkits with step-by-step implementation guides and visual supports.',
          suggestedResources: [
            'Complete Toddler Behavior Toolkit',
            'Trauma-Informed Classroom Guide',
            'Sensory Regulation Strategies'
          ]
        };
      case 'family-communication':
        return {
          title: 'Enhance Family Partnerships',
          description: 'Pair your communication with family companion materials and advanced conversation frameworks.',
          suggestedResources: [
            'Family Partnership Toolkit',
            'Cultural Responsiveness Guide',
            'Difficult Conversation Scripts'
          ]
        };
      case 'child-profile':
        return {
          title: 'Child-Specific Resources',
          description: 'Access targeted strategies and family materials based on this child\'s specific needs and patterns.',
          suggestedResources: [
            'Individual Behavior Plans',
            'IEP/IFSP Integration Guide',
            'Developmental Milestone Trackers'
          ]
        };
      case 'classroom-profile':
        return {
          title: 'Classroom Environment Resources',
          description: 'Transform your classroom with comprehensive environment guides and group management toolkits.',
          suggestedResources: [
            'Classroom Environment Design',
            'Group Management Mastery',
            'Routine & Transition Toolkits'
          ]
        };
      default:
        return {
          title: 'Explore LumiEd Resources',
          description: 'Access comprehensive toolkits and guides to enhance your practice.',
          suggestedResources: []
        };
    }
  };

  const content = getContextualContent();

  if (hasLumiEdAccess) {
    // Show integrated resource recommendations for subscribers
    return (
      <Card className={`p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              {content.title}
            </h3>
            <p className="text-gray-700 mb-4">
              {content.description}
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentView('library')}
                size="sm"
                icon={BookOpen}
              >
                Browse Resources
              </Button>
              <Button
                onClick={() => setCurrentView('library')}
                variant="outline"
                size="sm"
              >
                View Recommendations
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Show teaser and upsell for non-subscribers
  return (
    <Card className={`p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">
              {content.title}
            </h3>
            <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
              <Star className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-600">Premium</span>
            </div>
          </div>
          <p className="text-gray-700 mb-4">
            {content.description}
          </p>
          
          {content.suggestedResources.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-purple-900 mb-2">Suggested Resources:</p>
              <ul className="space-y-1">
                {content.suggestedResources.map((resource, index) => (
                  <li key={index} className="text-sm text-purple-700 flex items-center">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                    {resource}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button
              onClick={() => setCurrentView('lumied-preview')}
              variant="outline"
              size="sm"
              icon={BookOpen}
            >
              Preview LumiEd
            </Button>
            <Button
              onClick={() => setCurrentView('lumied-upsell')}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              icon={ExternalLink}
            >
              Unlock Access
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LumiEdIntegration;