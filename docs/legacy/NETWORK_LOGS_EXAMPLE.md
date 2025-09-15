# 📊 Exemplo de Logs no Network do Chrome

## 🚀 Fluxo de Criação de Conta Stripe

### 1️⃣ **Cadastro Inicial (Botão "Registrar")**

#### No Network do Chrome você verá:

**1. POST /api/stripe-network-logs** (Log do Payload)
```json
{
  "type": "STRIPE_CREATE_ACCOUNT",
  "action": "PAYLOAD_ENVIADO",
  "data": {
    "email": "mentor12@teste.com",
    "full_name": "João Silva",
    "phone": "",
    "cpf": "",
    "date_of_birth": "",
    "address": {
      "line1": "",
      "line2": "",
      "city": "",
      "state": "",
      "postal_code": "",
      "country": "BR"
    },
    "bank_account": {
      "account_type": "",
      "routing_number": "",
      "branch_number": "",
      "account_number": "",
      "account_holder_name": ""
    }
  },
  "timestamp": "2024-12-23T10:30:00.000Z"
}
```

**2. POST /api/stripe/account** (Request Principal)
```json
// Request Headers
Content-Type: application/json

// Request Payload (DADOS MÍNIMOS)
{
  "email": "mentor12@teste.com",
  "full_name": "João Silva",
  "phone": "",
  "cpf": "",
  "date_of_birth": "",
  "address": {
    "line1": "",
    "line2": "",
    "city": "",
    "state": "",
    "postal_code": "",
    "country": "BR"
  },
  "bank_account": {
    "account_type": "",
    "routing_number": "",
    "branch_number": "",
    "account_number": "",
    "account_holder_name": ""
  }
}
```

**3. Response do Servidor**
```json
// Status: 200 OK
// Response
{
  "success": true,
  "account": {
    "id": "acct_1ReS5xABCDEFGHIJ",
    "charges_enabled": false,
    "payouts_enabled": false,
    "details_submitted": false,
    "requirements": {
      "currently_due": [
        "individual.phone",
        "individual.id_number",
        "individual.dob",
        "individual.address",
        "external_account",
        "tos_acceptance"
      ]
    }
  }
}
```

**4. POST /api/stripe-network-logs** (Log da Response)
```json
{
  "type": "STRIPE_CREATE_ACCOUNT",
  "action": "RESPONSE_RECEBIDO",
  "data": {
    "status": 200,
    "ok": true,
    "result": {
      "success": true,
      "account": {
        "id": "acct_1ReS5xABCDEFGHIJ",
        "charges_enabled": false,
        "payouts_enabled": false
      }
    }
  }
}
```

---

### 2️⃣ **Onboarding Completo (Botão "Finalizar Configuração")**

#### No Network do Chrome você verá:

**1. POST /api/stripe-network-logs** (Log do Payload Completo)
```json
{
  "type": "STRIPE_CREATE_ACCOUNT",
  "action": "PAYLOAD_ENVIADO",
  "data": {
    "email": "mentor12@teste.com",
    "full_name": "João Silva",
    "phone": "11987654321",
    "cpf": "12345678900",
    "date_of_birth": "1990-05-15",
    "stripe_account_id": "acct_1ReS5xABCDEFGHIJ", // ID da conta existente
    "address": {
      "line1": "Rua das Flores, 123",
      "line2": "Apto 456",
      "city": "São Paulo",
      "state": "SP",
      "postal_code": "01310-100",
      "country": "BR"
    },
    "bank_account": {
      "account_type": "checking",
      "routing_number": "341",
      "branch_number": "0001",
      "account_number": "12345-6",
      "account_holder_name": "João Silva"
    },
    "tos_ip": "192.168.1.100"
  }
}
```

**2. POST /api/stripe/account** (UPDATE da conta existente)
```json
// Request - com todos os dados preenchidos
{
  "email": "mentor12@teste.com",
  "full_name": "João Silva",
  "phone": "11987654321",
  "cpf": "12345678900",
  "date_of_birth": "1990-05-15",
  "stripe_account_id": "acct_1ReS5xABCDEFGHIJ",
  "address": {
    "line1": "Rua das Flores, 123",
    "line2": "Apto 456",
    "city": "São Paulo",
    "state": "SP", 
    "postal_code": "01310-100",
    "country": "BR"
  },
  "bank_account": {
    "account_type": "checking",
    "routing_number": "341",
    "branch_number": "0001",
    "account_number": "12345-6",
    "account_holder_name": "João Silva"
  }
}
```

**3. Response do Servidor (Conta Atualizada)**
```json
{
  "success": true,
  "account": {
    "id": "acct_1ReS5xABCDEFGHIJ",
    "charges_enabled": true,
    "payouts_enabled": true,
    "details_submitted": true,
    "requirements": {
      "currently_due": [],
      "eventually_due": [],
      "past_due": [],
      "pending_verification": ["individual.verification.document"]
    }
  }
}
```

---

## 📋 Console Logs

### Durante o Cadastro Inicial:
```javascript
🔄 [LOGIN] Mentor cadastrado - criando conta Stripe básica...
📤 [LOGIN] Enviando APENAS dados básicos para Stripe...
🚀 [CLIENT] ==========================================
🚀 [CLIENT] INICIANDO CRIAÇÃO DE CONTA STRIPE
📤 [CLIENT] Email: mentor12@teste.com
📤 [CLIENT] Nome: João Silva
📤 [CLIENT] PAYLOAD COMPLETO ENVIADO PARA O SERVIDOR:
✅ [CLIENT] Conta criada/atualizada com sucesso: acct_1ReS5xABCDEFGHIJ
✅ [LOGIN] Conta Stripe básica criada: acct_1ReS5xABCDEFGHIJ
```

### Durante o Onboarding:
```javascript
🚀 [ONBOARDING] Chamando stripeClientService.ts (seguro)
📤 [CLIENT] PAYLOAD COMPLETO ENVIADO PARA O SERVIDOR:
✅ [CLIENT] Conta criada/atualizada com sucesso: acct_1ReS5xABCDEFGHIJ
✅ Conta Stripe atualizada com dados completos
```

---

## 🎯 Pontos Importantes

1. **Sem Duplicação**: O método é chamado apenas 1x no cadastro e 1x no onboarding
2. **Dados Mínimos**: No cadastro inicial enviamos apenas email, nome e país
3. **Dados Completos**: No onboarding enviamos todos os dados necessários
4. **Logs Claros**: Cada request/response aparece claramente no Network
5. **Rastreabilidade**: Todos os logs têm timestamp e identificação clara 