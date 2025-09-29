import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { OrganizationService } from '../../../lib/organization';
import { OrganizationRole } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

  const { newOwnerId, reason } = req.body;

  if (!user.organizationId) {
    return res.status(400).json({ error: 'User not part of organization' });
  }

  // Only current owner can transfer ownership
  const hasPermission = await OrganizationService.checkPermission(
    user.id,
    user.organizationId,
    OrganizationRole.OWNER
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Only organization owner can transfer ownership' });
  }

  if (!newOwnerId) {
    return res.status(400).json({ error: 'New owner ID is required' });
  }

  try {
    const result = await OrganizationService.transferOwnership({
      organizationId: user.organizationId,
      currentOwnerId: user.id,
      newOwnerId,
      reason
    });

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Transfer ownership error:', error);
    res.status(500).json({ error: 'Failed to transfer ownership' });
  }
}