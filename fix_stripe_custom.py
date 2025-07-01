import re

# Ler o arquivo atual
with open('server/services/stripeServerClientService.ts', 'r') as f:
    content = f.read()

# MUDANÇA 1: Atualizar comentário da função
old_comment = """/**
 * Criar ou atualizar conta conectada no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Express accounts: Processo simplificado para vendedores
 * - Individual business_type: Para pessoas físicas
 * - MCC 8299: Código para serviços educacionais
 * - External accounts: Conta bancária para receber transfers
 * 
 * �� OTIMIZAÇÃO UX: Campos enviados automaticamente para reduzir fricção:
 * - business_profile.monthly_estimated_revenue: R$ 5.000 fixo
 * - individual.political_exposure: 'none' (não é pessoa politicamente exposta)
 * - tos_acceptance: data/IP automáticos
 */"""

new_comment = """/**
 * Criar ou atualizar conta conectada no Stripe
 * 
 * 📚 EDUCATIVO PARA DEV JUNIOR:
 * - Custom accounts: Controle total sobre onboarding (platform gerencia tudo)
 * - Individual business_type: Para pessoas físicas
 * - MCC 8299: Código para serviços educacionais
 * - External accounts: Conta bancária para receber transfers
 * 
 * 🎯 ESTRATÉGIA 2 ETAPAS:
 * - CREATE: Dados mínimos (country + email) no cadastro inicial
 * - UPDATE: Dados completos + tos_acceptance na ativação de pagamentos
 * 
 * 📖 STRIPE DOCS: "The only piece of information you need to create a Custom 
 * connected account is the country. You can collect everything else at a later time."
 */"""

content = content.replace(old_comment, new_comment)

# MUDANÇA 2: Alterar type de express para custom
content = content.replace("type: 'express',", "type: 'custom',")

# MUDANÇA 3: Simplificar CREATE - remover campos complexos
# Encontrar e substituir o bloco CREATE completo
create_pattern = r"(// CRIAR nova conta\s+const accountCreateData: Stripe\.AccountCreateParams = \{[^}]+individual: \{[^}]+\},[^}]+business_profile: \{[^}]+\},[^}]+tos_acceptance: \{[^}]+\}\s+\};)"

new_create_block = """// CRIAR nova conta - DADOS MÍNIMOS APENAS
      // 📚 STRIPE DOCS: "The only piece of information you need to create a Custom 
      // connected account is the country. You can collect everything else at a later time."
      const accountCreateData: Stripe.AccountCreateParams = {
        type: 'custom',
        country: 'BR',
        email: userData.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
        // ✅ PARAR AQUI! Sem individual, sem business_profile, sem tos_acceptance
        // Tudo será enviado no UPDATE quando usuário clicar "Finalizar Configuração"
      };"""

# Aplicar a mudança de forma mais específica
content = re.sub(
    r"// CRIAR nova conta\s+const accountCreateData: Stripe\.AccountCreateParams = \{\s+type: '[^']+',\s+country: 'BR',\s+email: userData\.email,\s+business_type: 'individual',\s+capabilities: \{\s+card_payments: \{ requested: true \},\s+transfers: \{ requested: true \}\s+\},\s+individual: \{[^}]+\},\s+business_profile: \{[^}]+\},\s+tos_acceptance: \{[^}]+\}\s+\};",
    new_create_block,
    content,
    flags=re.DOTALL
)

# Salvar o arquivo modificado
with open('server/services/stripeServerClientService.ts', 'w') as f:
    f.write(content)

print("✅ Mudanças aplicadas com sucesso!")
