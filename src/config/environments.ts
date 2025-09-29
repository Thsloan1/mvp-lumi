export interface Environment {
  name: string;
  apiUrl: string;
  features: {
    mockData: boolean;
    realTimeUpdates: boolean;
    analytics: boolean;
    payments: boolean;
    emailDelivery: boolean;
  };
  database: {
    type: 'mock' | 'local' | 'staging' | 'production';
    resetOnReload: boolean;
  };
  auth: {
    requireEmailVerification: boolean;
    allowTestAccounts: boolean;
    sessionTimeout: number;
  };
}

export const ENVIRONMENTS: Record<string, Environment> = {
  development: {
    name: 'Development',
    apiUrl: 'http://localhost:3001/api',
    features: {
      mockData: true,
      realTimeUpdates: false,
      analytics: true,
      payments: false,
      emailDelivery: false
    },
    database: {
      type: 'mock',
      resetOnReload: true
    },
    auth: {
      requireEmailVerification: false,
      allowTestAccounts: true,
      sessionTimeout: 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  test: {
    name: 'Test Environment',
    apiUrl: 'http://localhost:3001/api',
    features: {
      mockData: true,
      realTimeUpdates: false,
      analytics: true,
      payments: false,
      emailDelivery: false
    },
    database: {
      type: 'local',
      resetOnReload: false
    },
    auth: {
      requireEmailVerification: false,
      allowTestAccounts: true,
      sessionTimeout: 2 * 60 * 60 * 1000 // 2 hours
    }
  },
  staging: {
    name: 'Staging',
    apiUrl: 'https://api-staging.lumi.app/api',
    features: {
      mockData: false,
      realTimeUpdates: true,
      analytics: true,
      payments: true,
      emailDelivery: true
    },
    database: {
      type: 'staging',
      resetOnReload: false
    },
    auth: {
      requireEmailVerification: true,
      allowTestAccounts: true,
      sessionTimeout: 8 * 60 * 60 * 1000 // 8 hours
    }
  },
  production: {
    name: 'Production',
    apiUrl: 'https://api.lumi.app/api',
    features: {
      mockData: false,
      realTimeUpdates: true,
      analytics: true,
      payments: true,
      emailDelivery: true
    },
    database: {
      type: 'production',
      resetOnReload: false
    },
    auth: {
      requireEmailVerification: true,
      allowTestAccounts: false,
      sessionTimeout: 4 * 60 * 60 * 1000 // 4 hours
    }
  }
};

export const getCurrentEnvironment = (): Environment => {
  const env = import.meta.env.VITE_ENVIRONMENT || 'development';
  return ENVIRONMENTS[env] || ENVIRONMENTS.development;
};

export const isTestEnvironment = (): boolean => {
  const env = getCurrentEnvironment();
  return env.name === 'Test Environment' || env.name === 'Development';
};

export const isDevelopment = (): boolean => {
  return getCurrentEnvironment().name === 'Development';
};

export const isProduction = (): boolean => {
  return getCurrentEnvironment().name === 'Production';
};