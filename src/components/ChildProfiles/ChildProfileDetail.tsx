import React, { useState } from 'react';
import { ArrowLeft, User, CreditCard as Edit, Save, X, Calendar, TrendingUp, Heart, FileText, BarChart3, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { EmptyState } from '../UI/EmptyState';
import { useAppContext } from '../../context/AppContext';
import { Child, BehaviorLog } from '../../types';
import { AnalyticsEngine } from '../../utils/analyticsEngine';
import { GRADE_BAND_OPTIONS } from '../../data/constants';

interface ChildProfileDetailProps {
  childId: string;
}

export const ChildProfileDetail: React.FC<ChildProfileDetailProps> = ({ childId }) => {
  const { children, behaviorLogs, setCurrentView, updateChild } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const child = children.find(c => c.id === childId);
  const childBehaviorLogs = behaviorLogs.filter(log => log.childId === childId);
  
  const [editData, setEditData] = useState({
    name: child?.name || '',
    gradeBand: child?.gradeBand || '',
    developmentalNotes: child?.developmentalNotes || '',
    hasIEP: child?.hasIEP || false,
    hasIFSP: child?.hasIFSP || false,
    languageAbility: child?.languageAbility || '',
    selfRegulationSkills: child?.selfRegulationSkills || '',
    sensorySensitivities: child?.sensorySensitivities || [],
    knownTriggers: child?.knownTriggers || [],
    homeLanguage: child?.homeLanguage || '',
    familyContext: child?.familyContext || ''
  });

  if (!child) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Child Not Found</h2>
          <p className="text-gray-600 mb-6">The requested child profile could not be found.</p>
          <Button onClick={() => setCurrentView('child-profiles')}>
            Back to Child Profiles
          </Button>
        </Card>
      </div>
    );
  }

  // Generate child insights
  const childInsight = AnalyticsEngine.generateChildInsights(childId, behaviorLogs, child);

  const gradeBandOptions = GRADE_BAND_OPTIONS.map(option => ({
    value: option,
    label: option
  }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateChild(childId, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update child:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: child.name,
      gradeBand: child.gradeBand,
      developmentalNotes: child.developmentalNotes || '',
      hasIEP: child.hasIEP,
      hasIFSP: child.hasIFSP,
      languageAbility: child.languageAbility || '',
      selfRegulationSkills: child.selfRegulationSkills || '',
      sensorySensitivities: child.sensorySensitivities || [],
      knownTriggers: child.knownTriggers || [],
      homeLanguage: child.homeLanguage || '',
      familyContext: child.familyContext || ''
    });
    setIsEditing(false);
  };

  const getRecentBehaviors = () => {
    return childBehaviorLogs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const recentBehaviors = getRecentBehaviors();
  
  // Add mock data if no real data exists
  const mockRecentBehaviors = recentBehaviors.length === 0 ? [
    {
      id: 'mock-1',
      behaviorDescription: 'Had difficulty during transition to circle time',
      context: 'transition',
      severity: 'medium' as const,
      selectedStrategy: 'Connection Before Direction approach',
      confidenceRating: 8,
      createdAt: new Date()
    }
  ] : recentBehaviors;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('child-profiles')}
            icon={ArrowLeft}
            className="mb-6 -ml-2"
          >
            Back to Child Profiles
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]">
                  {child.name}
                </h1>
                <p className="text-gray-600">{child.gradeBand}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {child.hasIEP && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      IEP
                    </span>
                  )}
                  {child.hasIFSP && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      IFSP
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} icon={Edit}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} loading={loading} icon={Save}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={handleCancel} icon={X}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Basic Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Child's Name"
                  value={isEditing ? editData.name : child.name}
                  onChange={(value) => setEditData(prev => ({ ...prev, name: value }))}
                  disabled={!isEditing}
                />
                
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Grade/Age Band
                  </label>
                  {isEditing ? (
                    <Select
                      value={editData.gradeBand}
                      onChange={(value) => setEditData(prev => ({ ...prev, gradeBand: value }))}
                      options={gradeBandOptions}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-[#F8F6F4] rounded-xl text-[#1A1A1A]">
                      {child.gradeBand}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <Input
                  label="Developmental Notes"
                  type="textarea"
                  value={isEditing ? editData.developmentalNotes : (child.developmentalNotes || '')}
                  onChange={(value) => setEditData(prev => ({ ...prev, developmentalNotes: value }))}
                  placeholder="Any relevant developmental information..."
                  rows={3}
                  disabled={!isEditing}
                />
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <Input
                  label="Home Language"
                  value={isEditing ? editData.homeLanguage : (child.homeLanguage || '')}
                  onChange={(value) => setEditData(prev => ({ ...prev, homeLanguage: value }))}
                  placeholder="Primary language spoken at home"
                  disabled={!isEditing}
                />
                
                <Input
                  label="Language Ability"
                  value={isEditing ? editData.languageAbility : (child.languageAbility || '')}
                  onChange={(value) => setEditData(prev => ({ ...prev, languageAbility: value }))}
                  placeholder="Current language development level"
                  disabled={!isEditing}
                />
              </div>
            </Card>

            {/* Support Plans */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Support Plans & Services
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.hasIEP : child.hasIEP}
                    onChange={(e) => setEditData(prev => ({ ...prev, hasIEP: e.target.checked }))}
                    disabled={!isEditing}
                    className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                  />
                  <div>
                    <span className="font-medium text-[#1A1A1A]">Has IEP (Individualized Education Program)</span>
                    <p className="text-sm text-gray-600">For children 3+ with developmental delays or disabilities</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.hasIFSP : child.hasIFSP}
                    onChange={(e) => setEditData(prev => ({ ...prev, hasIFSP: e.target.checked }))}
                    disabled={!isEditing}
                    className="rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                  />
                  <div>
                    <span className="font-medium text-[#1A1A1A]">Has IFSP (Individualized Family Service Plan)</span>
                    <p className="text-sm text-gray-600">For infants and toddlers (0-3) with developmental concerns</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Behavioral Insights */}
            {childInsight.totalLogs > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                  Behavioral Patterns & Insights
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-3">Pattern Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Most frequent trigger:</span>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {childInsight.patterns.mostFrequentContext.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Strategy confidence:</span>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {childInsight.patterns.confidenceTrend}/10
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total behavior logs:</span>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {childInsight.totalLogs}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-3">Severity Distribution</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {childInsight.patterns.severityDistribution.low}
                        </div>
                        <p className="text-xs text-gray-600">Low</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {childInsight.patterns.severityDistribution.medium}
                        </div>
                        <p className="text-xs text-gray-600">Medium</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {childInsight.patterns.severityDistribution.high}
                        </div>
                        <p className="text-xs text-gray-600">High</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Effective Strategies */}
                {childInsight.patterns.effectiveStrategies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-3">Most Effective Strategies</h4>
                    <div className="space-y-2">
                      {childInsight.patterns.effectiveStrategies.slice(0, 3).map((strategy, index) => (
                        <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-800">
                            {strategy.length > 100 ? `${strategy.substring(0, 100)}...` : strategy}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Recent Behavior History */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Recent Behavior History
                </h3>
                <Button
                  onClick={() => setCurrentView('behavior-log')}
                  size="sm"
                  icon={Heart}
                >
                  Log New Behavior
                </Button>
              </div>
              
              {recentBehaviors.length === 0 ? (
                <EmptyState
                  icon={Heart}
                  title="No behavior logs yet"
                  description={`Start tracking ${child.name}'s behaviors to see patterns and get personalized strategies.`}
                  actionLabel="Log First Behavior"
                  onAction={() => setCurrentView('behavior-log')}
                />
              ) : (
                <div className="space-y-4">
                  {mockRecentBehaviors.map((log, index) => (
                    <div key={index} className="p-4 bg-[#F8F6F4] rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`
                            w-3 h-3 rounded-full
                            ${log.severity === 'low' ? 'bg-green-500' :
                              log.severity === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                          `} />
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {log.context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {log.behaviorDescription}
                      </p>
                      {log.selectedStrategy && (
                        <div className="text-xs text-blue-600">
                          <strong>Strategy used:</strong> {log.selectedStrategy.substring(0, 80)}...
                        </div>
                      )}
                      {log.confidenceRating && (
                        <div className="text-xs text-green-600 mt-1">
                          <strong>Confidence:</strong> {log.confidenceRating}/10
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    onClick={() => setCurrentView('reports')}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    View Complete History
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar - Quick Stats & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-[#C44E38]" />
                    <span className="text-sm text-gray-600">Behavior Logs</span>
                  </div>
                  <span className="text-lg font-bold text-[#1A1A1A]">
                    {childBehaviorLogs.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">Avg Confidence</span>
                  </div>
                  <span className="text-lg font-bold text-[#1A1A1A]">
                    {childInsight.patterns.confidenceTrend}/10
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Last Entry</span>
                  </div>
                  <span className="text-sm font-medium text-[#1A1A1A]">
                    {recentBehaviors.length > 0 
                      ? new Date(recentBehaviors[0].createdAt).toLocaleDateString()
                      : 'None'
                    }
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentView('behavior-log')}
                  className="w-full justify-start"
                  icon={Heart}
                >
                  Log New Behavior
                </Button>
                
                <Button
                  onClick={() => setCurrentView('family-script-generator')}
                  variant="outline"
                  className="w-full justify-start"
                  icon={FileText}
                >
                  Generate Family Note
                </Button>
                
                <Button
                  onClick={() => setCurrentView('reports')}
                  variant="outline"
                  className="w-full justify-start"
                  icon={BarChart3}
                >
                  View Detailed Report
                </Button>
              </div>
            </Card>

            {/* Profile Completion */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                Profile Completion
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Basic Info</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Support Plans</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Behavior Data</span>
                  <span className={`text-sm font-medium ${childBehaviorLogs.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {childBehaviorLogs.length > 0 ? '✓ Active' : '⚠ Needs data'}
                  </span>
                </div>
              </div>
              
              {childBehaviorLogs.length === 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700 mb-3">
                    Add behavior logs to unlock insights and patterns for {child.name}.
                  </p>
                  <Button
                    onClick={() => setCurrentView('behavior-log')}
                    size="sm"
                    className="w-full"
                  >
                    Add First Behavior Log
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};