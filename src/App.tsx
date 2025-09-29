import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
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
import { LumiEdUpsell } from './components/Library/LumiEdUpsell';
import { FamilyNotesManager } from './components/FamilyNotes/FamilyNotesManager';
import { ChildProfilesManager } from './components/ChildProfiles/ChildProfilesManager';
import { ClassroomProfileManager } from './components/ClassroomProfile/ClassroomProfileManager';
import { SignIn } from './components/Auth/SignIn';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ManageEducators } from './components/Admin/ManageEducators';
import { InviteEducatorsModal } from './components/Admin/InviteEducatorsModal';
import { OrganizationSettings } from './components/Admin/OrganizationSettings';
import { OrganizationAnalytics } from './components/Admin/OrganizationAnalytics';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView } = useAppContext();

  const renderView = () => {
    switch (currentView) {
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
      case 'lumied-upsell':
        return <LumiEdUpsell />;
      case 'family-notes':
        return <FamilyNotesManager />;
      case 'child-profiles':
        return <ChildProfilesManager />;
      case 'classroom-profile':
        return <ClassroomProfileManager />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'manage-educators':
        return <ManageEducators />;
      case 'organization-settings':
        return <OrganizationSettings />;
      case 'organization-analytics':
        return <OrganizationAnalytics />;
      case 'invite-educators-modal':
        return (
          <div>
            <AdminDashboard />
            <InviteEducatorsModal onClose={() => setCurrentView('admin-dashboard')} />
          </div>
        );
      default:
        return <WelcomeScreen />;
    }
  };

  return renderView();
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;