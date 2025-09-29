import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, Building } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const OrganizationPayment: React.FC = () => {
  const { setCurrentView, createOrganization } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get organization plan data
      const planData = JSON.parse(localStorage.getItem('lumi_org_plan') || '{}');
      
      // Create organization
      await createOrganization({
        name: 'Organization Name', // Would come from admin signup
        type: 'school',
        plan: planData.billingCycle || 'annual',
        maxSeats: planData.seatCount || 5,
        paymentData
      });
      
      setCurrentView('invite-educators');
    } catch (error) {
      // Error handled by createOrganization
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('organization-plan')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Complete Your Organization Setup
            </h1>
            <p className="text-gray-600">
              Secure payment processing for your organization account.
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
          <div className="bg-[#F8F6F4] rounded-xl p-6 mb-8 border border-[#E6E2DD]">
            <h3 className="font-semibold text-[#1A1A1A] mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Organization Plan</span>
                <span className="font-medium text-[#1A1A1A]">5 seats</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billing Cycle</span>
                <span className="font-medium text-[#1A1A1A]">Annual</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price per seat</span>
                <span className="font-medium text-[#1A1A1A]">$29/month</span>
              </div>
              <div className="border-t border-[#E6E2DD] pt-2 mt-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#1A1A1A]">Total (billed annually)</span>
                  <span className="text-xl font-bold text-[#1A1A1A]">$1,740/year</span>
                </div>
                <div className="flex justify-between text-green-600 text-sm">
                  <span>You save</span>
                  <span className="font-medium">$360/year</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-4">Payment Information</h3>
              
              <div className="space-y-4">
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
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-4">Billing Address</h3>
              
              <div className="space-y-4">
                <Input
                  label="Address"
                  value={paymentData.billingAddress}
                  onChange={(value) => handleInputChange('billingAddress', value)}
                  placeholder="Street address"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={paymentData.city}
                    onChange={(value) => handleInputChange('city', value)}
                    placeholder="City"
                    required
                  />
                  <Input
                    label="State"
                    value={paymentData.state}
                    onChange={(value) => handleInputChange('state', value)}
                    placeholder="State"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="ZIP Code"
                    value={paymentData.zipCode}
                    onChange={(value) => handleInputChange('zipCode', value)}
                    placeholder="ZIP code"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      Country
                    </label>
                    <select
                      value={paymentData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2DD] focus:outline-none focus:ring-2 focus:ring-[#C44E38] focus:border-[#C44E38]"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={CreditCard}
            >
              Complete Payment & Setup Organization
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