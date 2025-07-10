/**
 * JitsiMeetService - Serviço ultra simples para gerar links Jitsi Meet
 * Zero configuração, sem API keys, sem OAuth, sem permissões
 * Gera links instantaneamente
 */

interface AgendamentoData {
  mentor: { nome: string };
  mentee?: { nome: string };
  mentorado?: { nome: string };
  data?: string;
  horario?: string;
  titulo?: string;
}

interface JitsiLinkResponse {
  sucesso: boolean;
  linkMeet?: string;
  linkTeste?: string;
  eventoId?: string;
  titulo?: string;
  mensagem: string;
  provider: string;
}

class JitsiMeetService {
  private generateRoomId(customName?: string): string {
    if (customName) {
      // Remove caracteres especiais e substitui espaços por hífen
      const cleanName = customName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '');
      
      // Adiciona timestamp para uniqueness
      const timestamp = Date.now().toString().slice(-6);
      return `${cleanName}-${timestamp}`;
    }
    
    // ID aleatório simples
    const timestamp = Date.now().toString().slice(-6);
    return `reuniao-${timestamp}`;
  }

  /**
   * Cria link Jitsi Meet personalizado
   */
  criarLinkMeet(nomeReuniao?: string): string {
    const roomId = this.generateRoomId(nomeReuniao);
    return `https://meet.jit.si/${roomId}`;
  }

  /**
   * Testa conexão (sempre funciona com Jitsi)
   */
  async testarConexao(): Promise<JitsiLinkResponse> {
    const linkTeste = this.criarLinkMeet('testeconexao');
    
    return {
      sucesso: true,
      linkTeste,
      mensagem: 'Jitsi funcionando perfeitamente - sem configuração!',
      provider: 'Jitsi Meet'
    };
  }

  /**
   * Cria agendamento com link Jitsi Meet
   */
  async criarAgendamentoComMeet(dadosAgendamento: any): Promise<JitsiLinkResponse> {
    try {
      const { mentor, mentee, mentorado, titulo } = dadosAgendamento;
      
      // Suportar tanto 'mentee' quanto 'mentorado'
      const mentoradoData = mentee || mentorado;
      
      if (!mentor || !mentor.nome || !mentoradoData || !mentoradoData.nome) {
        throw new Error('Dados de mentor e mentorado são obrigatórios');
      }
      
      // Gerar nome da reunião baseado nos participantes
      const nomeReuniao = titulo || `mentoria${mentor.nome.replace(/\s+/g, '')}${mentoradoData.nome.replace(/\s+/g, '')}`;
      
      const linkMeet = this.criarLinkMeet(nomeReuniao);
      const eventoId = `jitsi-${Date.now()}`;
      
      console.log('🎥 [JitsiMeetService] Agendamento criado:', {
        eventoId,
        linkMeet,
        mentor,
        mentorado: mentoradoData,
        titulo
      });

      return {
        sucesso: true,
        eventoId,
        linkMeet,
        titulo: titulo || `Mentoria: ${mentor.nome} & ${mentoradoData.nome}`,
        mensagem: 'Agendamento criado com sucesso!',
        provider: 'Jitsi Meet'
      };

    } catch (error) {
      console.error('❌ [JitsiMeetService] Erro ao criar agendamento:', error);
      
      return {
        sucesso: false,
        mensagem: `Erro ao criar agendamento: ${error}`,
        provider: 'Jitsi Meet'
      };
    }
  }

  /**
   * Cria link rápido para reunião
   */
  async criarLinkRapido(nomeReuniao?: string): Promise<{ link: string; provider: string }> {
    const link = this.criarLinkMeet(nomeReuniao || 'reuniaourgente');
    
    return {
      link,
      provider: 'Jitsi Meet'
    };
  }

  /**
   * Cria múltiplos links de uma vez
   */
  async criarMultiplosLinks(quantidade: number, prefixo?: string): Promise<{ links: string[]; quantidade: number }> {
    const links: string[] = [];
    const timestamp = Date.now().toString().slice(-6);
    
    for (let i = 1; i <= quantidade; i++) {
      const nome = prefixo ? `${prefixo}${i}` : `reuniao${i}`;
      const roomId = `${nome}-${timestamp}`;
      links.push(`https://meet.jit.si/${roomId}`);
    }
    
    return {
      links,
      quantidade: links.length
    };
  }

  /**
   * Cria link para evento específico
   */
  async criarLinkEvento(evento: {
    nome: string;
    organizador: string;
    data: string;
  }): Promise<{ link: string; eventoId: string; provider: string }> {
    const nomeEvento = `${evento.nome.replace(/\s+/g, '')}${evento.organizador.replace(/\s+/g, '')}`;
    const link = this.criarLinkMeet(nomeEvento);
    const eventoId = `evento-${Date.now()}`;
    
    return {
      link,
      eventoId,
      provider: 'Jitsi Meet'
    };
  }
}

export default JitsiMeetService;
