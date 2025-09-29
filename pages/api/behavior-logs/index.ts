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
      return getBehaviorLogs(req, res, user.id);
    case 'POST':
      return createBehaviorLog(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getBehaviorLogs(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const behaviorLogs = await prisma.behaviorLog.findMany({
      where: { educatorId: userId },
      include: {
        child: true,
        classroom: true
      },
      orderBy: { createdAt: 'desc' }
    });

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
    intensity,
    duration,
    frequency,
    adultResponse,
    outcome,
    developmentalNotes,
    supports,
    classroomRatio,
    resourcesAvailable,
    educatorStressLevel,
    confidenceLevel,
    aiResponse,
    selectedStrategy,
    confidenceRating,
    reflectionNotes
  } = req.body;

  if (!behaviorDescription || !context || !severity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const behaviorLog = await prisma.behaviorLog.create({
      data: {
        educatorId: userId,
        childId: childId || null,
        classroomId: classroomId || null,
        behaviorDescription,
        context,
        timeOfDay,
        severity: severity as Severity,
        educatorMood: educatorMood as EducatorMood,
        stressors: stressors || [],
        intensity,
        duration,
        frequency,
        adultResponse: adultResponse || [],
        outcome: outcome || [],
        developmentalNotes,
        supports: supports || [],
        classroomRatio,
        resourcesAvailable: resourcesAvailable || [],
        educatorStressLevel,
        confidenceLevel,
        aiResponse: aiResponse || null,
        selectedStrategy,
        confidenceRating,
        reflectionNotes
      },
      include: {
        child: true,
        classroom: true
      }
    });

    res.status(201).json({ behaviorLog });
  } catch (error) {
    console.error('Create behavior log error:', error);
    res.status(500).json({ error: 'Failed to create behavior log' });
  }
}