import { useState, useCallback } from 'react';

export interface AppError {
  id: string;
  type: 'validation' | 'network' | 'auth' | 'permission' | 'subscription' | 'unknown';
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setErrors(prev => [...prev, newError]);
    
    // Auto-remove error after 5 seconds for non-critical errors
    if (error.type !== 'auth' && error.type !== 'permission') {
      setTimeout(() => {
        setErrors(prev => prev.filter(e => e.id !== newError.id));
      }, 5000);
    }
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleApiError = useCallback((error: any, context?: Record<string, any>) => {
    let errorType: AppError['type'] = 'unknown';
    let message = 'An unexpected error occurred';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorType = 'validation';
          message = data.error || 'Invalid request data';
          break;
        case 401:
          errorType = 'auth';
          message = 'Please sign in to continue';
          break;
        case 403:
          errorType = 'permission';
          message = data.error || 'You don\'t have permission to perform this action';
          break;
        case 429:
          errorType = 'network';
          message = 'Too many requests. Please try again later';
          break;
        case 500:
          errorType = 'network';
          message = 'Server error. Please try again';
          break;
        default:
          message = data.error || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      errorType = 'network';
      message = 'Network error. Please check your connection';
    }

    addError({
      type: errorType,
      message,
      details: error.message,
      context
    });
  }, [addError]);

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleApiError
  };
};