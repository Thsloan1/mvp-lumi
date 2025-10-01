const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Lumi Backend API'
  });
});

// Authentication endpoints
app.post('/api/auth/signup', (req, res) => {
  const { fullName, email, password } = req.body;
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Create mock user
  const user = {
    id: Date.now().toString(),
    fullName,
    firstName: fullName.split(' ')[0],
    lastName: fullName.split(' ').slice(1).join(' '),
    email,
    role: 'educator',
    preferredLanguage: 'english',
    learningStyle: '',
    teachingStyle: '',
    onboardingStatus: 'incomplete',
    createdAt: new Date()
  };
  
  const token = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000
  })).toString('base64');
  
  res.json({ user, token });
});

app.post('/api/auth/signin', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }
  
  // Test users
  const testUsers = [
    {
      id: 'educator-1',
      fullName: 'Sarah Johnson',
      email: 'sarah.educator@test.lumi.app',
      role: 'educator',
      preferredLanguage: 'english',
      learningStyle: 'I learn best with visuals',
      teachingStyle: 'We learn together',
      onboardingStatus: 'complete',
      createdAt: new Date()
    },
    {
      id: 'admin-1',
      fullName: 'Dr. Michael Chen',
      email: 'admin@test.lumi.app',
      role: 'admin',
      preferredLanguage: 'english',
      learningStyle: 'A mix of all works for me',
      onboardingStatus: 'complete',
      createdAt: new Date()
    }
  ];
  
  const user = testUsers.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const token = Buffer.from(JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 24 * 60 * 60 * 1000
  })).toString('base64');
  
  res.json({ user, token });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const token = authHeader.substring(7);
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (tokenData.exp <= Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    // Return user data (would normally fetch from database)
    const user = {
      id: tokenData.id,
      email: tokenData.email,
      role: tokenData.role,
      fullName: tokenData.email === 'admin@test.lumi.app' ? 'Dr. Michael Chen' : 'Sarah Johnson',
      preferredLanguage: 'english',
      onboardingStatus: 'complete'
    };
    
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Onboarding endpoint
app.put('/api/user/onboarding', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const token = authHeader.substring(7);
    const tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (tokenData.exp <= Date.now()) {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    const onboardingData = req.body;
    
    // Update user with onboarding data
    const updatedUser = {
      id: tokenData.id,
      fullName: onboardingData.fullName || tokenData.email,
      email: tokenData.email,
      role: tokenData.role,
      preferredLanguage: onboardingData.preferredLanguage || 'english',
      learningStyle: onboardingData.learningStyle || '',
      teachingStyle: onboardingData.teachingStyle || '',
      onboardingStatus: 'complete',
      createdAt: new Date()
    };
    
    res.json({ user: updatedUser });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Basic API endpoints for development
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running successfully' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend server running on http://127.0.0.1:${PORT}`);
  console.log(`Health check available at http://127.0.0.1:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});