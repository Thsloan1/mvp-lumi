import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token: token as string },
      include: {
        organization: true,
        inviter: {
          select: { fullName: true }
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid invitation token' 
      });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ 
        valid: false, 
        error: 'Invitation has already been processed' 
      });
    }

    if (invitation.expiresAt < new Date()) {
      // Mark as expired
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      });

      return res.status(400).json({ 
        valid: false, 
        error: 'Invitation has expired' 
      });
    }

    res.status(200).json({
      valid: true,
      invitation: {
        email: invitation.email,
        organizationName: invitation.organization.name,
        inviterName: invitation.inviter.fullName,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error('Validate invitation error:', error);
    res.status(500).json({ error: 'Failed to validate invitation' });
  }
}