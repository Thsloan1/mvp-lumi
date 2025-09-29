@@ .. @@
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

+// Profile update route
+app.put('/api/user/profile', authenticateToken, (req, res) => {
+  try {
+    const userIndex = users.findIndex(u => u.id === req.user.id);
+    if (userIndex === -1) {
+      return res.status(404).json({ error: 'User not found' });
+    }
+
+    const { fullName, email, preferredLanguage, learningStyle, teachingStyle, profilePhotoUrl } = req.body;
+
+    // Update user profile
+    users[userIndex] = {
+      ...users[userIndex],
+      fullName: fullName || users[userIndex].fullName,
+      email: email || users[userIndex].email,
+      preferredLanguage: preferredLanguage || users[userIndex].preferredLanguage,
+      learningStyle: learningStyle || users[userIndex].learningStyle,
+      teachingStyle: teachingStyle || users[userIndex].teachingStyle,
+      profilePhotoUrl: profilePhotoUrl || users[userIndex].profilePhotoUrl,
+      updatedAt: new Date().toISOString()
+    };
+
+    console.log('User profile updated:', users[userIndex].fullName);
+    
+    res.json({ user: { ...users[userIndex], password: undefined } });
+  } catch (error) {
+    console.error('Profile update error:', error);
+    res.status(500).json({ error: 'Server error' });
+  }
+});
+
+// Password change route
+app.put('/api/user/password', authenticateToken, async (req, res) => {
+  try {
+    const { currentPassword, newPassword } = req.body;
+    
+    if (!currentPassword || !newPassword) {
+      return res.status(400).json({ error: 'Current and new passwords are required' });
+    }
+
+    const user = users.find(u => u.id === req.user.id);
+    if (!user) {
+      return res.status(404).json({ error: 'User not found' });
+    }
+
+    // Verify current password
+    const validPassword = await bcrypt.compare(currentPassword, user.password);
+    if (!validPassword) {
+      return res.status(400).json({ error: 'Current password is incorrect' });
+    }
+
+    // Validate new password
+    if (newPassword.length < 8) {
+      return res.status(400).json({ error: 'Password must be at least 8 characters' });
+    }
+    
+    const hasUppercase = /[A-Z]/.test(newPassword);
+    const hasNumber = /\d/.test(newPassword);
+    if (!hasUppercase || !hasNumber) {
+      return res.status(400).json({ error: 'Password must include a capital letter and number' });
+    }
+
+    // Hash new password
+    const hashedPassword = await bcrypt.hash(newPassword, 10);
+    user.password = hashedPassword;
+    user.updatedAt = new Date().toISOString();
+
+    console.log('Password changed for user:', user.fullName);
+    
+    res.json({ message: 'Password updated successfully' });
+  } catch (error) {
+    console.error('Password change error:', error);
+    res.status(500).json({ error: 'Server error' });
+  }
+});
+
 // Email verification routes