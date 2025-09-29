import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { OrganizationService } from '../../../lib/organization';
import { OrganizationRole } from '@prisma/client';

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
    case 'GET':
      return getMembers(req, res, user);
    case 'DELETE':
      return removeMember(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getMembers(req: NextApiRequest, res: NextApiResponse, user: any) {
  if (!user.organizationId) {
    return res.status(400).json({ error: 'User not part of organization' });
  }

  try {
    const members = await OrganizationService.getOrganizationMembers(user.organizationId);
    res.status(200).json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
}

async function removeMember(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { memberId } = req.query;

  if (!user.organizationId) {
    return res.status(400).json({ error: 'User not part of organization' });
  }

  // Check permissions
  const hasPermission = await OrganizationService.checkPermission(
    user.id,
    user.organizationId,
    OrganizationRole.ADMIN
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const result = await OrganizationService.removeEducator(
      user.organizationId,
      memberId as string,
      user.id
    );

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}