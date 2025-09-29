import { NextApiRequest, NextApiResponse } from 'next';
import { Webhook } from 'svix';
import { prisma } from '../../../lib/prisma';
import { Role, OnboardingStatus } from '@prisma/client';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const headers = req.headers;
  const payload = JSON.stringify(req.body);

  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(payload, headers as any);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const { type, data } = evt;

  try {
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUserCreated(data: any) {
  const { id: clerkId, email_addresses, first_name, last_name } = data;
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id);

  if (!primaryEmail) {
    throw new Error('No primary email found');
  }

  const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User';

  await prisma.user.create({
    data: {
      clerkId,
      email: primaryEmail.email_address,
      fullName,
      role: Role.EDUCATOR,
      onboardingStatus: OnboardingStatus.INCOMPLETE
    }
  });
}

async function handleUserUpdated(data: any) {
  const { id: clerkId, email_addresses, first_name, last_name } = data;
  const primaryEmail = email_addresses.find((email: any) => email.id === data.primary_email_address_id);

  if (!primaryEmail) return;

  const fullName = `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User';

  await prisma.user.update({
    where: { clerkId },
    data: {
      email: primaryEmail.email_address,
      fullName
    }
  });
}

async function handleUserDeleted(data: any) {
  const { id: clerkId } = data;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { organization: true }
  });

  if (user?.organizationId) {
    // Decrement active seats if user was part of organization
    await prisma.subscription.update({
      where: { organizationId: user.organizationId },
      data: { activeSeats: { decrement: 1 } }
    });
  }

  await prisma.user.delete({
    where: { clerkId }
  });
}