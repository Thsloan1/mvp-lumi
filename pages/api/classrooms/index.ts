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
      return getClassrooms(req, res, user.id);
    case 'POST':
      return createClassroom(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getClassrooms(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const classrooms = await DatabaseService.getUserClassrooms(userId);
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
    const classroom = await DatabaseService.createClassroom(userId, {
      name,
      gradeBand,
      studentCount: parseInt(studentCount),
      teacherStudentRatio,
      iepCount: parseInt(iepCount) || 0,
      ifspCount: parseInt(ifspCount) || 0,
      stressors: stressors || []
    });

    res.status(201).json({ classroom });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
}