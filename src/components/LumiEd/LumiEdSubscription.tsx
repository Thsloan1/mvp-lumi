import React, { useState } from 'react';
import { ArrowLeft, Check, Crown, BookOpen, CreditCard } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { useAppContext } from '../../context/AppContext';

export const LumiEdSubscription: React.FC = () => {
  const { setCurrentView, currentUser } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<string>('bundle');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'lumied-only',
      name: 'LumiEd Only',
      description: 'Resource library access only',
      monthly: 19,
      annual: 16, // $192/year = $16/month
      features: [
        '100+ downloadable resources',
        'Advanced toolkits and guides',
        'Family companion materials',
        'Bilingual content (English & Spanish)',
        'Search and filter tools',
        'PDF downloads and printing',
        'Email support'
      ]
    },
    {
      id: 'bundle',
      name: 'Lumi + LumiEd Bundle',
      description: 'Complete behavior coaching ecosystem',
      monthly: 39,
      annual: 33, // $396/year = $33/month
      originalMonthly: 48, // $29 + $19
      originalAnnual: 41, // $25 + $16
      features: [
        'Everything in Lumi Core',
        'Full LumiEd resource library',
        'Integrated resource recommendations',
        'Advanced analytics and reporting',
        'Priority support',
        'Exclusive webinars and training',
        'Early access to new features'
      ],
      popular: true,
      integrated: true
    }
  ];

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const price = selectedPlanData ? selectedPlanData[billingCycle] : 0;
  const originalPrice = selectedPlanData ? selectedPlanData[`original${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}` as keyof typeof selectedPlanData] as number : 0;
  const savings = originalPrice ? originalPrice - price : 0;

  const handleContinue = () => {
    setCurrentView('lumied-payment');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('lumied-preview')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Preview
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Choose Your LumiEd Plan
            </h1>
            <p className="text-gray-600">
              Select the option that works best for your needs and budget.
            </p>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F6F4] rounded-xl max-w-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`
                  px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
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
                  px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 relative
                  ${billingCycle === 'annual' 
                    ? 'bg-white text-[#1A1A1A] shadow-sm' 
                    : 'text-gray-600 hover:text-[#1A1A1A]'
                  }
                `}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 15%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              hoverable
              selected={selectedPlan === plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-8 relative ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className={`
                  w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center
                  ${selectedPlan === plan.id 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                    : 'bg-[#E6E2DD] text-purple-600'}
                `}>
                  {plan.integrated ? <Crown className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                </div>
                
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-bold text-[#1A1A1A]">
                      ${plan[billingCycle]}
                    </span>
                    <span className="text-gray-600 ml-2">
                      per month
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Billed annually (${plan.annual * 12}/year)
                    </p>
                  )}
                  {plan[`original${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}` as keyof typeof plan] && (
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <span className="text-gray-500 line-through text-sm">
                        ${plan[`original${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}` as keyof typeof plan]}
                      </span>
                      <span className="text-green-600 font-medium text-sm">
                        Save ${savings}/month
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Integration Callout for Bundle */}
        {selectedPlan === 'bundle' && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                🎉 Perfect Choice for Integrated Experience
              </h3>
              <p className="text-gray-600">
                Your behavior strategies will automatically suggest relevant LumiEd resources, and family communications will link to companion materials.
              </p>
            </div>
          </Card>
        )}

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            size="lg"
            className="px-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            icon={CreditCard}
          >
            Continue to Payment
          </Button>
          
          {!selectedPlan && (
            <p className="text-sm text-red-500 mt-2">
              Please select a plan to continue
            </p>
          )}
        </div>

        {/* Money-Back Guarantee */}
        <div className="text-center mt-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-sm text-green-800 font-medium mb-1">
              30-Day Money-Back Guarantee
            </p>
            <p className="text-xs text-green-700">
              Try LumiEd risk-free. Cancel anytime within 30 days for a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};