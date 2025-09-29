import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Building } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const AdminSignup: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    organizationName: '',
    organizationType: '',
    jobTitle: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const organizationTypes = [
    { value: 'school', label: 'School' },
    { value: 'district', label: 'School District' },
    { value: 'childcare_center', label: 'Childcare Center' },
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'other', label: 'Other' }
  ];

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!minLength || !hasUppercase || !hasNumber) {
      return 'Password must include at least 8 characters, with a capital letter and a number';
    }
    return null;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
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
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }
    
    if (!formData.organizationType) {
      newErrors.organizationType = 'Organization type is required';
    }
    
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
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

    // Simulate API call
    setTimeout(() => {
      setCurrentView('organization-plan');
      setLoading(false);
    }, 1000);
  };

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
          
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 text-center">
            Create Organization Account
          </h1>
          <p className="text-gray-600 text-center">
            Set up your organization and invite educators to join.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Your Full Name"
              value={formData.fullName}
              onChange={(value) => handleInputChange('fullName', value)}
              placeholder="Enter your full name"
              required
              error={errors.fullName}
            />

            <Input
              label="Your Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="Enter your email address"
              required
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Password"
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

            <div className="border-t border-[#E6E2DD] pt-6">
              <h3 className="font-medium text-[#1A1A1A] mb-4">Organization Details</h3>
              
              <div className="space-y-4">
                <Input
                  label="Organization Name"
                  value={formData.organizationName}
                  onChange={(value) => handleInputChange('organizationName', value)}
                  placeholder="Enter organization name"
                  required
                  error={errors.organizationName}
                />

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.organizationType}
                    onChange={(e) => handleInputChange('organizationType', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#E6E2DD] focus:outline-none focus:ring-2 focus:ring-[#C44E38] focus:border-[#C44E38]"
                    required
                  >
                    <option value="">Select organization type</option>
                    {organizationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.organizationType && (
                    <p className="text-sm text-red-500 mt-1">{errors.organizationType}</p>
                  )}
                </div>

                <Input
                  label="Your Job Title"
                  value={formData.jobTitle}
                  onChange={(value) => handleInputChange('jobTitle', value)}
                  placeholder="e.g., Director, Principal, Administrator"
                  required
                  error={errors.jobTitle}
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Create Organization Account
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('signin')}
              className="text-[#C44E38] font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};