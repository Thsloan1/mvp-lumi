import React, { useState } from 'react';
import { Users, CreditCard as Edit, Save, X, BarChart3, Calendar } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { useAppContext } from '../../context/AppContext';
import { Classroom } from '../../types';
import { GRADE_BAND_OPTIONS, STRESSOR_OPTIONS } from '../../data/constants';

export const ClassroomProfileManager: React.FC = () => {
  const { currentUser, classrooms, setClassrooms, behaviorLogs, classroomLogs } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Classroom>>({});

  // For MVP, we'll use a default classroom or create one if none exists
  const currentClassroom = classrooms.length > 0 ? classrooms[0] : null;

  React.useEffect(() => {
    if (!currentClassroom && currentUser) {
      // Create default classroom
      const defaultClassroom: Classroom = {
        id: 'default-classroom',
        name: `${currentUser.fullName?.split(' ')[0]}'s Classroom`,
        gradeBand: 'Preschool (4-5 years old)',
        studentCount: 15,
        teacherStudentRatio: '1:8',
        stressors: [],
        educatorId: currentUser.id
      };
      setClassrooms([defaultClassroom]);
    }
  }, [currentUser, currentClassroom, setClassrooms]);

  const handleEdit = () => {
    if (currentClassroom) {
      setEditData(currentClassroom);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (currentClassroom && editData) {
      const updatedClassroom = { ...currentClassroom, ...editData };
      setClassrooms([updatedClassroom]);
      setIsEditing(false);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleStressorToggle = (stressor: string) => {
    const currentStressors = editData.stressors || [];
    const isSelected = currentStressors.includes(stressor);
    
    let newStressors;
    if (isSelected) {
      newStressors = currentStressors.filter(s => s !== stressor);
    } else {
      newStressors = [...currentStressors, stressor];
    }
    
    setEditData(prev => ({ ...prev, stressors: newStressors }));
  };

  const getClassroomStats = () => {
    if (!currentClassroom) return { behaviorLogs: 0, classroomLogs: 0, totalStrategies: 0 };
    
    const behaviorCount = behaviorLogs.filter(log => log.classroomId === currentClassroom.id).length;
    const classroomCount = classroomLogs.filter(log => log.classroomId === currentClassroom.id).length;
    const strategiesUsed = behaviorLogs.filter(log => log.selectedStrategy).length + 
                         classroomLogs.filter(log => log.selectedStrategy).length;
    
    return {
      behaviorLogs: behaviorCount,
      classroomLogs: classroomCount,
      totalStrategies: strategiesUsed
    };
  };

  const stats = getClassroomStats();

  const gradeBandOptions = GRADE_BAND_OPTIONS.map(option => ({
    value: option,
    label: option
  }));

  if (!currentClassroom) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F8F6F4] rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
            Setting up your classroom...
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Classroom Profile
              </h1>
              <p className="text-gray-600">
                Manage your classroom details and environment settings
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} icon={Edit}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} icon={Save}>
                  Save Changes
                </Button>
                <Button variant="ghost" onClick={handleCancel} icon={X}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Behavior Logs</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{stats.behaviorLogs}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Classroom Challenges</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{stats.classroomLogs}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Strategies Used</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{stats.totalStrategies}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Classroom Details */}
        <Card className="p-8 mb-8">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Classroom Details
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Classroom Name"
              value={isEditing ? (editData.name || '') : currentClassroom.name}
              onChange={(value) => setEditData(prev => ({ ...prev, name: value }))}
              disabled={!isEditing}
            />
            
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Grade/Age Band
              </label>
              {isEditing ? (
                <Select
                  value={editData.gradeBand || currentClassroom.gradeBand}
                  onChange={(value) => setEditData(prev => ({ ...prev, gradeBand: value }))}
                  options={gradeBandOptions}
                />
              ) : (
                <div className="px-4 py-3 bg-[#F8F6F4] rounded-xl text-[#1A1A1A]">
                  {currentClassroom.gradeBand}
                </div>
              )}
            </div>
            
            <Input
              label="Student Count"
              type="number"
              value={isEditing ? (editData.studentCount?.toString() || '') : currentClassroom.studentCount.toString()}
              onChange={(value) => setEditData(prev => ({ ...prev, studentCount: parseInt(value) || 0 }))}
              disabled={!isEditing}
              min={1}
              max={50}
            />
            
            <Input
              label="Teacher:Student Ratio"
              value={isEditing ? (editData.teacherStudentRatio || '') : currentClassroom.teacherStudentRatio}
              onChange={(value) => setEditData(prev => ({ ...prev, teacherStudentRatio: value }))}
              placeholder="e.g., 1:8"
              disabled={!isEditing}
            />
          </div>

          <div className="mt-6">
            <Input
              label="IEP Count (Optional)"
              type="number"
              value={isEditing ? (editData.iepCount?.toString() || '') : (currentClassroom.iepCount?.toString() || '')}
              onChange={(value) => setEditData(prev => ({ ...prev, iepCount: parseInt(value) || 0 }))}
              disabled={!isEditing}
              min={0}
            />
          </div>

          <div className="mt-6">
            <Input
              label="IFSP Count (Optional)"
              type="number"
              value={isEditing ? (editData.ifspCount?.toString() || '') : (currentClassroom.ifspCount?.toString() || '')}
              onChange={(value) => setEditData(prev => ({ ...prev, ifspCount: parseInt(value) || 0 }))}
              disabled={!isEditing}
              min={0}
            />
          </div>
        </Card>

        {/* Stressors */}
        <Card className="p-8">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-6">
            Classroom Stressors
          </h3>
          <p className="text-gray-600 mb-6">
            Select the challenges currently affecting your classroom environment:
          </p>
          
          <div className="max-h-96 overflow-y-auto space-y-3">
            {STRESSOR_OPTIONS.map((stressor, index) => {
              const isSelected = isEditing 
                ? (editData.stressors || []).includes(stressor)
                : currentClassroom.stressors.includes(stressor);
              
              return (
                <label
                  key={index}
                  className={`flex items-start space-x-3 cursor-pointer group ${!isEditing ? 'cursor-default' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => isEditing && handleStressorToggle(stressor)}
                    disabled={!isEditing}
                    className="mt-1 rounded border-[#E6E2DD] text-[#C44E38] focus:ring-[#C44E38] disabled:opacity-50"
                  />
                  <span className={`text-sm leading-relaxed ${isSelected ? 'text-[#1A1A1A] font-medium' : 'text-gray-700'} ${isEditing ? 'group-hover:text-[#1A1A1A]' : ''} transition-colors`}>
                    {stressor}
                  </span>
                </label>
              );
            })}
          </div>
          
          {isEditing && (!editData.stressors || editData.stressors.length === 0) && (
            <p className="text-sm text-red-500 mt-4">
              Please select at least one stressor that affects your classroom
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};