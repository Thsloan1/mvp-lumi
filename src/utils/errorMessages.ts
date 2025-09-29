export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH_REQUIRED: 'Please sign in to continue',
  AUTH_INVALID: 'Invalid credentials. Please try again',
  AUTH_EXPIRED: 'Your session has expired. Please sign in again',
  
  // Permission Errors
  PERMISSION_DENIED: 'You don\'t have permission to perform this action',
  OWNER_ONLY: 'Only the organization owner can perform this action',
  ADMIN_REQUIRED: 'Administrator privileges required',
  
  // Subscription Errors
  SEAT_LIMIT_REACHED: 'Your subscription allows only {maxSeats} educators. Upgrade to add more',
  SUBSCRIPTION_INACTIVE: 'Your subscription is not active. Please update your billing information',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue',
  
  // Invitation Errors
  INVITATION_INVALID: 'Invalid invitation token',
  INVITATION_EXPIRED: 'This invitation has expired. Please request a new one',
  INVITATION_ALREADY_ACCEPTED: 'This invitation has already been accepted',
  DUPLICATE_INVITATION: 'An invitation has already been sent to this email address',
  USER_ALREADY_IN_ORG: 'This user is already part of your organization',
  
  // Validation Errors
  EMAIL_INVALID: 'Please enter a valid email address',
  EMAIL_REQUIRED: 'Email address is required',
  PASSWORD_WEAK: 'Password must be at least 8 characters with a capital letter and number',
  NAME_REQUIRED: 'Full name is required',
  ORGANIZATION_NAME_REQUIRED: 'Organization name is required',
  
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again',
  TIMEOUT_ERROR: 'Request timed out. Please try again',
  SERVER_ERROR: 'Server error. Please try again later',
  
  // General Errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
  OPERATION_FAILED: 'Operation failed. Please try again',
  DATA_NOT_FOUND: 'Requested data not found',
  
  // Success Messages
  INVITATION_SENT: 'Invitations sent successfully',
  INVITATION_ACCEPTED: 'Invitation accepted successfully',
  ORGANIZATION_CREATED: 'Organization created successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  OWNERSHIP_TRANSFERRED: 'Ownership transferred successfully'
};

export const formatErrorMessage = (template: string, variables: Record<string, any> = {}): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
};

export const getErrorMessage = (errorCode: keyof typeof ERROR_MESSAGES, variables?: Record<string, any>): string => {
  const template = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.UNKNOWN_ERROR;
  return variables ? formatErrorMessage(template, variables) : template;
};