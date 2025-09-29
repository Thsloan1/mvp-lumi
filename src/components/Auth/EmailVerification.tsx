import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const EmailVerification: React.FC = () => {
  const { setCurrentView, currentUser, resendVerificationEmail, verifyEmail } = useAppContext();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleVerify = async () => {
    if (!verificationCode.trim()) return;
    
    setLoading(true);
    try {
      await verifyEmail(verificationCode);
      // Success handled by context - user will be redirected
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail();
      setTimeLeft(60);
      setCanResend(false);
    } catch (error) {
      // Error handled by context
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('educator-signup')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We sent a verification code to <strong>{currentUser?.email}</strong>
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <Input
              label="Verification Code"
              value={verificationCode}
              onChange={setVerificationCode}
              placeholder="Enter 6-digit code"
              className="text-center text-lg tracking-widest"
              maxLength={6}
            />

            <Button
              onClick={handleVerify}
              disabled={verificationCode.length !== 6}
              loading={loading}
              className="w-full"
              size="lg"
              icon={CheckCircle}
            >
              Verify Email
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the code?
              </p>
              {canResend ? (
                <Button
                  onClick={handleResend}
                  variant="ghost"
                  loading={resendLoading}
                  icon={RefreshCw}
                >
                  Resend Code
                </Button>
              ) : (
                <p className="text-sm text-gray-500">
                  Resend available in {timeLeft}s
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};