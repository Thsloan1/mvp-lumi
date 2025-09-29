// Performance monitoring utilities for production
export class PerformanceMonitor {
  private static metrics: Map<string, number> = new Map();
  
  // Core Web Vitals monitoring
  static initializeWebVitals() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          this.recordMetric('LCP', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime;
          this.recordMetric('FID', fid);
        }
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('CLS', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Page load performance
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.recordMetric('TTFB', navigation.responseStart - navigation.fetchStart);
      this.recordMetric('DOMContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      this.recordMetric('LoadComplete', navigation.loadEventEnd - navigation.fetchStart);
    });
  }

  // Component render performance
  static measureComponentRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    this.recordMetric(`Component_${componentName}`, endTime - startTime);
  }

  // API call performance
  static measureApiCall(endpoint: string, method: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      this.recordMetric(`API_${method}_${endpoint}`, endTime - startTime);
    };
  }

  private static recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  private static sendToAnalytics(metric: string, value: number) {
    // Send to your analytics service (Google Analytics, etc.)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: metric,
        metric_value: Math.round(value),
        custom_parameter: 'lumi_performance'
      });
    }
  }

  // Get all metrics for debugging
  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Performance budget validation
  static validatePerformanceBudget(): { passed: boolean; violations: string[] } {
    const violations: string[] = [];
    
    const lcp = this.metrics.get('LCP');
    if (lcp && lcp > 2500) {
      violations.push(`LCP too slow: ${lcp.toFixed(0)}ms (target: <2500ms)`);
    }
    
    const fid = this.metrics.get('FID');
    if (fid && fid > 100) {
      violations.push(`FID too slow: ${fid.toFixed(0)}ms (target: <100ms)`);
    }
    
    const cls = this.metrics.get('CLS');
    if (cls && cls > 0.1) {
      violations.push(`CLS too high: ${cls.toFixed(3)} (target: <0.1)`);
    }
    
    return {
      passed: violations.length === 0,
      violations
    };
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.initializeWebVitals();
  PerformanceMonitor.measurePageLoad();
}