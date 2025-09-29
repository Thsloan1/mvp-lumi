import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

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
      return getChild(req, res, user.id, id as string);
    case 'PUT':
      return updateChild(req, res, user.id, id as string);
    case 'DELETE':
      return deleteChild(req, res, user.id, id as string);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getChild(req: NextApiRequest, res: NextApiResponse, userId: string, childId: string) {
  try {
    const child = await prisma.child.findFirst({
      where: { 
        id: childId,
        classroom: {
          educatorId: userId
        }
      },
      include: {
        classroom: true,
        behaviorLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    res.status(200).json({ child });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({ error: 'Failed to get child' });
  }
}

async function updateChild(req: NextApiRequest, res: NextApiResponse, userId: string, childId: string) {
  const updateData = req.body;

  try {
    const child = await prisma.child.findFirst({
      where: { 
        id: childId,
        classroom: {
          educatorId: userId
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        classroom: true,
        behaviorLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    res.status(200).json({ child: updatedChild });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(500).json({ error: 'Failed to update child' });
  }
}

async function deleteChild(req: NextApiRequest, res: NextApiResponse, userId: string, childId: string) {
  try {
    const child = await prisma.child.findFirst({
      where: { 
        id: childId,
        classroom: {
          educatorId: userId
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    await prisma.child.delete({
      where: { id: childId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({ error: 'Failed to delete child' });
  }
}