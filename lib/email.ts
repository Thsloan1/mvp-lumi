import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  static async sendInvitationEmail(
    email: string,
    organizationName: string,
    inviterName: string,
    inviteToken: string
  ) {
    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite?token=${inviteToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #C44E38; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">You're Invited to Join Lumi</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A1A1A; margin-bottom: 20px;">
            Join ${organizationName} on Lumi
          </h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Hi there! ${inviterName} has invited you to join ${organizationName} on Lumi, 
            the AI-powered classroom behavior coaching platform.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            With Lumi, you'll get personalized strategies for challenging behaviors, 
            classroom management tools, and family communication support.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" 
               style="background: #C44E38; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This invitation will expire in 7 days. If you have any questions, 
            please contact ${inviterName} or reply to this email.
          </p>
        </div>
        
        <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>© 2024 Lumi. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      const result = await resend.emails.send({
        from: 'Lumi <noreply@lumi.app>',
        to: email,
        subject: `You're invited to join ${organizationName} on Lumi`,
        html,
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #C44E38; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Lumi!</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #1A1A1A; margin-bottom: 20px;">
            Hi ${name}!
          </h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Lumi! We're excited to support you in your important work with children.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Your account is ready. You can now log challenging behaviors, get personalized strategies, 
            and create family communication notes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background: #C44E38; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'Lumi <welcome@lumi.app>',
        to: email,
        subject: 'Welcome to Lumi - Your Classroom Behavior Coach',
        html,
      });
      return { success: true };
    } catch (error) {
      console.error('Welcome email error:', error);
      return { success: false, error: error.message };
    }
  }
}