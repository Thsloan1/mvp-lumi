import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, BookOpen, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const LumiEdPayment: React.FC = () => {
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
      setCurrentView('lumied-welcome');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('lumied-subscription')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Complete Your LumiEd Setup
            </h1>
            <p className="text-gray-600">
              Secure payment processing for your LumiEd subscription.
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Secure Payment</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8 border border-purple-200">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Lumi + LumiEd Bundle</span>
                <span className="font-medium text-[#1A1A1A]">Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per month</span>
                <span className="font-medium text-[#1A1A1A]">$39/month</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Bundle savings</span>
                <span className="font-medium">Save $9/month</span>
              </div>
              <div className="border-t border-purple-200 pt-2 mt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#1A1A1A]">Total</span>
                  <span className="text-xl font-bold text-[#1A1A1A]">$39/month</span>
                </div>
              </div>
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
              icon={CreditCard}
            >
              Complete LumiEd Setup
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure payment processing by Stripe. Your data is encrypted and protected.
            </p>
          </div>
        </Card>

        {/* Benefits Reminder */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <h3 className="font-semibold text-[#1A1A1A] mb-3 text-center">
            What happens next?
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Instant access to 100+ premium resources</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Integrated recommendations in your behavior strategies</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Enhanced family communication tools</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};