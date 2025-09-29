import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  const { id: classroomId } = req.query;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  try {
    // Verify user owns this classroom
    const classroom = await prisma.classroom.findFirst({
      where: { 
        id: classroomId as string,
        educatorId: user.id
      },
      include: {
        children: true,
        behaviorLogs: {
          include: { child: true }
        },
        classroomLogs: true
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Calculate classroom insights
    const behaviorLogs = classroom.behaviorLogs;
    const classroomLogs = classroom.classroomLogs;
    
    // Calculate group climate score (1-10)
    const totalSeverityPoints = behaviorLogs.reduce((sum, log) => {
      return sum + (log.severity === 'HIGH' ? 3 : log.severity === 'MEDIUM' ? 2 : 1);
    }, 0) + classroomLogs.reduce((sum, log) => {
      return sum + (log.severity === 'HIGH' ? 3 : log.severity === 'MEDIUM' ? 2 : 1);
    }, 0);
    
    const totalLogs = behaviorLogs.length + classroomLogs.length;
    const avgSeverity = totalLogs > 0 ? totalSeverityPoints / totalLogs : 0;
    const groupClimateScore = Math.max(1, Math.min(10, 10 - (avgSeverity * 2)));

    // Aggregate child behaviors
    const behaviorCounts: Record<string, number> = {};
    const stressorCounts: Record<string, number> = {};
    const severityMix = { low: 0, medium: 0, high: 0 };

    behaviorLogs.forEach(log => {
      const behaviorType = categorizeBehavior(log.behaviorDescription);
      behaviorCounts[behaviorType] = (behaviorCounts[behaviorType] || 0) + 1;
      severityMix[log.severity.toLowerCase() as keyof typeof severityMix]++;
      
      log.stressors.forEach(stressor => {
        stressorCounts[stressor] = (stressorCounts[stressor] || 0) + 1;
      });
    });

    // Calculate transition challenges
    const transitionLogs = [...behaviorLogs, ...classroomLogs]
      .filter(log => log.context.includes('transition'));
    const transitionChallenges = totalLogs > 0 ? (transitionLogs.length / totalLogs) * 100 : 0;

    const classroomInsight = {
      classroomId: classroom.id,
      classroomName: classroom.name,
      totalLogs: totalLogs,
      groupClimate: {
        score: Math.round(groupClimateScore * 10) / 10,
        topStressors: Object.entries(stressorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([stressor]) => stressor),
        routineEffectiveness: Math.round((10 - avgSeverity) * 10) / 10,
        transitionChallenges: Math.round(transitionChallenges)
      },
      aggregatedChildBehaviors: {
        mostFrequentBehaviors: Object.entries(behaviorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([behavior]) => behavior),
        commonStressors: Object.entries(stressorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([stressor]) => stressor),
        severityMix
      },
      classroomChallenges: {
        transitionDifficulty: Math.round(transitionChallenges),
        groupManagementScore: Math.round(groupClimateScore * 10) / 10,
        environmentalStressors: classroom.stressors.slice(0, 3)
      }
    };

    res.status(200).json({ classroomInsight });
  } catch (error) {
    console.error('Get classroom analytics error:', error);
    res.status(500).json({ error: 'Failed to get classroom analytics' });
  }
}

function categorizeBehavior(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('hit') || lowerDesc.includes('push') || lowerDesc.includes('kick')) {
    return 'Physical Aggression';
  }
  if (lowerDesc.includes('bite') || lowerDesc.includes('biting')) {
    return 'Biting';
  }
  if (lowerDesc.includes('cry') || lowerDesc.includes('crying') || lowerDesc.includes('tears')) {
    return 'Crying/Emotional Expression';
  }
  if (lowerDesc.includes('tantrum') || lowerDesc.includes('meltdown')) {
    return 'Tantrums/Meltdowns';
  }
  if (lowerDesc.includes('run') || lowerDesc.includes('running') || lowerDesc.includes('flee')) {
    return 'Running Away';
  }
  if (lowerDesc.includes('hide') || lowerDesc.includes('hiding') || lowerDesc.includes('withdraw')) {
    return 'Withdrawal/Hiding';
  }
  if (lowerDesc.includes('share') || lowerDesc.includes('sharing') || lowerDesc.includes('turn')) {
    return 'Sharing Difficulties';
  }
  if (lowerDesc.includes('transition') || lowerDesc.includes('change')) {
    return 'Transition Challenges';
  }
  
  return 'Other Behaviors';
}