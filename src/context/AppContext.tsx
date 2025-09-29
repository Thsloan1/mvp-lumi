import React, { createContext, useContext, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Classroom, BehaviorLog, ClassroomLog, Child } from '../types';
import { useToast } from '../hooks/useToast';
import { useBehaviorLogs, useClassroomLogs, useChildren, useClassrooms } from '../hooks/useApiData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useState } from 'react';

interface AppContextType {
  // Auth
  currentUser: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => void;
  // Data
  classrooms: Classroom[];
  setClassrooms: (classrooms: Classroom[]) => void;
  children: Child[];
  setChildren: (children: Child[]) => void;
  behaviorLogs: BehaviorLog[];
  classroomLogs: ClassroomLog[];
  loading: boolean;
  // Actions
  createBehaviorLog: (data: any) => Promise<any>;
  createClassroomLog: (data: any) => Promise<any>;
  createChild: (data: any) => Promise<any>;
  createClassroom: (data: any) => Promise<any>;
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
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useLocalStorage<string>('lumi_current_view', 'welcome');
  
  const { success, error, warning, info } = useToast();
  
  // Use real API hooks
  const { behaviorLogs, loading: behaviorLoading, createBehaviorLog } = useBehaviorLogs();
  const { classroomLogs, loading: classroomLoading, createClassroomLog } = useClassroomLogs();
  const { children: apiChildren, loading: childrenLoading, createChild, setChildren } = useChildren();
  const { classrooms, loading: classroomsLoading, createClassroom, setClassrooms } = useClassrooms();
  
  const currentUser = session?.user;
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';
  const loading = behaviorLoading || classroomLoading || childrenLoading || classroomsLoading;

  const value: AppContextType = {
    currentUser,
    isAuthenticated,
    isLoading,
    signOut,
    classrooms,
    setClassrooms,
    children: apiChildren,
    setChildren,
    behaviorLogs,
    classroomLogs,
    loading,
    createBehaviorLog,
    createClassroomLog,
    createChild,
    createClassroom,
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