// Deployment Configuration
// This file contains deployment-specific settings

const deploymentConfig = {
  // CORS settings for different environments
  cors: {
    development: {
      origin: ['http://localhost:4000', 'http://localhost:3000', 'http://127.0.0.1:4000'],
      credentials: true
    },
    production: {
      origin: true, // Allow all origins for easy deployment
      credentials: true
    }
  },

  // Database settings
  database: {
    development: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    },
    production: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
      ssl: true,
      sslValidate: false
    }
  },

  // Server settings
  server: {
    port: process.env.PORT || 6000,
    host: process.env.HOST || '0.0.0.0'
  },

  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    bcryptRounds: 12,
    sessionTimeout: '24h'
  },

  // File upload settings
  upload: {
    maxFileSize: '10mb',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  }
};

module.exports = deploymentConfig;
