import { DocumentUpload } from '@/components/DocumentUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/utils/supabase';
import { CheckCircle, CreditCard, FileText, Info, Plane } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DocumentSectionProps {
  userId: string;
  initialDocumentType?: string;
  initialFrontUrl?: string | null;
  initialBackUrl?: string | null;
  onDocumentChange?: (data: {
    documentType: string;
    frontUploaded: boolean;
    backUploaded: boolean;
  }) => void;
}

export const DocumentSection: React.FC<DocumentSectionProps> = ({
  userId,
  initialDocumentType = '',
  initialFrontUrl,
  initialBackUrl,
  onDocumentChange
}) => {
  const [selectedDocumentType, setSelectedDocumentType] = useState(initialDocumentType);
  const [frontUploaded, setFrontUploaded] = useState(!!initialFrontUrl);
  const [backUploaded, setBackUploaded] = useState(!!initialBackUrl);
  const [documentVerificationStatus, setDocumentVerificationStatus] = useState<string | null>(null);
  
  // Estados para rastrear se os documentos foram removidos
  const [frontRemoved, setFrontRemoved] = useState(false);
  const [backRemoved, setBackRemoved] = useState(false);

  // Carregar status de verificação da conta
  useEffect(() => {
    const loadAccountStatus = async () => {
      if (userId) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('document_verification_status, account_already_verified')
            .eq('id', userId)
            .single();

          if (!error && profile) {
            setDocumentVerificationStatus(profile.document_verification_status);
          }
        } catch (error) {
          console.log('ℹ️ Não foi possível carregar status da conta:', error);
        }
      }
    };

    loadAccountStatus();
  }, [userId]);

  const documentTypes = [
    {
      value: 'rg',
      label: 'RG (Registro Geral)',
      icon: FileText,
      description: 'Documento de identidade oficial',
      requiresBack: true
    },
    {
      value: 'cnh',
      label: 'CNH (Carteira de Motorista)',
      icon: CreditCard,
      description: 'Carteira Nacional de Habilitação',
      requiresBack: true
    },
    {
      value: 'passaporte',
      label: 'Passaporte',
      icon: Plane,
      description: 'Documento de viagem internacional',
      requiresBack: false
    }
  ];

  const selectedDoc = documentTypes.find(doc => doc.value === selectedDocumentType);
  
  // Considerar completo se tem os documentos necessários OU se a conta está verificada
  // Se foi removido, não considerar as URLs iniciais
  const hasFrontDoc = frontRemoved ? frontUploaded : (frontUploaded || !!initialFrontUrl);
  const hasBackDoc = backRemoved ? backUploaded : (backUploaded || !!initialBackUrl);
  
  const isVerified = documentVerificationStatus === 'verified';
  const isComplete = isVerified || (selectedDocumentType && hasFrontDoc && 
    (selectedDoc?.requiresBack ? hasBackDoc : true));

  useEffect(() => {
    onDocumentChange?.({
      documentType: selectedDocumentType,
      frontUploaded: hasFrontDoc,
      backUploaded: selectedDoc?.requiresBack ? hasBackDoc : true
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocumentType, hasFrontDoc, hasBackDoc, selectedDoc?.requiresBack]);

  const handleDocumentTypeChange = (value: string) => {
    // Se está mudando para um tipo diferente, resetar os uploads
    if (value !== selectedDocumentType) {
      setSelectedDocumentType(value);
      setFrontUploaded(false);
      setBackUploaded(false);
      setFrontRemoved(false);
      setBackRemoved(false);
    }
  };

  const handleFrontUpload = (success: boolean) => {
    setFrontUploaded(success);
    if (!success && initialFrontUrl) {
      // Se falhou o upload e tinha documento inicial, foi removido
      setFrontRemoved(true);
    }
  };

  const handleBackUpload = (success: boolean) => {
    setBackUploaded(success);
    if (!success && initialBackUrl) {
      // Se falhou o upload e tinha documento inicial, foi removido
      setBackRemoved(true);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border border-border/50 min-h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="h-5 w-5 text-gold" />
          Documentos de Identificação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-8">
        {/* Mostrar Alert informativo apenas se NÃO estiver completo E não estiver verificado */}
        {!isComplete && !isVerified && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Para verificar sua identidade, precisamos de uma foto do seu documento oficial.
              Certifique-se de que a imagem esteja nítida e todos os dados sejam legíveis.
            </AlertDescription>
          </Alert>
        )}

        {/* Se conta já está verificada, mostrar apenas mensagem de sucesso */}
        {isVerified ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  Documentos já verificados!
                </h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  Seus documentos já foram validados e aprovados pela equipe de verificação. 
                  Sua identidade está confirmada e você está pronto para receber pagamentos.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Identidade verificada</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Documentos aprovados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>Pronto para receber pagamentos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Seleção do tipo de documento */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                {isComplete ? 'Tipo de documento enviado' : 'Selecione o tipo de documento *'}
              </Label>
              
              {/* Se documento completo, mostrar card especial */}
              {isComplete && selectedDoc ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  {(() => {
                    const Icon = selectedDoc.icon;
                    return <Icon className="h-6 w-6 text-green-600" />;
                  })()}
                  <div className="flex-1">
                    <div className="font-medium text-green-900">{selectedDoc.label}</div>
                    <div className="text-sm text-green-700">{selectedDoc.description}</div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <RadioGroup
                  value={selectedDocumentType}
                  onValueChange={handleDocumentTypeChange}
                  className="grid grid-cols-1 gap-4"
                >
                  {documentTypes.map((doc) => {
                    const Icon = doc.icon;
                    return (
                      <div key={doc.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={doc.value} id={doc.value} />
                        <Label 
                          htmlFor={doc.value} 
                          className="flex items-center gap-3 cursor-pointer flex-1 p-3 border border-border rounded-lg hover:bg-card/50 transition-colors bg-card/30"
                        >
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-foreground">{doc.label}</div>
                            <div className="text-sm text-muted-foreground">{doc.description}</div>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}
            </div>

            {/* Upload de documentos */}
            {selectedDocumentType && (
              <div className="space-y-6 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Frente do documento */}
                  <DocumentUpload
                    userId={userId}
                    documentType={selectedDocumentType as 'rg' | 'cnh' | 'passaporte'}
                    side="front"
                    label={`Frente do ${selectedDoc?.label}`}
                    required={true}
                    existingUrl={initialFrontUrl}
                    onUploadComplete={handleFrontUpload}
                  />

                  {/* Verso do documento (apenas para RG e CNH) */}
                  {selectedDoc?.requiresBack && (
                    <DocumentUpload
                      userId={userId}
                      documentType={selectedDocumentType as 'rg' | 'cnh' | 'passaporte'}
                      side="back"
                      label={`Verso do ${selectedDoc?.label}`}
                      required={true}
                      existingUrl={initialBackUrl}
                      onUploadComplete={handleBackUpload}
                    />
                  )}
                </div>

                {/* Status de completude - Mostrar apenas se NÃO estiver completo E não estiver verificado */}
                {!isComplete && !isVerified && (
                  <div className="flex items-center gap-2 p-3 bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm">
                    <div className="h-3 w-3 rounded-full bg-gold" />
                    <span className="text-sm font-medium text-foreground">
                      Aguardando upload dos documentos...
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
