import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { Severity, EducatorMood } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  const { id } = req.query;

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
      return getBehaviorLog(req, res, user.id, id as string);
    case 'PUT':
      return updateBehaviorLog(req, res, user.id, id as string);
    case 'DELETE':
      return deleteBehaviorLog(req, res, user.id, id as string);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getBehaviorLog(req: NextApiRequest, res: NextApiResponse, userId: string, logId: string) {
  try {
    const behaviorLog = await prisma.behaviorLog.findFirst({
      where: { 
        id: logId,
        educatorId: userId 
      },
      include: {
        child: true,
        classroom: true
      }
    });

    if (!behaviorLog) {
      return res.status(404).json({ error: 'Behavior log not found' });
    }

    res.status(200).json({ behaviorLog });
  } catch (error) {
    console.error('Get behavior log error:', error);
    res.status(500).json({ error: 'Failed to get behavior log' });
  }
}

async function updateBehaviorLog(req: NextApiRequest, res: NextApiResponse, userId: string, logId: string) {
  const updateData = req.body;

  try {
    const behaviorLog = await prisma.behaviorLog.findFirst({
      where: { 
        id: logId,
        educatorId: userId 
      }
    });

    if (!behaviorLog) {
      return res.status(404).json({ error: 'Behavior log not found' });
    }

    const updatedLog = await prisma.behaviorLog.update({
      where: { id: logId },
      data: {
        ...updateData,
        severity: updateData.severity as Severity,
        educatorMood: updateData.educatorMood as EducatorMood,
        updatedAt: new Date()
      },
      include: {
        child: true,
        classroom: true
      }
    });

    res.status(200).json({ behaviorLog: updatedLog });
  } catch (error) {
    console.error('Update behavior log error:', error);
    res.status(500).json({ error: 'Failed to update behavior log' });
  }
}

async function deleteBehaviorLog(req: NextApiRequest, res: NextApiResponse, userId: string, logId: string) {
  try {
    const behaviorLog = await prisma.behaviorLog.findFirst({
      where: { 
        id: logId,
        educatorId: userId 
      }
    });

    if (!behaviorLog) {
      return res.status(404).json({ error: 'Behavior log not found' });
    }

    await prisma.behaviorLog.delete({
      where: { id: logId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete behavior log error:', error);
    res.status(500).json({ error: 'Failed to delete behavior log' });
  }
}