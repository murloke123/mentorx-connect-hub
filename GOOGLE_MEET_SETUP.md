# 🎯 Configuração Google Meet com Domain-Wide Delegation

## Problema Identificado
Service Accounts **não podem criar Google Meet links diretamente**. O erro "Invalid conference type value" ocorre porque Google Meet (`hangoutsMeet`) só funciona com usuários reais do Google Workspace.

## Solução: Domain-Wide Delegation
Para resolver este problema, é necessário configurar **Domain-Wide Delegation** para permitir que o Service Account impersone um usuário real.

## Passos para Configuração

### 1. Configurar Domain-Wide Delegation no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para **IAM & Admin** > **Service Accounts**
3. Encontre seu Service Account (`mentoria-calendar-service@agendamento-465416.iam.gserviceaccount.com`)
4. Clique em **Actions** > **Manage keys**
5. Clique na aba **Details**
6. Marque a opção **"Enable Google Workspace Domain-wide Delegation"**
7. Anote o **Client ID** que será gerado

### 2. Configurar no Google Workspace Admin Console

1. Acesse o [Google Workspace Admin Console](https://admin.google.com/) (precisa ser administrador)
2. Vá para **Security** > **API controls**
3. Clique em **Domain-wide delegation**
4. Clique em **Add new**
5. Insira o **Client ID** do Service Account
6. Adicione os seguintes **OAuth scopes**:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   ```
7. Clique em **Authorize**

### 3. Configurar Variável de Ambiente

Adicione a seguinte variável no seu arquivo `.env`:

```bash
# Usuário para impersonar (deve ser um usuário real do Google Workspace)
GOOGLE_IMPERSONATE_USER=seu-usuario@seudominio.com
```

**Importante**: O usuário deve:
- Ser um usuário real do Google Workspace
- Ter permissão para criar eventos no calendário
- Estar no mesmo domínio do Google Workspace

### 4. Testar a Configuração

Após configurar, reinicie o servidor:

```bash
cd server
npm run dev
```

E teste criando um evento:

```bash
curl -X POST http://localhost:5000/api/google-meet/create-appointment \
-H "Content-Type: application/json" \
-d '{
  "mentor": {
    "nome": "João Silva",
    "email": "mentor@exemplo.com"
  },
  "mentorado": {
    "nome": "Maria Santos",
    "email": "mentorado@exemplo.com"
  },
  "dataInicio": "2025-07-10T10:00:00.000Z",
  "dataFim": "2025-07-10T11:00:00.000Z",
  "observacoes": "Teste com Domain-Wide Delegation"
}'
```

## Alternativa: Teste sem Impersonação

Se não for possível configurar Domain-Wide Delegation, você pode testar criando eventos **sem Google Meet** removendo temporariamente a configuração `conferenceData`:

```bash
# Definir variável vazia para desabilitar impersonação
GOOGLE_IMPERSONATE_USER=
```

## Verificação de Logs

Os logs do servidor mostrarão:

```
👤 [GoogleMeetService] Impersonando usuário: usuario@dominio.com
```

Ou se não configurado:

```
⚠️ [GoogleMeetService] Nenhum usuário para impersonar - Google Meet pode não funcionar
```

## Problemas Comuns

1. **"Invalid conference type value"** - Service Account não pode criar Meet links sem impersonação
2. **"Insufficient permissions"** - Domain-Wide Delegation não configurado
3. **"User not found"** - Usuário para impersonar não existe ou não tem permissões

## Status Atual

✅ **Código implementado** - Suporte a impersonação adicionado
🔄 **Pendente** - Configuração de Domain-Wide Delegation  
⏳ **Próximo passo** - Configurar no Google Cloud Console e Workspace Admin
