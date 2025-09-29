import { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { useToast } from './useToast';
import { useAppContext } from '../context/AppContext';

export const useApiData = () => {
  const { error: showError } = useToast();
  
  const handleApiError = (error: any, context?: any) => {
    console.error('API Error:', error, context);
    showError('Operation failed', error.message || 'Please try again');
  };

  return {
    handleApiError
  };
};

// Hook for behavior logs with real API integration
export const useBehaviorLogs = () => {
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleApiError } = useApiData();
  const { currentUser } = useAppContext();

  const fetchBehaviorLogs = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await AuthService.apiRequest('/api/behavior-logs');
      setBehaviorLogs(response.behaviorLogs || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchBehaviorLogs' });
    } finally {
      setLoading(false);
    }
  };

  const createBehaviorLog = async (data: any) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      const response = await AuthService.apiRequest('/api/behavior-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setBehaviorLogs(prev => [response.behaviorLog, ...prev]);
      return response.behaviorLog;
    } catch (error) {
      handleApiError(error, { action: 'createBehaviorLog' });
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBehaviorLogs();
    }
  }, [currentUser]);

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
  const { handleApiError } = useApiData();
  const { currentUser } = useAppContext();

  const fetchClassroomLogs = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await AuthService.apiRequest('/api/classroom-logs');
      setClassroomLogs(response.classroomLogs || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchClassroomLogs' });
    } finally {
      setLoading(false);
    }
  };

  const createClassroomLog = async (data: any) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      const response = await AuthService.apiRequest('/api/classroom-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setClassroomLogs(prev => [response.classroomLog, ...prev]);
      return response.classroomLog;
    } catch (error) {
      handleApiError(error, { action: 'createClassroomLog' });
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchClassroomLogs();
    }
  }, [currentUser]);

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
  const { handleApiError } = useApiData();
  const { currentUser } = useAppContext();

  const fetchChildren = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await AuthService.apiRequest('/api/children');
      setChildren(response.children || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchChildren' });
    } finally {
      setLoading(false);
    }
  };

  const createChild = async (data: any) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      const response = await AuthService.apiRequest('/api/children', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setChildren(prev => [...prev, response.child]);
      return response.child;
    } catch (error) {
      handleApiError(error, { action: 'createChild' });
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchChildren();
    }
  }, [currentUser]);

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
  const { handleApiError } = useApiData();
  const { currentUser } = useAppContext();

  const fetchClassrooms = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await AuthService.apiRequest('/api/classrooms');
      setClassrooms(response.classrooms || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchClassrooms' });
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async (data: any) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    try {
      const response = await AuthService.apiRequest('/api/classrooms', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setClassrooms(prev => [...prev, response.classroom]);
      return response.classroom;
    } catch (error) {
      handleApiError(error, { action: 'createClassroom' });
      throw error;
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchClassrooms();
    }
  }, [currentUser]);

  return {
    classrooms,
    setClassrooms,
    loading,
    createClassroom,
    refetch: fetchClassrooms
  };
};