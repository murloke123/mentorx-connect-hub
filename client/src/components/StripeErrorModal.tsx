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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {getErrorTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensagem amigável para o usuário */}
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <div className="space-y-3">
                <div>
                  <p className="font-medium mb-2">📝 Descrição do Problema:</p>
                  <p>{getUserFriendlyMessage()}</p>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Mensagem original da Stripe API */}
          {error.message && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                <div className="space-y-2">
                  <p className="font-medium">🔧 Mensagem Original da Stripe API:</p>
                  <div className="font-mono text-sm bg-yellow-100 p-3 rounded border">
                    "{error.message}"
                  </div>
                  <p className="text-xs text-yellow-700">
                    Esta é a mensagem exata retornada pela API da Stripe em inglês.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Detalhes técnicos */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Detalhes Técnicos:</h4>
            
            <div className="grid gap-2 text-sm">
              {error.code && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Código do Erro:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-red-600">
                    {error.code}
                  </span>
                </div>
              )}
              
              {error.request_id && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Request ID:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {error.request_id}
                  </span>
                </div>
              )}
              
              {error.param && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Parâmetro:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {error.param}
                  </span>
                </div>
              )}
              
              {error.status_code && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Status Code:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {error.status_code}
                  </span>
                </div>
              )}

              {error.endpoint && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Endpoint:</span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                    {error.endpoint}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instruções para o usuário */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-2">💡 O que fazer agora?</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Verifique se todos os dados bancários estão corretos</li>
              <li>• Confirme se o código do banco e agência estão no formato correto</li>
              <li>• Copie os detalhes do erro usando o botão abaixo</li>
              <li>• Entre em contato com nosso suporte técnico se o problema persistir</li>
              <li>• Inclua a mensagem original da Stripe em inglês ao contatar o suporte</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={copyErrorDetails}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar Detalhes
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.open('mailto:suporte@mentorx.com.br?subject=Erro na API Stripe&body=' + encodeURIComponent(`Olá, preciso de ajuda com o seguinte erro:\n\nCódigo: ${error.code}\nMensagem Original: ${error.message}\nRequest ID: ${error.request_id}`))}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Contatar Suporte
          </Button>
          
          <Button onClick={onClose} className="bg-orange-600 hover:bg-orange-700">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StripeErrorModal;
