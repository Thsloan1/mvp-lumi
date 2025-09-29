import { BehaviorLog, ClassroomLog, Child, Classroom } from '../types';

export interface ChildInsight {
  childId: string;
  childName: string;
  totalLogs: number;
  patterns: {
    mostFrequentContext: string;
    mostFrequentTrigger: string;
    severityDistribution: { low: number; medium: number; high: number };
    effectiveStrategies: string[];
    confidenceTrend: number;
  };
  triggers: {
    name: string;
    frequency: number;
    contexts: string[];
  }[];
  timePatterns: {
    timeOfDay: string;
    frequency: number;
  }[];
}

export interface ClassroomInsight {
  classroomId: string;
  classroomName: string;
  totalLogs: number;
  groupClimate: {
    score: number; // 1-10 based on severity and frequency
    topStressors: string[];
    routineEffectiveness: number;
    transitionChallenges: number;
  };
  aggregatedChildBehaviors: {
    mostFrequentBehaviors: string[];
    commonStressors: string[];
    severityMix: { low: number; medium: number; high: number };
  };
  classroomChallenges: {
    transitionDifficulty: number;
    groupManagementScore: number;
    environmentalStressors: string[];
  };
}

export interface UnifiedInsight {
  type: 'nested_pattern';
  pattern: string;
  childLevel: {
    affectedChildren: number;
    frequency: number;
    contexts: string[];
  };
  classroomLevel: {
    affectedClassrooms: number;
    severity: 'low' | 'medium' | 'high';
    stressorRank: number;
  };
  recommendations: string[];
}

export interface OrganizationInsight {
  totalEducators: number;
  totalChildren: number;
  totalBehaviorLogs: number;
  totalClassroomLogs: number;
  crossSiteComparisons: {
    highSeverityTransitions: number; // percentage
    mostFrequentChildStressor: string;
    classroomStressorPrevalence: { stressor: string; percentage: number }[];
    severityTrends: { grade: string; severity: string; percentage: number }[];
  };
}

