import React, { useState } from 'react';
import { ArrowLeft, User, CreditCard as Edit, Save, X, Calendar, TrendingUp, Heart, FileText, BarChart3, AlertCircle, Plus } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { EmptyState } from '../UI/EmptyState';
import { useAppContext } from '../../context/AppContext';
import { Child, BehaviorLog } from '../../types';
import { AnalyticsEngine } from '../../utils/analyticsEngine';
import { GRADE_BAND_OPTIONS } from '../../data/constants';
import { safeLocalStorageSet } from '../../utils/jsonUtils';

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
      <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center">
        <Card className="p-8 text-center bg-white border-[#E6E2DD]">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Child Not Found</h2>
          <p className="text-[#615E59] mb-6">The requested child profile could not be found.</p>
          <Button 
            onClick={() => setCurrentView('child-profiles')}
            className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
          >
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
      safeLocalStorageSet('lumi_child_profile_backup', { childId, editData });
      await updateChild(childId, editData);
      setIsEditing(false);
      localStorage.removeItem('lumi_child_profile_backup');
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
    <div className="min-h-screen bg-[#F8F6F4]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentView('child-profiles')}
            icon={ArrowLeft}
            className="mb-6 -ml-2 text-[#615E59] hover:text-[#1A1A1A]"
          >
            Back to Child Profiles
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-[#C44E38] bg-opacity-10 rounded-2xl flex items-center justify-center border border-[#E6E2DD]">
                <User className="w-10 h-10 text-[#C44E38]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A] mb-1">
                  {child.name}
                </h1>
                <p className="text-[#615E59] mb-2">{child.gradeBand}</p>
                <div className="flex items-center space-x-2">
                  {child.hasIEP && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      IEP
                    </span>
                  )}
                  {child.hasIFSP && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      IFSP
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)} 
                icon={Edit}
                className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSave} 
                  loading={loading} 
                  icon={Save}
                  className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
                >
                  Save Changes
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleCancel} 
                  icon={X}
                  className="text-[#615E59] hover:text-[#1A1A1A]"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="p-8 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                Basic Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Child's Name"
                  value={isEditing ? editData.name : child.name}
                  onChange={(value) => setEditData(prev => ({ ...prev, name: value }))}
                  disabled={!isEditing}
                  className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
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
                    <div className="px-4 py-3 bg-[#F8F6F4] rounded-xl text-[#1A1A1A] border border-[#E6E2DD]">
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
                  className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
                />
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <Input
                  label="Home Language"
                  value={isEditing ? editData.homeLanguage : (child.homeLanguage || '')}
                  onChange={(value) => setEditData(prev => ({ ...prev, homeLanguage: value }))}
                  placeholder="Primary language spoken at home"
                  disabled={!isEditing}
                  className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
                />
                
                <Input
                  label="Language Ability"
                  value={isEditing ? editData.languageAbility : (child.languageAbility || '')}
                  onChange={(value) => setEditData(prev => ({ ...prev, languageAbility: value }))}
                  placeholder="Current language development level"
                  disabled={!isEditing}
                  className="bg-white border-[#E6E2DD] focus:border-[#C44E38] focus:ring-[#C44E38]"
                />
              </div>
            </Card>

            {/* Support Plans */}
            <Card className="p-8 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                Support Plans & Services
              </h3>
              
              <div className="space-y-6">
                <label className="flex items-start space-x-4 p-4 bg-[#F8F6F4] rounded-xl border border-[#E6E2DD]">
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.hasIEP : child.hasIEP}
                    onChange={(e) => setEditData(prev => ({ ...prev, hasIEP: e.target.checked }))}
                    disabled={!isEditing}
                    className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                  />
                  <div>
                    <span className="font-medium text-[#1A1A1A]">Has IEP (Individualized Education Program)</span>
                    <p className="text-sm text-[#615E59] mt-1">For children 3+ with developmental delays or disabilities</p>
                  </div>
                </label>
                
                <label className="flex items-start space-x-4 p-4 bg-[#F8F6F4] rounded-xl border border-[#E6E2DD]">
                  <input
                    type="checkbox"
                    checked={isEditing ? editData.hasIFSP : child.hasIFSP}
                    onChange={(e) => setEditData(prev => ({ ...prev, hasIFSP: e.target.checked }))}
                    disabled={!isEditing}
                    className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38]"
                  />
                  <div>
                    <span className="font-medium text-[#1A1A1A]">Has IFSP (Individualized Family Service Plan)</span>
                    <p className="text-sm text-[#615E59] mt-1">For infants and toddlers (0-3) with developmental concerns</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Behavioral Insights */}
            {childInsight.totalLogs > 0 && (
              <Card className="p-8 bg-white border-[#E6E2DD] shadow-sm">
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                  Behavioral Patterns & Insights
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-4">Pattern Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-[#F8F6F4] rounded-lg">
                        <span className="text-sm text-[#615E59]">Most frequent trigger:</span>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {childInsight.patterns.mostFrequentContext.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[#F8F6F4] rounded-lg">
                        <span className="text-sm text-[#615E59]">Strategy confidence:</span>
                        <span className="text-sm font-medium text-[#C44E38]">
                          {childInsight.patterns.confidenceTrend}/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-[#F8F6F4] rounded-lg">
                        <span className="text-sm text-[#615E59]">Total behavior logs:</span>
                        <span className="text-sm font-medium text-[#1A1A1A]">
                          {childInsight.totalLogs}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-4">Severity Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {childInsight.patterns.severityDistribution.low}
                        </div>
                        <p className="text-xs text-green-700 font-medium">Low</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600 mb-1">
                          {childInsight.patterns.severityDistribution.medium}
                        </div>
                        <p className="text-xs text-yellow-700 font-medium">Medium</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {childInsight.patterns.severityDistribution.high}
                        </div>
                        <p className="text-xs text-red-700 font-medium">High</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Effective Strategies */}
                {childInsight.patterns.effectiveStrategies.length > 0 && (
                  <div>
                    <h4 className="font-medium text-[#1A1A1A] mb-4">Most Effective Strategies</h4>
                    <div className="space-y-3">
                      {childInsight.patterns.effectiveStrategies.slice(0, 3).map((strategy, index) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                              <span className="text-sm font-bold text-green-600">{index + 1}</span>
                            </div>
                            <p className="text-sm text-green-800 leading-relaxed">
                              {strategy.length > 100 ? `${strategy.substring(0, 100)}...` : strategy}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Recent Behavior History */}
            <Card className="p-8 bg-white border-[#E6E2DD] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#1A1A1A]">
                  Recent Behavior History
                </h3>
                <Button
                  onClick={() => setCurrentView('behavior-log')}
                  size="sm"
                  icon={Plus}
                  className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
                >
                  Log New Behavior
                </Button>
              </div>
              
              {recentBehaviors.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#C44E38] bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-8 h-8 text-[#C44E38]" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                    No behavior logs yet
                  </h4>
                  <p className="text-[#615E59] mb-6 max-w-md mx-auto">
                    Start tracking {child.name}'s behaviors to see patterns and get personalized strategies.
                  </p>
                  <Button
                    onClick={() => setCurrentView('behavior-log')}
                    icon={Heart}
                    className="bg-[#C44E38] hover:bg-[#A63D2A] text-white"
                  >
                    Log First Behavior
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockRecentBehaviors.map((log, index) => (
                    <div key={index} className="p-6 bg-[#F8F6F4] rounded-xl border border-[#E6E2DD]">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-3 h-3 rounded-full
                            ${log.severity === 'low' ? 'bg-green-500' :
                              log.severity === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                          `} />
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {log.context.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <span className="text-xs text-[#615E59]">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[#615E59] mb-3 leading-relaxed">
                        {log.behaviorDescription}
                      </p>
                      {log.selectedStrategy && (
                        <div className="text-xs text-blue-600 mb-2">
                          <strong>Strategy used:</strong> {log.selectedStrategy.substring(0, 80)}...
                        </div>
                      )}
                      {log.confidenceRating && (
                        <div className="text-xs text-green-600">
                          <strong>Confidence:</strong> {log.confidenceRating}/10
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    onClick={() => setCurrentView('reports')}
                    variant="ghost"
                    size="sm"
                    className="w-full text-[#615E59] hover:text-[#1A1A1A]"
                  >
                    View Complete History
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Quick Stats
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#F8F6F4] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-[#C44E38]" />
                    <span className="text-sm text-[#615E59]">Behavior Logs</span>
                  </div>
                  <span className="text-xl font-bold text-[#1A1A1A]">
                    {childBehaviorLogs.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#F8F6F4] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-[#615E59]">Avg Confidence</span>
                  </div>
                  <span className="text-xl font-bold text-[#1A1A1A]">
                    {childInsight.patterns.confidenceTrend}/10
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#F8F6F4] rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-[#615E59]">Last Entry</span>
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
            <Card className="p-6 bg-white border-[#E6E2DD] shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => setCurrentView('behavior-log')}
                  className="w-full justify-start bg-[#C44E38] hover:bg-[#A63D2A] text-white"
                  icon={Heart}
                >
                  Log New Behavior
                </Button>
                
                <Button
                  onClick={() => setCurrentView('family-script-generator')}
                  variant="outline"
                  className="w-full justify-start border-[#E6E2DD] text-[#615E59] hover:border-[#C44E38] hover:text-[#C44E38]"
                  icon={FileText}
                >
                  Generate Family Note
                </Button>
                
                <Button
                  onClick={() => setCurrentView('reports')}
                  variant="outline"
                  className="w-full justify-start border-[#E6E2DD] text-[#615E59] hover:border-[#C44E38] hover:text-[#C44E38]"
                  icon={BarChart3}
                >
                  View Detailed Report
                </Button>
              </div>
            </Card>

            {/* Profile Completion */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50 border-blue-200 shadow-sm">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                Profile Completion
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#615E59]">Basic Info</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#615E59]">Support Plans</span>
                  <span className="text-sm font-medium text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#615E59]">Behavior Data</span>
                  <span className={`text-sm font-medium ${childBehaviorLogs.length > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {childBehaviorLogs.length > 0 ? '✓ Active' : '⚠ Needs data'}
                  </span>
                </div>
              </div>
              
              {childBehaviorLogs.length === 0 && (
                <div className="mt-6 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700 mb-4">
                    Add behavior logs to unlock insights and patterns for {child.name}.
                  </p>
                  <Button
                    onClick={() => setCurrentView('behavior-log')}
                    size="sm"
                    className="w-full bg-[#C44E38] hover:bg-[#A63D2A] text-white"
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