/**
 * Environment Configuration Example
 * Copy this file to environment.ts and replace with real values
 */

export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

function getEnvironmentConfig(): EnvironmentConfig {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'YOUR_DATABASE_URL_HERE',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_STRIPE_SECRET_KEY_HERE',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY_HERE',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET_HERE',
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE'
  };
}

export const config = getEnvironmentConfig();

export function validateRequiredEnvironmentVariables(): { isValid: boolean; missingVars: string[] } {
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

export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return config.NODE_ENV === 'production';
}

// Default export for deployment compatibility
export default config;
