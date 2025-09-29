import React, { createContext, useContext, ReactNode } from 'react';
import { User, Classroom, BehaviorLog, ClassroomLog, Child } from '../types';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { OrganizationApi, InvitationApi } from '../services/apiClient';
import { useBehaviorLogs, useClassroomLogs, useChildren, useClassrooms } from '../hooks/useApiData';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  classrooms: Classroom[];
  classroomsLoading: boolean;
  createClassroom: (data: any) => Promise<any>;
  updateClassroom: (id: string, data: any) => Promise<any>;
  refetchClassrooms: () => void;
  children: Child[];
  childrenLoading: boolean;
  createChild: (data: any) => Promise<any>;
  updateChild: (id: string, data: any) => Promise<any>;
  deleteChild: (id: string) => Promise<void>;
  refetchChildren: () => void;
  behaviorLogs: BehaviorLog[];
  behaviorLogsLoading: boolean;
  createBehaviorLog: (data: any) => Promise<any>;
  updateBehaviorLog: (id: string, data: any) => Promise<any>;
  deleteBehaviorLog: (id: string) => Promise<void>;
  refetchBehaviorLogs: () => void;
  classroomLogs: ClassroomLog[];
  classroomLogsLoading: boolean;
  createClassroomLog: (data: any) => Promise<any>;
  refetchClassroomLogs: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  hasLumiEdAccess: boolean;
  setHasLumiEdAccess: (access: boolean) => void;
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
  const [currentView, setCurrentView] = useLocalStorage<string>('lumi_current_view', 'welcome');
  const [hasLumiEdAccess, setHasLumiEdAccess] = useLocalStorage<boolean>('lumi_lumied_access', false);
  
  const { errors, addError, removeError, clearErrors, handleApiError } = useErrorHandler();
  
  // Initialize API clients with error handling
  const organizationApi = new OrganizationApi({ onError: addError });
  const invitationApi = new InvitationApi({ onError: addError });

  // Use API hooks for real data
  const {
    behaviorLogs,
    loading: behaviorLogsLoading,
    createBehaviorLog,
    updateBehaviorLog,
    deleteBehaviorLog,
    refetch: refetchBehaviorLogs
  } = useBehaviorLogs();

  const {
    classroomLogs,
    loading: classroomLogsLoading,
    createClassroomLog,
    refetch: refetchClassroomLogs
  } = useClassroomLogs();

  const {
    children,
    loading: childrenLoading,
    createChild,
    updateChild,
    deleteChild,
    refetch: refetchChildren
  } = useChildren();

  const {
    classrooms,
    loading: classroomsLoading,
    createClassroom,
    updateClassroom,
    refetch: refetchClassrooms
  } = useClassrooms();

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    classrooms,
    classroomsLoading,
    createClassroom,
    updateClassroom,
    refetchClassrooms,
    children,
    childrenLoading,
    createChild,
    updateChild,
    deleteChild,
    refetchChildren,
    behaviorLogs,
    behaviorLogsLoading,
    createBehaviorLog,
    updateBehaviorLog,
    deleteBehaviorLog,
    refetchBehaviorLogs,
    classroomLogs,
    classroomLogsLoading,
    createClassroomLog,
    refetchClassroomLogs,
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