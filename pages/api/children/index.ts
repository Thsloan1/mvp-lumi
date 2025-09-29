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
      return getChildren(req, res, user);
    case 'POST':
      return createChild(req, res, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getChildren(req: NextApiRequest, res: NextApiResponse, user: any) {
  try {
    const classrooms = await DatabaseService.getUserClassrooms(user.id);
    const children = classrooms.flatMap(classroom => classroom.children || []);
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
    hasIEP,
    hasIFSP
  } = req.body;

  if (!name || !gradeBand) {
    return res.status(400).json({ error: 'Name and grade band are required' });
  }

  // Use default classroom if none specified
  let targetClassroomId = classroomId;
  if (!targetClassroomId) {
    const classrooms = await DatabaseService.getUserClassrooms(user.id);
    if (classrooms.length > 0) {
      targetClassroomId = classrooms[0].id;
    } else {
      // Create default classroom
      const defaultClassroom = await DatabaseService.createClassroom(user.id, {
        name: `${user.fullName?.split(' ')[0]}'s Classroom`,
        gradeBand: 'Preschool (4-5 years old)',
        studentCount: 15,
        teacherStudentRatio: '1:8',
        stressors: []
      });
      targetClassroomId = defaultClassroom.id;
    }
  }

  try {
    const child = await DatabaseService.createChild({
      name,
      age,
      gradeBand,
      classroomId: targetClassroomId,
      developmentalNotes,
      hasIEP: hasIEP || false,
      hasIFSP: hasIFSP || false
    });

    res.status(201).json({ child });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(500).json({ error: 'Failed to create child' });
  }
}