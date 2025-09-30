// Email service for test user invitations and notifications
export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface TestUserInvitation {
  name: string;
  email: string;
  accessCode: string;
  role: string;
  modules: string[];
  expiresAt?: string;
  inviterName: string;
}

export class EmailService {
  private static readonly API_KEY = import.meta.env.VITE_RESEND_API_KEY;
  private static readonly FROM_EMAIL = 'noreply@lumi.app';

  // Send test user invitation email
  static async sendTestUserInvitation(invitation: TestUserInvitation): Promise<boolean> {
    try {
      const template = this.generateTestInvitationTemplate(invitation);
      
      // In development/test environment, simulate email sending
      if (import.meta.env.VITE_ENVIRONMENT === 'development' || import.meta.env.VITE_ENVIRONMENT === 'test') {
        console.log('📧 TEST EMAIL SENT');
        console.log('To:', invitation.email);
        console.log('Subject:', template.subject);
        console.log('Access Code:', invitation.accessCode);
        console.log('Content:', template.textContent);
        
        // Show in browser console for easy access
        this.displayEmailInConsole(invitation, template);
        
        return true;
      }

      // Production email sending with Resend
      if (this.API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: this.FROM_EMAIL,
            to: invitation.email,
            subject: template.subject,
            html: template.htmlContent,
            text: template.textContent
          })
        });

        if (!response.ok) {
          throw new Error(`Email API error: ${response.status}`);
        }

        return true;
      }

      // Fallback: Store email for manual delivery
      this.storeEmailForManualDelivery(invitation, template);
      return true;

    } catch (error) {
      console.error('Failed to send test user invitation:', error);
      return false;
    }
  }

  // Generate test invitation email template
  private static generateTestInvitationTemplate(invitation: TestUserInvitation): EmailTemplate {
    const subject = `Lumi Test Access - Your Access Code: ${invitation.accessCode}`;
    
    const textContent = `Hi ${invitation.name},

You've been invited to test Lumi: Classroom Behavior Coach!

ACCESS DETAILS:
• Access Code: ${invitation.accessCode}
• Role: ${invitation.role}
• Modules: ${invitation.modules.join(', ') || 'All modules'}
${invitation.expiresAt ? `• Expires: ${new Date(invitation.expiresAt).toLocaleDateString()}` : '• No expiration'}

HOW TO ACCESS:
1. Go to https://lumi.app
2. Click "Developer Portal" (purple button, bottom-right)
3. Enter your access code: ${invitation.accessCode}
4. Start testing!

WHAT TO TEST:
• Complete user onboarding flows
• Log behaviors and get AI strategies
• Test family communication features
• Explore the resource library
• Try admin organization management

FEEDBACK:
Please submit feedback using the green "Submit Feedback" button while testing. Your insights help us improve Lumi for educators.

Questions? Reply to this email or contact: support@lumi.app

Thank you for helping us make Lumi better!

The Lumi Team
Human Potential Partners`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lumi Test Access Invitation</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #1A1A1A; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #C44E38 0%, #E88B6F 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .access-code { background: #F8F6F4; border: 2px solid #C44E38; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #C44E38; letter-spacing: 4px; font-family: monospace; }
    .steps { background: #F8F6F4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .step { margin: 10px 0; padding-left: 20px; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E6E2DD; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌟 Lumi</div>
      <h1>Test Access Invitation</h1>
      <p>You've been invited to test Lumi: Classroom Behavior Coach</p>
    </div>

    <h2>Hi ${invitation.name},</h2>
    
    <p>Welcome to the Lumi testing program! You've been selected to help us improve our AI-powered classroom behavior support platform.</p>

    <div class="access-code">
      <h3>Your Access Code</h3>
      <div class="code">${invitation.accessCode}</div>
      <p><strong>Keep this code handy - you'll need it to access the testing environment</strong></p>
    </div>

    <div class="steps">
      <h3>How to Get Started:</h3>
      <div class="step">1. Go to <a href="https://lumi.app" style="color: #C44E38;">https://lumi.app</a></div>
      <div class="step">2. Click the purple "Developer Portal" button (bottom-right corner)</div>
      <div class="step">3. Enter your access code: <strong>${invitation.accessCode}</strong></div>
      <div class="step">4. Start exploring and testing!</div>
    </div>

    <h3>Your Testing Details:</h3>
    <ul>
      <li><strong>Role:</strong> ${invitation.role}</li>
      <li><strong>Access Level:</strong> ${invitation.modules.join(', ') || 'All modules'}</li>
      ${invitation.expiresAt ? `<li><strong>Expires:</strong> ${new Date(invitation.expiresAt).toLocaleDateString()}</li>` : '<li><strong>Expires:</strong> No expiration</li>'}
    </ul>

    <h3>What to Test:</h3>
    <ul>
      <li>Complete educator onboarding flow</li>
      <li>Log child behaviors and get AI strategies</li>
      <li>Test family communication features</li>
      <li>Explore the resource library</li>
      <li>Try organization management (if admin access)</li>
    </ul>

    <div style="background: #E8F5E8; border: 1px solid #4CAF50; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <h4 style="color: #2E7D32; margin: 0 0 10px 0;">💡 Feedback is Crucial!</h4>
      <p style="margin: 0; color: #2E7D32;">Please use the green "Submit Feedback" button while testing. Your insights directly improve Lumi for educators.</p>
    </div>

    <p>Questions or issues? Reply to this email or contact <a href="mailto:support@lumi.app" style="color: #C44E38;">support@lumi.app</a></p>

    <div class="footer">
      <p>Thank you for helping us build better tools for educators!</p>
      <p><strong>The Lumi Team</strong><br>Human Potential Partners</p>
    </div>
  </div>
</body>
</html>`;

    return {
      subject,
      htmlContent,
      textContent
    };
  }

  // Display email in console for development
  private static displayEmailInConsole(invitation: TestUserInvitation, template: EmailTemplate) {
    console.group('📧 TEST USER INVITATION EMAIL');
    console.log('📬 To:', invitation.email);
    console.log('👤 Name:', invitation.name);
    console.log('🔑 Access Code:', invitation.accessCode);
    console.log('📋 Role:', invitation.role);
    console.log('📅 Expires:', invitation.expiresAt || 'No expiration');
    console.log('📝 Subject:', template.subject);
    console.log('📄 Full Email Content:');
    console.log(template.textContent);
    console.groupEnd();
    
    // Create a visual notification
    this.showEmailNotification(invitation);
  }

  // Show visual notification for sent email
  private static showEmailNotification(invitation: TestUserInvitation) {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: #4CAF50; 
        color: white; 
        padding: 15px 20px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 350px;
        font-family: Inter, sans-serif;
        cursor: pointer;
      ">
        <div style="font-weight: bold; margin-bottom: 5px;">📧 Test Invitation Sent!</div>
        <div style="font-size: 14px; opacity: 0.9;">
          To: ${invitation.email}<br>
          Access Code: <strong>${invitation.accessCode}</strong>
        </div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
          Click to copy access code • Check console for full email
        </div>
      </div>
    `;
    
    // Add click to copy functionality
    notification.addEventListener('click', () => {
      navigator.clipboard.writeText(invitation.accessCode);
      notification.style.background = '#2196F3';
      notification.querySelector('div')!.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">📋 Access Code Copied!</div>
        <div style="font-size: 14px; opacity: 0.9;">
          Code: <strong>${invitation.accessCode}</strong><br>
          Ready to share with tester
        </div>
      `;
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  // Store email for manual delivery (fallback)
  private static storeEmailForManualDelivery(invitation: TestUserInvitation, template: EmailTemplate) {
    const emailData = {
      to: invitation.email,
      subject: template.subject,
      content: template.textContent,
      accessCode: invitation.accessCode,
      createdAt: new Date().toISOString()
    };

    const pendingEmails = JSON.parse(localStorage.getItem('lumi_pending_emails') || '[]');
    pendingEmails.push(emailData);
    localStorage.setItem('lumi_pending_emails', JSON.stringify(pendingEmails));

    console.log('📧 Email stored for manual delivery:', emailData);
  }

  // Send feedback notification to development team
  static async sendFeedbackNotification(feedback: any): Promise<boolean> {
    try {
      const template = this.generateFeedbackNotificationTemplate(feedback);
      
      // In development, log to console
      if (import.meta.env.VITE_ENVIRONMENT === 'development' || import.meta.env.VITE_ENVIRONMENT === 'test') {
        console.log('📧 FEEDBACK NOTIFICATION');
        console.log('From:', feedback.testerName);
        console.log('Rating:', feedback.rating + '/5 stars');
        console.log('Category:', feedback.category);
        console.log('Priority:', feedback.priority);
        console.log('Feedback:', feedback.feedback);
        return true;
      }

      // Production email sending would go here
      return true;
    } catch (error) {
      console.error('Failed to send feedback notification:', error);
      return false;
    }
  }

  private static generateFeedbackNotificationTemplate(feedback: any): EmailTemplate {
    const subject = `Lumi Test Feedback: ${feedback.category} (${feedback.priority} priority)`;
    
    const textContent = `New test feedback received for Lumi:

FEEDBACK DETAILS:
• Tester: ${feedback.testerName} (${feedback.role})
• Module: ${feedback.module}
• Rating: ${feedback.rating}/5 stars
• Category: ${feedback.category}
• Priority: ${feedback.priority}
• Access Code: ${feedback.accessCode}

FEEDBACK:
${feedback.feedback}

${feedback.suggestions ? `SUGGESTIONS:\n${feedback.suggestions}` : ''}

TECHNICAL INFO:
• URL: ${feedback.url}
• User Agent: ${feedback.userAgent}
• Submitted: ${new Date(feedback.submittedAt).toLocaleString()}

View all feedback in the Developer Portal → Feedback & Reviews section.`;

    return {
      subject,
      htmlContent: textContent.replace(/\n/g, '<br>'),
      textContent
    };
  }

  // Get pending emails for manual delivery
  static getPendingEmails(): any[] {
    return JSON.parse(localStorage.getItem('lumi_pending_emails') || '[]');
  }

  // Clear pending emails
  static clearPendingEmails(): void {
    localStorage.removeItem('lumi_pending_emails');
  }

  // Export all pending emails
  static exportPendingEmails(): void {
    const emails = this.getPendingEmails();
    if (emails.length === 0) {
      console.log('No pending emails to export');
      return;
    }

    const csvContent = [
      'Email,Subject,Access Code,Created At',
      ...emails.map(email => 
        `"${email.to}","${email.subject}","${email.accessCode}","${email.createdAt}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumi-pending-emails-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}