import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createOrUpdateStripeConnectedAccount, verifyStripeAccountStatus } from '@/services/stripeClientService';
import { testStripeConnectivity } from '@/services/stripeConnectivityService';
import { useState } from 'react';

export default function StripeTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [accountResult, setAccountResult] = useState<any>(null);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTestConnectivity = async () => {
    setLoading(true);
    try {
      const result = await testStripeConnectivity();
      setTestResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const userData = {
        email: 'teste@exemplo.com',
        full_name: 'João Silva Teste',
        phone: '11999887766',
        cpf: '12345678901',
        date_of_birth: '1990-01-01',
        address: {
          line1: 'Rua Teste 123',
          line2: 'Apto 456',
          city: 'São Paulo',
          state: 'SP',
          postal_code: '01234567',
          country: 'BR'
        },
        bank_account: {
          account_type: 'checking',
          routing_number: '341',
          branch_number: '1234',
          account_number: '12345-6',
          account_holder_name: 'João Silva Teste'
        },
        tos_ip: '127.0.0.1'
      };
      
      const result = await createOrUpdateStripeConnectedAccount(userData);
      setAccountResult(result);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStatus = async () => {
    if (!accountResult?.account?.id) {
      alert('Primeiro crie uma conta para verificar o status');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyStripeAccountStatus(accountResult.account.id);
      setStatusResult(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Teste Stripe Backend</h1>
          <p className="text-gray-600">
          Página para testar os novos endpoints Stripe do servidor de forma incremental
          </p>
        </div>

        <div className="grid gap-6">
          {/* Teste de Conectividade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 1. Teste de Conectividade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestConnectivity} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testando...' : 'Testar Conectividade Stripe'}
            </Button>
            
            {testResult && (
              <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className="font-semibold mb-2">Resultado:</h4>
                <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
          </div>
            )}
          </CardContent>
        </Card>

        {/* Criar Conta */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏗️ 2. Criar Conta Conectada
            </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateAccount} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Criando...' : 'Criar Conta de Teste'}
            </Button>
            
            {accountResult && (
              <div className={`p-4 rounded-lg ${accountResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className="font-semibold mb-2">Resultado:</h4>
                <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(accountResult, null, 2)}
                </pre>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Verificar Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 3. Verificar Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleVerifyStatus} 
              disabled={loading || !accountResult?.account?.id}
              className="w-full"
            >
              {loading ? 'Verificando...' : 'Verificar Status da Conta'}
            </Button>
            
            {statusResult && (
              <div className={`p-4 rounded-lg ${statusResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className="font-semibold mb-2">Resultado:</h4>
                <pre className="text-sm bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(statusResult, null, 2)}
                </pre>
              </div>
            )}
            </CardContent>
          </Card>

        {/* Logs do Console */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instruções de Teste</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>1. Teste de Conectividade:</strong> Verifica se o Stripe está configurado corretamente</p>
              <p><strong>2. Criar Conta:</strong> Cria uma conta conectada de teste na Stripe</p>
              <p><strong>3. Verificar Status:</strong> Verifica o status da conta criada</p>
              <p><strong>Logs:</strong> Abra o Console do navegador (F12) para ver logs detalhados</p>
              <p><strong>Servidor:</strong> Verifique os logs do servidor no terminal para ver as chamadas backend</p>
        </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 