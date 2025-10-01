import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, Classroom, BehaviorLog, ClassroomLog, Child } from '../types';
import { useToast } from '../hooks/useToast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuthService } from '../services/authService';
import { OrganizationApi, InvitationApi } from '../services/apiClient';
import { ErrorLogger } from '../utils/errorLogger';
import { AuditService } from '../services/auditService';
import { EncryptionService } from '../services/encryptionService';
import { supabase } from '../lib/supabase';

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  microsoftSignin: () => Promise<void>;
  googleSignin: () => Promise<void>;
  appleSignin: () => Promise<void>;
  adminSignup: (data: any) => Promise<void>;
  signout: () => void;
  updateOnboarding: (data: any) => Promise<void>;
  
  // Email verification
  verifyEmail: (code: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  
  // Password reset
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  
  // Profile photo
  uploadProfilePhoto: (file: File) => Promise<string>;
  
  // Organization management
  createOrganization: (data: any) => Promise<void>;
  inviteEducators: (educators: any[]) => Promise<void>;
  
  // Admin-specific functions
  getOrganizationStats: () => Promise<any>;
  updateOrganizationSettings: (settings: any) => Promise<void>;
  transferOwnership: (newOwnerEmail: string, reason: string) => Promise<void>;
  upgradeSubscription: (newPlan: any) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  addSeats: (seatCount: number) => Promise<void>;
  removeSeats: (seatCount: number) => Promise<void>;
  
  // Invitation management
  invitationApi: InvitationApi;
  organizationApi: OrganizationApi;
  handleApiError: (error: any, context?: any) => void;
  validateInvitation: (token: string) => Promise<any>;
  acceptInvitation: (token: string, userData: any) => Promise<void>;
  
  // Data
  classrooms: Classroom[];
  children: Child[];
  behaviorLogs: BehaviorLog[];
  classroomLogs: ClassroomLog[];
  loading: boolean;
  
  // Actions
  createBehaviorLog: (data: any) => Promise<any>;
  createClassroomLog: (data: any) => Promise<any>;
  createChild: (data: any) => Promise<any>;
  createClassroom: (data: any) => Promise<any>;
  updateClassroom: (id: string, data: any) => Promise<any>;
  updateChild: (id: string, data: any) => Promise<any>;
  setChildren: (children: Child[]) => void;
  setClassrooms: (classrooms: Classroom[]) => void;
  
  // UI State
  currentView: string;
  setCurrentView: (view: string) => void;
  updateCurrentUser: (updates: any) => Promise<void>;
  
  // Toast notifications
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
  
  // User management
  setCurrentUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentView, setCurrentView] = useLocalStorage<string>('lumi_current_view', 'welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Data state
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [apiChildren, setApiChildren] = useState<Child[]>([]);
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorLog[]>([]);
  const [classroomLogs, setClassroomLogs] = useState<ClassroomLog[]>([]);
  
  const { success, error, warning, info } = useToast();
  
  // Initialize API clients
  const organizationApi = new OrganizationApi({ onError: (err) => error(err.message, err.details) });
  const invitationApi = new InvitationApi({ onError: (err) => error(err.message, err.details) });
  
  const handleApiError = (apiError: any, context?: any) => {
    ErrorLogger.error('API Error', { error: apiError.message, context });
    error('Operation failed', apiError.message || 'Please try again');
  };
  
  // Email verification functions
  const verifyEmail = async (code: string) => {
    try {
      const result = await AuthService.apiRequest('/api/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      
      setCurrentUser(result.user);
      success('Email verified!', 'Your account is now active');
      setCurrentView('onboarding-start');
    } catch (err: any) {
      error('Verification failed', err.message);
      throw err;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await AuthService.apiRequest('/api/auth/resend-verification', {
        method: 'POST'
      });
      success('Code sent!', 'Check your email for the new verification code');
    } catch (err: any) {
      error('Failed to resend', err.message);
      throw err;
    }
  };

  // Password reset functions
  const requestPasswordReset = async (email: string) => {
    try {
      await AuthService.apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      success('Reset code sent!', 'Check your email for the reset code');
    } catch (err: any) {
      error('Failed to send reset code', err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await AuthService.apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, newPassword })
      });
      success('Password reset!', 'You can now sign in with your new password');
    } catch (err: any) {
      error('Password reset failed', err.message);
      throw err;
    }
  };

  // Profile photo upload
  const uploadProfilePhoto = async (file: File): Promise<string> => {
    try {
      // For MVP, simulate upload with a generated avatar URL
      // In production, this would upload to cloud storage (AWS S3, Cloudinary, etc.)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload time
      
      // Generate a unique avatar URL based on user info
      const photoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.fullName}&backgroundColor=C44E38&color=ffffff`;
      
      // Update user profile with new photo URL
      if (currentUser) {
        const updatedUser = { ...currentUser, profilePhotoUrl: photoUrl };
        setCurrentUser(updatedUser);
        
        // In production, this would also update the backend
        try {
          await AuthService.apiRequest('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify({ profilePhotoUrl: photoUrl })
          });
        } catch (apiError) {
          console.warn('Failed to update profile photo on server:', apiError);
          // Continue with local update for demo
        }
      }
      
      return photoUrl;
    } catch (err: any) {
      error('Upload failed', err.message || 'Could not upload photo');
      throw err;
    }
  };

  // Initialize user on app load
  useEffect(() => {
    const initialize = async () => {
      ErrorLogger.info('App initialization started');
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
        
        if (user && user.onboardingStatus === 'incomplete') {
          ErrorLogger.logOnboardingEvent('redirect_to_onboarding', undefined, { userId: user.id });
          setCurrentView('onboarding-start');
        } else if (user) {
          ErrorLogger.info('User authenticated, redirecting to dashboard', { userId: user.id });
          setCurrentView('dashboard');
        }
      } catch (error) {
        ErrorLogger.error('Failed to initialize user', { error: error.message });
        console.error('Failed to initialize user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const initializeUser = async () => {
    ErrorLogger.info('App initialization started');
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      if (user && user.onboardingStatus === 'incomplete') {
        ErrorLogger.logOnboardingEvent('redirect_to_onboarding', undefined, { userId: user.id });
        setCurrentView('onboarding-start');
      } else if (user) {
        ErrorLogger.info('User authenticated, redirecting to dashboard', { userId: user.id });
        setCurrentView('dashboard');
      }
    } catch (error) {
      ErrorLogger.error('Failed to initialize user', { error: error.message });
      console.error('Failed to initialize user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [childrenRes, classroomsRes, behaviorRes, classroomRes] = await Promise.all([
        AuthService.apiRequest('/api/children'),
        AuthService.apiRequest('/api/classrooms'),
        AuthService.apiRequest('/api/behavior-logs'),
        AuthService.apiRequest('/api/classroom-logs')
      ]);

      setApiChildren(childrenRes.children || []);
      setClassrooms(classroomsRes.classrooms || []);
      setBehaviorLogs(behaviorRes.behaviorLogs || []);
      setClassroomLogs(classroomRes.classroomLogs || []);
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const signin = async (email: string, password: string) => {
    ErrorLogger.logAuthEvent('signin_attempt', { email });
    try {
      const result = await AuthService.signin({ email, password });
      setCurrentUser(result.user);
      ErrorLogger.logAuthEvent('signin_success', { userId: result.user.id });
      success('Welcome back!', 'Successfully signed in');
      
      if (result.user.onboardingStatus === 'incomplete') {
        ErrorLogger.logOnboardingEvent('redirect_after_signin', undefined, { userId: result.user.id });
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      ErrorLogger.logAuthEvent('signin_error', { email, error: err.message });
      error('Sign in failed', err.message);
      throw err;
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    ErrorLogger.logAuthEvent('signup_attempt', { email });
    try {
      const result = await AuthService.signup({ fullName, email, password });
      setCurrentUser(result.user);
      ErrorLogger.logAuthEvent('signup_success', { userId: result.user.id });
      success('Account created!', 'Welcome to Lumi');
      setCurrentView('welcome-to-lumi'); // Show welcome screen after signup
    } catch (err: any) {
      ErrorLogger.logAuthEvent('signup_error', { email, error: err.message });
      error('Sign up failed', err.message);
      throw err;
    }
  };

  const microsoftSignin = async () => {
    ErrorLogger.logAuthEvent('microsoft_signin_attempt', {});
    try {
      // Mock Microsoft OAuth for demo
      const mockUser = {
        id: 'microsoft-' + Date.now(),
        fullName: 'Microsoft Demo User',
        email: 'demo@microsoft.com',
        role: 'educator',
        preferredLanguage: 'english',
        learningStyle: 'I learn best with visuals',
        teachingStyle: 'We learn together',
        onboardingStatus: 'incomplete',
        createdAt: new Date()
      };
      
      const mockToken = btoa(JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000
      }));
      
      localStorage.setItem('lumi_token', mockToken);
      localStorage.setItem('lumi_current_user', JSON.stringify(mockUser));
      
      const result = { user: mockUser, token: mockToken };
      setCurrentUser(result.user);
      ErrorLogger.logAuthEvent('microsoft_signin_success', { userId: result.user.id });
      success('Welcome!', 'Successfully signed in with Microsoft');
      
      if (result.user.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      ErrorLogger.logAuthEvent('microsoft_signin_error', { error: err.message });
      error('Microsoft sign in failed', err.message);
      throw err;
    }
  };

  const googleSignin = async () => {
    ErrorLogger.logAuthEvent('google_signin_attempt', {});
    try {
      // Mock Google OAuth for demo
      const mockUser = {
        id: 'google-' + Date.now(),
        fullName: 'Google Demo User',
        email: 'demo@google.com',
        role: 'educator',
        preferredLanguage: 'english',
        learningStyle: 'I learn best with visuals',
        teachingStyle: 'We learn together',
        onboardingStatus: 'incomplete',
        createdAt: new Date()
      };
      
      const mockToken = btoa(JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000
      }));
      
      localStorage.setItem('lumi_token', mockToken);
      localStorage.setItem('lumi_current_user', JSON.stringify(mockUser));
      
      const result = { user: mockUser, token: mockToken };
      setCurrentUser(result.user);
      ErrorLogger.logAuthEvent('google_signin_success', { userId: result.user.id });
      success('Welcome!', 'Successfully signed in with Google');
      
      if (result.user.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      ErrorLogger.logAuthEvent('google_signin_error', { error: err.message });
      error('Google sign in failed', err.message);
      throw err;
    }
  };

  const appleSignin = async () => {
    ErrorLogger.logAuthEvent('apple_signin_attempt', {});
    try {
      // Mock Apple OAuth for demo
      const mockUser = {
        id: 'apple-' + Date.now(),
        fullName: 'Apple Demo User',
        email: 'demo@apple.com',
        role: 'educator',
        preferredLanguage: 'english',
        learningStyle: 'I learn best with visuals',
        teachingStyle: 'We learn together',
        onboardingStatus: 'incomplete',
        createdAt: new Date()
      };
      
      const mockToken = btoa(JSON.stringify({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        exp: Date.now() + 24 * 60 * 60 * 1000
      }));
      
      localStorage.setItem('lumi_token', mockToken);
      localStorage.setItem('lumi_current_user', JSON.stringify(mockUser));
      
      const result = { user: mockUser, token: mockToken };
      setCurrentUser(result.user);
      ErrorLogger.logAuthEvent('apple_signin_success', { userId: result.user.id });
      success('Welcome!', 'Successfully signed in with Apple');
      
      if (result.user.onboardingStatus === 'incomplete') {
        setCurrentView('onboarding-start');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err: any) {
      ErrorLogger.logAuthEvent('apple_signin_error', { error: err.message });
      error('Apple sign in failed', err.message);
      throw err;
    }
  };

  const signout = () => {
    AuthService.signout();
    setCurrentUser(null);
    setApiChildren([]);
    setClassrooms([]);
    setBehaviorLogs([]);
    setClassroomLogs([]);
    setCurrentView('welcome');
    info('Signed out', 'See you next time!');
  };

  const adminSignup = async (data: any) => {
    ErrorLogger.logAuthEvent('admin_signup_attempt', { email: data.email });
    try {
      const result = await AuthService.apiRequest('/api/auth/admin-signup', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setCurrentUser(result.user);
      ErrorLogger.logAuthEvent('admin_signup_success', { userId: result.user.id });
      success('Admin account created!', 'Welcome to Lumi');
      setCurrentView('organization-plan');
    } catch (err: any) {
      ErrorLogger.logAuthEvent('admin_signup_error', { email: data.email, error: err.message });
      error('Admin signup failed', err.message);
      throw err;
    }
  };

  const createOrganization = async (data: any) => {
    try {
      const result = await AuthService.apiRequest('/api/organizations', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      success('Organization created!', 'Your organization is ready');
      return result.organization;
    } catch (err: any) {
      error('Organization creation failed', err.message);
      throw err;
    }
  };

  const inviteEducators = async (educators: any[]) => {
    try {
      const result = await AuthService.apiRequest('/api/organizations/invitations', {
        method: 'POST',
        body: JSON.stringify({ educators })
      });
      success('Invitations sent!', `Invited ${educators.length} educator${educators.length !== 1 ? 's' : ''}`);
      return result;
    } catch (err: any) {
      error('Failed to send invitations', err.message);
      throw err;
    }
  };

  const validateInvitation = async (token: string) => {
    try {
      const response = await invitationApi.validateInvitation(token);
      return response;
    } catch (err: any) {
      handleApiError(err, { action: 'validateInvitation', token });
      throw err;
    }
  };

  const acceptInvitation = async (token: string, userData: any) => {
    try {
      const result = await invitationApi.acceptInvitation(token);
      
      // Create user account with invitation data
      const newUser = {
        id: Date.now().toString(),
        fullName: userData.fullName,
        email: result.invitation.email,
        role: 'educator',
        preferredLanguage: 'english',
        onboardingStatus: 'incomplete',
        organizationId: result.invitation.organizationId,
        createdAt: new Date().toISOString()
      };
      
      setCurrentUser(newUser);
      success('Invitation accepted!', 'Welcome to the organization');
    } catch (err: any) {
      handleApiError(err, { action: 'acceptInvitation', token });
      throw err;
    }
  };

  const updateOnboarding = async (data: any) => {
    ErrorLogger.logOnboardingEvent('completion_attempt', undefined, { userId: currentUser?.id });
    
    try {
      console.log('=== FRONTEND ONBOARDING START ===');
      console.log('Current user:', currentUser?.id, currentUser?.fullName);
      console.log('Onboarding data being sent:', JSON.stringify(data, null, 2));
      
      const response = await AuthService.updateOnboarding(data);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      console.log('=== ONBOARDING API RESPONSE ===');
      console.log('Response received:', JSON.stringify(response, null, 2));
      
      // Update current user with response
      setCurrentUser(response);
      
      // Create classroom if provided in onboarding data
      if (data.classroomData) {
        ErrorLogger.info('Creating classroom during onboarding', { classroomName: data.classroomData.name });
        try {
          console.log('Creating classroom from onboarding data:', data.classroomData);
          await createClassroom(data.classroomData);
        } catch (classroomError) {
          console.warn('Failed to create classroom during onboarding:', classroomError);
          // Continue with onboarding even if classroom creation fails
        }
      }
      
      ErrorLogger.logOnboardingEvent('completed', undefined, { userId: response.id });
      success('Profile updated!', 'Your preferences have been saved');
      
      // Route based on user role
      if (response.role === 'admin') {
        console.log('Redirecting admin user to admin dashboard');
        setCurrentView('admin-dashboard');
      } else {
        console.log('Redirecting educator to completion screen');
        setCurrentView('onboarding-complete-new');
      }
      
      console.log('=== FRONTEND ONBOARDING COMPLETE ===');
    } catch (err: any) {
      console.error('=== ONBOARDING ERROR DETAILS ===');
      console.error('Error object:', {
        error: err,
        message: err.message,
        stack: err.stack,
        sentData: data,
        currentUser: currentUser?.id
      });
      ErrorLogger.logOnboardingEvent('completion_error', undefined, { userId: currentUser?.id, error: err.message });
      error('Onboarding failed', err.message || 'Please try again');
      throw err;
    }
  };

  const updateProfile = async (data: any) => {
    try {
      await AuthService.apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      // Update local user state
      if (currentUser) {
        setCurrentUser({ ...currentUser, ...data });
      }
      success('Profile updated!', 'Your changes have been saved');
    } catch (err: any) {
      error('Update failed', err.message);
      throw err;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await AuthService.apiRequest('/api/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      success('Password updated!', 'Your password has been changed');
    } catch (err: any) {
      error('Password change failed', err.message);
      throw err;
    }
  };

  const createBehaviorLog = async (data: any) => {
    try {
      // Try Supabase first
      const { data: behaviorLogData, error } = await supabase
        .from('behavior_logs')
        .insert({
          educator_id: currentUser?.id,
          child_id: data.childId,
          classroom_id: data.classroomId,
          behavior_description: data.behaviorDescription,
          context: data.context,
          time_of_day: data.timeOfDay,
          severity: data.severity,
          educator_mood: data.educatorMood,
          stressors: data.stressors,
          ai_response: data.aiResponse,
          selected_strategy: data.selectedStrategy,
          confidence_rating: data.confidenceRating,
          phi_flag: data.phiFlag
        })
        .select()
        .single();

      if (!error && behaviorLogData) {
        const newLog = {
          id: behaviorLogData.id,
          educatorId: behaviorLogData.educator_id,
          childId: behaviorLogData.child_id,
          classroomId: behaviorLogData.classroom_id,
          behaviorDescription: behaviorLogData.behavior_description,
          context: behaviorLogData.context,
          timeOfDay: behaviorLogData.time_of_day,
          severity: behaviorLogData.severity as 'low' | 'medium' | 'high',
          educatorMood: behaviorLogData.educator_mood,
          stressors: behaviorLogData.stressors || [],
          aiResponse: behaviorLogData.ai_response,
          selectedStrategy: behaviorLogData.selected_strategy,
          confidenceRating: behaviorLogData.confidence_rating,
          phiFlag: behaviorLogData.phi_flag,
          createdAt: new Date(behaviorLogData.created_at)
        };
        
        setBehaviorLogs(prev => [newLog, ...prev]);
        success('Behavior logged!', 'Strategy saved to your dashboard');
        return newLog;
      }

      // Fallback to existing mock logic
      // Encrypt sensitive data before sending to API
      const encryptedData = await EncryptionService.encryptBehaviorLog(data);
      
      // Log data creation
      await AuditService.logDataAccess(
        'behavior_logs',
        'new',
        `Behavior log for ${children.find(c => c.id === data.childId)?.name || 'Unknown Child'}`,
        'create',
        { containsPHI: data.phiFlag?.containsPHI || false }
      );
      
      const result = await AuthService.apiRequest('/api/behavior-logs', {
        method: 'POST',
        body: JSON.stringify(encryptedData)
      });
      
      // Decrypt for local state
      const decryptedResult = {
        ...result.behaviorLog,
        behaviorDescription: await EncryptionService.decryptText(result.behaviorLog.behaviorDescription)
      };
      
      setBehaviorLogs(prev => [decryptedResult, ...prev]);
      success('Behavior logged!', 'Strategy saved to your dashboard');
      return decryptedResult;
    } catch (err: any) {
      error('Failed to save', err.message);
      throw err;
    }
  };

  const createClassroomLog = async (data: any) => {
    try {
      const result = await AuthService.apiRequest('/api/classroom-logs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setClassroomLogs(prev => [result.classroomLog, ...prev]);
      success('Classroom strategy saved!', 'Challenge logged to your dashboard');
      return result.classroomLog;
    } catch (err: any) {
      error('Failed to save', err.message);
      throw err;
    }
  };

  const createChild = async (data: any) => {
    try {
      // Try Supabase first
      const { data: childData, error } = await supabase
        .from('children')
        .insert({
          name: data.name,
          grade_band: data.gradeBand,
          classroom_id: data.classroomId || classrooms[0]?.id,
          developmental_notes: data.developmentalNotes,
          has_iep: data.hasIEP,
          has_ifsp: data.hasIFSP,
          language_ability: data.languageAbility,
          self_regulation_skills: data.selfRegulationSkills,
          home_language: data.homeLanguage,
          family_context: data.familyContext
        })
        .select()
        .single();

      if (!error && childData) {
        const newChild = {
          id: childData.id,
          name: childData.name,
          age: childData.age,
          gradeBand: childData.grade_band,
          classroomId: childData.classroom_id,
          developmentalNotes: childData.developmental_notes,
          languageAbility: childData.language_ability,
          selfRegulationSkills: childData.self_regulation_skills,
          sensorySensitivities: childData.sensory_sensitivities || [],
          hasIEP: childData.has_iep || false,
          hasIFSP: childData.has_ifsp || false,
          supportPlans: childData.support_plans || [],
          knownTriggers: childData.known_triggers || [],
          homeLanguage: childData.home_language,
          familyContext: childData.family_context,
          createdAt: new Date(childData.created_at),
          updatedAt: new Date(childData.updated_at)
        };
        
        setApiChildren(prev => [...prev, newChild]);
        success('Child added!', `${data.name} has been added to your classroom`);
        return newChild;
      }

      // Fallback to existing mock logic
      // Encrypt sensitive child data
      const encryptedData = await EncryptionService.encryptChildProfile(data);
      
      // Log child profile creation
      await AuditService.logFERPAAccess(
        'new',
        data.name,
        'CHILD_PROFILE_CREATED',
        false
      );
      
      const result = await AuthService.apiRequest('/api/children', {
        method: 'POST',
        body: JSON.stringify(encryptedData)
      });
      
      // Decrypt for local state
      const decryptedResult = {
        ...result.child,
        developmentalNotes: result.child.developmentalNotes 
          ? await EncryptionService.decryptText(result.child.developmentalNotes)
          : result.child.developmentalNotes
      };
      
      setApiChildren(prev => [...prev, decryptedResult]);
      success('Child added!', `${data.name} has been added to your classroom`);
      return decryptedResult;
    } catch (err: any) {
      error('Failed to add child', err.message);
      throw err;
    }
  };

  const createClassroom = async (data: any) => {
    try {
      // Try Supabase first
      const { data: classroomData, error } = await supabase
        .from('classrooms')
        .insert({
          name: data.name,
          grade_band: data.gradeBand,
          student_count: data.studentCount,
          teacher_student_ratio: data.teacherStudentRatio,
          iep_count: data.iepCount,
          ifsp_count: data.ifspCount,
          stressors: data.stressors,
          educator_id: currentUser?.id
        })
        .select()
        .single();

      if (!error && classroomData) {
        const newClassroom = {
          id: classroomData.id,
          name: classroomData.name,
          gradeBand: classroomData.grade_band,
          studentCount: classroomData.student_count,
          teacherStudentRatio: classroomData.teacher_student_ratio || '1:8',
          iepCount: classroomData.iep_count,
          ifspCount: classroomData.ifsp_count,
          stressors: classroomData.stressors || [],
          educatorId: classroomData.educator_id
        };
        
        setClassrooms(prev => [...prev, newClassroom]);
        success('Classroom created!', `${data.name} has been set up`);
        return newClassroom;
      }

      // Fallback to existing mock logic
      const result = await AuthService.apiRequest('/api/classrooms', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setClassrooms(prev => [...prev, result.classroom]);
      success('Classroom created!', `${data.name} has been set up`);
      return result.classroom;
    } catch (err: any) {
      error('Failed to create classroom', err.message);
      throw err;
    }
  };

  const updateClassroom = async (id: string, data: any) => {
    try {
      const result = await AuthService.apiRequest(`/api/classrooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setClassrooms(prev => prev.map(c => c.id === id ? result.classroom : c));
      success('Classroom updated!', 'Your changes have been saved');
      return result.classroom;
    } catch (err: any) {
      error('Failed to update classroom', err.message);
      throw err;
    }
  };

  const updateChild = async (id: string, data: any) => {
    try {
      const result = await AuthService.apiRequest(`/api/children/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setApiChildren(prev => prev.map(c => c.id === id ? result.child : c));
      success('Child profile updated!', 'Changes have been saved');
      return result.child;
    } catch (err: any) {
      error('Failed to update child', err.message);
      throw err;
    }
  };

  const value: AppContextType = {
    currentUser,
    setCurrentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    signin,
    signup,
    microsoftSignin,
    googleSignin,
    appleSignin,
    adminSignup,
    signout,
    updateOnboarding,
    updateCurrentUser: async (updates: any) => {
      try {
        if (updates.onboardingStatus === 'complete') {
          await updateOnboarding(updates.profileData || {});
        } else {
          // Handle other user updates
          setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        }
      } catch (error) {
        console.error('Failed to update user:', error);
        throw error;
      }
    },
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    uploadProfilePhoto,
    createOrganization,
    inviteEducators,
    getOrganizationStats: async () => {
      try {
        return await AuthService.apiRequest('/api/organizations/stats');
      } catch (err: any) {
        handleApiError(err, { action: 'getOrganizationStats' });
        throw err;
      }
    },
    updateOrganizationSettings: async (settings: any) => {
      try {
        const result = await AuthService.apiRequest('/api/organizations/settings', {
          method: 'PUT',
          body: JSON.stringify(settings)
        });
        success('Settings updated!', 'Organization settings have been saved');
        return result;
      } catch (err: any) {
        handleApiError(err, { action: 'updateOrganizationSettings' });
        throw err;
      }
    },
    transferOwnership: async (newOwnerEmail: string, reason: string) => {
      try {
        const result = await AuthService.apiRequest('/api/organizations/transfer-ownership', {
          method: 'POST',
          body: JSON.stringify({ newOwnerEmail, reason })
        });
        success('Ownership transferred!', 'Organization ownership has been transferred');
        return result;
      } catch (err: any) {
        handleApiError(err, { action: 'transferOwnership' });
        throw err;
      }
    },
    upgradeSubscription: async (newPlan: any) => {
      try {
        const result = await AuthService.apiRequest('/api/subscriptions/upgrade', {
          method: 'POST',
          body: JSON.stringify(newPlan)
        });
        success('Subscription upgraded!', 'Your plan has been updated');
        return result;
      } catch (err: any) {
        handleApiError(err, { action: 'upgradeSubscription' });
        throw err;
      }
    },
    cancelSubscription: async () => {
      try {
        const result = await AuthService.apiRequest('/api/subscriptions/cancel', {
          method: 'POST'
        });
        warning('Subscription cancelled', 'Your subscription will end at the current period');
        return result;
      } catch (err: any) {
        handleApiError(err, { action: 'cancelSubscription' });
        throw err;
      }
    },
    addSeats: async (seatCount: number) => {
      try {
        const result = await AuthService.apiRequest('/api/subscriptions/add-seats', {
          method: 'POST',
          body: JSON.stringify({ seatCount })
        });
        success('Seats added!', `Added ${seatCount} educator seats to your plan`);
        return result;
      } catch (err: any) {
        handleApiError(err, { action: 'addSeats' });
        throw err;
      }
    },
    removeSeats: async (seatCount: number) => {
      try {
        const result = await AuthService.apiRequest('/api/subscriptions/remove-seats', {
          method: 'POST',
          body: JSON.stringify({ seatCount })
        });
        success('Seats removed!', `Removed ${seatCount} educator seats from your plan`);
        return result;
      } catch (err: any) {
        handleApiError(err, { action: 'removeSeats' });
        throw err;
      }
    },
    invitationApi,
    organizationApi,
    handleApiError,
    validateInvitation,
    acceptInvitation,
    classrooms,
    children: apiChildren,
    behaviorLogs,
    classroomLogs,
    setChildren: setApiChildren,
    setClassrooms,
    loading,
    createBehaviorLog,
    createClassroomLog,
    createChild,
    createClassroom,
    updateClassroom,
    updateChild,
    currentView,
    setCurrentView,
    toast: {
      success,
      error,
      warning,
      info
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};