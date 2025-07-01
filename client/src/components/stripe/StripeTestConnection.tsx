import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { testStripeConnectivity } from '@/services/stripeConnectivityService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';

const StripeTestConnection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('🔄 [STRIPE-TEST] Testando conectividade via servidor seguro...');
      const result = await testStripeConnectivity();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro interno ao testar conexão'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔌 Teste de Conectividade Stripe
        </CardTitle>
        <CardDescription>
          Verifique se as chaves da Stripe estão configuradas corretamente via servidor seguro
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTestConnection}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Testando via Servidor...' : 'Testar Conexão Segura'}
        </Button>

        {testResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? 'Servidor Configurado' : 'Erro no Servidor'}
              </Badge>
            </div>

            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-sm font-medium mb-2">Resultado:</p>
              <p className="text-sm text-gray-700">{testResult.message}</p>
            </div>

            {testResult.success && testResult.data && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Informações do Servidor:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {testResult.data.stripe && (
                    <>
                  <div>
                        <span className="font-medium">Chave Stripe:</span>
                        <p className="text-gray-600">{testResult.data.stripe.hasKey ? '✅ Configurada' : '❌ Ausente'}</p>
                  </div>
                  <div>
                        <span className="font-medium">Ambiente:</span>
                        <p className="text-gray-600">{testResult.data.environment}</p>
                  </div>
                  <div>
                        <span className="font-medium">Tamanho da Chave:</span>
                        <p className="text-gray-600">{testResult.data.stripe.keyLength} caracteres</p>
                  </div>
                  <div>
                        <span className="font-medium">Prefixo:</span>
                        <p className="text-gray-600 font-mono">{testResult.data.stripe.keyPrefix}</p>
                  </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StripeTestConnection; 