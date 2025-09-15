#!/bin/bash

# Script para deploy com logs de debug melhorados
# Este script faz o deploy das melhorias de logs para debug do erro do Stripe no Vercel

echo "🚀 Iniciando deploy com logs de debug melhorados..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se há mudanças para commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Fazendo commit das melhorias de logs..."
    git add .
    git commit -m "feat: Adicionar logs detalhados para debug do erro Stripe no Vercel
    
    - Melhorar logs no frontend (stripeVerifyBalanceService)
    - Adicionar logs detalhados no backend (stripeServerVerifyBalanceService)
    - Incluir informações de ambiente, timing e detalhes de erro
    - Adicionar logs no hook useStripeFinancialData
    - Capturar resposta bruta da API para debug de parsing JSON"
else
    echo "ℹ️ Nenhuma mudança para commit"
fi

# Fazer push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin main

echo "✅ Deploy concluído! Os logs melhorados estarão disponíveis na próxima execução no Vercel."
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse o dashboard do mentor no Vercel"
echo "2. Abra o console do navegador (F12)"
echo "3. Verifique os logs detalhados no console"
echo "4. Verifique os logs do servidor no painel do Vercel"
echo ""
echo "🔍 Logs a observar:"
echo "- Frontend: logs com 🌐, 📡, ❌ no console do navegador"
echo "- Backend: logs com 🔍, 📊, ✅, ❌ no painel do Vercel"
echo "- Informações de ambiente, timing e detalhes de erro"