import { prisma } from './prisma';
import { InvitationStatus, SubscriptionStatus } from '@prisma/client';

export class SubscriptionService {
  /**
   * Check if organization has available seats for new invitations
   */
  static async checkSeatAvailability(organizationId: string, requestedSeats: number = 1): Promise<{
    available: boolean;
    maxSeats: number;
    activeSeats: number;
    message?: string;
  }> {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { organization: true }
    });

    if (!subscription) {
      return {
        available: false,
        maxSeats: 0,
        activeSeats: 0,
        message: 'No active subscription found'
      };
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.TRIALING) {
      return {
        available: false,
        maxSeats: subscription.maxSeats,
        activeSeats: subscription.activeSeats,
        message: 'Subscription is not active'
      };
    }

    const availableSeats = subscription.maxSeats - subscription.activeSeats;
    const hasAvailability = availableSeats >= requestedSeats;

    return {
      available: hasAvailability,
      maxSeats: subscription.maxSeats,
      activeSeats: subscription.activeSeats,
      message: hasAvailability 
        ? undefined 
        : `Your subscription allows only ${subscription.maxSeats} educators. Upgrade to add more.`
    };
  }

  /**
   * Increment active seats when invitation is accepted
   */
  static async incrementActiveSeats(organizationId: string): Promise<void> {
    await prisma.subscription.update({
      where: { organizationId },
      data: {
        activeSeats: {
          increment: 1
        }
      }
    });
  }

  /**
   * Decrement active seats when educator is removed
   */
  static async decrementActiveSeats(organizationId: string): Promise<void> {
    await prisma.subscription.update({
      where: { organizationId },
      data: {
        activeSeats: {
          decrement: 1
        }
      }
    });
  }

  /**
   * Get subscription details for an organization
   */
  static async getSubscriptionDetails(organizationId: string) {
    return await prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        organization: {
          include: {
            owner: true,
            members: true
          }
        }
      }
    });
  }
}