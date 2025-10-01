const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { testDataManager } = require('./testDataManager.cjs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-for-development';

// Middleware
app.use(cors());
app.use(express.json());

// Get test data
let users = testDataManager.getAllData().users;
let children = testDataManager.getAllData().children;
let classrooms = testDataManager.getAllData().classrooms;
let behaviorLogs = testDataManager.getAllData().behaviorLogs;
let classroomLogs = testDataManager.getAllData().classroomLogs;
let organizations = testDataManager.getAllData().organizations;
let invitations = testDataManager.getAllData().invitations;

// Store for verification codes
const verificationCodes = new Map();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('User created:', user.fullName, user.email);

    res.status(201).json({
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('User signed in:', user.fullName, user.email);

    res.json({
      user: { ...user, password: undefined },
      token
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: { ...user, password: undefined } });
  } catch (error) {
    console.error('Get user error:', error);
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

// Data Routes
app.get('/api/children', authenticateToken, (req, res) => {
  try {
    const userChildren = children.filter(child => {
      const classroom = classrooms.find(c => c.id === child.classroomId);
      return classroom && classroom.educatorId === req.user.id;
    });
    res.json({ children: userChildren });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/children', authenticateToken, (req, res) => {
  try {
    const child = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    children.push(child);
    res.status(201).json({ child });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/classrooms', authenticateToken, (req, res) => {
  try {
    const userClassrooms = classrooms.filter(c => c.educatorId === req.user.id);
    res.json({ classrooms: userClassrooms });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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

app.get('/api/behavior-logs', authenticateToken, (req, res) => {
  try {
    const userBehaviorLogs = behaviorLogs.filter(log => log.educatorId === req.user.id);
    res.json({ behaviorLogs: userBehaviorLogs });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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

app.get('/api/classroom-logs', authenticateToken, (req, res) => {
  try {
    const userClassroomLogs = classroomLogs.filter(log => log.educatorId === req.user.id);
    res.json({ classroomLogs: userClassroomLogs });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
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
app.post('/api/ai/child-strategy', authenticateToken, (req, res) => {
  try {
    // Mock AI response for development
    const aiResponse = {
      warmAcknowledgment: "Thank you for sharing this with me. This child needs your support, and I'm glad they have you to help.",
      observedBehavior: req.body.behaviorDescription,
      contextTrigger: `${req.body.context}, ${req.body.timeOfDay || 'during the day'}`,
      conceptualization: "This behavior is a normal part of child development. The child is working through important developmental tasks.",
      coreNeedsAndDevelopment: "This child is expressing a need for connection, predictability, and support. This aligns with typical development for their age.",
      attachmentSupport: "Get down to their eye level, use a calm voice, and acknowledge their feelings with simple words like 'I see you're having a hard time.'",
      practicalStrategies: [
        "**Connection First**: Prioritize emotional safety before any directions",
        "**Choice Within Structure**: Offer two good choices that both lead to positive outcomes",
        "**Calm Partnership**: Stay physically close and breathe calmly yourself"
      ],
      implementationGuidance: "Start with connection and safety first. Once the child is calm, then try the practical strategies.",
      whyStrategiesWork: "These approaches address the child's underlying needs for safety and connection rather than just the surface behavior.",
      futureReadinessBenefit: "These strategies help develop emotional regulation, problem-solving skills, and trust in relationships."
    };

    res.json({ aiResponse });
  } catch (error) {
    console.error('AI strategy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/ai/classroom-strategy', authenticateToken, (req, res) => {
  try {
    // Mock AI response for development
    const aiResponse = {
      conceptualization: "Group challenges often reflect the collective needs of developing children navigating social learning together.",
      alignedStrategy: "Implement a 'Calm Down Together' routine: Use a visual cue to signal the whole group to take three deep breaths together.",
      testOption: "Try 'Silent Signals': Develop hand gestures for common needs to reduce verbal disruptions.",
      futureReadinessBenefit: "These strategies build classroom community and teach children to be aware of collective energy."
    };

    res.json({ aiResponse });
  } catch (error) {
    console.error('AI strategy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Audit logging endpoint
app.post('/api/audit/log', authenticateToken, (req, res) => {
  try {
    const auditEntry = req.body;
    
    // Validate audit entry
    if (!auditEntry.action || !auditEntry.resourceType) {
      return res.status(400).json({ error: 'Invalid audit entry: action and resourceType required' });
    }

    // In production, this would save to a secure audit database
    // For development, we'll log to console and store in memory
    console.log('📋 AUDIT LOG:', {
      timestamp: auditEntry.timestamp,
      user: auditEntry.userEmail,
      action: auditEntry.action,
      resource: auditEntry.resourceType,
      success: auditEntry.success,
      riskLevel: auditEntry.riskLevel
    });

    // Store audit log (in production, this would be a secure database)
    const auditLogs = global.auditLogs || [];
    auditLogs.push(auditEntry);
    global.auditLogs = auditLogs;

    res.status(201).json({ 
      message: 'Audit log recorded successfully',
      logId: auditEntry.id 
    });
  } catch (error) {
    console.error('Audit logging error:', error);
    res.status(500).json({ error: 'Failed to record audit log' });
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

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Backend server running on http://127.0.0.1:${PORT}`);
  console.log('📊 Test data loaded:', {
    users: users.length,
    children: children.length,
    classrooms: classrooms.length,
    behaviorLogs: behaviorLogs.length,
    classroomLogs: classroomLogs.length
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});