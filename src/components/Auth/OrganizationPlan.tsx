import React, { useState } from 'react';
import { ArrowLeft, Users, Check, Plus, Minus } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const OrganizationPlan: React.FC = () => {
  const { setCurrentView, createOrganization } = useAppContext();
  const [seatCount, setSeatCount] = useState(5);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const pricePerSeat = {
    monthly: 35,
    annual: 29 // $348/year = $29/month
  };

  const totalPrice = seatCount * pricePerSeat[billingCycle];
  const annualSavings = billingCycle === 'annual' ? seatCount * (35 - 29) * 12 : 0;

  const handleSeatChange = (change: number) => {
    const newCount = Math.max(2, seatCount + change);
    setSeatCount(newCount);
  };

  const handleContinue = () => {
    // Store organization plan data for payment step
    localStorage.setItem('lumi_org_plan', JSON.stringify({
      seatCount,
      billingCycle,
      totalPrice: billingCycle === 'annual' ? totalPrice * 12 : totalPrice
    }));
    setCurrentView('organization-payment');
  };

  const features = [
    'Unlimited behavior strategies for all educators',
    'Organization-wide analytics and insights',
    'Bulk educator onboarding and management',
    'Custom training materials and resources',
    'Priority support and dedicated success manager',
    'Advanced reporting and compliance tools',
    'Single sign-on (SSO) integration',
    'Data export and backup capabilities'
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('admin-signup')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Choose Your Organization Plan
            </h1>
            <p className="text-gray-600">
              Select the number of educator seats and billing cycle for your organization.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plan Configuration */}
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
                Organization Plan
              </h2>
              <p className="text-gray-600">
                Comprehensive solution for educational organizations
              </p>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-4">
                Billing Cycle
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F6F4] rounded-xl">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`
                    px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
                    ${billingCycle === 'monthly' 
                      ? 'bg-white text-[#1A1A1A] shadow-sm' 
                      : 'text-gray-600 hover:text-[#1A1A1A]'
                    }
                  `}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`
                    px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative
                    ${billingCycle === 'annual' 
                      ? 'bg-white text-[#1A1A1A] shadow-sm' 
                      : 'text-gray-600 hover:text-[#1A1A1A]'
                    }
                  `}
                >
                  Annual
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-4">
                Number of Educator Seats
              </label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSeatChange(-1)}
                  disabled={seatCount <= 2}
                  icon={Minus}
                />
                <div className="flex-1">
                  <Input
                    type="number"
                    value={seatCount.toString()}
                    onChange={(value) => setSeatCount(Math.max(2, parseInt(value) || 2))}
                    min={2}
                    className="text-center text-lg font-semibold"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSeatChange(1)}
                  icon={Plus}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Minimum 2 seats required
              </p>
            </div>

            {/* Pricing Summary */}
            <div className="bg-[#F8F6F4] rounded-xl p-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {seatCount} educator seats × ${pricePerSeat[billingCycle]}/{billingCycle === 'monthly' ? 'month' : 'month (billed annually)'}
                  </span>
                  <span className="font-semibold text-[#1A1A1A]">
                    ${totalPrice}/{billingCycle === 'monthly' ? 'month' : 'month'}
                  </span>
                </div>
                
                {billingCycle === 'annual' && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Annual savings</span>
                    <span className="font-semibold">
                      ${annualSavings}/year
                    </span>
                  </div>
                )}
                
                <div className="border-t border-[#E6E2DD] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#1A1A1A]">
                      Total {billingCycle === 'annual' ? '(billed annually)' : ''}
                    </span>
                    <span className="text-xl font-bold text-[#1A1A1A]">
                      ${billingCycle === 'annual' ? totalPrice * 12 : totalPrice}
                      {billingCycle === 'annual' ? '/year' : '/month'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full"
            >
              Continue to Payment
            </Button>
          </Card>

          {/* Features List */}
          <Card className="p-8">
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
              Everything included:
            </h3>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Need more seats later?
              </h4>
              <p className="text-sm text-blue-700">
                You can easily add or remove educator seats at any time. Billing adjusts automatically on your next cycle.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};