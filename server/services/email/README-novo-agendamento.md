# 📧 Serviço de E-mail: Notificação de Novo Agendamento

Este documento explica como usar o novo serviço de e-mail `emailNewSchedule` que notifica mentores quando um novo agendamento é criado.

## 🎯 **Objetivo**

Quando um mentorado cria um agendamento, o mentor deve ser automaticamente notificado por e-mail para:
- Revisar os detalhes do agendamento
- Confirmar sua disponibilidade 
- Cancelar com justificativa se necessário
- Acessar a página de agendamentos diretamente

## 📁 **Arquivos Criados**

```
server/services/email/
├── types/emailTypes.ts                     # ✅ Adicionado NewScheduleEmailData
├── templates/mentor/newScheduleTemplate.ts # 🆕 Template HTML responsivo
├── services/mentor/emailNewSchedule.ts     # 🆕 Serviço principal
├── emailService.ts                         # ✅ Exportações atualizadas
└── exemplo-uso-novo-agendamento.ts         # 🆕 Exemplos de uso
```

## 🚀 **Como Usar**

### 1. **Importação Simples**

```typescript
import { notificarMentorNovoAgendamento } from '@/server/services/email/emailService';

// Usar em qualquer lugar do seu código
const resultado = await notificarMentorNovoAgendamento({
  mentorName: 'João Silva',
  mentorEmail: 'joao@email.com',
  menteeName: 'Maria Santos',
  appointmentDate: '15/01/2025',
  appointmentTime: '14:00 - 15:00',
  timezone: 'America/Sao_Paulo (UTC-3)',
  notes: 'Primeira sessão sobre carreira' // opcional
});
```

### 2. **Integração com Criação de Agendamento**

```typescript
async function criarAgendamento(dadosAgendamento) {
  try {
    // 1. Criar no banco
    const agendamento = await supabase
      .from('calendar')
      .insert(dadosAgendamento)
      .select()
      .single();

    // 2. Buscar dados do mentor  
    const { data: mentor } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', dadosAgendamento.mentor_id)
      .single();

    // 3. Notificar mentor por e-mail
    await notificarMentorNovoAgendamento({
      mentorName: mentor.name,
      mentorEmail: mentor.email,
      menteeName: dadosAgendamento.mentee_name,
      appointmentDate: formatarData(dadosAgendamento.scheduled_date),
      appointmentTime: `${dadosAgendamento.start_time} - ${dadosAgendamento.end_time}`,
      timezone: dadosAgendamento.timezone,
      notes: dadosAgendamento.notes
    });

    return agendamento;
  } catch (error) {
    console.error('Erro:', error);
    throw error;
  }
}
```

## 📧 **Conteúdo do E-mail**

### **Assunto**
`📅 Novo Agendamento Criado - [Nome do Mentorado]`

### **Conteúdo Principal**
- ✅ Saudação personalizada ao mentor
- 📋 Detalhes completos do agendamento
- ⚠️ Instruções sobre confirmar/cancelar
- 🔗 Botão direto para página de agendamentos
- 💬 Link para suporte

### **Dados Exibidos**
- 👨‍🎓 Nome do mentorado
- 📅 Data do agendamento  
- 🕒 Horário (início - fim)
- 🌍 Fuso horário
- 📝 Observações (se informadas)

## 🔧 **Configuração Técnica**

### **Dependências**
- ✅ Brevo (já configurado)
- ✅ Templates responsivos
- ✅ Logs detalhados
- ✅ Tratamento de erros

### **URLs Configuradas**
- **Agendamentos**: `https://app.mentoraai.com.br/mentor/agendamentos`
- **Suporte**: `https://app.mentoraai.com.br/suporte`

## 📊 **Interface TypeScript**

```typescript
interface NewScheduleEmailData {
  mentorName: string;        // Nome do mentor
  mentorEmail: string;       // E-mail do mentor
  menteeName: string;        // Nome do mentorado
  appointmentDate: string;   // Ex: "15/01/2025"
  appointmentTime: string;   // Ex: "14:00 - 15:00" 
  timezone: string;          // Ex: "America/Sao_Paulo (UTC-3)"
  notes?: string;           // Observações opcionais
  agendamentosUrl: string;  // URL da página de agendamentos
  supportUrl: string;       // URL do suporte
}
```

## 🎨 **Design do Template**

- 📱 **Responsivo** - Funciona em desktop e mobile
- 🎨 **Visual moderno** - Gradientes verdes (novo agendamento)
- 📋 **Informações destacadas** - Box com detalhes do agendamento
- ⚠️ **Avisos importantes** - Seção em amarelo sobre cancelamento
- 🔗 **Call-to-action claro** - Botão "Gerenciar Agendamentos"

## 🚨 **Pontos Importantes**

### **1. Não Quebra o Fluxo**
- Se o e-mail falhar, o agendamento ainda é criado
- Logs detalhados para debug
- Tratamento de erros robusto

### **2. URLs Dinâmicas**
- URLs configuráveis via variáveis
- Redirecionamento direto para página correta
- Parâmetros de tracking (futuro)

### **3. Observações Condicionais**
- Seção de observações só aparece se informada
- Template limpo quando não há observações
- Flexibilidade no conteúdo

## 🔄 **Fluxo Completo**

1. **Mentorado** cria agendamento
2. **Sistema** salva no banco de dados
3. **Trigger/Código** chama `notificarMentorNovoAgendamento()`
4. **Serviço** busca dados do mentor
5. **Template** é preenchido com dados
6. **Brevo** envia e-mail
7. **Mentor** recebe notificação
8. **Mentor** clica em "Gerenciar Agendamentos"
9. **Sistema** redireciona para `/mentor/agendamentos`
10. **Mentor** pode confirmar ou cancelar

## 📈 **Métricas e Logs**

```typescript
// Logs automáticos incluídos:
console.log('📧 Enviando notificação de novo agendamento...');
console.log('✅ E-mail enviado com sucesso! ID:', messageId);
console.log('❌ Erro ao enviar e-mail:', error);
```

## 🛠️ **Testando o Serviço**

Veja o arquivo `exemplo-uso-novo-agendamento.ts` para exemplos completos de:
- ✅ Uso básico
- ✅ Integração com banco de dados  
- ✅ Triggers do Supabase
- ✅ API routes
- ✅ Tratamento de erros

---

**Desenvolvido para MentorX Connect Hub** 🚀 