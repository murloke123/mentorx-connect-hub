import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Copy, ExternalLink } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

interface StripeErrorDetails {
  type?: string;
  code?: string;
  message?: string;
  param?: string;
  request_id?: string;
  endpoint?: string;
  status_code?: number;
  timestamp?: string;
}

interface StripeErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: StripeErrorDetails | null;
}

const StripeErrorModal: React.FC<StripeErrorModalProps> = ({ isOpen, onClose, error }) => {
  if (!error) return null;

  const copyErrorDetails = () => {
    const errorText = `
ERRO STRIPE API
===============
Código: ${error.code || 'N/A'}
Mensagem Original: ${error.message || 'N/A'}
Tipo: ${error.type || 'N/A'}
Parâmetro: ${error.param || 'N/A'}
Request ID: ${error.request_id || 'N/A'}
Status Code: ${error.status_code || 'N/A'}
Endpoint: ${error.endpoint || 'N/A'}
Timestamp: ${error.timestamp || 'N/A'}
===============
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Detalhes do erro copiados para a área de transferência');
    }).catch(() => {
      toast.error('Erro ao copiar detalhes');
    });
  };

  const getErrorTitle = () => {
    if (error.code === 'account_number_invalid') {
      return 'Número de Conta Bancária Inválido';
    }
    if (error.code === 'routing_number_invalid') {
      return 'Número de Roteamento Inválido';
    }
    if (error.code === 'invalid_request_error') {
      return 'Erro na Solicitação';
    }
    return 'Erro na API Stripe';
  };

  const getUserFriendlyMessage = () => {
    if (error.code === 'account_number_invalid') {
      return 'O número da conta bancária fornecido não é válido. Verifique se você digitou corretamente os dados da sua conta.';
    }
    if (error.code === 'routing_number_invalid') {
      return 'O número de roteamento bancário não é válido. Verifique se você digitou corretamente o código do banco e agência no formato correto (exemplo: 001-1234).';
    }
    if (error.code === 'invalid_request_error') {
      return 'Os dados enviados não estão no formato correto. Verifique os campos preenchidos e tente novamente.';
    }
    // Para outros erros, usar uma mensagem genérica em português
    return 'Ocorreu um erro inesperado ao processar sua solicitação. Verifique os dados informados e tente novamente.';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[70vh] overflow-y-auto p-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-700">
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            {getErrorTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Mensagem amigável para o usuário */}
          <Alert className="border-red-500/30 bg-red-500/10 backdrop-blur-sm">
            <AlertDescription className="text-red-200">
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-2 text-red-300">📝 Descrição do Problema:</p>
                  <p className="text-red-100">{getUserFriendlyMessage()}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Mensagem original da Stripe API */}
          {error.message && (
            <Alert className="border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm">
              <AlertDescription className="text-yellow-200">
                <div className="space-y-2">
                  <p className="font-medium text-yellow-300">🔧 Mensagem Original da Stripe API:</p>
                  <div className="font-mono text-sm bg-slate-800/50 p-3 rounded border border-slate-600 text-yellow-100">
                    "{error.message}"
                  </div>
                  <p className="text-xs text-yellow-400">
                    Esta é a mensagem exata retornada pela API da Stripe em inglês.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Detalhes técnicos */}
          <div className="space-y-3">
            <h4 className="font-medium text-white">Detalhes Técnicos:</h4>
            
            <div className="grid gap-2 text-sm">
              {error.code && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Código do Erro:</span>
                  <span className="font-mono bg-slate-800/50 px-2 py-1 rounded text-red-400 border border-slate-600">
                    {error.code}
                  </span>
                </div>
              )}
              
              {error.request_id && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Request ID:</span>
                  <span className="font-mono bg-slate-800/50 px-2 py-1 rounded text-gray-200 border border-slate-600">
                    {error.request_id}
                  </span>
                </div>
              )}
              
              {error.param && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Parâmetro:</span>
                  <span className="font-mono bg-slate-800/50 px-2 py-1 rounded text-gray-200 border border-slate-600">
                    {error.param}
                  </span>
                </div>
              )}
              
              {error.status_code && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Status Code:</span>
                  <span className="font-mono bg-slate-800/50 px-2 py-1 rounded text-gray-200 border border-slate-600">
                    {error.status_code}
                  </span>
                </div>
              )}

              {error.endpoint && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-300">Endpoint:</span>
                  <span className="font-mono bg-slate-800/50 px-2 py-1 rounded text-xs text-gray-200 border border-slate-600">
                    {error.endpoint}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instruções para o usuário */}
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 backdrop-blur-sm">
            <h5 className="font-medium text-blue-300 mb-2">💡 O que fazer agora?</h5>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Verifique se todos os dados bancários estão corretos</li>
              <li>• Confirme se o código do banco e agência estão no formato correto</li>
              <li>• Copie os detalhes do erro usando o botão abaixo</li>
              <li>• Entre em contato com nosso suporte técnico se o problema persistir</li>
              <li>• Inclua a mensagem original da Stripe em inglês ao contatar o suporte</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-slate-700 flex gap-2">
          <Button 
            variant="outline" 
            onClick={copyErrorDetails}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
          >
            <Copy className="h-4 w-4" />
            Copiar Detalhes
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.open('mailto:suporte@mentorx.com.br?subject=Erro na API Stripe&body=' + encodeURIComponent(`Olá, preciso de ajuda com o seguinte erro:\n\nCódigo: ${error.code}\nMensagem Original: ${error.message}\nRequest ID: ${error.request_id}`))}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30"
          >
            <ExternalLink className="h-4 w-4" />
            Contatar Suporte
          </Button>
          
          <Button onClick={onClose} className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StripeErrorModal;
