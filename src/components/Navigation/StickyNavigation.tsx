import React from 'react';
import { User, Users, BookOpen, Lock, BarChart3, Settings, Heart } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAppContext } from '../../context/AppContext';

export const StickyNavigation: React.FC = () => {
  const { currentView, setCurrentView, user } = useAppContext();
  const { signOut } = useSession();

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
                {user?.name?.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-600">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Educator'}
              </p>
            </div>
            <button 
              onClick={() => signOut()}
              className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <User className="w-4 h-4 text-blue-600" />
            </button>
          </div>
      </div>
    </nav>
  );
};