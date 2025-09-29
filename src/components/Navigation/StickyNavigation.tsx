import React from 'react';
import { useEffect } from 'react';
import { User, Users, BookOpen, BarChart3, Settings, Heart, Home, LogOut } from 'lucide-react';
import { Button } from '../UI/Button';
import { useAppContext } from '../../context/AppContext';

export const StickyNavigation: React.FC = () => {
  const { currentView, setCurrentView, currentUser, signout } = useAppContext();
  
  // Use keyboard navigation hook
  useKeyboardNavigation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      view: 'dashboard'
    },
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
    },
    {
      id: 'knowledge-library',
      label: 'Knowledge Library',
      icon: BookOpen,
      view: 'knowledge-library-manager'
    }
  ];

  const isActive = (itemView: string) => {
    return currentView === itemView || 
           (itemView === 'child-profiles' && currentView === 'child-profile-detail') ||
           (itemView === 'reports' && currentView.startsWith('report-')) ||
           (itemView === 'dashboard' && ['dashboard', 'behavior-log', 'classroom-log'].includes(currentView));
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E6E2DD] shadow-sm" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
            role="button"
            tabIndex={0}
            aria-label="Go to dashboard"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setCurrentView('dashboard');
              }
            }}
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
                  aria-label={`Navigate to ${item.label}`}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${active 
                      ? 'bg-[#C44E38] text-white shadow-sm' 
                      : 'text-gray-600 hover:text-[#1A1A1A] hover:bg-[#F8F6F4]'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
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
            <div className="relative group">
              <button 
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                aria-label="User menu"
                aria-expanded="false"
              >
                {currentUser?.profilePhotoUrl ? (
                  <img
                    src={currentUser.profilePhotoUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
              </button>
              
              {/* User Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E6E2DD] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <button
                    onClick={() => setCurrentView('profile-settings')}
                    className="w-full text-left px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F8F6F4] rounded-lg flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Profile & Settings</span>
                  </button>
                  <div className="border-t border-[#E6E2DD] my-2"></div>
                  <button
                    onClick={() => signout()}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Keyboard navigation hook for the navigation component
export const useKeyboardNavigation = () => {
  const { setCurrentView } = useAppContext();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + number keys for quick navigation
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentView('dashboard');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('child-profiles');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('classroom-profile');
            break;
          case '4':
            e.preventDefault();
            setCurrentView('library');
            break;
          case '5':
            e.preventDefault();
            setCurrentView('reports');
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);
};