export class AnalyticsEngine {
  static generateChildInsights(
    childId: string,
    behaviorLogs: BehaviorLog[],
    child: Child
  ): ChildInsight {
    const childLogs = behaviorLogs.filter(log => log.childId === childId);
    
    if (childLogs.length === 0) {
      return {
        childId,
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
      };
    }

    // Calculate patterns
    const contextCounts: Record<string, number> = {};
    const severityDistribution = { low: 0, medium: 0, high: 0 };
    const timePatterns: Record<string, number> = {};
    const strategies: Record<string, number> = {};
    
    childLogs.forEach(log => {
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

    const avgConfidence = childLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / childLogs.length;

    return {
      childId,
      childName: child.name,
      totalLogs: childLogs.length,
      patterns: {
        mostFrequentContext,
        mostFrequentTrigger: mostFrequentContext, // Simplified for MVP
        severityDistribution,
        effectiveStrategies,
        confidenceTrend: Math.round(avgConfidence * 10) / 10
      },
      triggers: Object.entries(contextCounts).map(([name, frequency]) => ({
        name,
        frequency,
        contexts: [name] // Simplified for MVP
      })).sort((a, b) => b.frequency - a.frequency),
      timePatterns: Object.entries(timePatterns).map(([timeOfDay, frequency]) => ({
        timeOfDay,
        frequency
      })).sort((a, b) => b.frequency - a.frequency)
    };
  }

  static generateClassroomInsights(
    classroomId: string,
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[],
    children: Child[],
    classroom: Classroom
  ): ClassroomInsight {
    const classroomBehaviorLogs = behaviorLogs.filter(log => log.classroomId === classroomId);
    const classroomChallenges = classroomLogs.filter(log => log.classroomId === classroomId);
    
    // Calculate group climate score (1-10)
    const totalSeverityPoints = classroomBehaviorLogs.reduce((sum, log) => {
      return sum + (log.severity === 'high' ? 3 : log.severity === 'medium' ? 2 : 1);
    }, 0) + classroomChallenges.reduce((sum, log) => {
      return sum + (log.severity === 'high' ? 3 : log.severity === 'medium' ? 2 : 1);
    }, 0);
    
    const totalLogs = classroomBehaviorLogs.length + classroomChallenges.length;
    const avgSeverity = totalLogs > 0 ? totalSeverityPoints / totalLogs : 0;
    const groupClimateScore = Math.max(1, Math.min(10, 10 - (avgSeverity * 2)));

    // Aggregate child behaviors
    const behaviorCounts: Record<string, number> = {};
    const stressorCounts: Record<string, number> = {};
    const severityMix = { low: 0, medium: 0, high: 0 };

    classroomBehaviorLogs.forEach(log => {
      const behaviorType = this.categorizeBehavior(log.behaviorDescription);
      behaviorCounts[behaviorType] = (behaviorCounts[behaviorType] || 0) + 1;
      severityMix[log.severity]++;
      
      log.stressors.forEach(stressor => {
        stressorCounts[stressor] = (stressorCounts[stressor] || 0) + 1;
      });
    });

    // Calculate transition challenges
    const transitionLogs = [...classroomBehaviorLogs, ...classroomChallenges]
      .filter(log => log.context.includes('transition'));
    const transitionChallenges = (transitionLogs.length / totalLogs) * 100;

    return {
      classroomId,
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
  }

  static generateUnifiedInsights(
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[],
    children: Child[],
    classrooms: Classroom[]
  ): UnifiedInsight[] {
    const insights: UnifiedInsight[] = [];

    // Analyze peer conflict as nested pattern
    const peerConflictBehaviors = behaviorLogs.filter(log => 
      log.behaviorDescription.toLowerCase().includes('peer') ||
      log.behaviorDescription.toLowerCase().includes('friend') ||
      log.behaviorDescription.toLowerCase().includes('sharing') ||
      log.context.includes('conflict')
    );

    const peerConflictClassroom = classroomLogs.filter(log =>
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
          severity: this.calculateAverageSeverity([...peerConflictBehaviors, ...peerConflictClassroom]),
          stressorRank: 1 // Would be calculated based on frequency
        },
        recommendations: [
          'Implement peer mediation strategies',
          'Create sharing protocols for high-demand materials',
          'Develop social-emotional learning activities'
        ]
      });
    }

    // Analyze transition challenges
    const transitionBehaviors = behaviorLogs.filter(log => 
      log.context.includes('transition')
    );

    const transitionClassroom = classroomLogs.filter(log =>
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
          severity: this.calculateAverageSeverity([...transitionBehaviors, ...transitionClassroom]),
          stressorRank: 2
        },
        recommendations: [
          'Implement visual transition cues',
          'Create predictable transition routines',
          'Use countdown timers for preparation'
        ]
      });
    }

    return insights;
  }

  static generateOrganizationInsights(
    behaviorLogs: BehaviorLog[],
    classroomLogs: ClassroomLog[],
    children: Child[],
    classrooms: Classroom[]
  ): OrganizationInsight {
    // Calculate high severity transitions percentage
    const transitionLogs = [...behaviorLogs, ...classroomLogs]
      .filter(log => log.context.includes('transition'));
    const highSeverityTransitions = transitionLogs.filter(log => log.severity === 'high');
    const highSeverityTransitionPercentage = transitionLogs.length > 0 
      ? Math.round((highSeverityTransitions.length / transitionLogs.length) * 100)
      : 0;

    // Find most frequent child stressor
    const childStressors: Record<string, number> = {};
    behaviorLogs.forEach(log => {
      log.stressors.forEach(stressor => {
        childStressors[stressor] = (childStressors[stressor] || 0) + 1;
      });
    });

    const mostFrequentChildStressor = Object.entries(childStressors)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';

    // Calculate classroom stressor prevalence
    const classroomStressors: Record<string, number> = {};
    const totalClassroomLogs = classroomLogs.length;
    
    classroomLogs.forEach(log => {
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
    
    behaviorLogs.forEach(log => {
      const child = children.find(c => c.id === log.childId);
      if (child) {
        const grade = child.gradeBand;
        if (!gradeSeverity[grade]) {
          gradeSeverity[grade] = { low: 0, medium: 0, high: 0 };
        }
        gradeSeverity[grade][log.severity]++;
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

    return {
      totalEducators: classrooms.length, // Simplified - would be actual educator count
      totalChildren: children.length,
      totalBehaviorLogs: behaviorLogs.length,
      totalClassroomLogs: classroomLogs.length,
      crossSiteComparisons: {
        highSeverityTransitions: highSeverityTransitionPercentage,
        mostFrequentChildStressor,
        classroomStressorPrevalence,
        severityTrends
      }
    };
  }

  private static categorizeBehavior(description: string): string {
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

  private static calculateAverageSeverity(logs: (BehaviorLog | ClassroomLog)[]): 'low' | 'medium' | 'high' {
    if (logs.length === 0) return 'low';
    
    const severityPoints = logs.reduce((sum, log) => {
      return sum + (log.severity === 'high' ? 3 : log.severity === 'medium' ? 2 : 1);
    }, 0);
    
    const avgSeverity = severityPoints / logs.length;
    
    if (avgSeverity >= 2.5) return 'high';
    if (avgSeverity >= 1.5) return 'medium';
    return 'low';
  }
}