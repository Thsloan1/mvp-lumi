import React from 'react';
import { Heart, Users, FileText, BarChart3, Plus, Calendar, BookOpen, TrendingUp, User, ArrowRight } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { EngagementTracker } from '../Analytics/EngagementTracker';
import { AnalyticsEngine, ChildInsight, ClassroomInsight, UnifiedInsight } from '../../utils/analyticsEngine';
import { FullPageLoading } from '../UI/LoadingState';
import { EmptyState } from '../UI/EmptyState';

export const EducatorDashboard: React.FC = () => {
  const { 
    currentUser,
    isLoading,
    behaviorLogs, 
    classroomLogs, 
    children, 
    classrooms, 
    loading,
    setCurrentView 
  } = useAppContext();

  if (isLoading || loading) {
    return <FullPageLoading message="Loading your dashboard..." />;
  }

  // Handle case where user has no data yet
  const hasAnyData = behaviorLogs.length > 0 || classroomLogs.length > 0 || children.length > 0;

  // Generate unified insights
  const currentClassroom = classrooms[0]; // For MVP, use first classroom
  const childInsights = children.map(child => 
    AnalyticsEngine.generateChildInsights(child.id, behaviorLogs, child)
  ).filter(insight => insight.totalLogs > 0);

  const classroomInsight = currentClassroom 
    ? AnalyticsEngine.generateClassroomInsights(
        currentClassroom.id, 
        behaviorLogs, 
        classroomLogs, 
        children, 
        currentClassroom
      )
    : null;

  const unifiedInsights = AnalyticsEngine.generateUnifiedInsights(
    behaviorLogs,
    classroomLogs,
    children,
    classrooms
  );

  const stats = [
    {
      label: 'Behaviors Logged',
      value: behaviorLogs.length.toString(),
      icon: Heart,
      color: 'text-[#C44E38]'
    },
    {
      label: 'Classroom Challenges',
      value: classroomLogs.length.toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Family Notes',
      value: behaviorLogs.filter(log => log.aiResponse?.familyScript).length.toString(),
      icon: FileText,
      color: 'text-green-600'
    },
    {
      label: 'This Week',
      value: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      icon: Calendar,
      color: 'text-purple-600'
    }
  ];

  const recentActivity = [
    ...behaviorLogs.slice(-3).map(log => ({
      type: 'behavior',
      description: log.behaviorDescription,
      time: new Date(log.createdAt).toLocaleDateString(),
      severity: log.severity
    })),
    ...classroomLogs.slice(-2).map(log => ({
      type: 'classroom',
      description: log.challengeDescription,
      time: new Date(log.createdAt).toLocaleDateString(),
      severity: log.severity
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  // Add mock data if no real data exists for demo
  const mockRecentActivity = recentActivity.length === 0 ? [
    {
      type: 'behavior',
      description: 'Child had difficulty during transition to circle time',
      time: new Date().toLocaleDateString(),
      severity: 'medium' as const
    },
    {
      type: 'classroom',
      description: 'Multiple children struggling with cleanup routine',
      time: new Date(Date.now() - 86400000).toLocaleDateString(),
      severity: 'low' as const
    }
  ] : recentActivity;

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Welcome back, {currentUser?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-gray-600">
            Ready to support your students today? Let's see what's happening.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} bg-opacity-10 rounded-xl p-3`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => setCurrentView('behavior-log')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#C44E38] bg-opacity-10 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-[#C44E38]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
                  Individual Child Behavior
                </h3>
                <p className="text-gray-600 text-sm">
                  Get personalized strategies for challenging behaviors
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => setCurrentView('classroom-log')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
                  Whole Class Challenge
                </h3>
                <p className="text-gray-600 text-sm">
                  Address classroom-wide management challenges
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-4">
                  <Button
                    onClick={() => setCurrentView('child-profiles')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={User}
                  >
                    Child Profiles
                  </Button>
                  <Button
                    onClick={() => setCurrentView('classroom-profile')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={Users}
                  >
                    Classroom Profile
                  </Button>
                  <Button
                    onClick={() => setCurrentView('reports')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={BarChart3}
                  >
                    View Data and Reports
                  </Button>
                  <Button
                    onClick={() => setCurrentView('library')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={BookOpen}
                  >
                    Resource Library
                  </Button>
                  <Button
                    onClick={() => setCurrentView('family-notes')}
                    variant="outline"
                    className="w-full justify-start"
                    icon={FileText}
                  >
                    Family Notes
                  </Button>
                </div>
              </Card>

              {/* Getting Started Guide */}
              {!hasAnyData && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    Getting Started with Lumi
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-[#C44E38] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">1</span>
                      </div>
                      <p>Add children to your classroom profiles</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-[#C44E38] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">2</span>
                      </div>
                      <p>Log your first behavior or classroom challenge</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-[#C44E38] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-white font-bold">3</span>
                      </div>
                      <p>Get personalized strategies and track your progress</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setCurrentView('child-profiles')}
                    className="w-full mt-4"
                    icon={Plus}
                  >
                    Add Your First Child
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Unified Insights */}
              {unifiedInsights.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                    Unified Insights
                  </h3>
                  <div className="space-y-4">
                    {unifiedInsights.map((insight, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-[#1A1A1A]">{insight.pattern}</h4>
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${insight.classroomLevel.severity === 'high' ? 'bg-red-100 text-red-700' :
                              insight.classroomLevel.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'}
                          `}>
                            {insight.classroomLevel.severity} severity
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm font-medium text-blue-900">Child Level:</p>
                            <p className="text-sm text-blue-700">
                              {insight.childLevel.affectedChildren} children, {insight.childLevel.frequency} incidents
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900">Classroom Level:</p>
                            <p className="text-sm text-green-700">
                              {insight.classroomLevel.affectedClassrooms} classrooms affected
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>Recommendations:</strong> {insight.recommendations.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Classroom Climate Feed */}
              {classroomInsight && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                    Classroom Climate Insights
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-3">Group Climate Score</h4>
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold text-[#C44E38]">
                          {classroomInsight.groupClimate.score}/10
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-[#E6E2DD] rounded-full h-2">
                            <div 
                              className="bg-[#C44E38] h-2 rounded-full"
                              style={{ width: `${classroomInsight.groupClimate.score * 10}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {classroomInsight.groupClimate.transitionChallenges}% transition challenges
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#1A1A1A] mb-3">Top Stressors</h4>
                      <div className="space-y-1">
                        {classroomInsight.groupClimate.topStressors.slice(0, 3).map((stressor, index) => (
                          <div key={index} className="text-sm text-gray-700 flex items-center">
                            <div className="w-2 h-2 bg-[#C44E38] rounded-full mr-2" />
                            {stressor}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Recent Activity
                </h3>
                
                {recentActivity.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="Ready to get started?"
                    description="Log your first behavior or classroom challenge to see personalized strategies."
                    actionLabel="Log First Behavior"
                    onAction={() => setCurrentView('behavior-log')}
                  />
                ) : (
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-[#F8F6F4] rounded-xl">
                        <div className={`
                          w-2 h-2 rounded-full mt-2
                          ${activity.severity === 'high' ? 'bg-red-500' :
                            activity.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}
                        `} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-[#C44E38] uppercase tracking-wide">
                              {activity.type === 'behavior' ? 'Child Behavior' : 'Classroom Challenge'}
                            </span>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                          <p className="text-sm text-[#1A1A1A] line-clamp-2">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      onClick={() => setCurrentView('reports')}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      View All Activity
                    </Button>
                  </div>
                )}
              </Card>
              
              {/* Engagement Analytics */}
              <EngagementTracker />
            </div>
          </div>
        </div>
        
        {/* Resource Library Promotion */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-[#F8F6F4] to-white border-[#E6E2DD]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                Explore Our Resource Library
              </h3>
              <p className="text-gray-600">
                Access curated strategies, family handouts, and implementation guides
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setCurrentView('library')}
                icon={BookOpen}
              >
                Browse Resources
              </Button>
              <Button
                onClick={() => setCurrentView('family-notes')}
                variant="outline"
                icon={FileText}
              >
                Family Notes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};