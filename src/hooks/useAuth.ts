import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ErrorLogger } from '../utils/errorLogger';

export const useAuth = () => {
  const { currentUser, isAuthenticated, signin, signout, toast } = useAppContext();

  const user = currentUser;
  const isLoading = false; // Managed by AppContext

  const login = async (email: string, password: string) => {
    try {
      ErrorLogger.logAuthEvent('signin_attempt', { email });
      await signin(email, password);
      ErrorLogger.logAuthEvent('signin_success', { userId: currentUser?.id });
    } catch (error) {
      ErrorLogger.logAuthEvent('signin_error', { email, error: error.message });
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      ErrorLogger.logAuthEvent('signout', { userId: currentUser?.id });
      signout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const requireAuth = () => {
    useEffect(() => {
      if (!isAuthenticated) {
        ErrorLogger.warning('Unauthorized access attempt', { 
          currentView: window.location.pathname,
          userId: currentUser?.id 
        });
      }
    }, [isAuthenticated]);
  };

  const requireOnboarding = () => {
    useEffect(() => {
      if (user && user.onboardingStatus === 'incomplete') {
        // Redirect to onboarding - handled by App.tsx routing
      }
    }, [user]);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    requireAuth,
    requireOnboarding
  };
};