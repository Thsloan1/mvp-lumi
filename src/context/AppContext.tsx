import React, { createContext, useContext, ReactNode } from 'react';
import { User, Classroom, BehaviorLog, ClassroomLog, Child } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { OrganizationApi, InvitationApi } from '../services/apiClient';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  classrooms: Classroom[];
  setClassrooms: (classrooms: Classroom[]) => void;
  children: Child[];
  setChildren: (children: Child[]) => void;
  behaviorLogs: BehaviorLog[];
  setBehaviorLogs: (logs: BehaviorLog[]) => void;
  classroomLogs: ClassroomLog[];
  setClassroomLogs: (logs: ClassroomLog[]) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  // Error handling
  errors: any[];
  addError: (error: any) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  handleApiError: (error: any, context?: Record<string, any>) => void;
  // API clients
  organizationApi: OrganizationApi;
  invitationApi: InvitationApi;
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
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('lumi_current_user', null);
  const [classrooms, setClassrooms] = useLocalStorage<Classroom[]>('lumi_classrooms', []);
  const [childrenList, setChildrenList] = useLocalStorage<Child[]>('lumi_children', []);
  const [behaviorLogs, setBehaviorLogs] = useLocalStorage<BehaviorLog[]>('lumi_behavior_logs', []);
  const [classroomLogs, setClassroomLogs] = useLocalStorage<ClassroomLog[]>('lumi_classroom_logs', []);
  const [currentView, setCurrentView] = useLocalStorage<string>('lumi_current_view', 'welcome');
  
  const { errors, addError, removeError, clearErrors, handleApiError } = useErrorHandler();
  
  // Initialize API clients with error handling
  const organizationApi = new OrganizationApi({ onError: addError });
  const invitationApi = new InvitationApi({ onError: addError });

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    classrooms,
    setClassrooms,
    children: childrenList,
    setChildren: setChildrenList,
    behaviorLogs,
    setBehaviorLogs,
    classroomLogs,
    setClassroomLogs,
    currentView,
    setCurrentView,
    hasLumiEdAccess,
    setHasLumiEdAccess,
    errors,
    addError,
    removeError,
    clearErrors,
    handleApiError,
    organizationApi,
    invitationApi
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};