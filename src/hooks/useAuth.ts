import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useAuth = () => {
  const { currentUser, isAuthenticated, signin, signout } = useAppContext();

  const user = currentUser;
  const isLoading = false; // Managed by AppContext

  const login = async (email: string, password: string) => {
    try {
      await signin(email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      signout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const requireAuth = () => {
    useEffect(() => {
      if (!isAuthenticated) {
        // Redirect to signin - handled by App.tsx routing
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