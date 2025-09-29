import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { DatabaseService } from '../../../lib/database';
import { EmailService } from '../../../lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    preferredLanguage,
    learningStyle,
    teachingStyle,
    classroomData
  } = req.body;

  try {
    const user = await DatabaseService.getUserByEmail(session.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user onboarding data
    await DatabaseService.updateUserOnboarding(user.id, {
      preferredLanguage: preferredLanguage?.toUpperCase(),
      learningStyle,
      teachingStyle,
      onboardingStatus: 'COMPLETE'
    });

    // Create default classroom if provided
    if (classroomData) {
      await DatabaseService.createClassroom(user.id, classroomData);
    }

    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, user.fullName);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
}