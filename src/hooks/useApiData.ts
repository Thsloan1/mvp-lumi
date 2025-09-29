import { useState, useEffect } from 'react';
import { BehaviorLogApi, ClassroomLogApi, ChildApi, ClassroomApi, AnalyticsApi } from '../../lib/apiClient';
import { useErrorHandler } from './useErrorHandler';

export const useApiData = () => {
  const { handleApiError } = useErrorHandler();
  
  // Initialize API clients
  const behaviorLogApi = new BehaviorLogApi({ onError: handleApiError });
  const classroomLogApi = new ClassroomLogApi({ onError: handleApiError });
  const childApi = new ChildApi({ onError: handleApiError });
  const classroomApi = new ClassroomApi({ onError: handleApiError });
  const analyticsApi = new AnalyticsApi({ onError: handleApiError });

  return {
    behaviorLogApi,
    classroomLogApi,
    childApi,
    classroomApi,
    analyticsApi,
    handleApiError
  };
};

// Hook for behavior logs with real-time sync
export const useBehaviorLogs = () => {
  const [behaviorLogs, setBehaviorLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { behaviorLogApi, handleApiError } = useApiData();

  const fetchBehaviorLogs = async () => {
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
    try {
      const response = await behaviorLogApi.createBehaviorLog(data);
      setBehaviorLogs(prev => [response.behaviorLog, ...prev]);
      return response.behaviorLog;
    } catch (error) {
      handleApiError(error, { action: 'createBehaviorLog' });
      throw error;
    }
  };

  const updateBehaviorLog = async (id: string, data: any) => {
    try {
      const response = await behaviorLogApi.updateBehaviorLog(id, data);
      setBehaviorLogs(prev => prev.map(log => 
        log.id === id ? response.behaviorLog : log
      ));
      return response.behaviorLog;
    } catch (error) {
      handleApiError(error, { action: 'updateBehaviorLog' });
      throw error;
    }
  };

  const deleteBehaviorLog = async (id: string) => {
    try {
      await behaviorLogApi.deleteBehaviorLog(id);
      setBehaviorLogs(prev => prev.filter(log => log.id !== id));
    } catch (error) {
      handleApiError(error, { action: 'deleteBehaviorLog' });
      throw error;
    }
  };

  useEffect(() => {
    fetchBehaviorLogs();
  }, []);

  return {
    behaviorLogs,
    loading,
    createBehaviorLog,
    updateBehaviorLog,
    deleteBehaviorLog,
    refetch: fetchBehaviorLogs
  };
};

// Hook for classroom logs
export const useClassroomLogs = () => {
  const [classroomLogs, setClassroomLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { classroomLogApi, handleApiError } = useApiData();

  const fetchClassroomLogs = async () => {
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
    fetchClassroomLogs();
  }, []);

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

  const fetchChildren = async () => {
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
    try {
      const response = await childApi.createChild(data);
      setChildren(prev => [...prev, response.child]);
      return response.child;
    } catch (error) {
      handleApiError(error, { action: 'createChild' });
      throw error;
    }
  };

  const updateChild = async (id: string, data: any) => {
    try {
      const response = await childApi.updateChild(id, data);
      setChildren(prev => prev.map(child => 
        child.id === id ? response.child : child
      ));
      return response.child;
    } catch (error) {
      handleApiError(error, { action: 'updateChild' });
      throw error;
    }
  };

  const deleteChild = async (id: string) => {
    try {
      await childApi.deleteChild(id);
      setChildren(prev => prev.filter(child => child.id !== id));
    } catch (error) {
      handleApiError(error, { action: 'deleteChild' });
      throw error;
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  return {
    children,
    loading,
    createChild,
    updateChild,
    deleteChild,
    refetch: fetchChildren
  };
};

// Hook for classrooms
export const useClassrooms = () => {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { classroomApi, handleApiError } = useApiData();

  const fetchClassrooms = async () => {
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
    try {
      const response = await classroomApi.createClassroom(data);
      setClassrooms(prev => [...prev, response.classroom]);
      return response.classroom;
    } catch (error) {
      handleApiError(error, { action: 'createClassroom' });
      throw error;
    }
  };

  const updateClassroom = async (id: string, data: any) => {
    try {
      const response = await classroomApi.updateClassroom(id, data);
      setClassrooms(prev => prev.map(classroom => 
        classroom.id === id ? response.classroom : classroom
      ));
      return response.classroom;
    } catch (error) {
      handleApiError(error, { action: 'updateClassroom' });
      throw error;
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return {
    classrooms,
    loading,
    createClassroom,
    updateClassroom,
    refetch: fetchClassrooms
  };
};