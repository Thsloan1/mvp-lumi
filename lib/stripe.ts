import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const getStripePublishableKey = () => {
  return process.env.STRIPE_PUBLISHABLE_KEY!;
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  individual_monthly: {
    priceId: 'price_individual_monthly',
    name: 'Individual Monthly',
    price: 2900, // $29.00 in cents
    interval: 'month' as const,
    features: [
      'Unlimited behavior strategies',
      'Classroom management tools',
      'Family communication notes',
      'Personal reflection tracking',
      'Mobile app access'
    ]
  },
  individual_annual: {
    priceId: 'price_individual_annual',
    name: 'Individual Annual',
    price: 29700, // $297.00 in cents
    interval: 'year' as const,
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority support',
      'Advanced analytics',
      'Exclusive webinars'
    ]
  },
  organization: {
    priceId: 'price_organization',
    name: 'Organization Plan',
    price: 3500, // $35.00 per seat per month in cents
    interval: 'month' as const,
    features: [
      'Everything in Individual',
      'Organization-wide analytics',
      'Bulk educator onboarding',
      'Custom training materials',
      'Priority support',
      'SSO integration'
    ]
  }
};

export const createCheckoutSession = async (
  priceId: string,
  customerId?: string,
  metadata?: Record<string, string>
) => {
  return await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer: customerId,
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/subscription-plan`,
    metadata,
  });
};

export const createCustomer = async (email: string, name: string) => {
  return await stripe.customers.create({
    email,
    name,
  });
};