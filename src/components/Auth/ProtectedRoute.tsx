import React from 'react';
import { useSession } from 'next-auth/react';
import { FullPageLoading } from '../UI/LoadingState';
import { WelcomeScreen } from '../Welcome/WelcomeScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true
}) => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <FullPageLoading message="Checking your authentication..." />;
  }

  if (!session) {
    return <WelcomeScreen />;
  }

  if (requireOnboarding && session.user?.onboardingStatus === 'INCOMPLETE') {
    return <FullPageLoading message="Redirecting to onboarding..." />;
  }

  return <>{children}</>;
};