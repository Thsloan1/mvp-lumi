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
      return getClassroomLogs(req, res, user.id);
    case 'POST':
      return createClassroomLog(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClassroomLogs(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const classroomLogs = await DatabaseService.getUserClassroomLogs(userId);
    res.status(200).json({ classroomLogs });
  } catch (error) {
    console.error('Get classroom logs error:', error);
    res.status(500).json({ error: 'Failed to get classroom logs' });
  }
}

async function createClassroomLog(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const {
    classroomId,
    challengeDescription,
    context,
    severity,
    educatorMood,
    stressors,
    aiResponse,
    selectedStrategy,
    confidenceSelfRating,
    confidenceStrategyRating
  } = req.body;

  if (!challengeDescription || !context || !severity || !classroomId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const classroomLog = await DatabaseService.createClassroomLog({
      educatorId: userId,
      classroomId,
      challengeDescription,
      context,
      severity: severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
      educatorMood: educatorMood?.toUpperCase(),
      stressors: stressors || [],
      aiResponse,
      selectedStrategy,
      confidenceSelfRating,
      confidenceStrategyRating
    });

    res.status(201).json({ classroomLog });
  } catch (error) {
    console.error('Create classroom log error:', error);
    res.status(500).json({ error: 'Failed to create classroom log' });
  }
}