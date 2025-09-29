import { useEffect } from 'react';
import { ErrorLogger } from '../utils/errorLogger';
import { useAppContext } from '../context/AppContext';

export const useErrorLogger = () => {
  const { currentUser } = useAppContext();

  useEffect(() => {
    // Log user session start
    if (currentUser) {
      ErrorLogger.info('User Session Started', {
        userId: currentUser.id,
        userRole: currentUser.role,
        onboardingStatus: currentUser.onboardingStatus
      });
    }
  }, [currentUser]);

  // Performance monitoring
  useEffect(() => {
    // Log page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      ErrorLogger.logPerformance('Page Load Time', navigation.loadEventEnd - navigation.fetchStart, {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      });
    });

    // Log Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          ErrorLogger.logPerformance('Largest Contentful Paint', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          ErrorLogger.logPerformance('First Input Delay', (entry as any).processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          ErrorLogger.logPerformance('Cumulative Layout Shift', (entry as any).value);
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    return () => observer.disconnect();
  }, []);

  return {
    logError: ErrorLogger.error,
    logWarning: ErrorLogger.warning,
    logInfo: ErrorLogger.info,
    logAuthEvent: ErrorLogger.logAuthEvent,
    logOnboardingEvent: ErrorLogger.logOnboardingEvent,
    logApiCall: ErrorLogger.logApiCall,
    logUserAction: ErrorLogger.logUserAction
  };
};