/**
 * Client Environment Configuration
 * Handles environment variables for the frontend
 */

export interface ClientEnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  NODE_ENV: string;
  APP_URL: string;
}

function getClientEnvironmentConfig(): ClientEnvironmentConfig {
  return {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://erfuinkfouijxgfkxhhn.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnVpbmtmb3VpanhnZmt4aGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMzU2NTAsImV4cCI6MjA2MjgxMTY1MH0.9cxdr4AC0HY3t64n3dJ939wVNwlp9Prpzlx-sxfCOnU',
    STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
    NODE_ENV: import.meta.env.MODE || 'development',
    APP_URL: import.meta.env.VITE_APP_URL || (import.meta.env.MODE === 'production' ? 'https://mentorx.com.br' : 'http://localhost:3000')
  };
}

export const clientConfig = getClientEnvironmentConfig();

export function validateClientEnvironment(): { isValid: boolean; missingVars: string[] } {
  const requiredVars: (keyof ClientEnvironmentConfig)[] = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'STRIPE_PUBLISHABLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !clientConfig[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}