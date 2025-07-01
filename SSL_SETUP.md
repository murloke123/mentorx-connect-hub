# Configuração SSL/HTTPS - Mentora Ai Platform

## Problema Identificado
O site mentoraai.com.br está sendo exibido como "Not Secure" no navegador, indicando problemas com o certificado SSL.

## Soluções Aplicadas

### 1. Headers de Segurança
Adicionados headers de segurança no servidor:
- `Strict-Transport-Security`: Força HTTPS
- `X-Content-Type-Options`: Previne MIME sniffing
- `X-Frame-Options`: Previne clickjacking
- `X-XSS-Protection`: Proteção contra XSS
- `Referrer-Policy`: Controla informações de referência

### 2. Redirecionamento HTTPS
Configurado redirecionamento automático de HTTP para HTTPS em produção.

## Configuração Necessária no Replit

### Para Domínio Personalizado (mentoraai.com.br):

1. **Verificar DNS:**
   - A record: mentoraai.com.br → IP do Replit
   - CNAME record: www.mentoraai.com.br → mentoraai.com.br

2. **Configurar no Painel do Replit:**
   - Vá em Settings > Domains
   - Adicione mentoraai.com.br como custom domain
   - Aguarde a verificação automática do SSL

3. **Aguardar Propagação:**
   - Certificados SSL podem levar até 24h para propagar
   - O Replit gera certificados Let's Encrypt automaticamente

## Status Atual
- ✅ Headers de segurança configurados
- ✅ Redirecionamento HTTPS ativo
- ⏳ Aguardando configuração de domínio no Replit

## Próximos Passos

1. **Configurar domínio no Replit:**
   - Acesse o painel do Replit
   - Vá em Settings do projeto
   - Adicione mentoraai.com.br na seção Domains

2. **Verificar DNS:**
   - Confirme que o DNS aponta para o Replit corretamente

3. **Aguardar certificado:**
   - O Replit gerará automaticamente um certificado SSL válido
   - Processo pode levar algumas horas

## Verificação

Para verificar se o SSL está funcionando:
```bash
# Verificar certificado
openssl s_client -connect mentoraai.com.br:443 -servername mentoraai.com.br

# Verificar headers de segurança
curl -I https://mentoraai.com.br
```

## Notas Importantes

- Certificados SSL no Replit são gerenciados automaticamente
- Domínios personalizados precisam ser configurados no painel
- A propagação de DNS pode afetar a disponibilidade do certificado
- Em caso de problemas persistentes, verifique as configurações de DNS com seu provedor de domínio