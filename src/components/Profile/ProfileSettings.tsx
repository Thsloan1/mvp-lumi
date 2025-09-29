import React, { useState } from 'react';
import { User, Bell, CreditCard, Shield, Save, Eye, EyeOff, ArrowLeft, Camera } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { ProfilePhotoUpload } from './ProfilePhotoUpload';
import { useAppContext } from '../../context/AppContext';
import { LEARNING_STYLE_OPTIONS, TEACHING_STYLE_OPTIONS, GRADE_BAND_OPTIONS } from '../../data/constants';

export const ProfileSettings: React.FC = () => {
  const { currentUser, setCurrentUser, setCurrentView, toast, updateProfile, changePassword } = useAppContext();
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'billing' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    preferredLanguage: currentUser?.preferredLanguage || 'english',
    learningStyle: currentUser?.learningStyle || '',
    teachingStyle: currentUser?.teachingStyle || '',
    profilePhotoUrl: currentUser?.profilePhotoUrl || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    strategyReminders: true,
    weeklyReports: false,
    familyNoteReminders: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' }
  ];

  const learningStyleOptions = LEARNING_STYLE_OPTIONS.map(option => ({
    value: option,
    label: option
  }));

  const teachingStyleOptions = TEACHING_STYLE_OPTIONS.map(option => ({
    value: option,
    label: option
  }));

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Update user in context
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          fullName: profileData.fullName,
          email: profileData.email,
          preferredLanguage: profileData.preferredLanguage as 'english' | 'spanish',
          learningStyle: profileData.learningStyle,
          teachingStyle: profileData.teachingStyle,
          profilePhotoUrl: profileData.profilePhotoUrl
        };
        setCurrentUser(updatedUser);
      }
      
      // In real implementation, this would call API
      console.log('Profile updated:', profileData);
      toast.success('Profile updated!', 'Your changes have been saved');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Update failed', 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password mismatch', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    setProfileData(prev => ({ ...prev, profilePhotoUrl: photoUrl }));
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Personal Information
        </h3>
        
        <div className="mb-6">
          <ProfilePhotoUpload
            currentPhotoUrl={profileData.profilePhotoUrl}
            onPhotoUpdate={handlePhotoUpdate}
          />
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Camera className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Photo Upload Tips
              </p>
              <p className="text-xs text-blue-700">
                • Use JPG, PNG, GIF, or WebP format
                • Keep file size under 5MB
                • Square images work best (1:1 ratio)
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={profileData.fullName}
            onChange={(value) => setProfileData(prev => ({ ...prev, fullName: value }))}
            placeholder="Enter your full name"
          />
          
          <Input
            label="Email Address"
            type="email"
            value={profileData.email}
            onChange={(value) => setProfileData(prev => ({ ...prev, email: value }))}
            placeholder="Enter your email"
          />
          
          <Select
            label="Preferred Language"
            value={profileData.preferredLanguage}
            onChange={(value) => setProfileData(prev => ({ ...prev, preferredLanguage: value }))}
            options={languageOptions}
          />
          
          <Select
            label="Learning Style"
            value={profileData.learningStyle}
            onChange={(value) => setProfileData(prev => ({ ...prev, learningStyle: value }))}
            options={learningStyleOptions}
            placeholder="How do you learn best?"
          />
        </div>

        <div className="mt-6">
          <Select
            label="Teaching Style"
            value={profileData.teachingStyle}
            onChange={(value) => setProfileData(prev => ({ ...prev, teachingStyle: value }))}
            options={teachingStyleOptions}
            placeholder="What's your teaching approach?"
          />
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E6E2DD]">
          <Button
            onClick={handleProfileSave}
            loading={loading}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <div>
                <span className="font-medium text-[#1A1A1A]">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                <p className="text-sm text-gray-600">
                  {key === 'emailNotifications' && 'Receive email updates about your account'}
                  {key === 'strategyReminders' && 'Get reminders to reflect on strategies you\'ve tried'}
                  {key === 'weeklyReports' && 'Weekly summary of your classroom insights'}
                  {key === 'familyNoteReminders' && 'Reminders to share updates with families'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings(prev => ({ 
                  ...prev, 
                  [key]: e.target.checked 
                }))}
                className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
              />
            </label>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E6E2DD]">
          <Button
            onClick={() => toast.success('Notifications updated!', 'Your preferences have been saved')}
            icon={Save}
          >
            Save Notification Preferences
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSubscriptionTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Current Subscription
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Plan Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium text-[#1A1A1A]">Individual Annual</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Renews:</span>
                <span className="font-medium text-[#1A1A1A]">Dec 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-[#1A1A1A]">$297/year</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Usage This Month</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Strategies Generated:</span>
                <span className="font-medium text-[#1A1A1A]">45</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Family Notes:</span>
                <span className="font-medium text-[#1A1A1A]">23</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resources Downloaded:</span>
                <span className="font-medium text-[#1A1A1A]">12</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E6E2DD] flex space-x-3">
          <Button variant="outline">
            Change Plan
          </Button>
          <Button variant="ghost" className="text-red-600">
            Cancel Subscription
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Subscription Benefits
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">What's Included</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Unlimited behavior strategies
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Classroom management tools
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Family communication notes
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Personal reflection tracking
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Mobile app access
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Premium Features</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                Advanced analytics
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                Priority support
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                Exclusive webinars
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                Early access to new features
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Payment Method
        </h3>
        
        <div className="flex items-center justify-between p-4 border border-[#E6E2DD] rounded-xl">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-[#1A1A1A]">•••• •••• •••• 4242</p>
              <p className="text-sm text-gray-600">Expires 12/26</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Billing History
        </h3>
        
        <div className="space-y-4">
          {[
            { date: 'Dec 15, 2023', amount: '$297.00', status: 'Paid', invoice: 'INV-001' },
            { date: 'Dec 15, 2022', amount: '$297.00', status: 'Paid', invoice: 'INV-002' }
          ].map((bill, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-[#F8F6F4] rounded-xl">
              <div>
                <p className="font-medium text-[#1A1A1A]">{bill.amount}</p>
                <p className="text-sm text-gray-600">{bill.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-green-600 font-medium">{bill.status}</span>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Change Password
        </h3>
        
        <div className="space-y-6">
          <Input
            label="Current Password"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(value) => setPasswordData(prev => ({ ...prev, currentPassword: value }))}
            placeholder="Enter current password"
          />
          
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(value) => setPasswordData(prev => ({ ...prev, newPassword: value }))}
            placeholder="Enter new password"
            helperText="Must be at least 8 characters with a capital letter and number"
          />
          
          <Input
            label="Confirm New Password"
            type={showPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(value) => setPasswordData(prev => ({ ...prev, confirmPassword: value }))}
            placeholder="Confirm new password"
            error={passwordData.newPassword && passwordData.confirmPassword && 
                   passwordData.newPassword !== passwordData.confirmPassword ? 
                   'Passwords do not match' : ''}
          />
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
            />
            <label className="text-sm text-gray-600">Show passwords</label>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E6E2DD]">
          <Button
            onClick={handlePasswordChange}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || 
                     passwordData.newPassword !== passwordData.confirmPassword}
            loading={loading}
            icon={Save}
          >
            Update Password
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Account Security
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#1A1A1A]">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[#1A1A1A]">Login Sessions</p>
              <p className="text-sm text-gray-600">Manage your active login sessions</p>
            </div>
            <Button variant="outline" size="sm">
              View Sessions
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('dashboard')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account preferences and subscription
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E6E2DD] mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-[#C44E38] text-[#C44E38]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'billing' && renderBillingTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>
      </div>
    </div>
  );
};