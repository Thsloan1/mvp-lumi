import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user;
  const isLoading = status === 'loading';
  const isAuthenticated = !!session;

  const login = async (provider: 'google' = 'google') => {
    try {
      await signIn(provider, { 
        callbackUrl: '/dashboard' 
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ 
        callbackUrl: '/' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const requireAuth = () => {
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/signin');
      }
    }, [isLoading, isAuthenticated]);
  };

  const requireOnboarding = () => {
    useEffect(() => {
      if (user && user.onboardingStatus === 'INCOMPLETE') {
        router.push('/onboarding');
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