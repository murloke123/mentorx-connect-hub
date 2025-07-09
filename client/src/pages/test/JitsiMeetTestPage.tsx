// 🎯 PÁGINA DE TESTE - JITSI MEET
// Testar geração de links de reunião de forma ultra simples!

import React, { useState } from 'react';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

const JitsiMeetTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [nomeReuniao, setNomeReuniao] = useState('');
  const [agendamentoResult, setAgendamentoResult] = useState<any>(null);
  const [multipleLinks, setMultipleLinks] = useState<string[]>([]);

  // ===== TESTE DE CONEXÃO =====
  const testarConexao = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testando conexão Jitsi...');
      
      const response = await fetch('/api/jitsi-meet/test-connection');
      const result = await response.json();
      
      console.log('📊 Resultado do teste:', result);
      setTestResult(result);
      
    } catch (error: any) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        success: false,
        error: error.message,
        message: 'Erro ao testar conexão'
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== GERAR LINK RÁPIDO =====
  const gerarLinkRapido = async () => {
    setLoading(true);
    
    try {
      console.log('⚡ Gerando link rápido...');
      
      const response = await fetch('/api/jitsi-meet/quick-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeReuniao: nomeReuniao || undefined
        })
      });
      
      const result = await response.json();
      console.log('🔗 Link gerado:', result);
      
      if (result.success) {
        // Copiar link para clipboard automaticamente
        await navigator.clipboard.writeText(result.data.link);
        alert(`Link copiado para clipboard!\n\n${result.data.link}`);
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao gerar link:', error);
      alert('Erro ao gerar link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== CRIAR AGENDAMENTO COMPLETO =====
  const criarAgendamento = async () => {
    setLoading(true);
    setAgendamentoResult(null);
    
    try {
      console.log('📅 Criando agendamento com Jitsi...');
      
      const dadosAgendamento = {
        mentor: {
          nome: 'João Silva',
          email: 'joao@exemplo.com'
        },
        mentorado: {
          nome: 'Maria Santos',
          email: 'maria@exemplo.com'
        },
        dataInicio: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // +1 hora
        observacoes: 'Mentoria de teste usando Jitsi Meet'
      };
      
      const response = await fetch('/api/jitsi-meet/create-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosAgendamento)
      });
      
      const result = await response.json();
      console.log('📋 Agendamento criado:', result);
      
      if (result.success) {
        setAgendamentoResult(result.data);
        // Copiar link para clipboard
        await navigator.clipboard.writeText(result.data.linkMeet);
      } else {
        alert('Erro: ' + result.error);
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== GERAR MÚLTIPLOS LINKS =====
  const gerarMultiplosLinks = async () => {
    setLoading(true);
    setMultipleLinks([]);
    
    try {
      console.log('🎯 Gerando múltiplos links...');
      
      const response = await fetch('/api/jitsi-meet/multiple-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantidade: 5
        })
      });
      
      const result = await response.json();
      console.log('📋 Links gerados:', result);
      
      if (result.success) {
        setMultipleLinks(result.data.links);
      } else {
        alert('Erro: ' + result.error);
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao gerar links:', error);
      alert('Erro ao gerar múltiplos links: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== ABRIR REUNIÃO =====
  const abrirReuniao = (link: string) => {
    console.log('🚀 Abrindo reunião:', link);
    window.open(link, '_blank');
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '2px solid #007bff'
      }}>
        <h1 style={{ color: '#007bff', margin: '0 0 10px 0' }}>
          🎥 Jitsi Meet - Página de Teste
        </h1>
        <p style={{ margin: '0', color: '#666' }}>
          🚀 ZERO configuração • ⚡ Links instantâneos • 🔒 Sem API keys
        </p>
      </div>

      {/* BOTÕES DE TESTE */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {/* Teste de Conexão */}
        <button 
          onClick={testarConexao}
          disabled={loading}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          🧪 Testar Conexão
        </button>

        {/* Criar Agendamento */}
        <button 
          onClick={criarAgendamento}
          disabled={loading}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            padding: '15px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          📅 Criar Agendamento
        </button>

        {/* Gerar Múltiplos Links */}
        <button 
          onClick={gerarMultiplosLinks}
          disabled={loading}
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            padding: '15px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          🎯 Gerar 5 Links
        </button>
      </div>

      {/* SEÇÃO LINK RÁPIDO */}
      <div style={{
        backgroundColor: '#fff3cd',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#856404' }}>
          ⚡ Gerador de Link Rápido
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Nome da reunião (opcional)"
            value={nomeReuniao}
            onChange={(e) => setNomeReuniao(e.target.value)}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          
          <button 
            onClick={gerarLinkRapido}
            disabled={loading}
            style={{
              backgroundColor: '#ffc107',
              color: '#212529',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.6 : 1
            }}
          >
            ⚡ Gerar Link
          </button>
        </div>
      </div>

      {/* RESULTADO DO TESTE DE CONEXÃO */}
      {testResult && (
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          border: `2px solid ${testResult.success ? '#28a745' : '#dc3545'}`,
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            color: testResult.success ? '#155724' : '#721c24' 
          }}>
            {testResult.success ? '✅' : '❌'} Resultado do Teste
          </h3>
          
          <p><strong>Status:</strong> {testResult.success ? 'Sucesso' : 'Erro'}</p>
          <p><strong>Mensagem:</strong> {testResult.message}</p>
          
          {testResult.success && testResult.data && (
            <div>
              <p><strong>Link de Teste:</strong></p>
              <div style={{ 
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>{testResult.data.linkTeste}</span>
                <button 
                  onClick={() => abrirReuniao(testResult.data.linkTeste)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    marginLeft: '10px'
                  }}
                >
                  🔗 Abrir
                </button>
              </div>
            </div>
          )}
          
          {testResult.error && (
            <div style={{ 
              backgroundColor: '#ffffff',
              padding: '10px',
              borderRadius: '5px',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#721c24'
            }}>
              <strong>Erro:</strong> {testResult.error}
            </div>
          )}
        </div>
      )}

      {/* RESULTADO DO AGENDAMENTO */}
      {agendamentoResult && (
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #007bff',
          backgroundColor: '#e3f2fd',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#1565c0' }}>
            📅 Agendamento Criado com Sucesso!
          </h3>
          
          <p><strong>Título:</strong> {agendamentoResult.titulo}</p>
          <p><strong>ID:</strong> {agendamentoResult.eventoId}</p>
          <p><strong>Provider:</strong> {agendamentoResult.provider}</p>
          
          <div style={{ marginTop: '15px' }}>
            <p><strong>🔗 Link da Reunião:</strong></p>
            <div style={{ 
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '5px',
              fontFamily: 'monospace',
              fontSize: '12px',
              wordBreak: 'break-all',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{agendamentoResult.linkMeet}</span>
              <button 
                onClick={() => abrirReuniao(agendamentoResult.linkMeet)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                🚀 Abrir Reunião
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MÚLTIPLOS LINKS */}
      {multipleLinks.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #6f42c1',
          backgroundColor: '#f3e5f5',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#4a148c' }}>
            🎯 Múltiplos Links Gerados ({multipleLinks.length})
          </h3>
          
          {multipleLinks.map((link, index) => (
            <div key={index} style={{ 
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ 
                fontFamily: 'monospace',
                fontSize: '12px',
                wordBreak: 'break-all',
                flex: 1
              }}>
                {index + 1}. {link}
              </span>
              
              <button 
                onClick={() => abrirReuniao(link)}
                style={{
                  backgroundColor: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  fontSize: '12px'
                }}
              >
                🔗 Abrir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* LOADING INDICATOR */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <p style={{ margin: '0', color: '#856404' }}>
            ⏳ Processando... Aguarde um momento.
          </p>
        </div>
      )}

      {/* INSTRUÇÕES */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
          📋 Como usar:
        </h4>
        <ul style={{ margin: '0', paddingLeft: '20px', color: '#6c757d' }}>
          <li><strong>Testar Conexão:</strong> Verifica se o serviço Jitsi está funcionando</li>
          <li><strong>Link Rápido:</strong> Gera um link instantâneo (com ou sem nome)</li>
          <li><strong>Criar Agendamento:</strong> Simula criação de mentoria completa</li>
          <li><strong>Múltiplos Links:</strong> Gera vários links de uma vez</li>
          <li><strong>Abrir Reunião:</strong> Clique nos botões 🔗 para testar os links</li>
        </ul>
        
        <p style={{ margin: '15px 0 0 0', fontSize: '14px', fontStyle: 'italic' }}>
          💡 <strong>Vantagem do Jitsi:</strong> Zero configuração, funciona instantaneamente!
        </p>
      </div>
    </div>
  );
};

export default JitsiMeetTestPage;
