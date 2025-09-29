import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  const { id: childId } = req.query;

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
    // Verify user has access to this child
    const child = await prisma.child.findFirst({
      where: { 
        id: childId as string,
        classroom: {
          educatorId: user.id
        }
      },
      include: {
        behaviorLogs: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Calculate child insights
    const behaviorLogs = child.behaviorLogs;
    
    if (behaviorLogs.length === 0) {
      return res.status(200).json({
        childInsight: {
          childId: child.id,
          childName: child.name,
          totalLogs: 0,
          patterns: {
            mostFrequentContext: '',
            mostFrequentTrigger: '',
            severityDistribution: { low: 0, medium: 0, high: 0 },
            effectiveStrategies: [],
            confidenceTrend: 0
          },
          triggers: [],
          timePatterns: []
        }
      });
    }

    // Calculate patterns
    const contextCounts: Record<string, number> = {};
    const severityDistribution = { low: 0, medium: 0, high: 0 };
    const timePatterns: Record<string, number> = {};
    const strategies: Record<string, number> = {};
    
    behaviorLogs.forEach(log => {
      contextCounts[log.context] = (contextCounts[log.context] || 0) + 1;
      severityDistribution[log.severity]++;
      if (log.timeOfDay) {
        timePatterns[log.timeOfDay] = (timePatterns[log.timeOfDay] || 0) + 1;
      }
      if (log.selectedStrategy && log.confidenceRating && log.confidenceRating >= 7) {
        strategies[log.selectedStrategy] = (strategies[log.selectedStrategy] || 0) + 1;
      }
    });

    const mostFrequentContext = Object.entries(contextCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    const effectiveStrategies = Object.entries(strategies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([strategy]) => strategy);

    const avgConfidence = behaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / behaviorLogs.length;

    const childInsight = {
      childId: child.id,
      childName: child.name,
      totalLogs: behaviorLogs.length,
      patterns: {
        mostFrequentContext,
        mostFrequentTrigger: mostFrequentContext,
        severityDistribution,
        effectiveStrategies,
        confidenceTrend: Math.round(avgConfidence * 10) / 10
      },
      triggers: Object.entries(contextCounts).map(([name, frequency]) => ({
        name,
        frequency,
        contexts: [name]
      })).sort((a, b) => b.frequency - a.frequency),
      timePatterns: Object.entries(timePatterns).map(([timeOfDay, frequency]) => ({
        timeOfDay,
        frequency
      })).sort((a, b) => b.frequency - a.frequency)
    };

    res.status(200).json({ childInsight });
  } catch (error) {
    console.error('Get child analytics error:', error);
    res.status(500).json({ error: 'Failed to get child analytics' });
  }
}