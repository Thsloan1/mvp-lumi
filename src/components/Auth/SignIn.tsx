import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { ErrorLogger } from '../../utils/errorLogger';

export const SignIn: React.FC = () => {
  const { setCurrentView, signin } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    ErrorLogger.logUserAction('signin_form_submit', { email: formData.email });
    
    const newErrors: Record<string, string> = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      ErrorLogger.warning('Signin form validation failed', { errors: newErrors });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await signin(formData.email, formData.password);
      // Success - user will be redirected by signin function
    } catch (error) {
      // Error is handled by signin function in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">
            Welcome Back to Lumi
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to continue supporting your classroom.
          </p>
        </div>

        <Card className="p-6 bg-white">
          {/* Social Sign In Options */}
          <div className="space-y-3 mb-6">
            <Button
              className="w-full justify-center border border-black bg-white text-black hover:bg-black hover:text-white hover:border-black transition-all duration-200 group"
              size="lg"
              onClick={() => {
                // Handle Google signin
                console.log('Google signin');
              }}
            >
              <svg className="w-5 h-5 mr-3 transition-colors duration-200" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-black group-hover:text-white transition-colors duration-200">Sign in with Google</span>
            </Button>
            
            <Button
              className="w-full justify-center border border-black bg-white text-black hover:bg-black hover:text-white hover:border-black transition-all duration-200 group"
              size="lg"
              onClick={() => {
                // Handle Apple signin
                console.log('Apple signin');
              }}
            >
              <svg className="w-5 h-5 mr-3 text-black group-hover:text-white transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-black group-hover:text-white transition-colors duration-200">Sign in with Apple</span>
            </Button>

            <Button
              className="w-full justify-center border border-black bg-white text-black hover:bg-black hover:text-white hover:border-black transition-all duration-200 group"
              size="lg"
              onClick={() => {
                // Handle Microsoft signin
                console.log('Microsoft signin');
              }}
            >
              <svg className="w-5 h-5 mr-3 text-black group-hover:text-white transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
              </svg>
              <span className="text-black group-hover:text-white transition-colors duration-200">Sign in with Microsoft</span>
            </Button>
          </div>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="you@yourschool.com"
              required
              error={errors.email}
              autoComplete="email"
              className="text-sm border-black focus:border-[#C44E38]"
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="Enter your password"
                required
                error={errors.password}
                autoComplete="current-password"
                className="text-sm border-black focus:border-[#C44E38]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C44E38] rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setCurrentView('forgot-password')}
                className="text-sm text-[#C44E38] hover:underline focus:outline-none focus:ring-2 focus:ring-[#C44E38] rounded px-1"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full bg-black border border-black text-white hover:bg-[#C44E38] hover:border-[#C44E38] transition-all duration-200"
              size="lg"
              disabled={loading}
            >
              Sign In
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentView('educator-signup')}
              className="text-[#C44E38] font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};