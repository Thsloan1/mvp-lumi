import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { classrooms: true }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  switch (req.method) {
    case 'GET':
      return getChildren(req, res, user);
    case 'POST':
      return createChild(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getChildren(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    // Get children from all user's classrooms
    const classroomIds = user.classrooms.map((c: any) => c.id);
    
    const children = await prisma.child.findMany({
      where: { 
        classroomId: { in: classroomIds }
      },
      include: {
        classroom: true,
        behaviorLogs: {
          select: { id: true, createdAt: true, severity: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({ children });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ error: 'Failed to get children' });
  }
}

async function createChild(req: NextApiRequest, res: NextApiResponse, user: any) {
  const {
    name,
    age,
    gradeBand,
    classroomId,
    developmentalNotes,
    languageAbility,
    selfRegulationSkills,
    sensorySensitivities,
    hasIEP,
    hasIFSP,
    supportPlans,
    knownTriggers,
    homeLanguage,
    familyContext
  } = req.body;

  if (!name || !gradeBand) {
    return res.status(400).json({ error: 'Name and grade band are required' });
  }

  // Use default classroom if none specified
  let targetClassroomId = classroomId;
  if (!targetClassroomId && user.classrooms.length > 0) {
    targetClassroomId = user.classrooms[0].id;
  }

  if (!targetClassroomId) {
    return res.status(400).json({ error: 'No classroom available for child' });
  }

  // Verify user owns the classroom
  const classroom = await prisma.classroom.findFirst({
    where: { 
      id: targetClassroomId,
      educatorId: user.id 
    }
  });

  if (!classroom) {
    return res.status(403).json({ error: 'Access denied to classroom' });
  }

  try {
    const child = await prisma.child.create({
      data: {
        name,
        age,
        gradeBand,
        classroomId: targetClassroomId,
        developmentalNotes,
        languageAbility,
        selfRegulationSkills,
        sensorySensitivities: sensorySensitivities || [],
        hasIEP: hasIEP || false,
        hasIFSP: hasIFSP || false,
        supportPlans: supportPlans || [],
        knownTriggers: knownTriggers || [],
        homeLanguage,
        familyContext
      },
      include: {
        classroom: true
      }
    });

    res.status(201).json({ child });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ error: 'Failed to create child' });
  }
}