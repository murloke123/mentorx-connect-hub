# Configuração do Servidor

## Environment Configuration

Para configurar o ambiente do servidor:

1. **Copie o arquivo example:**
   ```bash
   cp server/environment.example.ts server/environment.ts
   ```

2. **Configure as variáveis de ambiente reais:**
   - `DATABASE_URL`: URL de conexão com PostgreSQL/Supabase
   - `STRIPE_SECRET_KEY`: Chave secreta do Stripe (sk_test_... ou sk_live_...)
   - `STRIPE_PUBLISHABLE_KEY`: Chave pública do Stripe (pk_test_... ou pk_live_...)
   - `STRIPE_WEBHOOK_SECRET`: Secret para webhooks do Stripe (whsec_...)
   - `SUPABASE_URL`: URL do projeto Supabase
   - `SUPABASE_ANON_KEY`: Chave anônima do Supabase

## Diferença entre os Arquivos Environment

- **`server/environment.ts`** - Configurações do backend com **chaves secretas**
- **`client/src/config/environment.ts`** - Configurações do frontend com **chaves públicas apenas**

## Segurança

O arquivo `server/environment.ts` está no `.gitignore` para proteger credenciais sensíveis.
Nunca commite este arquivo com credenciais reais!
