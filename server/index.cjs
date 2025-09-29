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

app.listen(PORT, () => {
  console.log(`🚀 Lumi Core API server running on port ${PORT}`);
});