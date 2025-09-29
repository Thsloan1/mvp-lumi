import React, { useState } from 'react';
import { X, Mail, Plus, Minus, Send, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

interface InviteEducatorsModalProps {
  onClose: () => void;
}

interface EmailInvite {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const InviteEducatorsModal: React.FC<InviteEducatorsModalProps> = ({ onClose }) => {
  const { setCurrentView, organizationApi, handleApiError } = useAppContext();
  const [inviteMethod, setInviteMethod] = useState<'individual' | 'bulk'>('individual');
  const [emailInvites, setEmailInvites] = useState<EmailInvite[]>([
    { id: '1', firstName: '', lastName: '', email: '' }
  ]);
  const [bulkEmails, setBulkEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [invitesSent, setInvitesSent] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState({
    activeSeats: 0,
    maxSeats: 0,
    availableSeats: 0
  });
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchSeatInfo();
  }, []);

  const fetchSeatInfo = async () => {
    try {
      const seatCheck = await organizationApi.checkSeatAvailability(0);
      setSubscriptionInfo({
        activeSeats: seatCheck.activeSeats,
        maxSeats: seatCheck.maxSeats,
        availableSeats: seatCheck.maxSeats - seatCheck.activeSeats
      });
    } catch (error) {
      handleApiError(error, { action: 'fetchSeatInfo' });
    }
  };

  const inviteLink = "https://lumi.app/invite/abc123xyz";

  const addEmailInvite = () => {
    const newInvite: EmailInvite = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: ''
    };
    setEmailInvites([...emailInvites, newInvite]);
  };

  const removeEmailInvite = (id: string) => {
    if (emailInvites.length > 1) {
      setEmailInvites(emailInvites.filter(invite => invite.id !== id));
    }
  };

  const updateEmailInvite = (id: string, field: keyof EmailInvite, value: string) => {
    setEmailInvites(emailInvites.map(invite =>
      invite.id === id ? { ...invite, [field]: value } : invite
    ));
  };

  const validateEmails = (): string[] => {
    if (inviteMethod === 'individual') {
      return emailInvites
        .filter(invite => invite.email && invite.firstName && invite.lastName)
        .map(invite => invite.email);
    } else {
      return bulkEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    }
  };

  const checkSeatAvailability = (emailCount: number): boolean => {
    if (emailCount > subscriptionInfo.availableSeats) {
      setSeatError(
        `Your subscription allows only ${subscriptionInfo.maxSeats} educators. You have ${subscriptionInfo.availableSeats} seats available. Upgrade to add more.`
      );
      return false;
    }
    setSeatError(null);
    return true;
  };

  const handleSendInvites = async () => {
    const validEmails = validateEmails();
    
    if (validEmails.length === 0) {
      setSeatError('Please enter at least one valid email address');
      return;
    }

    setLoading(true);
    setSeatError(null);
    
    try {
      // Check seat availability
      if (validEmails.length > subscriptionInfo.availableSeats) {
        setSeatError(`Not enough seats available. You have ${subscriptionInfo.availableSeats} seats remaining.`);
        return;
      }

      // Send invitations
      const emailData = validEmails.map(email => ({
        email,
        firstName: 'Invited',
        lastName: 'Educator'
      }));
      const result = await inviteEducators(emailData);
      
      setInvitesSent(true);
      // Update seat info
      await fetchSeatInfo();
    } catch (error) {
      handleApiError(error, { action: 'sendInvites', emails: validEmails });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const validEmailCount = validateEmails().length;

  if (invitesSent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
            Invitations Sent!
          </h2>
          <p className="text-gray-600 mb-8">
            We've sent invitations to {validEmailCount} educator{validEmailCount !== 1 ? 's' : ''}. 
            They'll receive email instructions to join your organization.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                onClose();
                setCurrentView('manage-educators');
              }}
              className="w-full"
            >
              View Educator Management
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                Invite Educators
              </h2>
              <p className="text-gray-600">
                Add new team members to your organization
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              icon={X}
            />
          </div>

          {/* Seat Status */}
          <Card className="p-4 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Subscription Status
                </p>
                <p className="text-sm text-blue-700">
                  {subscriptionInfo.activeSeats}/{subscriptionInfo.maxSeats} seats used • {subscriptionInfo.availableSeats} available
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-2 bg-blue-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${(subscriptionInfo.activeSeats / subscriptionInfo.maxSeats) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Method Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F6F4] rounded-xl">
              <button
                onClick={() => setInviteMethod('individual')}
                className={`
                  px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${inviteMethod === 'individual' 
                    ? 'bg-white text-[#1A1A1A] shadow-sm' 
                    : 'text-gray-600 hover:text-[#1A1A1A]'
                  }
                `}
              >
                Individual Invites
              </button>
              <button
                onClick={() => setInviteMethod('bulk')}
                className={`
                  px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${inviteMethod === 'bulk' 
                    ? 'bg-white text-[#1A1A1A] shadow-sm' 
                    : 'text-gray-600 hover:text-[#1A1A1A]'
                  }
                `}
              >
                Bulk Invite / Share Link
              </button>
            </div>
          </div>

          {/* Individual Invites */}
          {inviteMethod === 'individual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1A1A1A]">
                  Add Educators
                </h3>
                <Button
                  onClick={addEmailInvite}
                  variant="outline"
                  size="sm"
                  icon={Plus}
                >
                  Add Another
                </Button>
              </div>

              <div className="space-y-4">
                {emailInvites.map((invite, index) => (
                  <div key={invite.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#F8F6F4] rounded-xl">
                    <Input
                      label={index === 0 ? "First Name" : ""}
                      value={invite.firstName}
                      onChange={(value) => updateEmailInvite(invite.id, 'firstName', value)}
                      placeholder="First name"
                    />
                    <Input
                      label={index === 0 ? "Last Name" : ""}
                      value={invite.lastName}
                      onChange={(value) => updateEmailInvite(invite.id, 'lastName', value)}
                      placeholder="Last name"
                    />
                    <Input
                      label={index === 0 ? "Email" : ""}
                      type="email"
                      value={invite.email}
                      onChange={(value) => updateEmailInvite(invite.id, 'email', value)}
                      placeholder="email@example.com"
                    />
                    <div className={`${index === 0 ? 'mt-7' : ''} flex items-center`}>
                      {emailInvites.length > 1 && (
                        <Button
                          onClick={() => removeEmailInvite(invite.id)}
                          variant="ghost"
                          size="sm"
                          icon={Minus}
                          className="text-red-500 hover:text-red-700"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk Invites */}
          {inviteMethod === 'bulk' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-[#1A1A1A] mb-4">
                  Bulk Email Invites
                </h3>
                <Input
                  type="textarea"
                  value={bulkEmails}
                  onChange={setBulkEmails}
                  placeholder="Enter email addresses separated by commas or new lines..."
                  rows={6}
                  helperText="Example: sarah@school.edu, mike@school.edu, lisa@school.edu"
                />
              </div>

              <div className="border-t border-[#E6E2DD] pt-6">
                <h3 className="font-semibold text-[#1A1A1A] mb-4">
                  Or Share Invite Link
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Share this link with educators to let them join your organization directly.
                </p>
                
                <div className="flex items-center space-x-3">
                  <div className="flex-1 px-4 py-3 bg-[#F8F6F4] rounded-xl border border-[#E6E2DD] font-mono text-sm">
                    {inviteLink}
                  </div>
                  <Button
                    onClick={copyInviteLink}
                    variant="outline"
                    icon={copiedLink ? Check : Copy}
                    className={copiedLink ? 'text-green-600' : ''}
                  >
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {seatError && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Invitation Error
                  </p>
                  <p className="text-sm text-red-700">
                    {seatError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-[#F8F6F4] rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Ready to invite: {validEmailCount} educator{validEmailCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-600">
                  This will use {validEmailCount} of your {subscriptionInfo.availableSeats} available seats
                </p>
              </div>
              {validEmailCount > 0 && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Seats after: {subscriptionInfo.activeSeats + validEmailCount}/{subscriptionInfo.maxSeats}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            
            <div className="flex space-x-3">
              {validEmailCount > subscriptionInfo.availableSeats && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('upgrade-subscription')}
                >
                  Upgrade Plan
                </Button>
              )}
              <Button
                onClick={handleSendInvites}
                disabled={validEmailCount === 0 || validEmailCount > subscriptionInfo.availableSeats}
                loading={loading}
                icon={Send}
              >
                Send {validEmailCount} Invitation{validEmailCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};