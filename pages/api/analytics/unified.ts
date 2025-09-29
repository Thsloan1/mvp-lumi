import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      classrooms: {
        include: {
          children: true,
          behaviorLogs: true,
          classroomLogs: true
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    // Aggregate user's data
    const allBehaviorLogs = user.classrooms.flatMap(classroom => classroom.behaviorLogs);
    const allClassroomLogs = user.classrooms.flatMap(classroom => classroom.classroomLogs);
    const allChildren = user.classrooms.flatMap(classroom => classroom.children);

    const insights = [];

    // Analyze peer conflict as nested pattern
    const peerConflictBehaviors = allBehaviorLogs.filter(log => 
      log.behaviorDescription.toLowerCase().includes('peer') ||
      log.behaviorDescription.toLowerCase().includes('friend') ||
      log.behaviorDescription.toLowerCase().includes('sharing') ||
      log.context.includes('conflict')
    );

    const peerConflictClassroom = allClassroomLogs.filter(log =>
      log.challengeDescription.toLowerCase().includes('peer') ||
      log.challengeDescription.toLowerCase().includes('conflict') ||
      log.stressors.some(s => s.toLowerCase().includes('peer'))
    );

    if (peerConflictBehaviors.length > 0 || peerConflictClassroom.length > 0) {
      insights.push({
        type: 'nested_pattern',
        pattern: 'Peer Conflict',
        childLevel: {
          affectedChildren: new Set(peerConflictBehaviors.map(log => log.childId)).size,
          frequency: peerConflictBehaviors.length,
          contexts: [...new Set(peerConflictBehaviors.map(log => log.context))]
        },
        classroomLevel: {
          affectedClassrooms: new Set(peerConflictClassroom.map(log => log.classroomId)).size,
          severity: calculateAverageSeverity([...peerConflictBehaviors, ...peerConflictClassroom]),
          stressorRank: 1
        },
        recommendations: [
          'Implement peer mediation strategies',
          'Create sharing protocols for high-demand materials',
          'Develop social-emotional learning activities'
        ]
      });
    }

    // Analyze transition challenges
    const transitionBehaviors = allBehaviorLogs.filter(log => 
      log.context.includes('transition')
    );

    const transitionClassroom = allClassroomLogs.filter(log =>
      log.context.includes('transition') ||
      log.challengeDescription.toLowerCase().includes('transition')
    );

    if (transitionBehaviors.length > 0 || transitionClassroom.length > 0) {
      insights.push({
        type: 'nested_pattern',
        pattern: 'Transition Difficulties',
        childLevel: {
          affectedChildren: new Set(transitionBehaviors.map(log => log.childId)).size,
          frequency: transitionBehaviors.length,
          contexts: [...new Set(transitionBehaviors.map(log => log.context))]
        },
        classroomLevel: {
          affectedClassrooms: new Set(transitionClassroom.map(log => log.classroomId)).size,
          severity: calculateAverageSeverity([...transitionBehaviors, ...transitionClassroom]),
          stressorRank: 2
        },
        recommendations: [
          'Implement visual transition cues',
          'Create predictable transition routines',
          'Use countdown timers for preparation'
        ]
      });
    }

    res.status(200).json({ unifiedInsights: insights });
  } catch (error) {
    console.error('Get unified analytics error:', error);
    res.status(500).json({ error: 'Failed to get unified analytics' });
  }
}

function calculateAverageSeverity(logs: any[]): 'low' | 'medium' | 'high' {
  if (logs.length === 0) return 'low';
  
  const severityPoints = logs.reduce((sum, log) => {
    const severity = typeof log.severity === 'string' ? log.severity.toLowerCase() : log.severity;
    return sum + (severity === 'high' ? 3 : severity === 'medium' ? 2 : 1);
  }, 0);
  
  const avgSeverity = severityPoints / logs.length;
  
  if (avgSeverity >= 2.5) return 'high';
  if (avgSeverity >= 1.5) return 'medium';
  return 'low';
}