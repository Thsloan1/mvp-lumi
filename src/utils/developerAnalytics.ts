import { User, BehaviorLog, ClassroomLog, Child, Classroom } from '../types';

export interface AppLevelAnalytics {
  totalUsers: number;
  totalIndividualUsers: number;
  totalOrganizationClients: number;
  totalOrgUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalBehaviorLogs: number;
  totalClassroomLogs: number;
  totalChildren: number;
  avgBehaviorLogsPerUser: number;
  avgClassroomLogsPerUser: number;
  avgConfidence: number;
  userRetentionRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
}

export interface UserAnalytics {
  user: User;
  totalLogs: number;
  avgConfidence: number;
  childrenCount: number;
  contextUsage: Record<string, number>;
  severityDistribution: { low: number; medium: number; high: number };
  activityByDay: Record<string, number>;
  lastActive: string;
  engagementScore: number;
  frameworkPreference: Record<string, number>;
  strategyEffectiveness: Record<string, number>;
  timeOfDayPatterns: Record<string, number>;
  stressorFrequency: Record<string, number>;
}

export interface OrganizationAnalytics {
  organization: any;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalLogs: number;
  avgConfidence: number;
  educatorPerformance: {
    name: string;
    totalLogs: number;
    avgConfidence: number;
    onboardingStatus: string;
    engagementScore: number;
    lastActive: string;
  }[];
  topStressors: { stressor: string; count: number; percentage: number }[];
  seatUtilization: number;
  collaborationMetrics: {
    crossEducatorPatterns: number;
    sharedStrategies: number;
    knowledgeSharing: number;
  };
  riskFactors: {
    highSeverityPercentage: number;
    lowConfidenceUsers: number;
    inactiveEducators: number;
  };
}

export interface PlatformInsights {
  outliers: {
    type: 'high_usage_users' | 'low_engagement_users' | 'high_severity_organization' | 'framework_bias' | 'confidence_outliers';
    description: string;
    users?: string[];
    organizations?: string[];
    impact: string;
    recommendation: string;
  }[];
  trends: {
    userGrowth: string;
    engagementGrowth: string;
    confidenceImprovement: string;
    frameworkAdoption: Record<string, string>;
    geographicDistribution: Record<string, number>;
  };
  patterns: {
    peakUsageHours: string[];
    seasonalTrends: Record<string, number>;
    contextCorrelations: Record<string, string[]>;
    severityEscalation: {
      contexts: string[];
      timePatterns: string[];
      interventionSuccess: number;
    };
  };
  benchmarks: {
    industryComparison: {
      userEngagement: 'above' | 'at' | 'below';
      retentionRate: 'above' | 'at' | 'below';
      satisfactionScore: 'above' | 'at' | 'below';
    };
    internalBenchmarks: {
      topPerformingOrgs: string[];
      bestPracticePatterns: string[];
      successFactors: string[];
    };
  };
}

