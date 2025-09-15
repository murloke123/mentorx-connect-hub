# Implementação dos Campos sender_role e receiver_role

## Resumo das Alterações

### 1. Estrutura de Dados Atualizada

**Arquivo:** `client/src/types/database.ts`
- Adicionados campos `sender_role` e `receiver_role` à interface `Notification`

**Arquivo:** `client/src/services/notificationService.ts`
- Adicionados campos `sender_role` e `receiver_role` à interface `CreateNotificationData`
- Criada função utilitária `getUserRole()` para buscar automaticamente o role de um usuário
- Atualizada função `createNotification()` para buscar roles automaticamente quando não fornecidos

### 2. Funções de Notificação Atualizadas

#### Notificações de Seguimento (roles fixos):
- **`notifyNewFollower()`**: sender_role = 'mentorado', receiver_role = 'mentor'
- **`notifyLostFollower()`**: sender_role = 'mentorado', receiver_role = 'mentor'

#### Notificações de Curso (roles fixos):
- **`notifyNewEnrollment()`**: sender_role = 'mentorado', receiver_role = 'mentor'
- **`notifyCourseUpdate()`**: sender_role = 'mentor', receiver_role = 'mentorado'

#### Notificações de Mensagem (roles fixos):
- **Mensagem de mentorado**: sender_role = 'mentorado', receiver_role = 'mentor'

#### Notificações de Agendamento (roles automáticos):
- **`notifyAppointmentCancellation()`**: roles buscados automaticamente via `getUserRole()`
- **`notifyScheduleCancelledByMentor()`**: roles buscados automaticamente via `getUserRole()`
- **`notifyNewAppointment()`**: roles buscados automaticamente via `getUserRole()`

### 3. Banco de Dados

**IMPORTANTE:** É necessário executar o script SQL para adicionar as colunas no banco de dados:

```sql
-- Execute este script no banco de dados
ALTER TABLE notifications 
ADD COLUMN sender_role VARCHAR(20),
ADD COLUMN receiver_role VARCHAR(20);

-- Adicionar comentários para documentação
COMMENT ON COLUMN notifications.sender_role IS 'Role do usuário que envia a notificação (mentor/mentorado)';
COMMENT ON COLUMN notifications.receiver_role IS 'Role do usuário que recebe a notificação (mentor/mentorado)';
```

### 4. Funcionalidades Implementadas

✅ **Captura automática de roles**: O sistema busca automaticamente o role dos usuários quando não fornecido explicitamente

✅ **Roles específicos para ações conhecidas**: 
- Seguir/deixar de seguir: sempre mentorado → mentor
- Matrícula: sempre mentorado → mentor  
- Atualização de curso: sempre mentor → mentorado
- Mensagem: sempre mentorado → mentor

✅ **Fallback automático**: Para agendamentos, o sistema busca os roles no banco de dados automaticamente

✅ **Compatibilidade**: Código mantém compatibilidade com implementação anterior

### 5. Tipos de Notificação Identificados

1. **`new_follower`** - Quando um mentorado segue um mentor
2. **`lost_follower`** - Quando um mentorado deixa de seguir um mentor  
3. **`message`** - Quando um mentorado envia mensagem para um mentor
4. **`new_enrollment`** - Quando um mentorado se matricula em curso
5. **`course_updated`** - Quando um mentor atualiza um curso
6. **`schedule`** - Novo agendamento
7. **`cancel_schedule`** - Cancelamento de agendamento
8. **`appointment_cancelled`** - Cancelamento genérico

### 6. Próximos Passos

1. **Execute o script SQL** no banco de dados para adicionar as colunas
2. **Teste as notificações** para verificar se os roles estão sendo capturados corretamente
3. **Monitore os logs** para verificar se a busca automática de roles está funcionando

### 7. Logs de Debug

O sistema inclui logs detalhados para debug:
- `🔍 [NOTIFICATION] Buscando role do receiver/sender`
- `📤 [NOTIFICATION] Dados para inserir no banco` (inclui os roles)

Todos os roles são capturados e armazenados automaticamente em cada notificação criada.