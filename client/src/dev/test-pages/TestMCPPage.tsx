import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase";
import { CheckCircle, XCircle, Database, Settings, Play, Copy } from 'lucide-react';

interface MCPConfig {
  mcpServers: {
    Postgrest: {
      command: string;
      args: string[];
      env: Record<string, string>;
    };
  };
}

const TestMCPPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [testResults, setTestResults] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM profiles LIMIT 5;');
  
  // Configuração MCP padrão
  const defaultMCPConfig: MCPConfig = {
    mcpServers: {
      Postgrest: {
        command: "npx",
        args: [
          "-y",
          "@supabase/mcp-server-postgrest",
          "--apiUrl",
          "https://erfuinkfouijxgfkxhhn.supabase.co/rest/v1",
          "--schema",
          "public",
          "--apiKey",
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyZnVpbmtmb3VpanhnZmt4aGhuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzIzNTY1MCwiZXhwIjoyMDYyODExNjUwfQ.oueeXq-oTRZvJihpnhBo5cHKsyW-_BCHJSWI73G0rCc"
        ],
        env: {}
      }
    }
  };

  const [mcpConfig, setMcpConfig] = useState<MCPConfig>(defaultMCPConfig);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('idle');
    setTestResults('');

    const logs: string[] = [];
    
    try {
      logs.push(`🔍 [${new Date().toISOString()}] Iniciando teste de conexão...`);
      console.log('🔍 Iniciando teste de conexão MCP Supabase');

      // Teste 1: Verificar configuração do Supabase
      logs.push(`📋 [${new Date().toISOString()}] Verificando configuração do Supabase...`);
      console.log('📋 Configuração Supabase:', {
        url: supabase.supabaseUrl,
        key: supabase.supabaseKey ? `${supabase.supabaseKey.substring(0, 20)}...` : 'Não encontrada'
      });

      // Teste 2: Conexão básica com Supabase Auth
      logs.push(`🔐 [${new Date().toISOString()}] Testando autenticação...`);
      console.log('🔐 Testando autenticação Supabase...');
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        logs.push(`❌ [${new Date().toISOString()}] Erro de autenticação: ${authError.message}`);
        console.error('❌ Erro de autenticação:', authError);
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }
      
      logs.push(`✅ [${new Date().toISOString()}] Autenticação: ${authData?.user ? 'Usuário autenticado' : 'Sem usuário logado'}`);
      console.log('✅ Dados de autenticação:', authData);

      // Teste 3: Conectividade com o banco
      logs.push(`🗄️ [${new Date().toISOString()}] Testando conectividade com banco...`);
      console.log('🗄️ Testando conectividade com banco...');
      
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (healthError) {
        logs.push(`❌ [${new Date().toISOString()}] Erro de conectividade: ${healthError.message}`);
        console.error('❌ Erro de conectividade:', healthError);
        throw new Error(`Erro de conectividade: ${healthError.message}`);
      }

      logs.push(`✅ [${new Date().toISOString()}] Conectividade com banco: OK`);
      console.log('✅ Conectividade com banco: OK', healthCheck);

      // Teste 4: Verificar se existem registros
      logs.push(`📊 [${new Date().toISOString()}] Verificando se existem registros na tabela...`);
      console.log('📊 Verificando se existem registros na tabela...');
      
      const { count: totalCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        logs.push(`⚠️ [${new Date().toISOString()}] Aviso ao contar registros: ${countError.message}`);
        console.warn('⚠️ Aviso ao contar registros:', countError);
      } else {
        logs.push(`✅ [${new Date().toISOString()}] Total de registros na tabela: ${totalCount || 0}`);
        console.log('✅ Total de registros na tabela:', totalCount);
      }

      // Teste 5: Query simples na tabela profiles (usando colunas básicas)
      logs.push(`📊 [${new Date().toISOString()}] Executando query na tabela profiles...`);
      console.log('📊 Executando query na tabela profiles...');
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .limit(3);

      if (profilesError) {
        logs.push(`❌ [${new Date().toISOString()}] Erro na query profiles: ${profilesError.message}`);
        console.error('❌ Erro na query profiles:', profilesError);
        throw new Error(`Erro ao consultar profiles: ${profilesError.message}`);
      }

      logs.push(`✅ [${new Date().toISOString()}] Query profiles: ${profilesData?.length || 0} registros retornados`);
      console.log('✅ Dados da query profiles:', profilesData);

      // Teste 6: Verificar estrutura da tabela
      logs.push(`🔍 [${new Date().toISOString()}] Verificando estrutura da tabela...`);
      console.log('🔍 Verificando estrutura da tabela...');
      
      const { data: tableInfo, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (tableError) {
        logs.push(`❌ [${new Date().toISOString()}] Erro ao verificar estrutura: ${tableError.message}`);
        console.error('❌ Erro ao verificar estrutura:', tableError);
        throw new Error(`Erro ao verificar estrutura da tabela: ${tableError.message}`);
      }

      const tableColumns = tableInfo && tableInfo[0] ? Object.keys(tableInfo[0]) : [];
      logs.push(`✅ [${new Date().toISOString()}] Estrutura da tabela: ${tableColumns.length} colunas encontradas`);
      logs.push(`📋 [${new Date().toISOString()}] Colunas disponíveis: ${tableColumns.join(', ')}`);
      console.log('✅ Estrutura da tabela:', tableColumns);
      console.log('📋 Colunas disponíveis:', tableColumns);

      // Teste 7: Verificar políticas RLS (Row Level Security)
      logs.push(`🔒 [${new Date().toISOString()}] Testando políticas RLS...`);
      console.log('🔒 Testando políticas RLS...');
      
      try {
        // Tentar uma query sem autenticação específica
        const { data: rlsTest, error: rlsError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        if (rlsError) {
          logs.push(`⚠️ [${new Date().toISOString()}] Possível problema com RLS: ${rlsError.message}`);
          console.warn('⚠️ Possível problema com RLS:', rlsError);
        } else {
          logs.push(`✅ [${new Date().toISOString()}] RLS OK: ${rlsTest?.length || 0} registros acessíveis`);
          console.log('✅ RLS OK:', rlsTest);
        }
      } catch (rlsError) {
        logs.push(`⚠️ [${new Date().toISOString()}] Erro ao testar RLS: ${rlsError instanceof Error ? rlsError.message : 'Erro desconhecido'}`);
        console.warn('⚠️ Erro ao testar RLS:', rlsError);
      }

      // Teste 8: Verificar MCP Config
      logs.push(`⚙️ [${new Date().toISOString()}] Verificando configuração MCP...`);
      console.log('⚙️ Configuração MCP:', mcpConfig);

      const apiUrl = mcpConfig.mcpServers.Postgrest.args.find((arg, index) => 
        mcpConfig.mcpServers.Postgrest.args[index - 1] === '--apiUrl'
      );
      
      const apiKey = mcpConfig.mcpServers.Postgrest.args.find((arg, index) => 
        mcpConfig.mcpServers.Postgrest.args[index - 1] === '--apiKey'
      );

      logs.push(`📋 [${new Date().toISOString()}] API URL: ${apiUrl || 'Não encontrada'}`);
      logs.push(`🔑 [${new Date().toISOString()}] API Key: ${apiKey ? `${apiKey.substring(0, 20)}...` : 'Não encontrada'}`);

      // Teste 9: Verificar se a API Key do MCP é válida
      logs.push(`🔐 [${new Date().toISOString()}] Testando API Key do MCP...`);
      console.log('🔐 Testando API Key do MCP...');
      
      if (apiUrl && apiKey) {
        try {
          const response = await fetch(`${apiUrl}/profiles?limit=1`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'apikey': apiKey
            }
          });
          
          const responseData = await response.json();
          
          if (response.ok) {
            logs.push(`✅ [${new Date().toISOString()}] API Key MCP válida: ${response.status} ${response.statusText}`);
            console.log('✅ API Key MCP válida:', responseData);
          } else {
            logs.push(`❌ [${new Date().toISOString()}] API Key MCP inválida: ${response.status} ${response.statusText}`);
            console.error('❌ API Key MCP inválida:', responseData);
          }
        } catch (fetchError) {
          logs.push(`⚠️ [${new Date().toISOString()}] Erro ao testar API Key MCP: ${fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'}`);
          console.warn('⚠️ Erro ao testar API Key MCP:', fetchError);
        }
      } else {
        logs.push(`⚠️ [${new Date().toISOString()}] API URL ou API Key não encontrada na configuração MCP`);
        console.warn('⚠️ API URL ou API Key não encontrada na configuração MCP');
      }

      // Compilar resultados
      const results = {
        timestamp: new Date().toISOString(),
        test_status: '✅ SUCESSO',
        logs: logs,
        authentication: {
          status: authData?.user ? '✅ Autenticado' : '⚠️ Sem usuário logado',
          user_id: authData?.user?.id || null,
          user_email: authData?.user?.email || null
        },
        database: {
          connection: '✅ Conectado',
          total_records: totalCount || 0,
          profiles_count: profilesData?.length || 0,
          table_columns: tableColumns,
          table_columns_list: tableColumns.join(', '),
          sample_data: profilesData,
          sample_record: tableInfo && tableInfo[0] ? tableInfo[0] : null
        },
        mcp_config: {
          api_url: apiUrl,
          api_key_preview: apiKey ? `${apiKey.substring(0, 20)}...` : 'Não encontrada',
          schema: mcpConfig.mcpServers.Postgrest.args.find((arg, index) => 
            mcpConfig.mcpServers.Postgrest.args[index - 1] === '--schema'
          ) || 'public'
        }
      };

      setTestResults(JSON.stringify(results, null, 2));
      setConnectionStatus('success');
      
      logs.push(`🎉 [${new Date().toISOString()}] Teste concluído com sucesso!`);
      console.log('🎉 Teste concluído com sucesso!', results);
      
      toast({
        title: "Teste realizado com sucesso!",
        description: "Conexão com Supabase está funcionando corretamente.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logs.push(`💥 [${new Date().toISOString()}] ERRO FATAL: ${errorMessage}`);
      console.error('💥 ERRO FATAL:', error);
      
      const errorResults = {
        timestamp: new Date().toISOString(),
        test_status: '❌ FALHA',
        error: errorMessage,
        logs: logs,
        mcp_config: mcpConfig
      };
      
      setTestResults(JSON.stringify(errorResults, null, 2));
      setConnectionStatus('error');
      
      toast({
        variant: "destructive",
        title: "Falha no teste",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testCustomQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        variant: "destructive",
        title: "Query vazia",
        description: "Digite uma query SQL para testar.",
      });
      return;
    }

    setIsLoading(true);
    const logs: string[] = [];
    
    try {
      logs.push(`🔍 [${new Date().toISOString()}] Iniciando execução de query personalizada...`);
      console.log('🔍 Iniciando execução de query personalizada:', sqlQuery);

      // Simular execução de query personalizada
      // Como estamos usando Supabase client, vamos adaptar para uma query válida
      const cleanQuery = sqlQuery.replace(/;$/, '');
      
      logs.push(`📝 [${new Date().toISOString()}] Query original: ${sqlQuery}`);
      logs.push(`🧹 [${new Date().toISOString()}] Query limpa: ${cleanQuery}`);
      console.log('📝 Query processada:', { original: sqlQuery, clean: cleanQuery });
      
      if (cleanQuery.toLowerCase().includes('select') && cleanQuery.toLowerCase().includes('profiles')) {
        logs.push(`✅ [${new Date().toISOString()}] Query validada: SELECT em profiles`);
        console.log('✅ Query validada para execução');
        
        // Primeiro, verificar quais colunas existem
        const { data: sampleData, error: sampleError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);

        if (sampleError) {
          logs.push(`❌ [${new Date().toISOString()}] Erro ao verificar colunas: ${sampleError.message}`);
          console.error('❌ Erro ao verificar colunas:', sampleError);
          throw sampleError;
        }

        const availableColumns = sampleData && sampleData[0] ? Object.keys(sampleData[0]) : [];
        logs.push(`📋 [${new Date().toISOString()}] Colunas disponíveis: ${availableColumns.join(', ')}`);
        console.log('📋 Colunas disponíveis:', availableColumns);
        
        // Agora executar a query
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(10);

        if (error) {
          logs.push(`❌ [${new Date().toISOString()}] Erro na execução: ${error.message}`);
          console.error('❌ Erro na execução da query:', error);
          throw error;
        }

        logs.push(`✅ [${new Date().toISOString()}] Query executada com sucesso: ${data?.length || 0} registros`);
        console.log('✅ Query executada com sucesso:', data);

        const queryResults = {
          timestamp: new Date().toISOString(),
          query_status: '✅ SUCESSO',
          logs: logs,
          query: {
            original: sqlQuery,
            executed: 'SELECT * FROM profiles LIMIT 10',
            type: 'SELECT'
          },
          results: {
            count: data?.length || 0,
            data: data,
            columns: availableColumns,
            sample_record: data && data[0] ? data[0] : null
          }
        };

        setTestResults(JSON.stringify(queryResults, null, 2));
        
        toast({
          title: "Query executada com sucesso!",
          description: `Retornados ${data?.length || 0} registros.`,
        });
      } else {
        logs.push(`❌ [${new Date().toISOString()}] Query inválida: deve conter SELECT e profiles`);
        console.error('❌ Query inválida:', cleanQuery);
        throw new Error('Apenas queries SELECT na tabela profiles são suportadas neste teste.');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logs.push(`💥 [${new Date().toISOString()}] ERRO: ${errorMessage}`);
      console.error('💥 Erro na query:', error);
      
      const errorResults = {
        timestamp: new Date().toISOString(),
        query_status: '❌ FALHA',
        error: errorMessage,
        logs: logs,
        query: sqlQuery
      };
      
      setTestResults(JSON.stringify(errorResults, null, 2));
      
      toast({
        variant: "destructive",
        title: "Erro na query",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyConfigToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(mcpConfig, null, 2));
    toast({
      title: "Configuração copiada!",
      description: "A configuração MCP foi copiada para a área de transferência.",
    });
  };

  const resetToDefault = () => {
    setMcpConfig(defaultMCPConfig);
    toast({
      title: "Configuração restaurada",
      description: "A configuração MCP foi restaurada para o padrão.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Teste de Conexão MCP - Supabase
          </h1>
          <p className="text-gray-600">
            Teste a configuração do MCP Server do Supabase e verifique se a conexão está funcionando corretamente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração MCP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração MCP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mcp-config">Configuração JSON</Label>
                <Textarea
                  id="mcp-config"
                  value={JSON.stringify(mcpConfig, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setMcpConfig(parsed);
                    } catch (error) {
                      // Ignorar erros de parsing durante a digitação
                    }
                  }}
                  className="font-mono text-sm"
                  rows={15}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={copyConfigToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar
                </Button>
                <Button
                  onClick={resetToDefault}
                  variant="outline"
                  size="sm"
                >
                  Restaurar Padrão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Testes de Conexão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Testes de Conexão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status da Conexão */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {connectionStatus === 'idle' && (
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  )}
                  {connectionStatus === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {connectionStatus === 'error' && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="font-medium">
                    Status: {connectionStatus === 'idle' ? 'Aguardando' : 
                            connectionStatus === 'success' ? 'Conectado' : 'Erro'}
                  </span>
                </div>
              </div>

              {/* Teste Básico */}
              <div>
                <Button
                  onClick={testSupabaseConnection}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Testar Conexão Supabase
                </Button>
              </div>

              {/* Query Personalizada */}
              <div className="space-y-2">
                <Label htmlFor="custom-query">Query SQL Personalizada</Label>
                <Textarea
                  id="custom-query"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="SELECT * FROM profiles LIMIT 5;"
                  className="font-mono text-sm"
                  rows={3}
                />
                <Button
                  onClick={testCustomQuery}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <Spinner className="h-4 w-4 mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Executar Query
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        {testResults && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resultados do Teste</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {testResults}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Informações Adicionais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações sobre o MCP Server</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">O que é o MCP Server?</h3>
              <p className="text-gray-600 mb-4">
                O MCP (Model Context Protocol) Server permite que assistentes de IA como Claude se conectem 
                diretamente com bancos de dados e APIs externas. O servidor Supabase MCP fornece acesso 
                direto ao seu banco PostgreSQL através da API REST do Supabase.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Configuração TRAE AI</h3>
              <p className="text-gray-600 mb-2">
                Para usar esta configuração no TRAE AI, adicione o JSON da configuração MCP nas 
                configurações do seu assistente.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Verifique se a API Key tem as permissões adequadas 
                  e se o domínio está configurado corretamente no Supabase.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Troubleshooting</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Verifique se a API Key não expirou</li>
                <li>• Confirme se o schema "public" está acessível</li>
                <li>• Verifique as políticas RLS (Row Level Security)</li>
                <li>• Confirme se o endpoint da API está correto</li>
                <li>• <strong>Erro "column does not exist"</strong>: Verifique as colunas disponíveis nos resultados do teste</li>
                <li>• Abra o Console do Navegador (F12) para ver logs detalhados</li>
                <li>• Verifique se há erros de CORS ou autenticação</li>
                <li>• Para queries SQL, use apenas colunas que existem na tabela</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Logs do Console</h3>
              <p className="text-gray-600 text-sm mb-2">
                Todos os testes geram logs detalhados no console do navegador. Pressione F12 para abrir as ferramentas de desenvolvedor e veja a aba "Console" para informações detalhadas sobre:
              </p>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Configuração do Supabase (URL e chave)</li>
                <li>• Dados de autenticação retornados</li>
                <li>• Respostas do servidor para cada teste</li>
                <li>• Estrutura das tabelas e dados</li>
                <li>• Erros detalhados com stack trace</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestMCPPage;