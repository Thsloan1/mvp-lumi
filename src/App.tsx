import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { ToastContainer } from './components/UI/ToastContainer';
import { FullPageLoading } from './components/UI/LoadingState';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';
import { EducatorSignup } from './components/Auth/EducatorSignup';
import { AdminSignup } from './components/Auth/AdminSignup';
import { OrganizationPlan } from './components/Auth/OrganizationPlan';
import { OrganizationPayment } from './components/Auth/OrganizationPayment';
import { InviteEducators } from './components/Auth/InviteEducators';
import { OrganizationComplete } from './components/Auth/OrganizationComplete';
import { InvitedSignup } from './components/Auth/InvitedSignup';
import { InvitedOnboarding } from './components/Auth/InvitedOnboarding';
import { SubscriptionPlan } from './components/Auth/SubscriptionPlan';
import { PaymentScreen } from './components/Auth/PaymentScreen';
import { OnboardingWizard } from './components/Onboarding/OnboardingWizard';
import { OnboardingComplete } from './components/Onboarding/OnboardingComplete';
import { EducatorDashboard } from './components/Dashboard/EducatorDashboard';
import { BehaviorLogFlow } from './components/BehaviorLog/BehaviorLogFlow';
import { ClassroomLogFlow } from './components/ClassroomLog/ClassroomLogFlow';
import { ResourceLibrary } from './components/Library/ResourceLibrary';
import { FamilyNotesManager } from './components/FamilyNotes/FamilyNotesManager';
import { ChildProfilesManager } from './components/ChildProfiles/ChildProfilesManager';
import { ClassroomProfileManager } from './components/ClassroomProfile/ClassroomProfileManager';
import { SignIn } from './components/Auth/SignIn';
import { EmailVerification } from './components/Auth/EmailVerification';
import { ForgotPassword } from './components/Auth/ForgotPassword';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ManageEducators } from './components/Admin/ManageEducators';
import { InviteEducatorsModal } from './components/Admin/InviteEducatorsModal';
import { OrganizationSettings } from './components/Admin/OrganizationSettings';
import { OrganizationAnalytics } from './components/Admin/OrganizationAnalytics';
import { StickyNavigation } from './components/Navigation/StickyNavigation';
import { ProfileSettings } from './components/Profile/ProfileSettings';
import { DataReports } from './components/Reports/DataReports';
import { FamilyScriptGenerator } from './components/FamilyNotes/FamilyScriptGenerator';
import { AccessibilityProvider } from './components/UI/AccessibilityProvider';
import { ChildProfileDetail } from './components/ChildProfiles/ChildProfileDetail';
import { LandingPage } from './components/Landing/LandingPage';
import { DeveloperPortal } from './components/Testing/TestEnvironmentPanel';
import { TestUserFeedbackWidget } from './components/Testing/TestUserFeedbackWidget';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, currentUser, isLoading, isAuthenticated } = useAppContext();
  
  // Show loading while checking authentication
  if (isLoading) {
    return <FullPageLoading message="Loading your account..." />;
  }
  
  // Redirect to onboarding if user is authenticated but hasn't completed onboarding
  if (isAuthenticated && currentUser?.onboardingStatus === 'incomplete' && 
      !['onboarding-start', 'onboarding-complete', 'welcome', 'signin', 'educator-signup', 'invited-onboarding'].includes(currentView)) {
    return <OnboardingWizard />;
  }
  
  // Redirect to dashboard if authenticated and trying to access auth pages
  if (isAuthenticated && ['welcome', 'signin', 'educator-signup'].includes(currentView)) {
    return <EducatorDashboard />;
  }
  
  // Redirect to welcome if not authenticated and trying to access protected pages
  const protectedViews = [
    'dashboard', 'behavior-log', 'classroom-log', 'child-profiles', 
    'classroom-profile', 'library', 'reports', 'family-notes', 'profile-settings'
  ];
  if (!isAuthenticated && protectedViews.includes(currentView)) {
    return <WelcomeScreen />;
  }

  // Show sticky navigation for main app views (not auth/onboarding)
  const showStickyNav = [
    'dashboard', 'behavior-log', 'classroom-log', 'child-profiles', 'classroom-profile',
    'library', 'reports', 'family-notes', 'profile-settings', 'child-profile-detail',
    'admin-dashboard', 'manage-educators', 'organization-settings', 'organization-analytics'
  ].includes(currentView);
  return (
    <div className="relative">
      {showStickyNav && <StickyNavigation />}
      {renderView()}
      <ToastContainer />
      <TestUserFeedbackWidget module={currentView} />
    </div>
  );

  function renderView() {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'educator-signup':
        return <EducatorSignup />;
      case 'admin-signup':
        return <AdminSignup />;
      case 'organization-plan':
        return <OrganizationPlan />;
      case 'organization-payment':
        return <OrganizationPayment />;
      case 'invite-educators':
        return <InviteEducators />;
      case 'organization-complete':
        return <OrganizationComplete />;
      case 'invited-signup':
        return <InvitedSignup />;
      case 'invited-onboarding':
        return <InvitedOnboarding />;
      case 'signin':
        return <SignIn />;
      case 'subscription-plan':
        return <SubscriptionPlan />;
      case 'payment':
        return <PaymentScreen />;
      case 'onboarding-start':
        return <OnboardingWizard />;
      case 'onboarding-complete':
        return <OnboardingComplete />;
      case 'dashboard':
        return <EducatorDashboard />;
      case 'behavior-log':
        return <BehaviorLogFlow />;
      case 'classroom-log':
        return <ClassroomLogFlow />;
      case 'library':
        return <ResourceLibrary />;
      case 'family-notes':
        return <FamilyNotesManager />;
      case 'family-script-generator':
        return (
          <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('family-notes')}
                icon={ArrowLeft}
                className="mb-6 -ml-2"
              >
                Back to Family Notes
              </Button>
              <FamilyScriptGenerator />
            </div>
          </div>
        );
      case 'child-profiles':
        return <ChildProfilesManager />;
      case 'classroom-profile':
        return <ClassroomProfileManager />;
      case 'profile-settings':
        return <ProfileSettings />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'manage-educators':
        return <ManageEducators />;
      case 'organization-settings':
        return <OrganizationSettings />;
      case 'organization-analytics':
        return <OrganizationAnalytics />;
      case 'developer-app-manager':
        return <DeveloperAppManager />;
      default:
        // Handle dynamic child profile detail routes
        if (currentView.startsWith('child-profile-detail-')) {
          const childId = currentView.replace('child-profile-detail-', '');
          return <ChildProfileDetail childId={childId} />;
        }
        return <WelcomeScreen />;
    }
  }
};

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <AppProvider>
          <div className="min-h-screen bg-gray-50" id="main-content">
            <AppContent />
            <DeveloperPortal />
          </div>
        </AppProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;