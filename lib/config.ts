// Database and application configuration

export const config = {
  // Database Configuration
  database: {
    path: process.env.DATABASE_PATH || './atavi-comandas.db',
    enableWAL: true, // Write-Ahead Logging for better performance
    enableForeignKeys: true,
    connectionTimeout: 5000, // 5 seconds
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '24h',
    issuer: 'atavi-comandas',
    audience: 'atavi-comandas-users',
  },

  // Authentication Configuration
  auth: {
    saltRounds: 12, // bcrypt salt rounds
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // API Configuration
  api: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
    },
  },

  // Application Configuration
  app: {
    name: 'Atavi Comandas',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  },

  // Storage Configuration - Now using database only
  storage: {
    defaultMode: 'database' as 'localStorage' | 'api' | 'hybrid' | 'database',
    enableMigration: false, // Migration completed
    backupOnMigration: false,
  },

  // Business Logic Configuration
  business: {
    defaultPreparationTime: 15, // minutes
    currency: 'BRL',
    locale: 'pt-BR',
    orderStatuses: ['pending', 'preparing', 'ready', 'delivered'] as const,
    orderTypes: ['dine-in', 'delivery', 'takeout'] as const,
    categories: ['food', 'drink', 'dessert'] as const,
    userRoles: ['admin', 'kitchen', 'delivery'] as const,
  },

  // Feature Flags
  features: {
    enableRegistration: process.env.NODE_ENV === 'development', // Enable user registration in dev
    enableStatistics: true,
    enablePrinting: true,
    enableNotifications: true,
    enableOfflineMode: true,
  },
};

// Validation functions
export const validateConfig = () => {
  const errors: string[] = [];

  // Check critical environment variables
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }

    if (config.jwt.secret === 'your-secret-key-change-in-production') {
      errors.push('JWT_SECRET must be changed from default value in production');
    }
  }

  // Database path validation
  if (config.database.path && !config.database.path.endsWith('.db')) {
    errors.push('Database path must end with .db extension');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }

  return true;
};

// Development helpers
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isTest = () => config.app.environment === 'test';

export default config;