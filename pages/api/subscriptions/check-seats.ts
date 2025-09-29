import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { SubscriptionService } from '../../../lib/subscription';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user?.organizationId) {
    return res.status(400).json({ error: 'User not part of organization' });
  }

  const { requestedSeats = 1 } = req.query;

  try {
    const seatCheck = await SubscriptionService.checkSeatAvailability(
      user.organizationId,
      parseInt(requestedSeats as string)
    );

    res.status(200).json(seatCheck);
  } catch (error) {
    console.error('Check seats error:', error);
    res.status(500).json({ error: 'Failed to check seat availability' });
  }
}