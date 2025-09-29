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