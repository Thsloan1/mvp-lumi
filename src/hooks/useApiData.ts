import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BehaviorLogApi, ClassroomLogApi, ChildApi, ClassroomApi, AIApi } from '../../lib/apiClient';
import { useToast } from './useToast';

export const useApiData = () => {
  const { error: showError } = useToast();
  
  const handleApiError = (error: any, context?: any) => {
    console.error('API Error:', error, context);
    showError('Operation failed', error.message || 'Please try again');
  };

  // Initialize API clients
  const behaviorLogApi = new BehaviorLogApi();
  const classroomLogApi = new ClassroomLogApi();
  const childApi = new ChildApi();
  const classroomApi = new ClassroomApi();
  const aiApi = new AIApi();

  return {
    behaviorLogApi,
    classroomLogApi,
    childApi,
    classroomApi,
    aiApi,
    handleApiError
  };
};

// Hook for behavior logs with real API integration
export const useBehaviorLogs = () => {
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { behaviorLogApi, handleApiError } = useApiData();
  const { data: session } = useSession();

  const fetchBehaviorLogs = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const response = await behaviorLogApi.getBehaviorLogs();
      setBehaviorLogs(response.behaviorLogs || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchBehaviorLogs' });
    } finally {
      setLoading(false);
    }
  };

  const createBehaviorLog = async (data: any) => {
    if (!session?.user) throw new Error('Not authenticated');
    
    try {
      const response = await behaviorLogApi.createBehaviorLog(data);
      setBehaviorLogs(prev => [response.behaviorLog, ...prev]);
      return response.behaviorLog;
    } catch (error) {
      handleApiError(error, { action: 'createBehaviorLog' });
      throw error;
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchBehaviorLogs();
    }
  }, [session?.user]);

  return {
    behaviorLogs,
    loading,
    createBehaviorLog,
    refetch: fetchBehaviorLogs
  };
};

// Hook for classroom logs
export const useClassroomLogs = () => {
  const [classroomLogs, setClassroomLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { classroomLogApi, handleApiError } = useApiData();
  const { data: session } = useSession();

  const fetchClassroomLogs = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const response = await classroomLogApi.getClassroomLogs();
      setClassroomLogs(response.classroomLogs || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchClassroomLogs' });
    } finally {
      setLoading(false);
    }
  };

  const createClassroomLog = async (data: any) => {
    if (!session?.user) throw new Error('Not authenticated');
    
    try {
      const response = await classroomLogApi.createClassroomLog(data);
      setClassroomLogs(prev => [response.classroomLog, ...prev]);
      return response.classroomLog;
    } catch (error) {
      handleApiError(error, { action: 'createClassroomLog' });
      throw error;
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchClassroomLogs();
    }
  }, [session?.user]);

  return {
    classroomLogs,
    loading,
    createClassroomLog,
    refetch: fetchClassroomLogs
  };
};

// Hook for children
export const useChildren = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { childApi, handleApiError } = useApiData();
  const { data: session } = useSession();

  const fetchChildren = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const response = await childApi.getChildren();
      setChildren(response.children || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchChildren' });
    } finally {
      setLoading(false);
    }
  };

  const createChild = async (data: any) => {
    if (!session?.user) throw new Error('Not authenticated');
    
    try {
      const response = await childApi.createChild(data);
      setChildren(prev => [...prev, response.child]);
      return response.child;
    } catch (error) {
      handleApiError(error, { action: 'createChild' });
      throw error;
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchChildren();
    }
  }, [session?.user]);

  return {
    children,
    setChildren,
    loading,
    createChild,
    refetch: fetchChildren
  };
};

// Hook for classrooms
export const useClassrooms = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { classroomApi, handleApiError } = useApiData();
  const { data: session } = useSession();

  const fetchClassrooms = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      const response = await classroomApi.getClassrooms();
      setClassrooms(response.classrooms || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchClassrooms' });
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (data: any) => {
    if (!session?.user) throw new Error('Not authenticated');
    
    try {
      const response = await classroomApi.createClassroom(data);
      setClassrooms(prev => [...prev, response.classroom]);
      return response.classroom;
    } catch (error) {
      handleApiError(error, { action: 'createClassroom' });
      throw error;
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchClassrooms();
    }
  }, [session?.user]);

  return {
    classrooms,
    setClassrooms,
    loading,
    createClassroom,
    refetch: fetchClassrooms
  };
};