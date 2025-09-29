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
      return getClassroom(req, res, user.id, id as string);
    case 'PUT':
      return updateClassroom(req, res, user.id, id as string);
    case 'DELETE':
      return deleteClassroom(req, res, user.id, id as string);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClassroom(req: NextApiRequest, res: NextApiResponse, userId: string, classroomId: string) {
  try {
    const classroom = await prisma.classroom.findFirst({
      where: { 
        id: classroomId,
        educatorId: userId 
      },
      include: {
        children: true,
        behaviorLogs: {
          include: { child: true },
          orderBy: { createdAt: 'desc' }
        },
        classroomLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    res.status(200).json({ classroom });
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({ error: 'Failed to get classroom' });
  }
}

async function updateClassroom(req: NextApiRequest, res: NextApiResponse, userId: string, classroomId: string) {
  const updateData = req.body;

  try {
    const classroom = await prisma.classroom.findFirst({
      where: { 
        id: classroomId,
        educatorId: userId 
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    const updatedClassroom = await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        ...updateData,
        studentCount: updateData.studentCount ? parseInt(updateData.studentCount) : undefined,
        iepCount: updateData.iepCount ? parseInt(updateData.iepCount) : undefined,
        ifspCount: updateData.ifspCount ? parseInt(updateData.ifspCount) : undefined,
        updatedAt: new Date()
      },
      include: {
        children: true
      }
    });

    res.status(200).json({ classroom: updatedClassroom });
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(500).json({ error: 'Failed to update classroom' });
  }
}

async function deleteClassroom(req: NextApiRequest, res: NextApiResponse, userId: string, classroomId: string) {
  try {
    const classroom = await prisma.classroom.findFirst({
      where: { 
        id: classroomId,
        educatorId: userId 
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    await prisma.classroom.delete({
      where: { id: classroomId }
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({ error: 'Failed to delete classroom' });
  }
}