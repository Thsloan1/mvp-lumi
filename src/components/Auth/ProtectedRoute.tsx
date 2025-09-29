import React from 'react';
import { FullPageLoading } from '../UI/LoadingState';
import { WelcomeScreen } from '../Welcome/WelcomeScreen';
import { useAppContext } from '../../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true
}) => {
  const { currentUser, isLoading } = useAppContext();

  if (isLoading) {
    return <FullPageLoading message="Checking your authentication..." />;
  }

  if (!currentUser) {
    return <WelcomeScreen />;
  }

  if (requireOnboarding && currentUser.onboardingStatus === 'incomplete') {
    return <FullPageLoading message="Redirecting to onboarding..." />;
  }

  return <>{children}</>;
};