import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../../lib/stripe';
import { prisma } from '../../../lib/prisma';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, planId, seats } = session.metadata!;
  
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionPlan: planId.toUpperCase() as any,
      subscriptionStatus: 'ACTIVE'
    }
  });

  // If organization plan, create organization and subscription
  if (planId === 'organization') {
    // Implementation for organization setup
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if ('email' in customer && customer.email) {
    await prisma.user.updateMany({
      where: { 
        stripeCustomerId: customer.id 
      },
      data: {
        subscriptionStatus: subscription.status.toUpperCase() as any
      }
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  
  if ('email' in customer && customer.email) {
    await prisma.user.updateMany({
      where: { 
        stripeCustomerId: customer.id 
      },
      data: {
        subscriptionStatus: 'CANCELED'
      }
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  
  if ('email' in customer && customer.email) {
    await prisma.user.updateMany({
      where: { 
        stripeCustomerId: customer.id 
      },
      data: {
        subscriptionStatus: 'PAST_DUE'
      }
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};