/**
 * Environment Configuration
 * Manages environment variables and provides fallback values for development
 */

function getEnvironmentConfig() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder-test-db',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_testing',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_for_testing',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder_for_testing',
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://erfuinkfouijxgfkxhhn.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnVpbmtmb3VpanhnZmt4aGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzU2NTAsImV4cCI6MjA2MjgxMTY1MH0.9cxdr4AC0HY3t64n3dJ939wVNwlp9Prpzlx-sxfCOnU',
    BREVO_API_KEY: process.env.BREVO_API_KEY || 'your-brevo-api-key-here',
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || 'contato@mentoraai.com.br',
    BREVO_SENDER_NAME: process.env.BREVO_SENDER_NAME || 'Mentora AI'
  };
}

const config = getEnvironmentConfig();

function validateRequiredEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY', 
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

function isDevelopment() {
  return config.NODE_ENV === 'development';
}

function isProduction() {
  return config.NODE_ENV === 'production';
}

// CommonJS exports
module.exports = {
  config,
  validateRequiredEnvironmentVariables,
  isDevelopment,
  isProduction
};
