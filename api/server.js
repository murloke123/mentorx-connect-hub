// Vercel Serverless Function
const { createServer } = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv/config');
const { config, validateRequiredEnvironmentVariables } = require('./environment.js');
const { registerRoutes } = require('./routes.js');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000', 
    'http://localhost:5173',
    'https://mentoraai.com.br',
    'https://www.mentoraai.com.br',
    /\.vercel\.app$/,
    /\.vercel\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const envValidation = validateRequiredEnvironmentVariables();
  
  const maskApiKey = (key) => {
    if (!key) return 'NOT_SET';
    if (key.length <= 8) return key;
    return key.substring(0, 8) + '...';
  };

  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    validation: envValidation,
    stripe: {
      secretKey: maskApiKey(process.env.STRIPE_SECRET_KEY),
      publishableKey: maskApiKey(process.env.STRIPE_PUBLISHABLE_KEY)
    }
  });
});

// Register all routes
registerRoutes(app).then(() => {
  console.log('✅ Routes registered successfully');
}).catch((error) => {
  console.error('❌ Error registering routes:', error);
});

// Export the app for Vercel
module.exports = app;