import React, { useState, useEffect } from 'react';
import { Mail, Send, Copy, Download, RefreshCw, CheckCircle, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { useAppContext } from '../../context/AppContext';
import { EmailService } from '../../services/emailService';

export const EmailDeliveryPanel: React.FC = () => {
  const { toast } = useAppContext();
  const [pendingEmails, setPendingEmails] = useState<any[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingEmails();
  }, []);

  const loadPendingEmails = () => {
    try {
      setLoading(true);
      const emails = EmailService.getPendingEmails();
      console.log('📧 Loading pending emails:', emails.length, 'found');
      setPendingEmails(emails);
      
      if (emails.length > 0) {
        toast.info('Emails Loaded', `Found ${emails.length} pending email${emails.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Failed to load pending emails:', error);
      toast.error('Load Failed', 'Could not load pending emails');
    } finally {
      setLoading(false);
    }
  };

  const clearPendingEmail = (emailIndex: number) => {
    try {
      const updatedEmails = pendingEmails.filter((_, index) => index !== emailIndex);
      localStorage.setItem('lumi_pending_emails', JSON.stringify(updatedEmails));
      setPendingEmails(updatedEmails);
      toast.success('Email Removed', 'Email removed from pending list');
    } catch (error) {
      console.error('Failed to clear email:', error);
      toast.error('Clear Failed', 'Could not remove email');
    }
  };

  const clearAllPendingEmails = () => {
    try {
      EmailService.clearPendingEmails();
      setPendingEmails([]);
      toast.success('All Emails Cleared', 'Pending email list cleared');
    } catch (error) {
      console.error('Failed to clear all emails:', error);
      toast.error('Clear Failed', 'Could not clear all emails');
    }
  };

  const exportPendingEmails = () => {
    try {
      EmailService.exportPendingEmails();
      toast.success('Emails Exported', 'Pending emails exported to CSV');
    } catch (error) {
      console.error('Failed to export emails:', error);
      toast.error('Export Failed', 'Could not export emails');
    }
  };

  const resendEmail = async (email: any) => {
    try {
      const emailSent = await EmailService.sendTestUserInvitation({
        name: email.to.split('@')[0],
        email: email.to,
        accessCode: email.accessCode,
        role: 'tester',
        modules: ['all'],
        inviterName: 'Developer Portal'
      });
      
      if (emailSent) {
        toast.success('Email Resent!', 'Invitation email sent again');
      } else {
        toast.error('Resend Failed', 'Could not resend email');
      }
    } catch (error) {
      console.error('Failed to resend email:', error);
      toast.error('Resend Failed', 'Could not resend email');
    }
  };

  const markEmailAsSent = (emailIndex: number) => {
    try {
      const updatedEmails = pendingEmails.filter((_, index) => index !== emailIndex);
      localStorage.setItem('lumi_pending_emails', JSON.stringify(updatedEmails));
      setPendingEmails(updatedEmails);
      toast.success('Email Marked as Sent', 'Removed from pending list');
    } catch (error) {
      console.error('Failed to mark email as sent:', error);
      toast.error('Update Failed', 'Could not mark email as sent');
    }
  };

  const copyEmailContent = (email: any) => {
    try {
      const content = `To: ${email.to}
Subject: ${email.subject}
Access Code: ${email.accessCode}

${email.content}`;
      
      navigator.clipboard.writeText(content);
      setCopiedEmail(email.to);
      setTimeout(() => setCopiedEmail(null), 2000);
      toast.success('Email Copied', 'Email content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy email:', error);
      toast.error('Copy Failed', 'Could not copy email content');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">
            Email Delivery Management
          </h3>
          <p className="text-gray-600">
            Manage test user invitations and email delivery
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadPendingEmails}
            loading={loading}
            size="sm"
            variant="outline"
            icon={RefreshCw}
          >
            Refresh
          </Button>
          {pendingEmails.length > 0 && (
            <>
              <Button
                onClick={exportPendingEmails}
                size="sm"
                variant="outline"
                icon={Download}
              >
                Export
              </Button>
              <Button
                onClick={clearAllPendingEmails}
                size="sm"
                variant="outline"
                icon={Trash2}
                className="text-red-600"
              >
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Email Service Status */}
      <Card className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${
            import.meta.env.VITE_RESEND_API_KEY ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <h4 className="font-medium text-[#1A1A1A]">
            Email Service Status
          </h4>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Environment:</span>
            <span className="font-medium">{import.meta.env.VITE_ENVIRONMENT || 'development'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email API:</span>
            <span className={`font-medium ${
              import.meta.env.VITE_RESEND_API_KEY ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {import.meta.env.VITE_RESEND_API_KEY ? 'Configured' : 'Development Mode'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Method:</span>
            <span className="font-medium">
              {import.meta.env.VITE_RESEND_API_KEY ? 'Resend API' : 'Console + Visual Notification'}
            </span>
          </div>
        </div>
      </Card>

      {/* Pending Emails */}
      <Card className="p-4">
        <h4 className="font-medium text-[#1A1A1A] mb-4">
          Pending Email Deliveries ({pendingEmails.length})
        </h4>
        
        {pendingEmails.length === 0 ? (
          <div className="text-center py-6">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No pending emails</p>
            <p className="text-xs text-gray-500 mt-1">
              Emails will appear here when API delivery fails
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingEmails.map((email, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{email.to}</p>
                    <p className="text-xs text-yellow-700">
                      Access Code: <strong>{email.accessCode}</strong>
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(email.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyEmailContent(email)}
                    size="sm"
                    variant="outline"
                    icon={copiedEmail === email.to ? CheckCircle : Copy}
                    className={copiedEmail === email.to ? 'text-green-600' : ''}
                  >
                    {copiedEmail === email.to ? 'Copied!' : 'Copy Email'}
                  </Button>
                  <Button
                    onClick={() => resendEmail(email)}
                    size="sm"
                    variant="outline"
                    icon={Mail}
                  >
                    Resend
                  </Button>
                  <Button
                    onClick={() => markEmailAsSent(index)}
                    size="sm"
                    icon={Send}
                  >
                    Mark as Sent
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Development Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">
          📧 Email Setup Instructions
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Development Mode:</strong> Emails are logged to console with visual notifications</p>
          <p><strong>Production Setup:</strong> Add VITE_RESEND_API_KEY to environment variables</p>
          <p><strong>Manual Delivery:</strong> Use "Copy Email" to manually send invitations</p>
          <p><strong>Monitoring:</strong> Check pending emails for failed deliveries</p>
        </div>
      </Card>
    </div>
  );
};