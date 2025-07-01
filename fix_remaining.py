import re

# Ler o arquivo atual
with open('server/services/stripeServerClientService.ts', 'r') as f:
    content = f.read()

# 1. Atualizar comentário que ainda não foi alterado
content = content.replace(
    "* - Express accounts: Processo simplificado para vendedores", 
    "* - Custom accounts: Controle total sobre onboarding (platform gerencia tudo)"
)

content = content.replace(
    "* 🎯 OTIMIZAÇÃO UX: Campos enviados automaticamente para reduzir fricção:",
    "* 🎯 ESTRATÉGIA 2 ETAPAS:"
)

content = content.replace(
    "* - business_profile.monthly_estimated_revenue: R$ 5.000 fixo\n * - individual.political_exposure: 'none' (não é pessoa politicamente exposta)\n * - tos_acceptance: data/IP automáticos",
    "* - CREATE: Dados mínimos (country + email) no cadastro inicial\n * - UPDATE: Dados completos + tos_acceptance na ativação de pagamentos\n *\n * 📖 STRIPE DOCS: \"The only piece of information you need to create a Custom\n * connected account is the country. You can collect everything else at a later time.\""
)

# 2. Remover campos complexos do CREATE e simplificar
# Encontrar e substituir todo o bloco CREATE
old_create = """      // CRIAR nova conta
      const accountCreateData: Stripe.AccountCreateParams = {
        type: 'custom',
        country: 'BR',
        email: userData.email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        individual: {
          first_name: firstName,
          last_name: lastName,
          email: userData.email,
          // 🎯 NOVO: Adicionar exposição política padrão (reduz fricção UX)
          political_exposure: 'none' as const,
        },
        business_profile: {
          mcc: '8299',
          product_description: 'Plataforma de mentoria e cursos online',
          // 🎯 NOVO: Receita mensal estimada (R$ 5.000 fixo - reduz fricção UX)
          monthly_estimated_revenue: {
            amount: 500000, // R$ 5.000,00 em centavos
            currency: 'brl'
          }
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: userData.tos_ip || '127.0.0.1',
          user_agent: 'MentorX-Platform/1.0'
        }
      };"""

new_create = """      // CRIAR nova conta - DADOS MÍNIMOS APENAS
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

content = content.replace(old_create, new_create)

# 3. Remover adição de campos opcionais do CREATE
old_optional = """      // 🔍 DEBUG: Verificar campos CREATE (after adding optional fields)
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_CREATE_CAMPOS_DEPOIS_OPCIONAIS', {
        payload_final_para_stripe: 'Ver log PAYLOAD_CREATE_COMPLETO abaixo'
      });

      // Adicionar campos opcionais apenas se tiverem valor
      if (userData.phone && userData.phone.trim() !== '') {
        accountCreateData.individual!.phone = `+55${userData.phone.replace(/\D/g, '')}`;
      }
      if (userData.cpf && userData.cpf.trim() !== '') {
        accountCreateData.individual!.id_number = userData.cpf.replace(/\D/g, '');
      }
      if (dobData) {
        accountCreateData.individual!.dob = dobData;
      }
      if (userData.address.line1 && userData.address.line1.trim() !== '') {
        accountCreateData.individual!.address = {
          line1: userData.address.line1,
          line2: userData.address.line2 ?? undefined,
          city: userData.address.city,
          state: userData.address.state,
          postal_code: userData.address.postal_code,
          country: userData.address.country
        };
      }

      // Adicionar conta bancária apenas se houver dados
      if (concatenatedRoutingNumber && userData.bank_account.account_number) {
        accountCreateData.external_account = {
          object: 'bank_account',
          country: 'BR',
          currency: 'brl',
          routing_number: concatenatedRoutingNumber,
          account_number: userData.bank_account.account_number,
          account_holder_name: userData.bank_account.account_holder_name,
          account_holder_type: 'individual'
        };
      }"""

new_optional = """      // ✅ ESTRATÉGIA: Não adicionar nenhum campo opcional no CREATE
      // Todos os dados detalhados serão enviados no UPDATE quando necessário
      
      // 🔍 DEBUG: Confirmar dados mínimos
      await logToNetworkChrome('STRIPE_ACCOUNT', 'DEBUG_CREATE_DADOS_MINIMOS', {
        campos_enviados: ['type', 'country', 'email', 'business_type', 'capabilities'],
        campos_NAO_enviados: ['individual', 'business_profile', 'tos_acceptance', 'external_account'],
        observacao: 'Dados completos serão enviados no UPDATE - conforme Stripe docs'
      });"""

content = content.replace(old_optional, new_optional)

# 4. Atualizar logs do CREATE
content = content.replace(
    "campos_automaticos_adicionados: [\n          'individual.political_exposure = \"none\"',\n          'business_profile.monthly_estimated_revenue = {amount: 500000, currency: \"brl\"}',\n          'tos_acceptance = {date: auto, ip: auto, user_agent: \"MentorX-Platform/1.0\"}'\n        ],\n        observacao: 'ESTES CAMPOS DEVERIAM RESOLVER OS REQUISITOS DA STRIPE!',",
    "campos_automaticos_adicionados: [\n          'NENHUM - Estratégia de dados mínimos'\n        ],\n        observacao: 'CREATE com dados mínimos - requirements serão resolvidos no UPDATE!',\n        estrategia_2_etapas: {\n          etapa_1_create: 'Dados mínimos (country + email + business_type)',\n          etapa_2_update: 'Dados completos quando usuário ativar pagamentos',\n          vantagem: 'UX melhor - cadastro rápido, dados só quando necessário'\n        },"
)

# Salvar o arquivo modificado
with open('server/services/stripeServerClientService.ts', 'w') as f:
    f.write(content)

print("✅ Mudanças restantes aplicadas com sucesso!")
