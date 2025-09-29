import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Classroom, BehaviorLog, ClassroomLog, Child } from '../types';
import { useToast } from '../hooks/useToast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuthService } from '../services/authService';

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  signout: () => void;
  updateOnboarding: (data: any) => Promise<void>;
  
  // Data
  classrooms: Classroom[];
  children: Child[];
  behaviorLogs: BehaviorLog[];
  classroomLogs: ClassroomLog[];
  loading: boolean;
  
  // Actions
  createBehaviorLog: (data: any) => Promise<any>;
  createClassroomLog: (data: any) => Promise<any>;
  createChild: (data: any) => Promise<any>;
  createClassroom: (data: any) => Promise<any>;
  updateClassroom: (id: string, data: any) => Promise<any>;
  setChildren: (children: Child[]) => void;
  setClassrooms: (classrooms: Classroom[]) => void;
  
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Toast notifications
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useLocalStorage<string>('lumi_current_view', 'welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Data state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [apiChildren, setApiChildren] = useState<Child[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);
  const [classroomLogs, setClassroomLogs] = useState<ClassroomLog[]>([]);
  
  const { success, error, warning, info } = useToast();

  // Initialize user on app load
  useEffect(() => {
    initializeUser();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const initializeUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      if (user && user.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else if (user) {
        setCurrentView('dashboard');
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [childrenRes, classroomsRes, behaviorRes, classroomRes] = await Promise.all([
        AuthService.apiRequest('/api/children'),
        AuthService.apiRequest('/api/classrooms'),
        AuthService.apiRequest('/api/behavior-logs'),
        AuthService.apiRequest('/api/classroom-logs')
      ]);

      setApiChildren(childrenRes.children || []);
      setClassrooms(classroomsRes.classrooms || []);
      setBehaviorLogs(behaviorRes.behaviorLogs || []);
      setClassroomLogs(classroomRes.classroomLogs || []);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      const result = await AuthService.signin({ email, password });
      setCurrentUser(result.user);
      success('Welcome back!', 'Successfully signed in');
      
      if (result.user.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      error('Sign in failed', err.message);
      throw err;
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      const result = await AuthService.signup({ fullName, email, password });
      setCurrentUser(result.user);
      success('Account created!', 'Welcome to Lumi');
      setCurrentView('onboarding-start');
    } catch (err: any) {
      error('Sign up failed', err.message);
      throw err;
    }
  };

  const signout = () => {
    AuthService.signout();
    setCurrentUser(null);
    setApiChildren([]);
    setClassrooms([]);
    setBehaviorLogs([]);
    setClassroomLogs([]);
    setCurrentView('welcome');
    info('Signed out', 'See you next time!');
  };

  const updateOnboarding = async (data: any) => {
    try {
      const updatedUser = await AuthService.updateOnboarding(data);
      setCurrentUser(updatedUser);
      success('Profile updated!', 'Your preferences have been saved');
      setCurrentView('dashboard');
    } catch (err: any) {
      error('Update failed', err.message);
      throw err;
    }
  };

  const createBehaviorLog = async (data: any) => {
    try {
      const result = await AuthService.apiRequest('/api/behavior-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setBehaviorLogs(prev => [result.behaviorLog, ...prev]);
      success('Behavior logged!', 'Strategy saved to your dashboard');
      return result.behaviorLog;
    } catch (err: any) {
      error('Failed to save', err.message);
      throw err;
    }
  };

  const createClassroomLog = async (data: any) => {
    try {
      const result = await AuthService.apiRequest('/api/classroom-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setClassroomLogs(prev => [result.classroomLog, ...prev]);
      success('Classroom challenge logged!', 'Strategy saved to your dashboard');
      return result.classroomLog;
    } catch (err: any) {
      error('Failed to save', err.message);
      throw err;
    }
  };

  const createChild = async (data: any) => {
    try {
      const result = await AuthService.apiRequest('/api/children', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setApiChildren(prev => [...prev, result.child]);
      success('Child added!', `${data.name} has been added to your classroom`);
      return result.child;
    } catch (err: any) {
      error('Failed to add child', err.message);
      throw err;
    }
  };

  const createClassroom = async (data: any) => {
    try {
      const result = await AuthService.apiRequest('/api/classrooms', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setClassrooms(prev => [...prev, result.classroom]);
      success('Classroom created!', `${data.name} has been set up`);
      return result.classroom;
    } catch (err: any) {
      error('Failed to create classroom', err.message);
      throw err;
    }
  };

  const updateClassroom = async (id: string, data: any) => {
    try {
      const result = await AuthService.apiRequest(`/api/classrooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setClassrooms(prev => prev.map(c => c.id === id ? result.classroom : c));
      success('Classroom updated!', 'Your changes have been saved');
      return result.classroom;
    } catch (err: any) {
      error('Failed to update classroom', err.message);
      throw err;
    }
  };

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signin,
    signup,
    signout,
    updateOnboarding,
    classrooms,
    children: apiChildren,
    behaviorLogs,
    classroomLogs,
    setChildren: setApiChildren,
    setClassrooms,
    loading,
    createBehaviorLog,
    createClassroomLog,
    createChild,
    createClassroom,
    updateClassroom,
    currentView,
    setCurrentView,
    toast: {
      success,
      error,
      warning,
      info
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};