// Test API connectivity
export async function testApiConnectivity() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  try {
    console.log('🧪 testApiConnectivity: Testando conectividade com:', API_BASE_URL);
    
    // Test 1: Health check
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log('✅ Health check status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('✅ Health check data:', healthData);
    
    // Test 2: Simple POST to network logs
    const logResponse = await fetch(`${API_BASE_URL}/api/stripe-network-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'TEST',
        action: 'CONNECTIVITY_TEST',
        data: { test: true },
        timestamp: Date.now()
      })
    });
    console.log('✅ Network logs status:', logResponse.status);
    const logData = await logResponse.json();
    console.log('✅ Network logs data:', logData);
    
    return { success: true, message: 'API connectivity working' };
  } catch (error) {
    console.error('❌ testApiConnectivity error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}