// Vercel Serverless Function - Health Check

/**
 * Handler serverless para health check
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async (req, res) => {
  const startTime = Date.now();
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    console.log('🚀 SERVERLESS health: Health check requisitado');
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      services: {
        stripe: !!process.env.STRIPE_SECRET_KEY
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '2.0.0-serverless'
    };
    
    const duration = Date.now() - startTime;
    console.log(`✅ SERVERLESS health: Health check respondido em ${duration}ms`);
    
    return res.status(200).json(healthData);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ SERVERLESS health: Erro após ${duration}ms:`, error);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    });
  }
};