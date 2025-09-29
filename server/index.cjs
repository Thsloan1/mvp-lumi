const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'lumi-secret-key-change-in-production';

// Initialize Express app
const app = express();

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

// Update child
app.put('/api/children/:id', authenticateToken, (req, res) => {
  try {
    const childIndex = children.findIndex(c => c.id === req.params.id);
    if (childIndex === -1) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Verify ownership through classroom
    const child = children[childIndex];
    const classroom = classrooms.find(c => c.id === child.classroomId);
    if (!classroom || classroom.educatorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    children[childIndex] = {
      ...children[childIndex],
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    res.json({ child: children[childIndex] });
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

// Admin signup route
app.post('/api/auth/admin-signup', async (req, res) => {
  try {
    const { fullName, email, password, organizationName, organizationType, jobTitle } = req.body;

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
    if (!organizationName?.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }
    if (!organizationType) {
      return res.status(400).json({ error: 'Organization type is required' });
    }
    if (!jobTitle?.trim()) {
      return res.status(400).json({ error: 'Job title is required' });
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

    // Create admin user
    const user = {
      id: Date.now().toString(),
      fullName,
      email,
      password: hashedPassword,
      role: 'admin',
      preferredLanguage: 'english',
      onboardingStatus: 'incomplete',
      organizationName,
      organizationType,
      jobTitle,
      createdAt: new Date().toISOString()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Admin user created:', user.fullName, 'for', organizationName);

    res.status(201).json({
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Organization creation route
app.post('/api/organizations', authenticateToken, (req, res) => {
  try {
    const { name, type, plan, maxSeats, paymentData } = req.body;
    
    if (!name || !type || !plan || !maxSeats) {
      return res.status(400).json({ error: 'Organization details required' });
    }

    const organization = {
      id: Date.now().toString(),
      name,
      type,
      plan,
      maxSeats,
      activeSeats: 1, // Admin user
      ownerId: req.user.id,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Store organization (in real app, this would be in database)
    console.log('Organization created:', organization.name);
    
    res.status(201).json({ organization });
  } catch (error) {
    console.error('Organization creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Organization invitations route
app.post('/api/organizations/invitations', authenticateToken, (req, res) => {
  try {
    const { educators } = req.body;
    
    if (!educators || !Array.isArray(educators)) {
      return res.status(400).json({ error: 'Educators list required' });
    }

    // Validate educator data
    const validEducators = educators.filter(educator => 
      educator.email && educator.firstName && educator.lastName
    );

    if (validEducators.length === 0) {
      return res.status(400).json({ error: 'No valid educators to invite' });
    }

    // Generate invitation codes and send emails (simulated)
    const invitations = validEducators.map(educator => ({
      id: Date.now().toString() + Math.random(),
      email: educator.email,
      firstName: educator.firstName,
      lastName: educator.lastName,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: 'sent',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    console.log('Invitations sent to:', validEducators.map(e => e.email).join(', '));
    
    res.status(201).json({ 
      invitations,
      message: `Sent ${validEducators.length} invitation${validEducators.length !== 1 ? 's' : ''}` 
    });
  } catch (error) {
    console.error('Invitation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Invitation validation route
app.get('/api/invitations/validate', (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    // Mock validation - in real app, this would check database
    const mockInvitation = {
      valid: true,
      invitation: {
        email: 'sarah.johnson@example.com',
        organizationName: 'Sunshine Elementary School',
        inviterName: 'Dr. Maria Rodriguez',
        organizationId: 'org-123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    
    res.json(mockInvitation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Invitation acceptance route
app.post('/api/invitations/accept', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }
    
    // Mock acceptance - in real app, this would update database
    const result = {
      success: true,
      invitation: {
        email: 'sarah.johnson@example.com',
        organizationId: 'org-123',
        organizationName: 'Sunshine Elementary School'
      }
    };
    
    console.log('Invitation accepted for:', result.invitation.email);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Organization stats route
app.get('/api/organizations/stats', authenticateToken, (req, res) => {
  try {
    // Mock organization stats for MVP
    const stats = {
      totalEducators: 12,
      activeSeats: 12,
      maxSeats: 15,
      pendingInvitations: 3,
      totalBehaviorLogs: behaviorLogs.length,
      totalClassroomLogs: classroomLogs.length,
      subscriptionStatus: 'active',
      currentPeriodEnd: '2024-12-15',
      plan: 'Organization Pro'
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Organization settings update route
app.put('/api/organizations/settings', authenticateToken, (req, res) => {
  try {
    const { name, type, settings } = req.body;
    
    // Mock organization update for MVP
    console.log('Organization settings updated:', { name, type, settings });
    
    res.json({ 
      message: 'Organization settings updated successfully',
      organization: { name, type, settings }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Transfer ownership route
app.post('/api/organizations/transfer-ownership', authenticateToken, (req, res) => {
  try {
    const { newOwnerEmail, reason } = req.body;
    
    if (!newOwnerEmail || !reason) {
      return res.status(400).json({ error: 'New owner email and reason required' });
    }
    
    // Mock ownership transfer for MVP
    console.log('Ownership transfer initiated:', { newOwnerEmail, reason });
    
    res.json({ 
      message: 'Ownership transfer initiated',
      newOwner: newOwnerEmail
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Subscription management routes
app.post('/api/subscriptions/upgrade', authenticateToken, (req, res) => {
  try {
    const { plan } = req.body;
    
    console.log('Subscription upgrade requested:', plan);
    
    res.json({ 
      message: 'Subscription upgraded successfully',
      newPlan: plan
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/subscriptions/cancel', authenticateToken, (req, res) => {
  try {
    console.log('Subscription cancellation requested');
    
    res.json({ 
      message: 'Subscription will be cancelled at the end of current period',
      cancelAtPeriodEnd: true
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/subscriptions/add-seats', authenticateToken, (req, res) => {
  try {
    const { seatCount } = req.body;
    
    if (!seatCount || seatCount < 1) {
      return res.status(400).json({ error: 'Valid seat count required' });
    }
    
    console.log('Adding seats:', seatCount);
    
    res.json({ 
      message: `Added ${seatCount} seats successfully`,
      newSeatCount: 15 + seatCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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