import React, { useState } from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const InvitedSignup: React.FC = () => {
  const { setCurrentView, validateInvitation, acceptInvitation, handleApiError } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    inviteCode: '',
    firstName: '',
    lastName: '',
    email: '', // Will be pre-filled from invite
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [invitationValid, setInvitationValid] = useState(false);
  const [organizationInfo, setOrganizationInfo] = useState({
    name: '',
    invitedBy: ''
  });

  useEffect(() => {
    validateInvitationFromUrl();
  }, []);

  useEffect(() => {
    validateInvitation();
  }, []);

  const validateInvitationFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      handleApiError({ message: 'Invalid invitation link' }, { action: 'validateInvitationFromUrl' });
      return;
    }

    try {
      const response = await validateInvitation(token);
      if (response.valid) {
        setInvitationValid(true);
        setOrganizationInfo({
          name: response.invitation.organizationName,
          invitedBy: response.invitation.inviterName
        });
        setFormData(prev => ({ ...prev, email: response.invitation.email }));
        
        // Auto-populate names if provided by admin
        if (response.invitation.firstName) {
          setFormData(prev => ({ ...prev, firstName: response.invitation.firstName }));
        }
        if (response.invitation.lastName) {
          setFormData(prev => ({ ...prev, lastName: response.invitation.lastName }));
        }
      } else {
        handleApiError({ message: response.error }, { action: 'validateInvitationFromUrl' });
      }
    } catch (error) {
      handleApiError(error, { action: 'validateInvitationFromUrl' });
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!minLength || !hasUppercase || !hasNumber) {
      return 'Password must include at least 8 characters, with a capital letter and a number';
    }
    return null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.inviteCode.trim()) {
      newErrors.inviteCode = 'Invite code is required';
    }
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        throw new Error('Invalid invitation token');
      }

      await acceptInvitation(token, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        inviteCode: formData.inviteCode
      });
      setCurrentView('invited-onboarding');
    } catch (error) {
      handleApiError(error, { action: 'acceptInvitation' });
    } finally {
      setLoading(false);
    }
  };

  if (!invitationValid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
          <Button onClick={() => setCurrentView('welcome')}>
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('welcome')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Join Your Organization
            </h1>
            <p className="text-gray-600">
              You've been invited to join <strong>{organizationInfo.name}</strong>
            </p>
          </div>
        </div>

        <Card className="p-8 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Invitation from {organizationInfo.invitedBy}
                </p>
                <p className="text-sm text-blue-700">
                  Organization: {organizationInfo.name}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Invite Code"
              value={formData.inviteCode}
              onChange={(value) => handleInputChange('inviteCode', value)}
              placeholder="Enter your invite code"
              required
              error={errors.inviteCode}
              helperText="Check your email invitation for the invite code"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                placeholder="Enter your first name"
                required
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                placeholder="Enter your last name"
                required
                error={errors.lastName}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              disabled
              helperText="This email was specified in your invitation"
            />

            <div className="relative">
              <Input
                label="Create Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="Create a secure password"
                required
                error={errors.password}
                helperText="Must be at least 8 characters with a capital letter and number"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Accept Invitation & Create Account
            </Button>
          </form>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <button className="text-[#C44E38] font-medium hover:underline">
              Contact your administrator
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};