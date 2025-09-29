import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { DatabaseService } from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await DatabaseService.getUserByEmail(session.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (req.method) {
    case 'GET':
      return getBehaviorLogs(req, res, user.id);
    case 'POST':
      return createBehaviorLog(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getBehaviorLogs(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const behaviorLogs = await DatabaseService.getUserBehaviorLogs(userId);
    res.status(200).json({ behaviorLogs });
  } catch (error) {
    console.error('Get behavior logs error:', error);
    res.status(500).json({ error: 'Failed to get behavior logs' });
  }
}

async function createBehaviorLog(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const {
    childId,
    classroomId,
    behaviorDescription,
    context,
    timeOfDay,
    severity,
    educatorMood,
    stressors,
    aiResponse,
    selectedStrategy,
    confidenceRating
  } = req.body;

  if (!behaviorDescription || !context || !severity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const behaviorLog = await DatabaseService.createBehaviorLog({
      educatorId: userId,
      childId: childId || undefined,
      classroomId: classroomId || undefined,
      behaviorDescription,
      context,
      timeOfDay,
      severity: severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
      educatorMood: educatorMood?.toUpperCase(),
      stressors: stressors || [],
      aiResponse,
      selectedStrategy,
      confidenceRating
    });

    res.status(201).json({ behaviorLog });
  } catch (error) {
    console.error('Create behavior log error:', error);
    res.status(500).json({ error: 'Failed to create behavior log' });
  }
}