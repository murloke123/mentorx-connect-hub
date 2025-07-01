/**
 * Stripe Configuration Example - Frontend (Apenas chaves públicas)
 * 
 * ATENÇÃO: 
 * - Copie este arquivo para 'stripe-config.ts' e preencha com sua chave pública.
 * - Chaves secretas devem estar APENAS no servidor (server/environment.ts)
 * - O arquivo 'stripe-config.ts' está no .gitignore e nunca será commitado.
 */

export const stripeConfig = {
  // Apenas chave pública (seguro para frontend)
  publishableKey: 'pk_test_sua_chave_publica_aqui',
  
  // Configurações do Brasil
  country: 'BR' as const,
  currency: 'brl' as const,
  
  // URLs de callback
  successUrl: 'http://localhost:8080/stripe/success',
  cancelUrl: 'http://localhost:8080/stripe/cancel',
  
  // Taxa da plataforma (em centavos)
  platformFeePercent: 10, // 10% da transação
};

export type StripeConfig = typeof stripeConfig;
