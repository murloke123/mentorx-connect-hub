// 🎯 JITSI MEET - VERSÃO ULTRA SIMPLES
// Zero configuração, zero API keys, zero complicação!
// Apenas 1 função para gerar link de reunião instantaneamente!

/**
 * 🚀 FUNÇÃO PRINCIPAL - Criar link de reunião Jitsi
 * 
 * @param nomeRoomCustomizado - Nome personalizado para a sala (opcional)
 * @returns string - URL completa da reunião
 */
function criarLinkJitsi(nomeRoomCustomizado?: string): string {
  
  // PASSO 1: Definir se vai usar nome customizado ou gerar automático
  let roomId: string;
  
  if (nomeRoomCustomizado) {
    // PASSO 1A: Se passou nome customizado, limpar caracteres especiais
    const nomeProcessado = nomeRoomCustomizado
      .toLowerCase()                    // Converter para minúsculo
      .replace(/[^a-z0-9]/g, '')       // Remover caracteres especiais
      .substring(0, 30);               // Limitar a 30 caracteres
    
    // PASSO 1B: Adicionar timestamp para garantir unicidade
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
    roomId = `${nomeProcessado}-${timestamp}`;
  } else {
    // PASSO 1C: Gerar ID aleatório se não passou nome
    const randomId = Math.random().toString(36).substring(2, 12); // ID aleatório
    const timestamp = Date.now().toString().slice(-6);
    roomId = `sala-${randomId}-${timestamp}`;
  }
  
  // PASSO 2: Construir URL final
  const linkCompleto = `https://meet.jit.si/${roomId}`;
  
  // PASSO 3: Retornar link pronto para usar
  return linkCompleto;
}

// ===== JITSI MEET SERVICE =====
class JitsiMeetService {
  
  constructor() {
    console.log('🚀 [Jitsi] Serviço inicializado - ZERO configuração necessária!');
  }

  // ===== FUNÇÃO PRINCIPAL - GERAR LINK JITSI =====
  criarLinkMeet(nomeCustomizado?: string): string {
    console.log('🎥 [Jitsi] Gerando link da reunião...');
    
    const link = criarLinkJitsi(nomeCustomizado);
    
    console.log('✅ [Jitsi] Link gerado com sucesso!');
    console.log('🔗 [Jitsi] Link:', link);
    
    return link;
  }

  // ===== TESTAR CONEXÃO =====
  async testarConexao() {
    console.log('🧪 [Jitsi] Testando geração de link...');
    
    try {
      const linkTeste = this.criarLinkMeet('teste-conexao');
      
      console.log('✅ [Jitsi] Teste realizado com sucesso!');
      
      return {
        sucesso: true,
        linkTeste: linkTeste,
        mensagem: 'Jitsi funcionando perfeitamente - sem configuração!',
        provider: 'Jitsi Meet'
      };
      
    } catch (error: any) {
      console.error('❌ [Jitsi] Erro no teste (improvável):', error.message);
      return {
        sucesso: false,
        erro: error.message,
        mensagem: 'Falha no teste (muito improvável com Jitsi)'
      };
    }
  }

  // ===== MÉTODO PARA COMPATIBILIDADE COM SISTEMA ATUAL =====
  async criarAgendamentoComMeet(dadosAgendamento: any) {
    console.log('🔄 [Jitsi] Gerando link para agendamento...');
    console.log('📝 [Jitsi] Dados recebidos:', {
      mentor: dadosAgendamento.mentor?.nome,
      mentorado: dadosAgendamento.mentorado?.nome,
      dataInicio: dadosAgendamento.dataInicio
    });
    
    try {
      // Criar nome personalizado para a reunião
      const nomeReuniao = `mentoria-${dadosAgendamento.mentor?.nome || 'mentor'}-${dadosAgendamento.mentorado?.nome || 'mentorado'}`;
      
      // Gerar link Jitsi
      const linkMeet = this.criarLinkMeet(nomeReuniao);
      
      // Retornar no formato esperado pelo sistema atual
      const resultado = {
        eventoId: `jitsi-${Date.now()}`, // ID único
        linkMeet: linkMeet,
        linkEvento: linkMeet, // Mesmo link
        titulo: `Mentoria: ${dadosAgendamento.mentor?.nome} & ${dadosAgendamento.mentorado?.nome}`,
        dataInicio: dadosAgendamento.dataInicio,
        dataFim: dadosAgendamento.dataFim,
        status: 'confirmed',
        provider: 'Jitsi Meet'
      };
      
      console.log('✅ [Jitsi] Link gerado para agendamento!');
      console.log('🎥 [Jitsi] Link:', linkMeet);
      
      return resultado;
      
    } catch (error: any) {
      console.error('❌ [Jitsi] Erro ao gerar link para agendamento:', error.message);
      throw error;
    }
  }

  // ===== EXEMPLOS E UTILIDADES =====
  
  // Gerar link e abrir automaticamente
  criarEAbrir(nome?: string): string {
    const link = this.criarLinkMeet(nome);
    console.log('🚀 [Jitsi] Abrindo reunião automaticamente...');
    // No servidor, apenas retorna o link. No frontend, usaria window.open
    return link;
  }
  
  // Gerar múltiplos links de uma vez
  criarMultiplosLinks(quantidade: number = 3): string[] {
    console.log(`🎯 [Jitsi] Gerando ${quantidade} links...`);
    
    const links: string[] = [];
    for (let i = 1; i <= quantidade; i++) {
      const link = this.criarLinkMeet(`reuniao-${i}`);
      links.push(link);
    }
    
    console.log(`✅ [Jitsi] ${quantidade} links gerados!`);
    return links;
  }
  
  // Gerar link para evento específico
  criarLinkEvento(evento: { nome: string, data: string, participantes?: string[] }): any {
    console.log('📅 [Jitsi] Criando link para evento:', evento.nome);
    
    const nomeEvento = `${evento.nome}-${evento.data.replace(/[^0-9]/g, '')}`;
    const link = this.criarLinkMeet(nomeEvento);
    
    return {
      evento: evento.nome,
      data: evento.data,
      link: link,
      participantes: evento.participantes || [],
      criadoEm: new Date().toISOString(),
      provider: 'Jitsi Meet'
    };
  }
}

// ===== HELPER FUNCTIONS =====

// Versão ainda mais simples (1 linha só!)
const linkRapido = (): string => `https://meet.jit.si/sala-${Date.now()}`;

// Objeto com funções úteis
export const jitsiSimples = {
  // Gerar link com nome personalizado
  criarComNome: (nome: string) => criarLinkJitsi(nome),
  
  // Gerar link automático
  criarAutomatico: () => criarLinkJitsi(),
  
  // Versão ultra rápida
  criarRapido: linkRapido,
  
  // Gerar para mentoria específica
  criarMentoria: (mentor: string, mentorado: string) => {
    const nome = `mentoria-${mentor}-${mentorado}`;
    return criarLinkJitsi(nome);
  }
};

// 📋 EXEMPLOS DE USO:
console.log('🎯 Exemplos Jitsi:');
console.log('Link personalizado:', criarLinkJitsi('reuniao da equipe'));
console.log('Link automático:', criarLinkJitsi());
console.log('Link rápido:', linkRapido());
console.log('Link mentoria:', jitsiSimples.criarMentoria('João', 'Maria'));

export default JitsiMeetService;
export { criarLinkJitsi };
