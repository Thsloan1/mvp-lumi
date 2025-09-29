import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Mail, MoreVertical, UserX, Crown, Shield, Calendar, Search } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

interface Educator {
  id: string;
  fullName: string;
  email: string;
  organizationRole: 'OWNER' | 'ADMIN' | 'EDUCATOR';
  onboardingStatus: 'INCOMPLETE' | 'COMPLETE';
  createdAt: string;
  lastActive?: string;
  behaviorLogsCount?: number;
  classroomLogsCount?: number;
}

interface PendingInvitation {
  id: string;
  email: string;
  inviterName: string;
  createdAt: string;
  expiresAt: string;
  status: 'PENDING' | 'EXPIRED';
}

export const ManageEducators: React.FC = () => {
  const { setCurrentView, organizationApi, handleApiError } = useAppContext();
  const { setCurrentView, getOrganizationStats, inviteEducators } = useAppContext();
  const [educators, setEducators] = useState<Educator[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchEducators();
    fetchPendingInvitations();
  }, []);

  const fetchEducators = async () => {
    try {
      const response = await organizationApi.getMembers();
      setEducators(response.members || []);
    } catch (error) {
      handleApiError(error, { action: 'fetchEducators' });
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      // Mock pending invitations for MVP
      const mockInvitations: PendingInvitation[] = [
        {
          id: '1',
          email: 'david.kim@school.edu',
          inviterName: 'Dr. Maria Rodriguez',
          createdAt: '2024-02-10',
          expiresAt: '2024-02-17',
          status: 'PENDING'
        },
        {
          id: '2',
          email: 'emma.thompson@school.edu',
          inviterName: 'Dr. Maria Rodriguez',
          createdAt: '2024-02-12',
          expiresAt: '2024-02-19',
          status: 'PENDING'
        }
      ];
      setPendingInvitations(mockInvitations);
    } catch (error) {
      handleApiError(error, { action: 'fetchPendingInvitations' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEducator = async (educatorId: string) => {
    try {
      await organizationApi.removeMember(educatorId);
      await fetchEducators(); // Refresh the list
      setActionMenuOpen(null);
    } catch (error) {
      handleApiError(error, { action: 'removeEducator', educatorId });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await organizationApi.delete(`/organizations/invitations?invitationId=${invitationId}`);
      await fetchPendingInvitations(); // Refresh the list
    } catch (error) {
      handleApiError(error, { action: 'cancelInvitation', invitationId });
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await organizationApi.post(`/organizations/invitations/resend`, { invitationId });
      await fetchPendingInvitations(); // Refresh the list
    } catch (error) {
      handleApiError(error, { action: 'resendInvitation', invitationId });
    }
  };

  const filteredEducators = educators.filter(educator =>
    educator.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    educator.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Owner';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Educator';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Manage Educators
              </h1>
              <p className="text-gray-600">
                View and manage your organization's educator team
              </p>
            </div>
            <Button
              onClick={() => setCurrentView('invite-educators-modal')}
              icon={Mail}
            >
              Invite Educators
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="max-w-md">
            <Input
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search educators..."
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Educators */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Active Educators ({filteredEducators.length})
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-[#F8F6F4] rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEducators.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-[#1A1A1A] mb-2">
                    No educators found
                  </h4>
                  <p className="text-gray-600">
                    {searchQuery ? 'Try adjusting your search' : 'Invite your first educator to get started'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEducators.map((educator) => (
                    <div key={educator.id} className="flex items-center justify-between p-4 bg-[#F8F6F4] rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-[#1A1A1A]">
                              {educator.fullName}
                            </p>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(educator.organizationRole)}
                              <span className="text-xs font-medium text-gray-600">
                                {getRoleLabel(educator.organizationRole)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{educator.email}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`
                              text-xs px-2 py-1 rounded-full
                              ${educator.onboardingStatus === 'COMPLETE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'}
                            `}>
                              {educator.onboardingStatus === 'COMPLETE' ? 'Active' : 'Onboarding'}
                            </span>
                            <span className="text-xs text-gray-500">
                              Last active: {educator.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">
                            {educator.behaviorLogsCount} behaviors
                          </p>
                          <p className="text-gray-600">
                            {educator.classroomLogsCount} classroom logs
                          </p>
                        </div>
                        
                        {educator.organizationRole !== 'OWNER' && (
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={MoreVertical}
                              onClick={() => setActionMenuOpen(
                                actionMenuOpen === educator.id ? null : educator.id
                              )}
                            />
                            
                            {actionMenuOpen === educator.id && (
                              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E6E2DD] rounded-xl shadow-lg z-10">
                                <div className="p-2">
                                  <button
                                    onClick={() => handleRemoveEducator(educator.id)}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
                                  >
                                    <UserX className="w-4 h-4" />
                                    <span>Remove from Organization</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Pending Invitations */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Pending Invitations ({pendingInvitations.length})
              </h3>
              
              {pendingInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    No pending invitations
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingInvitations.map((invitation) => (
                    <div key={invitation.id} className="p-4 border border-[#E6E2DD] rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-[#1A1A1A] text-sm">
                            {invitation.email}
                          </p>
                          <p className="text-xs text-gray-600">
                            Invited by {invitation.inviterName}
                          </p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Sent {new Date(invitation.createdAt).toLocaleDateString()}</span>
                        <span>Expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleResendInvitation(invitation.id)}
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                        >
                          Resend
                        </Button>
                        <Button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-[#E6E2DD]">
                <Button
                  onClick={() => setCurrentView('invite-educators-modal')}
                  variant="outline"
                  className="w-full"
                  icon={Mail}
                >
                  Invite More Educators
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};