import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { User, Classroom, BehaviorLog, ClassroomLog, Child } from '../types';
import { useToast } from '../hooks/useToast';
import { DatabaseService } from '../../lib/database';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useState, useEffect } from 'react';

interface AppContextType {
  // Auth
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  refreshData: () => Promise<void>;
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  hasLumiEdAccess: boolean;
  setHasLumiEdAccess: (access: boolean) => void;
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
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useLocalStorage<string>('lumi_current_view', 'welcome');
  const [hasLumiEdAccess, setHasLumiEdAccess] = useLocalStorage<boolean>('lumi_lumied_access', false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);
  const [classroomLogs, setClassroomLogs] = useState<ClassroomLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { success, error, warning, info } = useToast();
  
  const user = session?.user;
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      loadUserData();
    }
  }, [isAuthenticated, user?.email]);

  const loadUserData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const dbUser = await DatabaseService.getUserByEmail(user.email);
      if (dbUser) {
        setClassrooms(dbUser.classrooms || []);
        
        // Load children from all classrooms
        const allChildren = dbUser.classrooms?.flatMap(c => c.children) || [];
        setChildren(allChildren);
        
        // Load behavior logs
        const behaviorLogs = await DatabaseService.getUserBehaviorLogs(dbUser.id);
        setBehaviorLogs(behaviorLogs);
        
        // Load classroom logs
        const classroomLogs = await DatabaseService.getUserClassroomLogs(dbUser.id);
        setClassroomLogs(classroomLogs);
      }
    } catch (err) {
      error('Failed to load data', 'Please refresh the page and try again');
    } finally {
      setLoading(false);
    }
  };

  const createBehaviorLog = async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const behaviorLog = await DatabaseService.createBehaviorLog({
        ...data,
        educatorId: user.id,
        severity: data.severity.toUpperCase()
      });
      setBehaviorLogs(prev => [behaviorLog, ...prev]);
      success('Behavior logged successfully', 'Strategy saved to your dashboard');
      return behaviorLog;
    } catch (err) {
      error('Failed to save behavior log', 'Please try again');
      throw err;
    }
  };

  const createClassroomLog = async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const classroomLog = await DatabaseService.createClassroomLog({
        ...data,
        educatorId: user.id,
        severity: data.severity.toUpperCase()
      });
      setClassroomLogs(prev => [classroomLog, ...prev]);
      success('Classroom challenge logged', 'Strategy saved to your dashboard');
      return classroomLog;
    } catch (err) {
      error('Failed to save classroom log', 'Please try again');
      throw err;
    }
  };

  const createChild = async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      // Use first classroom or create default
      let classroomId = classrooms[0]?.id;
      if (!classroomId) {
        const defaultClassroom = await createClassroom({
          name: `${user.name?.split(' ')[0]}'s Classroom`,
          gradeBand: 'Preschool (4-5 years old)',
          studentCount: 15,
          teacherStudentRatio: '1:8',
          stressors: []
        });
        classroomId = defaultClassroom.id;
      }
      
      const child = await DatabaseService.createChild({
        ...data,
        classroomId
      });
      setChildren(prev => [...prev, child]);
      success('Child profile created', `${data.name} added to your classroom`);
      return child;
    } catch (err) {
      error('Failed to create child profile', 'Please try again');
      throw err;
    }
  };

  const createClassroom = async (data: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const classroom = await DatabaseService.createClassroom(user.id, data);
      setClassrooms(prev => [...prev, classroom]);
      success('Classroom created', `${data.name} is ready to use`);
      return classroom;
    } catch (err) {
      error('Failed to create classroom', 'Please try again');
      throw err;
    }
  };

  const refreshData = async () => {
    await loadUserData();
  };

  const value: AppContextType = {
    user,
    isAuthenticated,
    isLoading,
    classrooms,
    children,
    behaviorLogs,
    classroomLogs,
    loading,
    createChild,
    createBehaviorLog,
    createClassroomLog,
    createClassroom,
    refreshData,
    currentView,
    setCurrentView,
    hasLumiEdAccess,
    setHasLumiEdAccess,
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