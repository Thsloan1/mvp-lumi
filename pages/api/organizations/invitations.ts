import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { InvitationService } from '../../../lib/invitation';
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
    case 'POST':
      return sendInvitations(req, res, user);
    case 'GET':
      return getInvitations(req, res, user);
    case 'DELETE':
      return cancelInvitation(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function sendInvitations(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { emails } = req.body;

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

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Emails array is required' });
  }

  try {
    const result = await InvitationService.inviteEducators({
      emails,
      organizationId: user.organizationId,
      invitedBy: user.id
    });

    if (!result.success && result.errors.length > 0) {
      return res.status(400).json({ 
        error: 'Invitation failed', 
        details: result.errors 
      });
    }

    res.status(200).json({
      success: true,
      invitedCount: result.invitedCount,
      invitations: result.invitations,
      errors: result.errors
    });
  } catch (error) {
    console.error('Send invitations error:', error);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
}

async function getInvitations(req: NextApiRequest, res: NextApiResponse, user: any) {
  if (!user.organizationId) {
    return res.status(400).json({ error: 'User not part of organization' });
  }

  try {
    const invitations = await InvitationService.getOrganizationInvitations(user.organizationId);
    res.status(200).json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
}

async function cancelInvitation(req: NextApiRequest, res: NextApiResponse, user: any) {
  const { invitationId } = req.query;

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
    const success = await InvitationService.cancelInvitation(
      invitationId as string,
      user.id
    );

    if (!success) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ error: 'Failed to cancel invitation' });
  }
}