import { prisma } from './prisma';
import { InvitationStatus, OrganizationRole } from '@prisma/client';
import { SubscriptionService } from './subscription';
import crypto from 'crypto';

export interface InviteEducatorsRequest {
  emails: string[];
  organizationId: string;
  invitedBy: string;
}

export interface InviteEducatorsResponse {
  success: boolean;
  invitedCount: number;
  errors: string[];
  invitations: any[];
}

export class InvitationService {
  /**
   * Generate secure invitation token
   */
  private static generateInvitationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Send bulk invitations to educators
   */
  static async inviteEducators({
    emails,
    organizationId,
    invitedBy
  }: InviteEducatorsRequest): Promise<InviteEducatorsResponse> {
    const response: InviteEducatorsResponse = {
      success: false,
      invitedCount: 0,
      errors: [],
      invitations: []
    };

    // Validate emails
    const validEmails = emails.filter(email => {
      const trimmedEmail = email.trim().toLowerCase();
      if (!this.isValidEmail(trimmedEmail)) {
        response.errors.push(`Invalid email format: ${email}`);
        return false;
      }
      return true;
    }).map(email => email.trim().toLowerCase());

    if (validEmails.length === 0) {
      response.errors.push('No valid emails provided');
      return response;
    }

    // Check seat availability
    const seatCheck = await SubscriptionService.checkSeatAvailability(
      organizationId, 
      validEmails.length
    );

    if (!seatCheck.available) {
      response.errors.push(seatCheck.message || 'Not enough seats available');
      return response;
    }

    // Check for existing invitations and users
    const existingInvitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        email: { in: validEmails },
        status: InvitationStatus.PENDING
      }
    });

    const existingUsers = await prisma.user.findMany({
      where: {
        email: { in: validEmails },
        organizationId
      }
    });

    const existingEmails = new Set([
      ...existingInvitations.map(inv => inv.email),
      ...existingUsers.map(user => user.email)
    ]);

    const newEmails = validEmails.filter(email => !existingEmails.has(email));

    if (newEmails.length === 0) {
      response.errors.push('All provided emails are already invited or part of the organization');
      return response;
    }

    // Create invitations
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    try {
      const invitations = await Promise.all(
        newEmails.map(async (email) => {
          const token = this.generateInvitationToken();
          
          return await prisma.invitation.create({
            data: {
              email,
              organizationId,
              invitedBy,
              token,
              expiresAt,
              status: InvitationStatus.PENDING
            },
            include: {
              organization: true,
              inviter: true
            }
          });
        })
      );

      response.success = true;
      response.invitedCount = invitations.length;
      response.invitations = invitations;

      // TODO: Send invitation emails here
      // await this.sendInvitationEmails(invitations);

    } catch (error) {
      response.errors.push('Failed to create invitations');
      console.error('Invitation creation error:', error);
    }

    return response;
  }

  /**
   * Accept an invitation
   */
  static async acceptInvitation(token: string, userId: string): Promise<{
    success: boolean;
    message: string;
    organizationId?: string;
  }> {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: { organization: true }
    });

    if (!invitation) {
      return { success: false, message: 'Invalid invitation token' };
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return { success: false, message: 'Invitation has already been processed' };
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED }
      });
      return { success: false, message: 'Invitation has expired' };
    }

    // Check seat availability one more time
    const seatCheck = await SubscriptionService.checkSeatAvailability(invitation.organizationId);
    if (!seatCheck.available) {
      return { success: false, message: 'No seats available in organization' };
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Update user with organization
        await tx.user.update({
          where: { id: userId },
          data: {
            organizationId: invitation.organizationId,
            organizationRole: OrganizationRole.EDUCATOR
          }
        });

        // Mark invitation as accepted
        await tx.invitation.update({
          where: { id: invitation.id },
          data: {
            status: InvitationStatus.ACCEPTED,
            acceptedAt: new Date()
          }
        });

        // Increment active seats
        await tx.subscription.update({
          where: { organizationId: invitation.organizationId },
          data: {
            activeSeats: { increment: 1 }
          }
        });
      });

      return {
        success: true,
        message: 'Invitation accepted successfully',
        organizationId: invitation.organizationId
      };
    } catch (error) {
      console.error('Accept invitation error:', error);
      return { success: false, message: 'Failed to accept invitation' };
    }
  }

  /**
   * Get pending invitations for an organization
   */
  static async getOrganizationInvitations(organizationId: string) {
    return await prisma.invitation.findMany({
      where: { organizationId },
      include: {
        inviter: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Cancel an invitation
   */
  static async cancelInvitation(invitationId: string, cancelledBy: string): Promise<boolean> {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { id: invitationId }
      });

      if (!invitation || invitation.status !== InvitationStatus.PENDING) {
        return false;
      }

      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: InvitationStatus.CANCELLED }
      });

      return true;
    } catch (error) {
      console.error('Cancel invitation error:', error);
      return false;
    }
  }
}