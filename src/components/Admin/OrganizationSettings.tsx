import React, { useState } from 'react';
import { ArrowLeft, Crown, Shield, Users, CreditCard, Settings, Save, AlertTriangle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';

interface OrganizationData {
  name: string;
  type: string;
  ownerId: string;
  settings: {
    defaultLanguage: string;
    requireOnboarding: boolean;
    allowEducatorInvites: boolean;
  };
}

interface SubscriptionData {
  plan: string;
  maxSeats: number;
  activeSeats: number;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const OrganizationSettings: React.FC = () => {
  const { setCurrentView, organizationApi, handleApiError } = useAppContext();
  const [activeTab, setActiveTab] = useState<'general' | 'subscription' | 'ownership'>('general');
  const [loading, setLoading] = useState(false);
  const [showTransferOwnership, setShowTransferOwnership] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Mock data - in real implementation, this would come from API
  const [orgData, setOrgData] = useState<OrganizationData>({
    name: 'Sunshine Elementary School',
    type: 'school',
    ownerId: currentUser?.id || '',
    settings: {
      defaultLanguage: 'english',
      requireOnboarding: true,
      allowEducatorInvites: false
    }
  });

  const [subscriptionData] = useState<SubscriptionData>({
    plan: 'Pro Plan',
    maxSeats: 15,
    activeSeats: 12,
    status: 'active',
    currentPeriodEnd: '2024-12-15',
    cancelAtPeriodEnd: false
  });

  const organizationTypes = [
    { value: 'school', label: 'School' },
    { value: 'district', label: 'School District' },
    { value: 'childcare_center', label: 'Childcare Center' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'other', label: 'Other' }
  ];

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'bilingual', label: 'Bilingual (English & Spanish)' }
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
    { id: 'ownership', label: 'Ownership & Permissions', icon: Crown }
  ];

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      await organizationApi.put('/organizations', {
        name: orgData.name,
        type: orgData.type,
        settings: orgData.settings
      });
    } catch (error) {
      handleApiError(error, { action: 'saveOrganizationSettings' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferEmail || !transferReason) return;
    
    setLoading(true);
    try {
      await organizationApi.transferOwnership(transferEmail, transferReason);
      setShowTransferOwnership(false);
      setTransferEmail('');
      setTransferReason('');
    } catch (error) {
      handleApiError(error, { action: 'transferOwnership', transferEmail });
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Organization Details
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Organization Name"
            value={orgData.name}
            onChange={(value) => setOrgData(prev => ({ ...prev, name: value }))}
            placeholder="Enter organization name"
          />
          
          <Select
            label="Organization Type"
            value={orgData.type}
            onChange={(value) => setOrgData(prev => ({ ...prev, type: value }))}
            options={organizationTypes}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Default Settings
        </h3>
        
        <div className="space-y-6">
          <Select
            label="Default Platform Language"
            value={orgData.settings.defaultLanguage}
            onChange={(value) => setOrgData(prev => ({
              ...prev,
              settings: { ...prev.settings, defaultLanguage: value }
            }))}
            options={languageOptions}
          />
          
          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={orgData.settings.requireOnboarding}
                onChange={(e) => setOrgData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, requireOnboarding: e.target.checked }
                }))}
                className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
              />
              <div>
                <span className="font-medium text-[#1A1A1A]">Require Onboarding</span>
                <p className="text-sm text-gray-600">
                  New educators must complete the onboarding wizard before accessing Lumi
                </p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={orgData.settings.allowEducatorInvites}
                onChange={(e) => setOrgData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, allowEducatorInvites: e.target.checked }
                }))}
                className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
              />
              <div>
                <span className="font-medium text-[#1A1A1A]">Allow Educator Invites</span>
                <p className="text-sm text-gray-600">
                  Let educators invite other educators (subject to seat limits)
                </p>
              </div>
            </label>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E6E2DD]">
          <Button
            onClick={handleSaveGeneral}
            loading={loading}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderSubscriptionSettings = () => (
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
                <span className="font-medium text-[#1A1A1A]">{subscriptionData.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats:</span>
                <span className="font-medium text-[#1A1A1A]">
                  {subscriptionData.activeSeats}/{subscriptionData.maxSeats}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium capitalize">
                  {subscriptionData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Renews:</span>
                <span className="font-medium text-[#1A1A1A]">
                  {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-[#1A1A1A] mb-3">Seat Utilization</h4>
            <div className="space-y-3">
              <div className="w-full bg-[#E6E2DD] rounded-full h-3">
                <div 
                  className="bg-[#C44E38] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(subscriptionData.activeSeats / subscriptionData.maxSeats) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {subscriptionData.maxSeats - subscriptionData.activeSeats} seats available
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#E6E2DD] flex space-x-3">
          <Button variant="outline">
            Upgrade Plan
          </Button>
          <Button variant="outline">
            Add More Seats
          </Button>
          <Button variant="ghost" className="text-red-600">
            Cancel Subscription
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderOwnershipSettings = () => (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Organization Ownership
        </h3>
        
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-[#1A1A1A]">
              Current Owner: {currentUser?.fullName}
            </p>
            <p className="text-sm text-gray-600">
              {currentUser?.email}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Owner since January 15, 2024
            </p>
          </div>
        </div>

        {!showTransferOwnership ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-2">
                  Transfer Ownership
                </h4>
                <p className="text-sm text-yellow-800 mb-4">
                  As the organization owner, you can transfer ownership to another team member. 
                  This action cannot be undone and will give the new owner full control over billing and administration.
                </p>
                <Button
                  onClick={() => setShowTransferOwnership(true)}
                  size="sm"
                  variant="outline"
                >
                  Transfer Ownership
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h4 className="font-medium text-red-900 mb-4">
              Transfer Organization Ownership
            </h4>
            
            <div className="space-y-4 mb-6">
              <Input
                label="New Owner Email"
                type="email"
                value={transferEmail}
                onChange={setTransferEmail}
                placeholder="Enter email of existing team member"
                helperText="Must be an existing educator in your organization"
              />
              
              <Input
                label="Reason for Transfer"
                type="textarea"
                value={transferReason}
                onChange={setTransferReason}
                placeholder="Briefly explain why you're transferring ownership..."
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleTransferOwnership}
                disabled={!transferEmail || !transferReason}
                loading={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirm Transfer
              </Button>
              <Button
                onClick={() => setShowTransferOwnership(false)}
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Role Permissions Reference */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
          Role Permissions
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-600" />
              <h4 className="font-medium text-[#1A1A1A]">Owner</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Manage billing & subscription</li>
              <li>• Transfer ownership</li>
              <li>• Invite/remove educators</li>
              <li>• Full organization control</li>
            </ul>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-[#1A1A1A]">Admin</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Invite/remove educators</li>
              <li>• Manage classrooms</li>
              <li>• View organization analytics</li>
              <li>• Cannot change billing</li>
            </ul>
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-[#1A1A1A]">Educator</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Classroom tools & strategies</li>
              <li>• Personal analytics</li>
              <li>• Resource library access</li>
              <li>• Limited admin access</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('admin-dashboard')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Organization Settings
          </h1>
          <p className="text-gray-600">
            Manage your organization preferences, subscription, and permissions
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
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'subscription' && renderSubscriptionSettings()}
          {activeTab === 'ownership' && renderOwnershipSettings()}
        </div>
      </div>
    </div>
  );
};