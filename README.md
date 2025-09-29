# Lumi: Classroom Behavior Coach

A comprehensive platform for educators to get AI-powered strategies for challenging behaviors and classroom management.

## 🚀 Quick Start

### Development Environment
```bash
npm install
npm run dev:full
```

### Test Environment
```bash
npm run test:env
```

## 🧪 Test Environment Guide

### Available Test Environments

1. **Development** - Local development with hot reload
2. **Test** - Isolated testing with persistent data
3. **Staging** - Production-like environment for final testing
4. **Production** - Live environment

### Test Users

| User Type | Email | Password | Role | Status |
|-----------|-------|----------|------|--------|
| Educator (Complete) | sarah.educator@test.lumi.app | Test123! | educator | complete |
| Educator (Spanish) | maria.educator@test.lumi.app | Test123! | educator | complete |
| Admin | admin@test.lumi.app | Test123! | admin | complete |
| New Educator | emma.new@test.lumi.app | Test123! | educator | incomplete |

### Test Scenarios

#### 1. **Fresh Educator Flow**
- New user signup and onboarding
- Empty state handling
- First behavior log creation
- Dashboard population

#### 2. **Experienced Educator Flow**
- Login with existing data
- Analytics and insights
- Pattern recognition
- Strategy effectiveness

#### 3. **Admin User Flow**
- Organization management
- Educator invitations
- Seat management
- Analytics overview

#### 4. **Invited User Flow**
- Invitation validation
- Account creation
- Organization integration
- Team collaboration

### Using the Test Panel

1. **Access**: Click the purple "Test Panel" button (bottom-right in test environments)
2. **Quick Login**: Select any test user and login instantly
3. **Scenarios**: Run pre-configured test scenarios
4. **Data Management**: Reset, generate, or export test data

### Test Data Management

```bash
# Reset all test data
npm run test:reset

# Generate additional sample data
npm run test:generate
```

## 🔧 Environment Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Environment
VITE_ENVIRONMENT=development

# Features
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_TEST_PANEL=true

# External Services (staging/production only)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### Feature Flags

- `VITE_ENABLE_MOCK_DATA` - Use mock data instead of real API
- `VITE_ENABLE_TEST_PANEL` - Show test environment panel
- `VITE_ENABLE_ANALYTICS` - Enable analytics tracking
- `VITE_ENABLE_PAYMENTS` - Enable payment processing

## 🧪 Testing Workflows

### 1. **Educator User Testing**
```bash
# Start test environment
npm run test:env

# Test fresh educator
1. Click "Fresh Educator" scenario
2. Complete signup flow
3. Go through onboarding
4. Test behavior logging
5. Verify analytics

# Test experienced educator
1. Click "Experienced Educator" scenario
2. Login with existing data
3. Test dashboard insights
4. Verify pattern recognition
```

### 2. **Admin User Testing**
```bash
# Test admin setup
1. Click "Admin Setup" scenario
2. Test organization creation
3. Invite educators
4. Manage subscriptions
5. View analytics

# Test seat management
1. Add educators near limit
2. Test upgrade prompts
3. Verify seat tracking
```

### 3. **Invited User Testing**
```bash
# Test invitation flow
1. Click "Invited User" scenario
2. Validate invitation
3. Create account
4. Complete onboarding
5. Access organization features
```

## 📊 Production Readiness

### All User Flows: **100% Production Ready**

#### ✅ **Educator User (100%)**
- Complete authentication & onboarding
- AI-powered behavior strategies
- Comprehensive analytics
- Profile & subscription management

#### ✅ **Admin User (100%)**
- Organization setup & management
- Educator invitation & management
- Advanced analytics & reporting
- Subscription & billing management

#### ✅ **Invited User (100%)**
- Secure invitation validation
- Seamless account creation
- Organization integration
- Standard onboarding flow

### Enterprise Features
- Multi-tenant architecture
- Role-based permissions
- Seat-based billing
- Audit logging
- Data export capabilities

## 🚀 Deployment

### Staging Deployment
```bash
VITE_ENVIRONMENT=staging npm run build
```

### Production Deployment
```bash
VITE_ENVIRONMENT=production npm run build
```

## 🔒 Security

- JWT token authentication
- Password encryption (bcrypt)
- Role-based access control
- Organization data isolation
- Audit logging for compliance

## 📚 Knowledge Library Management

### Accessing the Knowledge Library Manager

The Knowledge Library Manager allows you to update Lumi's core clinical foundations:

#### **For Admin Users:**
1. Login as admin user
2. Go to Admin Dashboard
3. Click "Knowledge Library" in Quick Actions
4. Access the comprehensive management interface

#### **For Test Environment:**
1. Open Test Panel (purple button)
2. Click "Knowledge Library" button
3. Direct access to management interface

### **What You Can Manage:**

#### **1. Theoretical Frameworks:**
- **Attachment Theory** - Core principles for connection-based strategies
- **IECMH** - Infant & Early Childhood Mental Health approaches
- **Developmental Neuroscience** - Brain-based understanding of behavior
- **Trauma-Informed Care** - Safety and choice-focused interventions
- **SEL** - Social-Emotional Learning competencies
- **Culturally Responsive** - Honoring family and cultural strengths

#### **2. Strategy Templates:**
- **Connection Before Direction** - Attachment-based approach
- **Quiet Partnership** - Co-regulation strategies
- **First-Then Structure** - Executive function support
- **Calm Down Together** - Group regulation techniques
- **Choice Within Structure** - Autonomy-supporting approaches

#### **3. Language Guidelines:**
- **Plain Language** - Nonjudgmental, accessible communication
- **Skill Building** - Growth-focused rather than compliance-focused
- **Developmental Normal** - Normalizing variability and avoiding pathologizing
- **Shared Responsibility** - "We" framing for collaboration
- **Connection First** - Prioritizing safety before skill practice
- **Cultural Respect** - Honoring family practices and strengths

### **Knowledge Library Features:**

#### **✅ Framework Management:**
- Edit core principles and product guidelines
- Update AI hooks and language patterns
- Modify avoidance patterns and contraindications
- Version control with change tracking

#### **✅ Strategy Template System:**
- Create new evidence-based strategy templates
- Map strategies to specific frameworks
- Define age groups, contexts, and severity levels
- Include implementation variations and benefits

#### **✅ Language Guidelines:**
- Maintain preferred vs. avoided language patterns
- Update cultural responsiveness guidelines
- Modify tone and framing rules
- Ensure consistency across all AI outputs

#### **✅ Import/Export Capabilities:**
- **Export** complete knowledge base for backup
- **Import** updated frameworks from research teams
- **Version control** with dated backups
- **Collaboration** with clinical experts and researchers

### **Clinical Foundation Updates:**

The Knowledge Library Manager allows authorized users to:

1. **Update Research Integration** - Incorporate latest developmental science
2. **Refine AI Responses** - Improve strategy generation quality
3. **Enhance Cultural Responsiveness** - Add new language patterns
4. **Expand Framework Coverage** - Include additional theoretical approaches
5. **Improve Language Guidelines** - Ensure trauma-informed, strengths-based communication

### **Quality Assurance:**
- All changes are logged with timestamps and user attribution
- Framework updates automatically propagate to AI strategy generation
- Language guideline changes immediately affect all new outputs
- Export/import system ensures backup and collaboration capabilities

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-optimized interactions
- Mobile-first navigation
- Offline capability ready

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- High contrast mode ready
- Reduced motion support