import React from 'react';
import { User, Users, BookOpen, Lock, BarChart3, Settings, Heart } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAppContext } from '../../context/AppContext';

export const StickyNavigation: React.FC = () => {
  const { currentView, setCurrentView, currentUser } = useAppContext();

  const navigationItems = [
    {
      id: 'child-profiles',
      label: 'Child Profiles',
      icon: User,
      view: 'child-profiles'
    },
    {
      id: 'classroom-profile',
      label: 'Classroom Profile',
      icon: Users,
      view: 'classroom-profile'
    },
    {
      id: 'library',
      label: 'Learning Library',
      icon: BookOpen,
      view: 'library'
    },
    {
      id: 'lumied-preview',
      label: 'LumiEd',
      icon: Lock,
      view: 'lumied-preview',
      locked: true
    },
    {
      id: 'reports',
      label: 'Data & Reports',
      icon: BarChart3,
      view: 'reports'
    },
    {
      id: 'profile',
      label: 'Profile & Settings',
      icon: Settings,
      view: 'profile-settings'
    }
  ];

  const isActive = (itemView: string) => {
    return currentView === itemView || 
           (itemView === 'child-profiles' && currentView === 'child-profile-detail') ||
           (itemView === 'reports' && currentView.startsWith('report-'));
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E6E2DD] shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-8 h-8 bg-[#C44E38] rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">Lumi</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.view);
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.view)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active 
                      ? 'bg-[#C44E38] text-white shadow-sm' 
                      : 'text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F8F6F4]'
                    }
                    ${item.locked ? 'relative' : ''}
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.locked && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Lock className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-[#1A1A1A]">
                {currentUser?.fullName?.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-600">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Educator'}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>
        {/* LumiEd Integration Callout */}
        {generatedScript && (
          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                  Enhance with LumiEd Resources
                </h3>
                <p className="text-gray-700 mb-4">
                  Pair this family communication with relevant toolkits and family companion materials from LumiEd.
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setCurrentView('lumied-preview')}
                    variant="outline"
                    size="sm"
                    icon={BookOpen}
                  >
                    Browse LumiEd
                  </Button>
                  <Button
                    onClick={() => setCurrentView('lumied-upsell')}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Unlock Premium
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </nav>
  );
};