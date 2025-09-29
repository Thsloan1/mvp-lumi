import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

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
      return getClassrooms(req, res, user.id);
    case 'POST':
      return createClassroom(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClassrooms(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const classrooms = await prisma.classroom.findMany({
      where: { educatorId: userId },
      include: {
        children: {
          select: { id: true, name: true, hasIEP: true, hasIFSP: true }
        },
        behaviorLogs: {
          select: { id: true, severity: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        classroomLogs: {
          select: { id: true, severity: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ classrooms });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({ error: 'Failed to get classrooms' });
  }
}

async function createClassroom(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const {
    name,
    gradeBand,
    studentCount,
    teacherStudentRatio,
    iepCount,
    ifspCount,
    stressors
  } = req.body;

  if (!name || !gradeBand || !studentCount || !teacherStudentRatio) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const classroom = await prisma.classroom.create({
      data: {
        name,
        gradeBand,
        studentCount: parseInt(studentCount),
        teacherStudentRatio,
        iepCount: parseInt(iepCount) || 0,
        ifspCount: parseInt(ifspCount) || 0,
        stressors: stressors || [],
        educatorId: userId
      },
      include: {
        children: true
      }
    });

    res.status(201).json({ classroom });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
}