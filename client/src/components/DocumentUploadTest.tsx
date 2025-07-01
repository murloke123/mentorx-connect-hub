import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DocumentSection } from '@/components/DocumentSection';
import { setupDocumentStorage } from '@/scripts/setupStorage';
import { supabase } from '@/utils/supabase';

export function DocumentUploadTest() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSetupStorage = async () => {
    setIsLoading(true);
    setMessage('Configurando storage...');
    
    try {
      const success = await setupDocumentStorage();
      setMessage(success ? '✅ Storage configurado com sucesso!' : '❌ Erro ao configurar storage');
    } catch (error) {
      setMessage(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetUser = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
      setMessage(user ? `✅ Usuário carregado: ${user.email}` : '❌ Nenhum usuário logado');
    } catch (error) {
      setMessage(`❌ Erro ao carregar usuário: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Upload de Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleSetupStorage}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Configurando...' : 'Configurar Storage'}
            </Button>
            
            <Button 
              onClick={handleGetUser}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Carregando...' : 'Carregar Usuário'}
            </Button>
          </div>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {user && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Upload de Documentos</h3>
              <DocumentSection
                userId={user.id}
                initialDocumentType=""
                initialFrontUrl=""
                initialBackUrl=""
                onDocumentChange={(data) => {
                  console.log('Document change:', data);
                  setMessage(`📄 Documento atualizado: ${data.documentType}, Frente: ${data.frontUploaded}, Verso: ${data.backUploaded}`);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
