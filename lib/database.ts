import { prisma } from './prisma';
import { User, Classroom, Child, BehaviorLog, ClassroomLog } from '@prisma/client';

export class DatabaseService {
  // User operations
  static async createUser(data: {
    email: string;
    fullName: string;
    clerkId?: string;
  }) {
    return await prisma.user.create({
      data: {
        ...data,
        clerkId: data.clerkId || data.email, // Fallback for NextAuth
        role: 'EDUCATOR',
        onboardingStatus: 'INCOMPLETE'
      }
    });
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        classrooms: {
          include: {
            children: true
          }
        }
      }
    });
  }

  static async updateUserOnboarding(userId: string, data: {
    preferredLanguage?: 'ENGLISH' | 'SPANISH';
    learningStyle?: string;
    teachingStyle?: string;
    onboardingStatus?: 'COMPLETE';
  }) {
    return await prisma.user.update({
      where: { id: userId },
      data
    });
  }

  // Classroom operations
  static async createClassroom(userId: string, data: {
    name: string;
    gradeBand: string;
    studentCount: number;
    teacherStudentRatio: string;
    stressors: string[];
    iepCount?: number;
    ifspCount?: number;
  }) {
    return await prisma.classroom.create({
      data: {
        ...data,
        educatorId: userId
      },
      include: {
        children: true
      }
    });
  }

  static async getUserClassrooms(userId: string) {
    return await prisma.classroom.findMany({
      where: { educatorId: userId },
      include: {
        children: true,
        behaviorLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        classroomLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  // Child operations
  static async createChild(data: {
    name: string;
    gradeBand: string;
    classroomId: string;
    age?: number;
    hasIEP?: boolean;
    hasIFSP?: boolean;
    developmentalNotes?: string;
  }) {
    return await prisma.child.create({
      data,
      include: {
        classroom: true
      }
    });
  }

  static async getClassroomChildren(classroomId: string) {
    return await prisma.child.findMany({
      where: { classroomId },
      include: {
        behaviorLogs: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  }

  // Behavior log operations
  static async createBehaviorLog(data: {
    educatorId: string;
    childId?: string;
    classroomId?: string;
    behaviorDescription: string;
    context: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    timeOfDay?: string;
    educatorMood?: string;
    stressors?: string[];
    aiResponse?: any;
    selectedStrategy?: string;
    confidenceRating?: number;
  }) {
    return await prisma.behaviorLog.create({
      data: {
        ...data,
        stressors: data.stressors || [],
        adultResponse: [],
        outcome: [],
        supports: [],
        resourcesAvailable: []
      },
      include: {
        child: true,
        classroom: true
      }
    });
  }

  static async getUserBehaviorLogs(userId: string) {
    return await prisma.behaviorLog.findMany({
      where: { educatorId: userId },
      include: {
        child: true,
        classroom: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Classroom log operations
  static async createClassroomLog(data: {
    educatorId: string;
    classroomId: string;
    challengeDescription: string;
    context: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    educatorMood?: string;
    stressors?: string[];
    aiResponse?: any;
    selectedStrategy?: string;
    confidenceSelfRating?: number;
    confidenceStrategyRating?: number;
  }) {
    return await prisma.classroomLog.create({
      data: {
        ...data,
        stressors: data.stressors || []
      },
      include: {
        classroom: true
      }
    });
  }

  static async getUserClassroomLogs(userId: string) {
    return await prisma.classroomLog.findMany({
      where: { educatorId: userId },
      include: {
        classroom: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}