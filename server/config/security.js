// Production Security Configuration
// Additional security middleware and configurations for production deployment

// Install additional security packages
// npm install express-rate-limit helmet compression bcryptjs jsonwebtoken
// npm install express-validator express-mongo-sanitize --save
// npm install xss-clean hpp --save

// Security Headers Configuration
const securityConfig = {
  // Helmet configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "https://images.unsplash.com"],
        connectSrc: ["'self'", "https://api.unsplash.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.CLIENT_URL] 
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  }
};

// Environment Security Variables
const SECURITY_ENV_VARS = {
  // JWT Configuration
  JWT_SECRET: "minimum-32-characters-long-random-string",
  JWT_EXPIRES_IN: "7d",
  
  // Password Security
  BCRYPT_ROUNDS: 12,
  
  // Session Security
  SESSION_SECRET: "another-random-string-for-sessions",
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 900000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // File Upload Security
  MAX_FILE_SIZE: 5242880, // 5MB
  ALLOWED_FILE_TYPES: ["jpg", "jpeg", "png", "gif", "pdf"],
  
  // API Security
  API_RATE_LIMIT: 1000, // requests per hour
  API_KEY_LENGTH: 32,
};

// Security Middleware Implementation
const securityMiddleware = `
// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit']
}));

// Request size limiter
app.use(express.json({ limit: '10kb' }));

// HTTP Parameter Pollution protection
app.use(hpp());

// Trust proxy for rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}
`;

// Database Security Configuration
const DATABASE_SECURITY = {
  // Connection security
  connectionTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
  
  // Query security
  charset: 'utf8mb4',
  timezone: '+00:00',
  
  // Pool security
  connectionLimit: 10,
  queueLimit: 0,
  
  // SSL Configuration (if supported)
  ssl: {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  }
};

// Input Validation Rules
const VALIDATION_RULES = {
  user: {
    email: {
      required: true,
      email: true,
      normalizeEmail: true,
      maxLength: 255
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 128,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'
    },
    name: {
      required: true,
      trim: true,
      escape: true,
      minLength: 2,
      maxLength: 100
    }
  },
  
  transaction: {
    amount: {
      required: true,
      isFloat: { min: 0.01, max: 999999.99 }
    },
    description: {
      required: true,
      trim: true,
      escape: true,
      minLength: 1,
      maxLength: 255
    },
    category: {
      required: true,
      isIn: [['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Salary', 'Freelance', 'Investment', 'Other']]
    },
    type: {
      required: true,
      isIn: [['income', 'expense']]
    }
  }
};

// Logging Security Configuration
const LOGGING_CONFIG = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: 'combined',
  filename: 'logs/app.log',
  maxSize: '20m',
  maxFiles: '14d',
  
  // Security event logging
  securityEvents: {
    loginAttempts: true,
    failedAuth: true,
    suspiciousActivity: true,
    dataAccess: true,
    adminActions: true
  }
};

// Backup Security Configuration
const BACKUP_CONFIG = {
  // Database backup
  database: {
    enabled: true,
    frequency: 'daily',
    retention: 30, // days
    encryption: true,
    compression: true
  },
  
  // File backup
  files: {
    enabled: true,
    frequency: 'weekly',
    retention: 90, // days
    exclude: ['node_modules', 'logs', '.git']
  }
};

// Monitoring Security Configuration
const MONITORING_CONFIG = {
  // Performance monitoring
  performance: {
    enabled: true,
    sampleRate: 0.1,
    maxMemoryUsage: 0.8, // 80%
    maxCpuUsage: 0.8 // 80%
  },
  
  // Security monitoring
  security: {
    enabled: true,
    alertThreshold: 10, // failed attempts
    blockDuration: 900, // 15 minutes
    suspiciousPatterns: [
      'sql injection',
      'xss attack',
      'brute force',
      'ddos attempt'
    ]
  }
};

console.log("Security configuration loaded successfully!");
console.log("Review and customize settings before production deployment.");

module.exports = {
  securityConfig,
  SECURITY_ENV_VARS,
  securityMiddleware,
  DATABASE_SECURITY,
  VALIDATION_RULES,
  LOGGING_CONFIG,
  BACKUP_CONFIG,
  MONITORING_CONFIG
};
