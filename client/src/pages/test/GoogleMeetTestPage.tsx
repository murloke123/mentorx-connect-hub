import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Mail, User, Video, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface GoogleMeetTestPageProps {}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const GoogleMeetTestPage: React.FC<GoogleMeetTestPageProps> = () => {
  const [connectionStatus, setConnectionStatus] = useState<TestResult | null>(null);
  const [appointmentResult, setAppointmentResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    mentor: {
      nome: 'João Silva Mentor',
      email: 'joao.mentor@teste.com'
    },
    mentorado: {
      nome: 'Maria Santos Mentorada',
      email: 'maria.mentorada@teste.com'
    },
    dataInicio: '',
    dataFim: '',
    observacoes: 'Teste de integração com Google Meet API'
  });

  // Função para testar conexão
  const testarConexao = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      console.log('🧪 [TEST] Iniciando teste de conexão...');
      
      const response = await fetch('/api/google-meet/test-connection');
      const result = await response.json();
      
      console.log('📊 [TEST] Resultado do teste:', result);
      setConnectionStatus(result);
      
    } catch (error) {
      console.error('❌ [TEST] Erro no teste de conexão:', error);
      setConnectionStatus({
        success: false,
        message: 'Erro ao testar conexão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Função para criar agendamento
  const criarAgendamento = async () => {
    setIsCreatingAppointment(true);
    setAppointmentResult(null);

    try {
      console.log('📅 [TEST] Criando agendamento...');
      console.log('📝 [TEST] Dados do formulário:', formData);
      
      const response = await fetch('/api/google-meet/create-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      console.log('📊 [TEST] Resultado da criação:', result);
      setAppointmentResult(result);
      
    } catch (error) {
      console.error('❌ [TEST] Erro ao criar agendamento:', error);
      setAppointmentResult({
        success: false,
        message: 'Erro ao criar agendamento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  // Função para gerar horários de teste
  const gerarHorariosTeste = () => {
    const agora = new Date();
    const dataInicio = new Date(agora.getTime() + 2 * 60 * 60 * 1000); // 2 horas a partir de agora
    const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); // 1 hora de duração
    
    setFormData({
      ...formData,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString()
    });
  };

  // Função para renderizar status
  const renderStatus = (result: TestResult | null) => {
    if (!result) return null;
    
    const Icon = result.success ? CheckCircle : XCircle;
    const color = result.success ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-2 ${color}`}>
        <Icon className="h-5 w-5" />
        <span>{result.message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎥 Teste de Integração Google Meet
          </h1>
          <p className="text-gray-600">
            Página para testar a criação de agendamentos com Google Meet API
          </p>
        </div>

        {/* Teste de Conexão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Teste de Conexão com Google Meet API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Primeiro, vamos testar se conseguimos conectar com a API do Google Calendar/Meet.
            </p>
            
            <Button 
              onClick={testarConexao}
              disabled={isTestingConnection}
              className="w-full"
            >
              {isTestingConnection ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testando Conexão...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
            
            {connectionStatus && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                {renderStatus(connectionStatus)}
                {connectionStatus.data && (
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(connectionStatus.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Agendamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Criar Agendamento de Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do Mentor */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Mentor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mentorNome">Nome do Mentor</Label>
                  <Input
                    id="mentorNome"
                    value={formData.mentor.nome}
                    onChange={(e) => setFormData({
                      ...formData,
                      mentor: { ...formData.mentor, nome: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="mentorEmail">Email do Mentor</Label>
                  <Input
                    id="mentorEmail"
                    type="email"
                    value={formData.mentor.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      mentor: { ...formData.mentor, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Dados do Mentorado */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Mentorado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mentoradoNome">Nome do Mentorado</Label>
                  <Input
                    id="mentoradoNome"
                    value={formData.mentorado.nome}
                    onChange={(e) => setFormData({
                      ...formData,
                      mentorado: { ...formData.mentorado, nome: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="mentoradoEmail">Email do Mentorado</Label>
                  <Input
                    id="mentoradoEmail"
                    type="email"
                    value={formData.mentorado.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      mentorado: { ...formData.mentorado, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Horários */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horários
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={gerarHorariosTeste}
                >
                  Gerar Horários de Teste
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicio">Data/Hora de Início</Label>
                  <Input
                    id="dataInicio"
                    type="datetime-local"
                    value={formData.dataInicio ? new Date(formData.dataInicio).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dataInicio: new Date(e.target.value).toISOString()
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="dataFim">Data/Hora de Fim</Label>
                  <Input
                    id="dataFim"
                    type="datetime-local"
                    value={formData.dataFim ? new Date(formData.dataFim).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dataFim: new Date(e.target.value).toISOString()
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({
                  ...formData,
                  observacoes: e.target.value
                })}
                rows={3}
              />
            </div>

            {/* Botão de Criar Agendamento */}
            <Button 
              onClick={criarAgendamento}
              disabled={isCreatingAppointment || !formData.dataInicio || !formData.dataFim}
              className="w-full"
              size="lg"
            >
              {isCreatingAppointment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando Agendamento...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Criar Agendamento de Teste
                </>
              )}
            </Button>

            {/* Resultado do Agendamento */}
            {appointmentResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                {renderStatus(appointmentResult)}
                
                {appointmentResult.success && appointmentResult.data && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appointmentResult.data.linkMeet && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded">
                          <p className="font-semibold text-green-800">🎥 Link do Google Meet:</p>
                          <a 
                            href={appointmentResult.data.linkMeet} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {appointmentResult.data.linkMeet}
                          </a>
                        </div>
                      )}
                      
                      {appointmentResult.data.linkEvento && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="font-semibold text-blue-800">📅 Link do Evento:</p>
                          <a 
                            href={appointmentResult.data.linkEvento} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            Ver no Google Calendar
                          </a>
                        </div>
                      )}
                    </div>
                    
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-gray-700">
                        📊 Ver Resposta Completa da API
                      </summary>
                      <pre className="mt-2 text-xs bg-white p-3 rounded border overflow-x-auto">
                        {JSON.stringify(appointmentResult.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
                
                {appointmentResult.error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="font-semibold text-red-800">❌ Erro:</p>
                    <p className="text-red-700">{appointmentResult.error}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instruções de Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Primeiro, clique em "Testar Conexão" para verificar se a API está funcionando</li>
              <li>Preencha os dados do mentor e mentorado (use emails reais para receber os convites)</li>
              <li>Use o botão "Gerar Horários de Teste" para criar horários automáticos</li>
              <li>Clique em "Criar Agendamento de Teste" para gerar o evento com Google Meet</li>
              <li>Se bem-sucedido, você receberá o link do Google Meet e do evento no calendário</li>
              <li>Verifique o console do navegador para logs detalhados do processo</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoogleMeetTestPage;
