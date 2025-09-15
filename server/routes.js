const { createServer } = require('http');

async function registerRoutes(app) {
  // ENDPOINT DE LOG: Para aparecer no Network do Chrome
  app.post('/api/stripe-network-logs', async (req, res) => {
    try {
      const { type, action, data, timestamp } = req.body;
      
      res.json({ 
        success: true, 
        logged: true,
        message: `Log registrado: ${type} - ${action}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro no log' });
    }
  });

  // ENDPOINT 1: Criar ou atualizar conta conectada
  app.post('/api/stripe/account', async (req, res) => {
    try {
      const userData = req.body;
      
      console.log('🚀 ROUTES.JS: Requisição recebida em /api/stripe/account');
      console.log('📦 ROUTES.JS: Dados recebidos:', JSON.stringify(userData, null, 2));
      
      // Por enquanto, retornar um mock para testar a conectividade
      res.json({
        success: true,
        message: 'Endpoint funcionando - implementação completa em desenvolvimento',
        received_data: userData,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ ROUTES.JS: Erro em /api/stripe/account:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  // ENDPOINT: Health check adicional
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      message: 'API funcionando corretamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Retornar o servidor HTTP
  return createServer(app);
}

module.exports = {
  registerRoutes
};
