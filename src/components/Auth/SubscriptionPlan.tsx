import React, { useState } from 'react';
import { ArrowLeft, Check, Zap, Crown } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';

export const SubscriptionPlan: React.FC = () => {
  const { setCurrentView } = useAppContext();
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const plans = [
    {
      id: 'individual_monthly',
      name: 'Individual Monthly',
      price: '$29',
      period: 'per month',
      icon: Zap,
      features: [
        'Unlimited behavior strategies',
        'Classroom management tools',
        'Family communication notes',
        'Personal reflection tracking',
        'Mobile app access'
      ]
    },
    {
      id: 'individual_annual',
      name: 'Individual Annual',
      price: '$297',
      period: 'per year',
      originalPrice: '$348',
      savings: 'Save 15%',
      icon: Crown,
      popular: true,
      features: [
        'Everything in Monthly',
        '2 months free',
        'Priority support',
        'Advanced analytics',
        'Exclusive webinars'
      ]
    }
  ];

  const handleContinue = () => {
    if (selectedPlan) {
      setCurrentView('payment');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
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
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
              Choose Your Plan
            </h1>
            <p className="text-gray-600">
              Which plan feels right for you? Monthly or annual? You're in control — you can always change later.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                hoverable
                selected={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-8 relative ${plan.popular ? 'ring-2 ring-[#C44E38]' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#C44E38] text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`
                    w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center
                    ${selectedPlan === plan.id ? 'bg-[#C44E38] text-white' : 'bg-[#E6E2DD] text-[#C44E38]'}
                  `}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#1A1A1A]">
                        {plan.price}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {plan.period}
                      </span>
                    </div>
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <span className="text-gray-500 line-through text-sm">
                          {plan.originalPrice}
                        </span>
                        <span className="text-green-600 font-medium text-sm">
                          {plan.savings}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-[#C44E38] mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedPlan}
            size="lg"
            className="px-12"
          >
            Continue to Payment
          </Button>
          
          {!selectedPlan && (
            <p className="text-sm text-red-500 mt-2">
              Please select a plan to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};