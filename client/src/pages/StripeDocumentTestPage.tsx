import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadAndAssociateDocument, getUserStripeAccountId } from '@/services/stripeDocumentService';
import { debugStripeAccount } from '@/utils/debugStripeAccount';
import { testStripeDocumentService, testCompleteUploadFlow } from '@/utils/testStripeDocumentService';

export default function StripeDocumentTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState('');
  const [documentType, setDocumentType] = useState<'front' | 'back' | 'additional'>('front');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log(' Arquivo selecionado:', {
        name: selectedFile.name,
        size: `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`,
        type: selectedFile.type
      });
    }
  };

  const checkStripeAccount = async () => {
    if (!userId) {
      alert('Digite um User ID primeiro');
      return;
    }

    try {
      setIsUploading(true);
      const accountId = await getUserStripeAccountId(userId);
      setStripeAccountId(accountId);
      console.log(' Stripe Account ID encontrado:', accountId);
    } catch (error) {
      console.error(' Erro ao buscar Stripe Account:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) {
      alert('Selecione um arquivo e digite um User ID');
      return;
    }

    try {
      setIsUploading(true);
      setResult(null);

      console.log(' ===== TESTE DE UPLOAD COMPLETO =====');
      console.log(' Parâmetros:', {
        fileName: file.name,
        userId,
        documentType,
        purpose: 'identity_document'
      });

      const uploadResult = await uploadAndAssociateDocument(
        file,
        userId,
        documentType,
        'identity_document'
      );

      setResult(uploadResult);
      
      console.log(' RESULTADO FINAL:', uploadResult);

      if (uploadResult.success) {
        console.log(' SUCESSO COMPLETO!');
        if (uploadResult.associated) {
          console.log(' Documento enviado para Stripe E associado à conta conectada');
        } else {
          console.log(' Documento enviado para Stripe mas NÃO foi associado à conta');
        }
      } else {
        console.log(' FALHA:', uploadResult.error);
      }

    } catch (error: any) {
      console.error(' ERRO CRÍTICO:', error);
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDebug = async () => {
    try {
      setIsUploading(true);
      const info = await debugStripeAccount();
      setDebugInfo(info);
      
      if (info?.currentUser?.id) {
        setUserId(info.currentUser.id);
        setStripeAccountId(info.stripeAccountId);
      }
    } catch (error) {
      console.error(' Erro no debug:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectTest = async () => {
    try {
      setIsUploading(true);
      const result = await testStripeDocumentService();
      setTestResult(result);
      console.log('🧪 Resultado do teste direto:', result);
    } catch (error) {
      console.error('❌ Erro no teste direto:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCompleteTest = async () => {
    if (!file) {
      alert('Selecione um arquivo primeiro!');
      return;
    }
    
    try {
      setIsUploading(true);
      const result = await testCompleteUploadFlow(file);
      setResult(result);
      console.log('🚀 Resultado do teste completo:', result);
    } catch (error) {
      console.error('❌ Erro no teste completo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Teste de Upload de Documentos - Stripe API
        </h1>
        
        <div className="grid gap-6">
          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle>1. Configurações do Teste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userId">User ID do Supabase</Label>
                <Input
                  id="userId"
                  placeholder="Ex: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front">Frente do Documento</SelectItem>
                    <SelectItem value="back">Verso do Documento</SelectItem>
                    <SelectItem value="additional">Documento Adicional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  onClick={checkStripeAccount} 
                  disabled={isUploading || !userId}
                  variant="outline"
                >
                  {isUploading ? 'Verificando...' : 'Verificar Stripe Account ID'}
                </Button>
                {stripeAccountId && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Stripe Account ID: <code className="font-mono">{stripeAccountId}</code>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Button 
                  onClick={handleDebug} 
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? 'Debugando...' : 'Debugar Stripe Account'}
                </Button>
                {debugInfo && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>
                          <strong>CurrentUser ID:</strong> <code className="font-mono">{debugInfo.currentUser.id}</code>
                        </div>
                        <div>
                          <strong>Stripe Account ID:</strong> <code className="font-mono">{debugInfo.stripeAccountId}</code>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div>
                <Button 
                  onClick={handleDirectTest} 
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? 'Testando...' : 'Testar Serviço de Documentos'}
                </Button>
                {testResult && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>
                          <strong>Resultado:</strong> {testResult.success ? ' Sucesso' : ' Erro'}
                        </div>
                        {testResult.error && (
                          <div>
                            <strong>Erro:</strong> <span className="text-red-600">{testResult.error}</span>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload */}
          <Card>
            <CardHeader>
              <CardTitle>2. Upload de Arquivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">Selecionar Arquivo (JPEG, PNG ou PDF)</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                />
                {file && (
                  <Alert className="mt-2">
                    <AlertDescription>
                      Arquivo selecionado: <strong>{file.name}</strong> 
                      ({(file.size / 1024 / 1024).toFixed(2)}MB)
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={isUploading || !file || !userId}
                className="w-full"
              >
                {isUploading ? 'Fazendo Upload...' : 'Upload para Stripe + Associar à Conta'}
              </Button>

              <Button 
                onClick={handleCompleteTest} 
                disabled={isUploading || !file}
                className="w-full mt-4"
              >
                {isUploading ? 'Testando...' : 'Testar Upload Completo'}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>3. Resultado do Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant={result.success ? "default" : "destructive"}>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div>
                        <strong>Status:</strong> {result.success ? ' Sucesso' : ' Erro'}
                      </div>
                      
                      {result.fileId && (
                        <div>
                          <strong>Stripe File ID:</strong> <code className="font-mono">{result.fileId}</code>
                        </div>
                      )}
                      
                      {result.url && (
                        <div>
                          <strong>URL:</strong> <code className="font-mono text-xs">{result.url}</code>
                        </div>
                      )}
                      
                      {result.associated !== undefined && (
                        <div>
                          <strong>Associado à Conta:</strong> {result.associated ? ' Sim' : ' Não'}
                        </div>
                      )}
                      
                      {result.error && (
                        <div>
                          <strong>Erro:</strong> <span className="text-red-600">{result.error}</span>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle> Instruções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>1.</strong> Digite um User ID válido do Supabase (usuário que já fez onboarding do Stripe)</p>
                <p><strong>2.</strong> Selecione o tipo de documento (frente, verso ou adicional)</p>
                <p><strong>3.</strong> Escolha um arquivo (JPEG, PNG ou PDF até 5MB)</p>
                <p><strong>4.</strong> Clique em upload para enviar para Stripe e associar automaticamente à conta</p>
                <p><strong>5.</strong> Verifique os logs detalhados no console do navegador</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
