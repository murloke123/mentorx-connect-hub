import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/utils/supabase';
import { CheckCircle, RefreshCw, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const TestDocumentVerificationPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'mentor1@teste.com')
        .single();

      if (error) {
        setMessage(`❌ Erro: ${error.message}`);
      } else {
        setProfile(data);
        setMessage('');
      }
    } catch (error) {
      setMessage(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const setVerificationStatus = async (status: string | null) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ document_verification_status: status })
        .eq('email', 'mentor1@teste.com');

      if (error) {
        setMessage(`❌ Erro ao atualizar: ${error.message}`);
      } else {
        setMessage(`✅ Status atualizado para: ${status || 'null'}`);
        await loadProfile();
      }
    } catch (error) {
      setMessage(`❌ Erro: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Teste - Verificação de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status do usuário */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3">👤 Usuário: mentor1@teste.com</h3>
              {profile ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">ID:</span> 
                    <span className="ml-2 font-mono">{profile.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nome:</span> 
                    <span className="ml-2">{profile.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status de Verificação:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                      profile.document_verification_status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.document_verification_status || 'null'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Carregando...</p>
              )}
            </div>

            {/* Mensagem de status */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Ações */}
            <div className="space-y-4">
              <h3 className="font-medium">🔧 Ações de Teste:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={() => setVerificationStatus('verified')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Definir como "verified"
                </Button>

                <Button
                  onClick={() => setVerificationStatus(null)}
                  disabled={loading}
                  variant="outline"
                >
                  <X className="h-4 w-4 mr-2" />
                  Resetar (null)
                </Button>

                <Button
                  onClick={loadProfile}
                  disabled={loading}
                  variant="outline"
                  className="md:col-span-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Dados
                </Button>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📋 Como testar:</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Defina o status como "verified" usando o botão acima</li>
                <li>Faça login com a conta mentor1@teste.com</li>
                <li>Acesse a página de onboarding do Stripe</li>
                <li>Vá para o Step 4 (Documentos)</li>
                <li>Verifique se os elementos estão ocultos:
                  <ul className="ml-6 mt-2 space-y-1 text-xs list-disc list-inside">
                    <li>Alert com requisitos do passaporte</li>
                    <li>Label com asterisco obrigatório</li>
                    <li>Área de upload drag-and-drop</li>
                    <li>Mensagem "Aguardando upload dos documentos..."</li>
                  </ul>
                </li>
                <li>Para resetar o teste, clique em "Resetar (null)"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
