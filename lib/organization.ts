import { prisma } from './prisma';
import { OrganizationRole } from '@prisma/client';

export interface TransferOwnershipRequest {
  organizationId: string;
  currentOwnerId: string;
  newOwnerId: string;
  reason?: string;
}

export class OrganizationService {
  /**
   * Check if user has permission to perform organization actions
   */
  static async checkPermission(
    userId: string, 
    organizationId: string, 
    requiredRole: OrganizationRole
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true }
    });

    if (!user || user.organizationId !== organizationId) {
      return false;
    }

    // Owner has all permissions
    if (user.organizationRole === OrganizationRole.OWNER) {
      return true;
    }

    // Admin can do admin and educator actions
    if (user.organizationRole === OrganizationRole.ADMIN && 
        (requiredRole === OrganizationRole.ADMIN || requiredRole === OrganizationRole.EDUCATOR)) {
      return true;
    }

    // Educator can only do educator actions
    if (user.organizationRole === OrganizationRole.EDUCATOR && 
        requiredRole === OrganizationRole.EDUCATOR) {
      return true;
    }

    return false;
  }

  /**
   * Transfer organization ownership
   */
  static async transferOwnership({
    organizationId,
    currentOwnerId,
    newOwnerId,
    reason
  }: TransferOwnershipRequest): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Verify current owner
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: { owner: true }
      });

      if (!organization || organization.ownerId !== currentOwnerId) {
        return { success: false, message: 'Invalid current owner' };
      }

      // Verify new owner is part of organization
      const newOwner = await prisma.user.findUnique({
        where: { id: newOwnerId }
      });

      if (!newOwner || newOwner.organizationId !== organizationId) {
        return { success: false, message: 'New owner must be a member of the organization' };
      }

      await prisma.$transaction(async (tx) => {
        // Update organization owner
        await tx.organization.update({
          where: { id: organizationId },
          data: { ownerId: newOwnerId }
        });

        // Update new owner role
        await tx.user.update({
          where: { id: newOwnerId },
          data: { organizationRole: OrganizationRole.OWNER }
        });

        // Update previous owner role to admin
        await tx.user.update({
          where: { id: currentOwnerId },
          data: { organizationRole: OrganizationRole.ADMIN }
        });

        // Record ownership history
        await tx.ownershipHistory.create({
          data: {
            organizationId,
            previousOwnerId: currentOwnerId,
            newOwnerId,
            transferredBy: currentOwnerId,
            reason: reason || 'Ownership transfer'
          }
        });
      });

      return { success: true, message: 'Ownership transferred successfully' };
    } catch (error) {
      console.error('Transfer ownership error:', error);
      return { success: false, message: 'Failed to transfer ownership' };
    }
  }

  /**
   * Remove educator from organization
   */
  static async removeEducator(
    organizationId: string,
    educatorId: string,
    removedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const educator = await prisma.user.findUnique({
        where: { id: educatorId }
      });

      if (!educator || educator.organizationId !== organizationId) {
        return { success: false, message: 'Educator not found in organization' };
      }

      if (educator.organizationRole === OrganizationRole.OWNER) {
        return { success: false, message: 'Cannot remove organization owner' };
      }

      await prisma.$transaction(async (tx) => {
        // Remove educator from organization
        await tx.user.update({
          where: { id: educatorId },
          data: {
            organizationId: null,
            organizationRole: null
          }
        });

        // Decrement active seats
        await tx.subscription.update({
          where: { organizationId },
          data: {
            activeSeats: { decrement: 1 }
          }
        });
      });

      return { success: true, message: 'Educator removed successfully' };
    } catch (error) {
      console.error('Remove educator error:', error);
      return { success: false, message: 'Failed to remove educator' };
    }
  }

  /**
   * Get organization members with their roles
   */
  static async getOrganizationMembers(organizationId: string) {
    return await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        fullName: true,
        email: true,
        organizationRole: true,
        onboardingStatus: true,
        createdAt: true
      },
      orderBy: [
        { organizationRole: 'asc' }, // Owner first, then admin, then educator
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Get organization details with subscription info
   */
  static async getOrganizationDetails(organizationId: string) {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: {
          select: { id: true, fullName: true, email: true }
        },
        subscription: true,
        members: {
          select: {
            id: true,
            fullName: true,
            email: true,
            organizationRole: true,
            onboardingStatus: true
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
    });
  }
}