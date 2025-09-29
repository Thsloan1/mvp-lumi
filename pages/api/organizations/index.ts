import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { OrganizationRole, SubscriptionStatus } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (req.method) {
    case 'POST':
      return createOrganization(req, res, user.id);
    case 'GET':
      return getOrganization(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createOrganization(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { name, type, plan, maxSeats } = req.body;

  if (!name || !type || !plan || !maxSeats) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const organization = await prisma.$transaction(async (tx) => {
      // Create organization
      const org = await tx.organization.create({
        data: {
          name,
          type,
          ownerId: userId
        }
      });

      // Create subscription
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          plan,
          maxSeats: parseInt(maxSeats),
          activeSeats: 1, // Owner counts as first seat
          status: SubscriptionStatus.TRIALING
        }
      });

      // Update user to be organization owner
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: org.id,
          organizationRole: OrganizationRole.OWNER,
          role: 'ADMIN'
        }
      });

      return org;
    });

    res.status(201).json({ organization });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
}

async function getOrganization(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            subscription: true,
            members: {
              select: {
                id: true,
                fullName: true,
                email: true,
                organizationRole: true,
                onboardingStatus: true,
                createdAt: true
              }
            },
            invitations: {
              where: { status: 'PENDING' },
              include: {
                inviter: {
                  select: { fullName: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user?.organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({ organization: user.organization });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to get organization' });
  }
}