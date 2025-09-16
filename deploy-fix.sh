#!/bin/bash

# Script para fazer deploy após corrigir o problema da API do Stripe

echo "🚀 Iniciando deploy após correção da API do Stripe..."

# 1. Fazer login no Vercel (se necessário)
echo "📝 Verificando autenticação do Vercel..."
vercel whoami || {
    echo "❌ Não autenticado. Execute: vercel login"
    exit 1
}

# 2. Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run vercel-build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build"
    exit 1
fi

# 3. Deploy para produção
echo "🚀 Fazendo deploy para produção..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🔍 Teste o endpoint: https://seu-dominio.vercel.app/api/stripe/verify-balance"
else
    echo "❌ Erro no deploy"
    exit 1
fi