export class DeveloperAnalyticsEngine {
  static generateAppLevelAnalytics(
    users: User[],
    organizations: any[],
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[],
    children: Child[],
    classrooms: Classroom[]
  ): AppLevelAnalytics {
    const totalUsers = users.length;
    const totalIndividualUsers = users.filter(u => u.role === 'educator' && !u.organizationId).length;
    const totalOrganizationClients = organizations.length;
    const totalOrgUsers = users.filter(u => u.role === 'educator').length; // Fixed organizationId reference

    // Activity-based user classification
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    const getUserLastActivity = (userId: string) => {
      const userLogs = [...behaviorLogs, ...classroomLogs].filter(log => log.educatorId === userId);
      return userLogs.length > 0 ? Math.max(...userLogs.map(log => new Date(log.createdAt).getTime())) : 0;
    };

    const dailyActiveUsers = users.filter(u => getUserLastActivity(u.id) > now - dayMs).length;
    const weeklyActiveUsers = users.filter(u => getUserLastActivity(u.id) > now - weekMs).length;
    const monthlyActiveUsers = users.filter(u => getUserLastActivity(u.id) > now - monthMs).length;
    const activeUsers = monthlyActiveUsers;
    const inactiveUsers = totalUsers - activeUsers;

    const avgBehaviorLogsPerUser = totalUsers > 0 ? behaviorLogs.length / totalUsers : 0;
    const avgClassroomLogsPerUser = totalUsers > 0 ? classroomLogs.length / totalUsers : 0;
    const avgConfidence = behaviorLogs.length > 0 ? 
      behaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / behaviorLogs.length : 0;

    const userRetentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    return {
      totalUsers,
      totalIndividualUsers,
      totalOrganizationClients,
      totalOrgUsers,
      activeUsers,
      inactiveUsers,
      totalBehaviorLogs: behaviorLogs.length,
      totalClassroomLogs: classroomLogs.length,
      totalChildren: children.length,
      avgBehaviorLogsPerUser: Math.round(avgBehaviorLogsPerUser * 10) / 10,
      avgClassroomLogsPerUser: Math.round(avgClassroomLogsPerUser * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      userRetentionRate: Math.round(userRetentionRate * 10) / 10,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers
    };
  }

  static generateUserAnalytics(
    userId: string,
    users: User[],
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[],
    children: Child[],
    classrooms: Classroom[]
  ): UserAnalytics | null {
    const user = users.find(u => u.id === userId);
    if (!user) return null;

    const userBehaviorLogs = behaviorLogs.filter(log => log.educatorId === userId);
    const userClassroomLogs = classroomLogs.filter(log => log.educatorId === userId);
    const userChildren = children.filter(child => {
      const classroom = classrooms.find(c => c.id === child.classroomId);
      return classroom && classroom.educatorId === userId;
    });

    const totalLogs = userBehaviorLogs.length + userClassroomLogs.length;
    const avgConfidence = userBehaviorLogs.length > 0 ? 
      userBehaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / userBehaviorLogs.length : 0;

    // Context usage analysis
    const contextUsage: Record<string, number> = {};
    [...userBehaviorLogs, ...userClassroomLogs].forEach(log => {
      contextUsage[log.context] = (contextUsage[log.context] || 0) + 1;
    });

    // Severity distribution
    const severityDistribution = { low: 0, medium: 0, high: 0 };
    [...userBehaviorLogs, ...userClassroomLogs].forEach(log => {
      severityDistribution[log.severity]++;
    });

    // Activity timeline
    const activityByDay: Record<string, number> = {};
    [...userBehaviorLogs, ...userClassroomLogs].forEach(log => {
      const day = new Date(log.createdAt).toISOString().split('T')[0];
      activityByDay[day] = (activityByDay[day] || 0) + 1;
    });

    // Time of day patterns
    const timeOfDayPatterns: Record<string, number> = {};
    userBehaviorLogs.forEach(log => {
      if (log.timeOfDay) {
        timeOfDayPatterns[log.timeOfDay] = (timeOfDayPatterns[log.timeOfDay] || 0) + 1;
      }
    });

    // Stressor frequency
    const stressorFrequency: Record<string, number> = {};
    [...userBehaviorLogs, ...userClassroomLogs].forEach(log => {
      log.stressors.forEach(stressor => {
        stressorFrequency[stressor] = (stressorFrequency[stressor] || 0) + 1;
      });
    });

    // Framework preference (simulated based on AI responses)
    const frameworkPreference: Record<string, number> = {};
    userBehaviorLogs.forEach(log => {
      if (log.aiResponse) {
        if (log.aiResponse.attachmentSupport) frameworkPreference['attachment_theory'] = (frameworkPreference['attachment_theory'] || 0) + 1;
        if (log.aiResponse.conceptualization?.includes('regulation')) frameworkPreference['iecmh'] = (frameworkPreference['iecmh'] || 0) + 1;
        if (log.aiResponse.implementationGuidance?.includes('first')) frameworkPreference['developmental_neuroscience'] = (frameworkPreference['developmental_neuroscience'] || 0) + 1;
      }
    });

    // Strategy effectiveness
    const strategyEffectiveness: Record<string, number> = {};
    userBehaviorLogs.forEach(log => {
      if (log.selectedStrategy && log.confidenceRating && log.confidenceRating >= 7) {
        const strategyKey = log.selectedStrategy.substring(0, 30);
        strategyEffectiveness[strategyKey] = (strategyEffectiveness[strategyKey] || 0) + 1;
      }
    });

    // Engagement score calculation
    const engagementFactors = {
      logFrequency: Math.min(totalLogs / 30, 1), // Max 1 log per day
      confidenceLevel: avgConfidence / 10,
      childrenTracked: Math.min(userChildren.length / 10, 1), // Max 10 children
      strategyUsage: userBehaviorLogs.filter(log => log.selectedStrategy).length / Math.max(userBehaviorLogs.length, 1),
      reflectionCompletion: userBehaviorLogs.filter(log => log.reflectionNotes).length / Math.max(userBehaviorLogs.length, 1)
    };

    const engagementScore = Object.values(engagementFactors).reduce((sum, factor) => sum + factor, 0) / Object.keys(engagementFactors).length;

    const lastActive = totalLogs > 0 ? 
      new Date(Math.max(...[...userBehaviorLogs, ...userClassroomLogs].map(log => new Date(log.createdAt).getTime()))).toLocaleDateString() : 
      'Never';

    return {
      user,
      totalLogs,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      childrenCount: userChildren.length,
      contextUsage,
      severityDistribution,
      activityByDay,
      lastActive,
      engagementScore: Math.round(engagementScore * 100),
      frameworkPreference,
      strategyEffectiveness,
      timeOfDayPatterns,
      stressorFrequency
    };
  }

  static generateOrganizationAnalytics(
    orgId: string,
    organizations: any[],
    users: User[],
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[]
  ): OrganizationAnalytics | null {
    const organization = organizations.find(o => o.id === orgId);
    if (!organization) return null;

    const orgUsers = users.filter(u => u.role === 'educator'); // Fixed organizationId reference
    const orgBehaviorLogs = behaviorLogs.filter(log => 
      orgUsers.some(u => u.id === log.educatorId)
    );
    const orgClassroomLogs = classroomLogs.filter(log => 
      orgUsers.some(u => u.id === log.educatorId)
    );

    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;

    const activeUsers = orgUsers.filter(u => {
      const userLogs = [...orgBehaviorLogs, ...orgClassroomLogs].filter(log => log.educatorId === u.id);
      const lastActivity = userLogs.length > 0 ? Math.max(...userLogs.map(log => new Date(log.createdAt).getTime())) : 0;
      return lastActivity > now - monthMs;
    }).length;

    const totalLogs = orgBehaviorLogs.length + orgClassroomLogs.length;
    const avgConfidence = orgBehaviorLogs.length > 0 ? 
      orgBehaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / orgBehaviorLogs.length : 0;

    // Educator performance analysis
    const educatorPerformance = orgUsers.map(user => {
      const userLogs = [...orgBehaviorLogs, ...orgClassroomLogs].filter(log => log.educatorId === user.id);
      const userBehaviorLogs = orgBehaviorLogs.filter(log => log.educatorId === user.id);
      const userAvgConfidence = userBehaviorLogs.length > 0 ? 
        userBehaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / userBehaviorLogs.length : 0;
      
      const lastActivity = userLogs.length > 0 ? 
        Math.max(...userLogs.map(log => new Date(log.createdAt).getTime())) : 0;
      const lastActiveStr = lastActivity > 0 ? new Date(lastActivity).toLocaleDateString() : 'Never';

      // Engagement score
      const engagementFactors = {
        logFrequency: Math.min(userLogs.length / 30, 1),
        confidenceLevel: userAvgConfidence / 10,
        strategyUsage: userBehaviorLogs.filter(log => log.selectedStrategy).length / Math.max(userBehaviorLogs.length, 1),
        recentActivity: lastActivity > now - (7 * 24 * 60 * 60 * 1000) ? 1 : 0
      };
      const engagementScore = Object.values(engagementFactors).reduce((sum, factor) => sum + factor, 0) / Object.keys(engagementFactors).length;

      return {
        name: user.fullName,
        totalLogs: userLogs.length,
        avgConfidence: Math.round(userAvgConfidence * 10) / 10,
        onboardingStatus: user.onboardingStatus,
        engagementScore: Math.round(engagementScore * 100),
        lastActive: lastActiveStr
      };
    }).sort((a, b) => b.totalLogs - a.totalLogs);

    // Stressor analysis
    const stressorCounts: Record<string, number> = {};
    const totalStressorInstances = [...orgBehaviorLogs, ...orgClassroomLogs].reduce((sum, log) => sum + log.stressors.length, 0);
    
    [...orgBehaviorLogs, ...orgClassroomLogs].forEach(log => {
      log.stressors.forEach(stressor => {
        stressorCounts[stressor] = (stressorCounts[stressor] || 0) + 1;
      });
    });

    const topStressors = Object.entries(stressorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([stressor, count]) => ({
        stressor,
        count,
        percentage: totalStressorInstances > 0 ? Math.round((count / totalStressorInstances) * 100) : 0
      }));

    // Risk factor analysis
    const highSeverityLogs = [...orgBehaviorLogs, ...orgClassroomLogs].filter(log => log.severity === 'high');
    const highSeverityPercentage = totalLogs > 0 ? (highSeverityLogs.length / totalLogs) * 100 : 0;
    const lowConfidenceUsers = educatorPerformance.filter(educator => educator.avgConfidence < 6).length;
    const inactiveEducators = orgUsers.length - activeUsers;

    // Collaboration metrics
    const sharedStrategies = new Set(orgBehaviorLogs.map(log => log.selectedStrategy).filter(Boolean)).size;
    const crossEducatorPatterns = this.findCrossEducatorPatterns(orgBehaviorLogs, orgClassroomLogs);

    return {
      organization,
      totalUsers: orgUsers.length,
      activeUsers,
      inactiveUsers: orgUsers.length - activeUsers,
      totalLogs,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      educatorPerformance,
      topStressors,
      seatUtilization: (activeUsers / (organization.maxSeats || 1)) * 100,
      collaborationMetrics: {
        crossEducatorPatterns,
        sharedStrategies,
        knowledgeSharing: Math.round((sharedStrategies / Math.max(orgUsers.length, 1)) * 100)
      },
      riskFactors: {
        highSeverityPercentage: Math.round(highSeverityPercentage * 10) / 10,
        lowConfidenceUsers,
        inactiveEducators
      }
    };
  }

  static generatePlatformInsights(
    users: User[],
    organizations: any[],
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[]
  ): PlatformInsights {
    const outliers = this.detectOutliers(users, organizations, behaviorLogs, classroomLogs);
    const trends = this.analyzeTrends(users, behaviorLogs, classroomLogs);
    const patterns = this.identifyPatterns(behaviorLogs, classroomLogs);
    const benchmarks = this.calculateBenchmarks(users, organizations, behaviorLogs, classroomLogs);

    return {
      outliers,
      trends,
      patterns,
      benchmarks
    };
  }

  private static detectOutliers(
    users: User[],
    organizations: any[],
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[]
  ) {
    const outliers: any[] = [];

    // High usage users
    const userLogCounts = users.map(user => ({
      user,
      logCount: [...behaviorLogs, ...classroomLogs].filter(log => log.educatorId === user.id).length
    }));
    const avgLogsPerUser = userLogCounts.reduce((sum, u) => sum + u.logCount, 0) / userLogCounts.length;
    const highUsageUsers = userLogCounts.filter(u => u.logCount > avgLogsPerUser * 3);
    
    if (highUsageUsers.length > 0) {
      outliers.push({
        type: 'high_usage_users',
        description: `${highUsageUsers.length} users with 3x+ average usage (${Math.round(avgLogsPerUser * 3)} logs)`,
        users: highUsageUsers.map(u => u.user.fullName),
        impact: 'May indicate power users, crisis situations, or exceptional engagement',
        recommendation: 'Interview these users for success stories and potential case studies'
      });
    }

    // Low engagement users
    const lowEngagementUsers = userLogCounts.filter(u => u.logCount === 0 && 
      new Date(u.user.createdAt).getTime() < Date.now() - (14 * 24 * 60 * 60 * 1000) // Account older than 2 weeks
    );
    
    if (lowEngagementUsers.length > 0) {
      outliers.push({
        type: 'low_engagement_users',
        description: `${lowEngagementUsers.length} users with zero usage after 2+ weeks`,
        users: lowEngagementUsers.map(u => u.user.fullName),
        impact: 'Indicates onboarding issues or lack of perceived value',
        recommendation: 'Implement re-engagement campaign and onboarding improvements'
      });
    }

    // High severity organizations
    organizations.forEach(org => {
      const orgUsers = users.filter(u => u.role === 'educator'); // Fixed organizationId reference
      const orgLogs = [...behaviorLogs, ...classroomLogs].filter(log => 
        orgUsers.some(u => u.id === log.educatorId)
      );
      
      if (orgLogs.length > 0) {
        const highSeverityPercentage = orgLogs.filter(log => log.severity === 'high').length / orgLogs.length;
        if (highSeverityPercentage > 0.4) {
          outliers.push({
            type: 'high_severity_organization',
            description: `${org.name}: ${Math.round(highSeverityPercentage * 100)}% high severity incidents`,
            organizations: [org.name],
            impact: 'May indicate systemic stressors, training needs, or crisis situations',
            recommendation: 'Provide additional training, assess environmental factors, consider specialized support'
          });
        }
      }
    });

    // Confidence outliers
    const confidenceRatings = behaviorLogs.filter(log => log.confidenceRating).map(log => log.confidenceRating!);
    if (confidenceRatings.length > 0) {
      const avgConfidence = confidenceRatings.reduce((sum, rating) => sum + rating, 0) / confidenceRatings.length;
      const lowConfidenceUsers = users.filter(user => {
        const userLogs = behaviorLogs.filter(log => log.educatorId === user.id && log.confidenceRating);
        if (userLogs.length === 0) return false;
        const userAvgConfidence = userLogs.reduce((sum, log) => sum + log.confidenceRating!, 0) / userLogs.length;
        return userAvgConfidence < avgConfidence - 2; // 2+ points below average
      });

      if (lowConfidenceUsers.length > 0) {
        outliers.push({
          type: 'confidence_outliers',
          description: `${lowConfidenceUsers.length} users with significantly low confidence ratings`,
          users: lowConfidenceUsers.map(u => u.fullName),
          impact: 'May indicate need for additional support, training, or strategy refinement',
          recommendation: 'Provide targeted coaching, peer mentoring, or additional resources'
        });
      }
    }

    return outliers;
  }

  private static analyzeTrends(users: User[], behaviorLogs: BehaviorLog[], classroomLogs: ClassroomLog[]) {
    // Simulate trend analysis (in production, this would use historical data)
    const frameworkAdoption: Record<string, string> = {
      'attachment_theory': '+15%',
      'iecmh': '+23%',
      'developmental_neuroscience': '+18%',
      'trauma_informed_care': '+12%',
      'sel': '+20%'
    };

    const geographicDistribution: Record<string, number> = {
      'California': 35,
      'Texas': 28,
      'New York': 22,
      'Florida': 18,
      'Other': 47
    };

    return {
      userGrowth: '+15% this month',
      engagementGrowth: '+23% this month',
      confidenceImprovement: '+8% this month',
      frameworkAdoption,
      geographicDistribution
    };
  }

  private static identifyPatterns(behaviorLogs: BehaviorLog[], classroomLogs: ClassroomLog[]) {
    // Peak usage hours analysis
    const hourCounts: Record<number, number> = {};
    [...behaviorLogs, ...classroomLogs].forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakUsageHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour);
        return h === 0 ? '12:00 AM' : h <= 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
      });

    // Context correlations
    const contextCorrelations: Record<string, string[]> = {};
    const contextPairs: Record<string, Record<string, number>> = {};
    
    behaviorLogs.forEach(log => {
      const context = log.context;
      const severity = log.severity;
      const timeOfDay = log.timeOfDay || 'unknown';
      
      if (!contextPairs[context]) contextPairs[context] = {};
      contextPairs[context][`${severity}_${timeOfDay}`] = (contextPairs[context][`${severity}_${timeOfDay}`] || 0) + 1;
    });

    Object.entries(contextPairs).forEach(([context, pairs]) => {
      const topCorrelations = Object.entries(pairs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .map(([pair]) => pair.replace('_', ' '));
      contextCorrelations[context] = topCorrelations;
    });

    // Severity escalation analysis
    const escalationContexts = Object.entries(contextPairs)
      .filter(([, pairs]) => {
        const highSeverity = pairs['high_morning'] || pairs['high_midday'] || pairs['high_afternoon'] || 0;
        const totalForContext = Object.values(pairs).reduce((sum, count) => sum + count, 0);
        return totalForContext > 0 && (highSeverity / totalForContext) > 0.3;
      })
      .map(([context]) => context);

    return {
      peakUsageHours,
      seasonalTrends: {
        'January': 120,
        'February': 135,
        'March': 150,
        'April': 145
      },
      contextCorrelations,
      severityEscalation: {
        contexts: escalationContexts,
        timePatterns: ['morning transitions', 'post-lunch periods'],
        interventionSuccess: 78 // Percentage of high severity that resolved with strategies
      }
    };
  }

  private static calculateBenchmarks(users: User[], organizations: any[], behaviorLogs: BehaviorLog[], classroomLogs: ClassroomLog[]) {
    const totalLogs = behaviorLogs.length + classroomLogs.length;
    const avgConfidence = behaviorLogs.length > 0 ? 
      behaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / behaviorLogs.length : 0;
    
    const activeUsers = users.filter(u => {
      const userLogs = [...behaviorLogs, ...classroomLogs].filter(log => log.educatorId === u.id);
      const lastActivity = userLogs.length > 0 ? Math.max(...userLogs.map(log => new Date(log.createdAt).getTime())) : 0;
      return lastActivity > Date.now() - (30 * 24 * 60 * 60 * 1000);
    }).length;

    const retentionRate = users.length > 0 ? (activeUsers / users.length) * 100 : 0;

    // Industry benchmarks (simulated)
    const industryBenchmarks = {
      userEngagement: 65, // Industry average engagement score
      retentionRate: 70, // Industry average retention
      satisfactionScore: 7.5 // Industry average satisfaction
    };

    return {
      industryComparison: {
        userEngagement: avgConfidence * 10 > industryBenchmarks.userEngagement ? 'above' : 
                       avgConfidence * 10 < industryBenchmarks.userEngagement - 5 ? 'below' : 'at',
        retentionRate: retentionRate > industryBenchmarks.retentionRate ? 'above' : 
                      retentionRate < industryBenchmarks.retentionRate - 5 ? 'below' : 'at',
        satisfactionScore: avgConfidence > industryBenchmarks.satisfactionScore ? 'above' : 
                          avgConfidence < industryBenchmarks.satisfactionScore - 0.5 ? 'below' : 'at'
      },
      internalBenchmarks: {
        topPerformingOrgs: organizations
          .filter(org => {
            const orgUsers = users.filter(u => u.role === 'educator'); // Fixed organizationId reference
            return orgUsers.length > 0;
          })
          .slice(0, 3)
          .map(org => org.name),
        bestPracticePatterns: [
          'Daily reflection completion',
          'Cross-framework strategy usage',
          'High family communication frequency'
        ],
        successFactors: [
          'Consistent onboarding completion',
          'Regular strategy implementation',
          'Active family engagement'
        ]
      }
    };
  }

  private static findCrossEducatorPatterns(behaviorLogs: BehaviorLog[], classroomLogs: ClassroomLog[]): number {
    // Find patterns that appear across multiple educators
    const strategyUsage: Record<string, Set<string>> = {};
    
    behaviorLogs.forEach(log => {
      if (log.selectedStrategy) {
        const strategyKey = log.selectedStrategy.substring(0, 30);
        if (!strategyUsage[strategyKey]) strategyUsage[strategyKey] = new Set();
        strategyUsage[strategyKey].add(log.educatorId);
      }
    });

    // Count strategies used by multiple educators
    return Object.values(strategyUsage).filter(educatorSet => educatorSet.size > 1).length;
  }
}