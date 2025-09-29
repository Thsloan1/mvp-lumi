import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { Severity, EducatorMood } from '@prisma/client';

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
      return getClassroomLogs(req, res, user.id);
    case 'POST':
      return createClassroomLog(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClassroomLogs(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const classroomLogs = await prisma.classroomLog.findMany({
      where: { educatorId: userId },
      include: {
        classroom: true
      },
      orderBy: { createdAt: 'desc' }
    });

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
    confidenceStrategyRating,
    reflectionNotes
  } = req.body;

  if (!challengeDescription || !context || !severity || !classroomId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const classroomLog = await prisma.classroomLog.create({
      data: {
        educatorId: userId,
        classroomId,
        challengeDescription,
        context,
        severity: severity as Severity,
        educatorMood: educatorMood as EducatorMood,
        stressors: stressors || [],
        aiResponse: aiResponse || null,
        selectedStrategy,
        confidenceSelfRating,
        confidenceStrategyRating,
        reflectionNotes
      },
      include: {
        classroom: true
      }
    });

    res.status(201).json({ classroomLog });
  } catch (error) {
    console.error('Create classroom log error:', error);
    res.status(500).json({ error: 'Failed to create classroom log' });
  }
}