import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Shield } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const PaymentScreen: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setCurrentView('onboarding-start');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('subscription-plan')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-600">
            Just submit payment and you're all set. Your subscription starts now. Look out for your receipt in your inbox.
          </p>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
          </div>

          <div className="bg-[#F8F6F4] rounded-xl p-4 mb-6 border border-[#E6E2DD]">
            <h3 className="font-semibold text-[#1A1A1A] mb-1">Individual Annual</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">$297 per year</span>
              <span className="text-green-600 font-medium text-sm">Save 15%</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Cardholder Name"
              value={paymentData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Full name on card"
              required
            />

            <Input
              label="Card Number"
              value={paymentData.cardNumber}
              onChange={(value) => handleInputChange('cardNumber', value)}
              placeholder="1234 5678 9012 3456"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                value={paymentData.expiryDate}
                onChange={(value) => handleInputChange('expiryDate', value)}
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVV"
                value={paymentData.cvv}
                onChange={(value) => handleInputChange('cvv', value)}
                placeholder="123"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={CreditCard}
            >
              Complete Payment
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure payment processing by Stripe. Your data is encrypted and protected.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};