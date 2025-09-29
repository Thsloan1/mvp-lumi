import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const ForgotPassword: React.FC = () => {
  const { setCurrentView, requestPasswordReset, resetPassword } = useAppContext();
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return minLength && hasUppercase && hasNumber;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep('code');
      setErrors({});
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (resetCode.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    setStep('password');
    setErrors({});
  };

  const handlePasswordSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!validatePassword(newPassword)) {
      newErrors.password = 'Password must be at least 8 characters with a capital letter and number';
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, resetCode, newPassword);
      setCurrentView('signin');
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          Reset Your Password
        </h1>
        <p className="text-gray-600">
          Enter your email address and we'll send you a reset code
        </p>
      </div>

      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="Enter your email address"
        error={errors.email}
        required
      />

      <Button
        onClick={handleEmailSubmit}
        loading={loading}
        className="w-full"
        size="lg"
      >
        Send Reset Code
      </Button>
    </div>
  );

  const renderCodeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          Check Your Email
        </h1>
        <p className="text-gray-600">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <Input
        label="Reset Code"
        value={resetCode}
        onChange={setResetCode}
        placeholder="Enter 6-digit code"
        className="text-center text-lg tracking-widest"
        maxLength={6}
        error={errors.code}
      />

      <Button
        onClick={handleCodeSubmit}
        disabled={resetCode.length !== 6}
        className="w-full"
        size="lg"
      >
        Verify Code
      </Button>

      <div className="text-center">
        <Button
          onClick={() => setStep('email')}
          variant="ghost"
        >
          Use different email
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
          Create New Password
        </h1>
        <p className="text-gray-600">
          Choose a strong password for your account
        </p>
      </div>

      <div className="relative">
        <Input
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Create a secure password"
          error={errors.password}
          helperText="Must be at least 8 characters with a capital letter and number"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <Input
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
      />

      <Button
        onClick={handlePasswordSubmit}
        disabled={!newPassword || !confirmPassword}
        loading={loading}
        className="w-full"
        size="lg"
      >
        Reset Password
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('signin')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Sign In
          </Button>
        </div>

        <Card className="p-8">
          {step === 'email' && renderEmailStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'password' && renderPasswordStep()}
        </Card>
      </div>
    </div>
  );
};