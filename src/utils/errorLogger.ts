interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  userAgent?: string;
  url?: string;
  stackTrace?: string;
  sessionId?: string;
}

export class ErrorLogger {
  private static logs: ErrorLogEntry[] = [];
  private static sessionId = this.generateSessionId();

  private static generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static log(
    level: 'error' | 'warning' | 'info',
    message: string,
    context?: Record<string, any>,
    error?: Error
  ) {
    const entry: ErrorLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      stackTrace: error?.stack,
      sessionId: this.sessionId
    };

    this.logs.push(entry);
    
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? console.error : 
                      level === 'warning' ? console.warn : console.info;
      logMethod(`[${level.toUpperCase()}] ${message}`, { context, error });
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(entry);
    }

    // Store locally for debugging
    this.storeLocally(entry);
  }

  static error(message: string, context?: Record<string, any>, error?: Error) {
    this.log('error', message, context, error);
  }

  static warning(message: string, context?: Record<string, any>) {
    this.log('warning', message, context);
  }

  static info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  // Authentication flow logging
  static logAuthEvent(event: 'signup_attempt' | 'signup_success' | 'signup_error' | 
                           'signin_attempt' | 'signin_success' | 'signin_error' |
                           'signout' | 'token_refresh' | 'token_expired',
                     context?: Record<string, any>) {
    this.info(`Auth: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Onboarding flow logging
  static logOnboardingEvent(event: 'started' | 'step_completed' | 'completed' | 'abandoned',
                           step?: number,
                           context?: Record<string, any>) {
    this.info(`Onboarding: ${event}`, {
      event,
      step,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // API call logging
  static logApiCall(endpoint: string, method: string, status: number, 
                   duration: number, context?: Record<string, any>) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warning' : 'info';
    this.log(level, `API: ${method} ${endpoint} - ${status}`, {
      endpoint,
      method,
      status,
      duration,
      ...context
    });
  }

  // User interaction logging
  static logUserAction(action: string, context?: Record<string, any>) {
    this.info(`User Action: ${action}`, {
      action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  // Performance logging
  static logPerformance(metric: string, value: number, context?: Record<string, any>) {
    this.info(`Performance: ${metric}`, {
      metric,
      value,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  private static getCurrentUserId(): string | undefined {
    try {
      const token = localStorage.getItem('lumi_token');
      if (token) {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          return payload.id;
        }
      }
    } catch (error) {
      // Ignore token parsing errors
    }
    return undefined;
  }

  private static async sendToMonitoring(entry: ErrorLogEntry) {
    try {
      // In production, send to monitoring service like Sentry, LogRocket, etc.
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fail silently to avoid infinite loops
    }
  }

  private static storeLocally(entry: ErrorLogEntry) {
    try {
      const logs = safeLocalStorageGet('lumi_error_logs', []);
      logs.push(entry);
      
      // Keep only last 100 entries
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      safeLocalStorageSet('lumi_error_logs', logs);
    } catch (error) {
      // Ignore storage errors
    }
  }

  // Get logs for debugging
  static getLogs(level?: 'error' | 'warning' | 'info'): ErrorLogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs;
  }

  // Export logs for support
  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  static clearLogs() {
    this.logs = [];
    localStorage.removeItem('lumi_error_logs');
  }
  
  // Setup global error handlers
  private static setupGlobalErrorHandlers() {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, event.error);
    });
    
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason?.toString()
      });
    });
    
    // Log page navigation
    window.addEventListener('beforeunload', () => {
      this.info('Page Unload', {
        url: window.location.href,
        duration: Date.now() - performance.timing.navigationStart
      });
    });
  }
}