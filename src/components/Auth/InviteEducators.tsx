import React, { useState } from 'react';
import { ArrowLeft, Mail, Plus, X, Send, Copy, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

interface Educator {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'pending' | 'sent' | 'accepted';
}

export const InviteEducators: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [educators, setEducators] = useState<Educator[]>([
    { id: '1', email: '', firstName: '', lastName: '', status: 'pending' }
  ]);
  const [invitesSent, setInvitesSent] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const inviteLink = "https://lumi.app/invite/abc123xyz";

  const addEducator = () => {
    const newEducator: Educator = {
      id: Date.now().toString(),
      email: '',
      firstName: '',
      lastName: '',
      status: 'pending'
    };
    setEducators([...educators, newEducator]);
  };

  const removeEducator = (id: string) => {
    if (educators.length > 1) {
      setEducators(educators.filter(educator => educator.id !== id));
    }
  };

  const updateEducator = (id: string, field: keyof Educator, value: string) => {
    setEducators(educators.map(educator => 
      educator.id === id ? { ...educator, [field]: value } : educator
    ));
  };

  const sendInvites = () => {
    // Mark all educators as sent
    setEducators(educators.map(educator => ({ ...educator, status: 'sent' })));
    setInvitesSent(true);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleFinish = () => {
    setCurrentView('organization-complete');
  };

  const validEducators = educators.filter(educator => 
    educator.email && educator.firstName && educator.lastName
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('organization-payment')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Invite Your Educators
            </h1>
            <p className="text-gray-600">
              Add your team members to get started with Lumi. You can always invite more later.
            </p>
          </div>
        </div>

        {!invitesSent ? (
          <div className="space-y-8">
            {/* Individual Invites */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Add Educators Individually
                </h3>
                <Button
                  onClick={addEducator}
                  variant="outline"
                  size="sm"
                  icon={Plus}
                >
                  Add Another
                </Button>
              </div>

              <div className="space-y-4">
                {educators.map((educator, index) => (
                  <div key={educator.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#F8F6F4] rounded-xl">
                    <Input
                      label={index === 0 ? "First Name" : ""}
                      value={educator.firstName}
                      onChange={(value) => updateEducator(educator.id, 'firstName', value)}
                      placeholder="First name"
                    />
                    <Input
                      label={index === 0 ? "Last Name" : ""}
                      value={educator.lastName}
                      onChange={(value) => updateEducator(educator.id, 'lastName', value)}
                      placeholder="Last name"
                    />
                    <Input
                      label={index === 0 ? "Email" : ""}
                      type="email"
                      value={educator.email}
                      onChange={(value) => updateEducator(educator.id, 'email', value)}
                      placeholder="email@example.com"
                    />
                    <div className={`${index === 0 ? 'mt-7' : ''} flex items-center`}>
                      {educators.length > 1 && (
                        <Button
                          onClick={() => removeEducator(educator.id)}
                          variant="ghost"
                          size="sm"
                          icon={X}
                          className="text-red-500 hover:text-red-700"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {validEducators.length} educator{validEducators.length !== 1 ? 's' : ''} ready to invite
                </p>
                <Button
                  onClick={sendInvites}
                  disabled={validEducators.length === 0}
                  icon={Send}
                >
                  Send Invites
                </Button>
              </div>
            </Card>

            {/* Bulk Invite Option */}
            <Card className="p-8">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                Or Share Invite Link
              </h3>
              <p className="text-gray-600 mb-6">
                Share this link with educators to let them join your organization directly.
              </p>
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 px-4 py-3 bg-[#F8F6F4] rounded-xl border border-[#E6E2DD] font-mono text-sm">
                  {inviteLink}
                </div>
                <Button
                  onClick={copyInviteLink}
                  variant="outline"
                  icon={copiedInvite ? Check : Copy}
                  className={copiedInvite ? 'text-green-600' : ''}
                >
                  {copiedInvite ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </Card>

            {/* Skip Option */}
            <div className="text-center">
              <Button
                onClick={handleFinish}
                variant="ghost"
              >
                Skip for now - I'll invite educators later
              </Button>
            </div>
          </div>
        ) : (
          /* Invites Sent Confirmation */
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
              Invites Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-8">
              We've sent invitation emails to {validEducators.length} educator{validEducators.length !== 1 ? 's' : ''}. 
              They'll receive instructions to join your organization and complete their onboarding.
            </p>

            <div className="bg-[#F8F6F4] rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-[#1A1A1A] mb-4">Invited Educators:</h3>
              <div className="space-y-2">
                {validEducators.map((educator) => (
                  <div key={educator.id} className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {educator.firstName} {educator.lastName}
                    </span>
                    <span className="text-sm text-gray-500">{educator.email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleFinish}
                size="lg"
                className="px-12"
              >
                Continue to Dashboard
              </Button>
              
              <div>
                <Button
                  onClick={() => setInvitesSent(false)}
                  variant="ghost"
                >
                  Invite More Educators
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};