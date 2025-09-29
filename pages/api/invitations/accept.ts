import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { InvitationService } from '../../../lib/invitation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  const { token } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!token) {
    return res.status(400).json({ error: 'Invitation token is required' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    const result = await InvitationService.acceptInvitation(token, user.id);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      organizationId: result.organizationId
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
}