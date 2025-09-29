const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database for MVP (replace with real DB later)
let users = [];
let behaviorLogs = [];
let classroomLogs = [];
let children = [];
let classrooms = [];
let verificationCodes = new Map();
let resetCodes = new Map();

// Import test data for consistency
const { testDataManager } = require('./testDataManager.cjs');

// Sync with test data manager
const syncWithTestData = () => {
  const testData = testDataManager.getAllData();
  users = testData.users;
  children = testData.children;
  classrooms = testData.classrooms;
  behaviorLogs = testData.behaviorLogs;
  classroomLogs = testData.classroomLogs;
};

// Initialize with test data
syncWithTestData();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'lumi-secret-key-change-in-production';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName?.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Password strength validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasUppercase || !hasNumber) {
      return res.status(400).json({ error: 'Password must include at least 8 characters, with a capital letter and a number' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: Date.now().toString(),
      fullName,
      email,
      password: hashedPassword,
      role: 'educator',
      preferredLanguage: 'english',
      onboardingStatus: 'incomplete',
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user: { ...user, password: undefined } });
});

// Email verification routes
app.post('/api/auth/verify-email', authenticateToken, (req, res) => {
  try {
    const { code } = req.body;
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const storedCode = verificationCodes.get(user.email);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Mark email as verified
    user.emailVerified = true;
    verificationCodes.delete(user.email);
    
    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/resend-verification', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes.set(user.email, verificationCode);
    
    console.log(`📧 New verification code for ${user.email}: ${verificationCode}`);
    
    res.json({ message: 'Verification code sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Password reset routes
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If the email exists, a reset code has been sent' });
    }
    
    // Generate reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    resetCodes.set(email, resetCode);
    
    console.log(`🔑 Password reset code for ${email}: ${resetCode}`);
    
    res.json({ message: 'If the email exists, a reset code has been sent' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    
    const storedCode = resetCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (!hasUppercase || !hasNumber) {
      return res.status(400).json({ error: 'Password must include a capital letter and number' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    
    // Clear reset code
    resetCodes.delete(email);
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Profile photo upload
app.post('/api/user/photo', authenticateToken, (req, res) => {
  try {
    // In a real implementation, this would handle file upload to cloud storage
    // For MVP, we'll simulate a successful upload
    const photoUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${req.user.id}`;
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      users[userIndex].profilePhotoUrl = photoUrl;
    }
    
    res.json({ photoUrl });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Profile update route
app.put('/api/user/profile', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { fullName, email, preferredLanguage, learningStyle, teachingStyle, profilePhotoUrl } = req.body;

    // Update user profile
    users[userIndex] = {
      ...users[userIndex],
      fullName: fullName || users[userIndex].fullName,
      email: email || users[userIndex].email,
      preferredLanguage: preferredLanguage || users[userIndex].preferredLanguage,
      learningStyle: learningStyle || users[userIndex].learningStyle,
      teachingStyle: teachingStyle || users[userIndex].teachingStyle,
      profilePhotoUrl: profilePhotoUrl || users[userIndex].profilePhotoUrl,
      updatedAt: new Date().toISOString()
    };

    console.log('User profile updated:', users[userIndex].fullName);
    
    res.json({ user: { ...users[userIndex], password: undefined } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Password change route
app.put('/api/user/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    if (!hasUppercase || !hasNumber) {
      return res.status(400).json({ error: 'Password must include a capital letter and number' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date().toISOString();

    console.log('Password changed for user:', user.fullName);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.put('/api/user/onboarding', authenticateToken, (req, res) => {
  try {
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { classroomData, ...userData } = req.body;

    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...userData,
      onboardingStatus: 'complete',
      updatedAt: new Date().toISOString()
    };

    console.log('User onboarding completed:', users[userIndex].fullName);
    
    res.json({ user: { ...users[userIndex], password: undefined } });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Children Routes
app.get('/api/children', authenticateToken, (req, res) => {
  const userChildren = children.filter(child => {
    const classroom = classrooms.find(c => c.id === child.classroomId);
    return classroom && classroom.educatorId === req.user.id;
  });
  res.json({ children: userChildren });
});

app.post('/api/children', authenticateToken, (req, res) => {
  try {
    const { name, gradeBand, hasIEP, hasIFSP, developmentalNotes } = req.body;

    if (!name || !gradeBand) {
      return res.status(400).json({ error: 'Name and grade band required' });
    }

    // Get or create default classroom
    let userClassroom = classrooms.find(c => c.educatorId === req.user.id);
    if (!userClassroom) {
      const user = users.find(u => u.id === req.user.id);
      userClassroom = {
        id: Date.now().toString(),
        name: `${user.fullName.split(' ')[0]}'s Classroom`,
        gradeBand: 'Preschool (4-5 years old)',
        studentCount: 15,
        teacherStudentRatio: '1:8',
        stressors: [],
        educatorId: req.user.id,
        createdAt: new Date().toISOString()
      };
      classrooms.push(userClassroom);
    }

    const child = {
      id: Date.now().toString(),
      name,
      gradeBand,
      classroomId: userClassroom.id,
      hasIEP: hasIEP || false,
      hasIFSP: hasIFSP || false,
      developmentalNotes: developmentalNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    children.push(child);
    res.status(201).json({ child });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Classrooms Routes
app.get('/api/classrooms', authenticateToken, (req, res) => {
  const userClassrooms = classrooms.filter(c => c.educatorId === req.user.id);
  res.json({ classrooms: userClassrooms });
});

app.post('/api/classrooms', authenticateToken, (req, res) => {
  try {
    const classroom = {
      id: Date.now().toString(),
      ...req.body,
      educatorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    classrooms.push(classroom);
    res.status(201).json({ classroom });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update classroom
app.put('/api/classrooms/:id', authenticateToken, (req, res) => {
  try {
    const classroomIndex = classrooms.findIndex(c => c.id === req.params.id && c.educatorId === req.user.id);
    if (classroomIndex === -1) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    classrooms[classroomIndex] = {
      ...classrooms[classroomIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({ classroom: classrooms[classroomIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Behavior Logs Routes
app.get('/api/behavior-logs', authenticateToken, (req, res) => {
  const userLogs = behaviorLogs.filter(log => log.educatorId === req.user.id);
  res.json({ behaviorLogs: userLogs });
});

app.post('/api/behavior-logs', authenticateToken, (req, res) => {
  try {
    const behaviorLog = {
      id: Date.now().toString(),
      ...req.body,
      educatorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    behaviorLogs.push(behaviorLog);
    res.status(201).json({ behaviorLog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Classroom Logs Routes
app.get('/api/classroom-logs', authenticateToken, (req, res) => {
  const userLogs = classroomLogs.filter(log => log.educatorId === req.user.id);
  res.json({ classroomLogs: userLogs });
});

app.post('/api/classroom-logs', authenticateToken, (req, res) => {
  try {
    const classroomLog = {
      id: Date.now().toString(),
      ...req.body,
      educatorId: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    classroomLogs.push(classroomLog);
    res.status(201).json({ classroomLog });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Strategy Routes
app.post('/api/ai/child-strategy', authenticateToken, async (req, res) => {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { behaviorDescription, context, severity, educatorMood } = req.body;

    // Generate contextual response based on input
    const response = {
      warmAcknowledgment: `Thank you for sharing this with me. This child needs your support, and I'm glad they have you to help. ${educatorMood === 'overwhelmed' ? 'I can see this was overwhelming for you too.' : ''}`,
      observedBehavior: behaviorDescription,
      contextTrigger: `${context}, during classroom activities`,
      conceptualization: `This behavior is a normal part of child development. When children ${behaviorDescription.toLowerCase()}, they're often communicating important needs or working through developmental challenges.`,
      coreNeedsAndDevelopment: `**Core Needs:** Based on what you've described, this child needs safety and emotional regulation support, connection and reassurance from trusted adults, and opportunities to practice the skills they're still developing.\n\n**Developmental Context:** This behavior is very typical for children this age, as their executive function and emotional regulation systems are still developing rapidly.`,
      attachmentSupport: `To help this child feel safe and connected, you can get down to their eye level and use a calm, warm voice. Acknowledge their feelings with simple words like "I see you're having a hard time." Stay physically close and breathe calmly yourself - your regulation helps them regulate.`,
      practicalStrategies: [
        "**Connection First**: Get down to the child's eye level and acknowledge their feelings with simple, warm words like 'I see you're having a hard time.' Then, offer two simple choices that both lead to the same positive outcome.",
        "**Quiet Partnership**: Stand or sit near the child without immediately speaking. Sometimes your calm, supportive presence alone can help them regulate.",
        "**First-Then Structure**: Use clear, visual 'first-then' language: 'First we clean up the blocks, then we go outside.' Consider using pictures or gestures to support understanding."
      ],
      implementationGuidance: `Start with connection and safety first. Once the child is calm, then try the practical strategies. Try one strategy at a time and give it a few days to see if it's working. Remember, consistency is more important than perfection.`,
      whyStrategiesWork: `**Why These Strategies Work:** These approaches are grounded in attachment theory and developmental neuroscience. They work because they address the underlying need rather than just the surface behavior, helping children build lasting skills for emotional regulation and social connection.`,
      futureReadinessBenefit: `These strategies help build emotional regulation skills, develop trust in adult relationships, strengthen problem-solving abilities, and support resilience and confidence - all essential for success in school and life.`
    };

    res.json({ aiResponse: response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
});

app.post('/api/ai/classroom-strategy', authenticateToken, async (req, res) => {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { challengeDescription, context, severity } = req.body;

    const response = {
      conceptualization: `Group challenges often reflect the collective needs of developing children navigating social learning together. When ${challengeDescription.toLowerCase()}, the classroom community is working through important developmental tasks like cooperation, turn-taking, and emotional co-regulation.`,
      alignedStrategy: `Implement a 'Calm Down Together' routine: Use a visual cue (like dimming lights or playing soft music) to signal the whole group to take three deep breaths together. This creates collective regulation and teaches children that everyone sometimes needs to reset. Follow with a simple, engaging activity that rebuilds positive group energy.`,
      testOption: `Try 'Silent Signals': Develop hand gestures or visual cues that the whole class learns for common needs (bathroom, water, help). This reduces verbal disruptions while giving children agency to communicate their needs appropriately.`,
      futureReadinessBenefit: `These group strategies build classroom community, teach children to be aware of collective energy, and develop skills for collaboration and mutual support - critical abilities for thriving in our interconnected world.`
    };

    res.json({ aiResponse: response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate strategy' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Developer Portal Analytics Routes
app.get('/api/developer/analytics/app-level', (req, res) => {
  try {
    const allUsers = users;
    const allOrganizations = []; // Mock organizations for MVP
    const allBehaviorLogs = behaviorLogs;
    const allClassroomLogs = classroomLogs;
    const allChildren = children;
    const allClassrooms = classrooms;

    // Calculate app-level analytics
    const totalUsers = allUsers.length;
    const totalIndividualUsers = allUsers.filter(u => u.role === 'educator' && !u.organizationId).length;
    const totalOrganizationClients = allOrganizations.length;
    const totalOrgUsers = allUsers.filter(u => u.organizationId).length;

    // Activity-based user classification
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    const monthMs = 30 * dayMs;

    const getUserLastActivity = (userId) => {
      const userLogs = [...allBehaviorLogs, ...allClassroomLogs].filter(log => log.educatorId === userId);
      return userLogs.length > 0 ? Math.max(...userLogs.map(log => new Date(log.createdAt).getTime())) : 0;
    };

    const dailyActiveUsers = allUsers.filter(u => getUserLastActivity(u.id) > now - dayMs).length;
    const weeklyActiveUsers = allUsers.filter(u => getUserLastActivity(u.id) > now - weekMs).length;
    const monthlyActiveUsers = allUsers.filter(u => getUserLastActivity(u.id) > now - monthMs).length;
    const activeUsers = monthlyActiveUsers;
    const inactiveUsers = totalUsers - activeUsers;

    const avgBehaviorLogsPerUser = totalUsers > 0 ? allBehaviorLogs.length / totalUsers : 0;
    const avgClassroomLogsPerUser = totalUsers > 0 ? allClassroomLogs.length / totalUsers : 0;
    const avgConfidence = allBehaviorLogs.length > 0 ? 
      allBehaviorLogs.reduce((sum, log) => sum + (log.confidenceRating || 0), 0) / allBehaviorLogs.length : 0;

    const userRetentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

    const analytics = {
      totalUsers,
      totalIndividualUsers,
      totalOrganizationClients,
      totalOrgUsers,
      activeUsers,
      inactiveUsers,
      totalBehaviorLogs: allBehaviorLogs.length,
      totalClassroomLogs: allClassroomLogs.length,
      totalChildren: allChildren.length,
      avgBehaviorLogsPerUser: Math.round(avgBehaviorLogsPerUser * 10) / 10,
      avgClassroomLogsPerUser: Math.round(avgClassroomLogsPerUser * 10) / 10,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      userRetentionRate: Math.round(userRetentionRate * 10) / 10,
      dailyActiveUsers,
      weeklyActiveUsers,
      monthlyActiveUsers
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

app.get('/api/developer/analytics/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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
    const contextUsage = {};
    [...userBehaviorLogs, ...userClassroomLogs].forEach(log => {
      contextUsage[log.context] = (contextUsage[log.context] || 0) + 1;
    });

    // Severity distribution
    const severityDistribution = { low: 0, medium: 0, high: 0 };
    [...userBehaviorLogs, ...userClassroomLogs].forEach(log => {
      severityDistribution[log.severity]++;
    });

    const userAnalytics = {
      user: { ...user, password: undefined },
      totalLogs,
      avgConfidence: Math.round(avgConfidence * 10) / 10,
      childrenCount: userChildren.length,
      contextUsage,
      severityDistribution,
      lastActive: totalLogs > 0 ? 
        new Date(Math.max(...[...userBehaviorLogs, ...userClassroomLogs].map(log => new Date(log.createdAt).getTime()))).toLocaleDateString() : 
        'Never',
      engagementScore: Math.round((totalLogs / 30 + avgConfidence / 10) * 50) // Simplified engagement calculation
    };

    res.json({ userAnalytics });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to generate user analytics' });
  }
});

app.get('/api/developer/analytics/outliers', (req, res) => {
  try {
    const outliers = [];

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
      new Date(u.user.createdAt).getTime() < Date.now() - (14 * 24 * 60 * 60 * 1000)
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

    res.json({ outliers });
  } catch (error) {
    console.error('Outliers analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze outliers' });
  }
});

app.get('/api/developer/revenue', (req, res) => {
  try {
    const individualUsers = users.filter(u => u.role === 'educator' && !u.organizationId).length;
    const orgUsers = users.filter(u => u.organizationId).length;
    const organizations = 1; // Mock for MVP

    const individualARR = individualUsers * 297;
    const organizationARR = orgUsers * 29 * 12;
    const totalARR = individualARR + organizationARR;

    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    
    const activeUsers = users.filter(u => {
      const userLogs = [...behaviorLogs, ...classroomLogs].filter(log => log.educatorId === u.id);
      const lastActivity = userLogs.length > 0 ? Math.max(...userLogs.map(log => new Date(log.createdAt).getTime())) : 0;
      return lastActivity > now - monthMs;
    }).length;

    const retentionRate = users.length > 0 ? (activeUsers / users.length) * 100 : 0;

    const revenueData = {
      individualUsers,
      organizationClients: organizations,
      orgUsers,
      individualARR,
      organizationARR,
      totalARR,
      activeUsers,
      inactiveUsers: users.length - activeUsers,
      retentionRate: Math.round(retentionRate * 10) / 10,
      churnRisk: users.length - activeUsers
    };

    res.json({ revenueData });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to generate revenue analytics' });
  }
});

app.get('/api/developer/system-health', (req, res) => {
  try {
    const systemHealth = {
      components: [
        { name: 'Frontend (React + TypeScript)', status: 'Healthy', uptime: '99.9%' },
        { name: 'Backend API (Express + Node.js)', status: 'Healthy', uptime: '99.8%' },
        { name: 'Authentication System', status: 'Healthy', uptime: '100%' },
        { name: 'AI Strategy Engine', status: 'Healthy', uptime: '99.7%' },
        { name: 'Analytics Engine', status: 'Healthy', uptime: '99.9%' },
        { name: 'Knowledge Library', status: 'Healthy', uptime: '100%' }
      ],
      performance: {
        loadTime: '< 2s',
        apiResponse: '< 500ms',
        memoryUsage: 'Optimized',
        bundleSize: 'Efficient'
      },
      errors: {
        critical: 0,
        warnings: 0,
        info: 2
      }
    };

    res.json({ systemHealth });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ error: 'Failed to get system health' });
  }
});

app.post('/api/developer/data/reset', (req, res) => {
  try {
    // Reset to initial test data
    const testData = testDataManager.getAllData();
    users.length = 0;
    children.length = 0;
    classrooms.length = 0;
    behaviorLogs.length = 0;
    classroomLogs.length = 0;
    
    users.push(...testData.users);
    children.push(...testData.children);
    classrooms.push(...testData.classrooms);
    behaviorLogs.push(...testData.behaviorLogs);
    classroomLogs.push(...testData.classroomLogs);
    
    console.log('🔄 Data reset via API');
    res.json({ message: 'Data reset successfully' });
  } catch (error) {
    console.error('Data reset error:', error);
    res.status(500).json({ error: 'Failed to reset data' });
  }
});

app.post('/api/developer/data/generate', (req, res) => {
  try {
    const { count = 20 } = req.body;
    
    // Generate additional test behavior logs
    testDataManager.generateTestBehaviorLogs(count);
    const newData = testDataManager.getAllData();
    
    // Sync with server data
    behaviorLogs.length = 0;
    behaviorLogs.push(...newData.behaviorLogs);
    
    console.log(`📊 Generated ${count} additional behavior logs via API`);
    res.json({ message: `Generated ${count} additional behavior logs` });
  } catch (error) {
    console.error('Data generation error:', error);
    res.status(500).json({ error: 'Failed to generate data' });
  }
});

// Knowledge base management routes
app.get('/api/developer/knowledge-base', (req, res) => {
  try {
    // Mock knowledge base data for MVP
    const knowledgeBase = {
      frameworks: [
        {
          id: 'attachment_theory',
          name: 'Attachment Theory',
          coreIdea: 'Children need a secure base; behavior often signals a need for safety/connection.',
          productPrinciples: [
            'Use warm, supportive tone in all interactions',
            'Assume skill-building needs, not willful defiance',
            'Prioritize co-regulation prompts before teaching',
            'Frame behaviors as communication of needs'
          ]
        },
        {
          id: 'iecmh',
          name: 'Infant & Early Childhood Mental Health (IECMH)',
          coreIdea: 'Relationships drive regulation and learning.',
          productPrinciples: [
            'Include adult co-regulation in all strategies',
            'Emphasize frequent, predictable routines',
            'Suggest gentle, predictable transitions',
            'Support educator emotional state as part of system'
          ]
        }
      ],
      templates: [
        {
          id: 'connection_before_direction',
          name: 'Connection Before Direction',
          frameworks: ['attachment_theory', 'iecmh', 'trauma_informed_care'],
          template: 'First, get down to the child\'s eye level and acknowledge their feelings with simple, warm words like "I see you\'re having a hard time." Then, offer two simple choices that both lead to the same positive outcome.'
        }
      ],
      guidelines: [
        {
          id: 'plain_language',
          category: 'tone',
          rule: 'Use plain, nonjudgmental language that assumes positive intent',
          examples: [
            { preferred: 'had a hard time starting the activity', avoid: 'refused to participate' }
          ]
        }
      ]
    };

    res.json({ knowledgeBase });
  } catch (error) {
    console.error('Knowledge base error:', error);
    res.status(500).json({ error: 'Failed to get knowledge base' });
  }
});

app.put('/api/developer/knowledge-base/framework/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log(`📚 Framework update request for ${id}:`, updates);
    
    // In a real implementation, this would update the knowledge base
    res.json({ message: 'Framework updated successfully', frameworkId: id });
  } catch (error) {
    console.error('Framework update error:', error);
    res.status(500).json({ error: 'Failed to update framework' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Lumi Core API server running on port ${PORT}`);
  console.log(`📊 Mock data initialized:`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Children: ${children.length}`);
  console.log(`   - Classrooms: ${classrooms.length}`);
  console.log(`   - Behavior Logs: ${behaviorLogs.length}`);
  console.log(`   - Classroom Logs: ${classroomLogs.length}`);
});