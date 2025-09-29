import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '../../../lib/prisma';
import { OrganizationService } from '../../../lib/organization';
import { OrganizationRole } from '@prisma/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  });

  if (!user?.organizationId) {
    return res.status(400).json({ error: 'User not part of organization' });
  }

  // Check permissions - only admins and owners can view org analytics
  const hasPermission = await OrganizationService.checkPermission(
    user.id,
    user.organizationId,
    OrganizationRole.ADMIN
  );

  if (!hasPermission) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    // Get all organization data
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        members: {
          include: {
            classrooms: {
              include: {
                children: true,
                behaviorLogs: true,
                classroomLogs: true
              }
            }
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Aggregate all data
    const allBehaviorLogs = organization.members.flatMap(member => 
      member.classrooms.flatMap(classroom => classroom.behaviorLogs)
    );
    
    const allClassroomLogs = organization.members.flatMap(member => 
      member.classrooms.flatMap(classroom => classroom.classroomLogs)
    );
    
    const allChildren = organization.members.flatMap(member => 
      member.classrooms.flatMap(classroom => classroom.children)
    );
    
    const allClassrooms = organization.members.flatMap(member => member.classrooms);

    // Calculate high severity transitions percentage
    const transitionLogs = [...allBehaviorLogs, ...allClassroomLogs]
      .filter(log => log.context.includes('transition'));
    const highSeverityTransitions = transitionLogs.filter(log => log.severity === 'HIGH');
    const highSeverityTransitionPercentage = transitionLogs.length > 0 
      ? Math.round((highSeverityTransitions.length / transitionLogs.length) * 100)
      : 0;

    // Find most frequent child stressor
    const childStressors: Record<string, number> = {};
    allBehaviorLogs.forEach(log => {
      log.stressors.forEach(stressor => {
        childStressors[stressor] = (childStressors[stressor] || 0) + 1;
      });
    });

    const mostFrequentChildStressor = Object.entries(childStressors)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';

    // Calculate classroom stressor prevalence
    const classroomStressors: Record<string, number> = {};
    const totalClassroomLogs = allClassroomLogs.length;
    
    allClassroomLogs.forEach(log => {
      log.stressors.forEach(stressor => {
        classroomStressors[stressor] = (classroomStressors[stressor] || 0) + 1;
      });
    });

    const classroomStressorPrevalence = Object.entries(classroomStressors)
      .map(([stressor, count]) => ({
        stressor,
        percentage: totalClassroomLogs > 0 ? Math.round((count / totalClassroomLogs) * 100) : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // Calculate severity trends by grade
    const gradeSeverity: Record<string, { low: number; medium: number; high: number }> = {};
    
    allBehaviorLogs.forEach(log => {
      const child = allChildren.find(c => c.id === log.childId);
      if (child) {
        const grade = child.gradeBand;
        if (!gradeSeverity[grade]) {
          gradeSeverity[grade] = { low: 0, medium: 0, high: 0 };
        }
        gradeSeverity[grade][log.severity.toLowerCase() as keyof typeof gradeSeverity[string]]++;
      }
    });

    const severityTrends = Object.entries(gradeSeverity).flatMap(([grade, severities]) => {
      const total = severities.low + severities.medium + severities.high;
      return total > 0 ? [
        { grade, severity: 'low', percentage: Math.round((severities.low / total) * 100) },
        { grade, severity: 'medium', percentage: Math.round((severities.medium / total) * 100) },
        { grade, severity: 'high', percentage: Math.round((severities.high / total) * 100) }
      ] : [];
    });

    const organizationInsight = {
      totalEducators: organization.members.length,
      totalChildren: allChildren.length,
      totalBehaviorLogs: allBehaviorLogs.length,
      totalClassroomLogs: allClassroomLogs.length,
      crossSiteComparisons: {
        highSeverityTransitions: highSeverityTransitionPercentage,
        mostFrequentChildStressor,
        classroomStressorPrevalence,
        severityTrends
      }
    };

    res.status(200).json({ organizationInsight });
  } catch (error) {
    console.error('Get organization analytics error:', error);
    res.status(500).json({ error: 'Failed to get organization analytics' });
  }
}