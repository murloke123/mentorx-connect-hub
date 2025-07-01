import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { supabase } from '@/utils/supabase';
import { AlertCircle, CheckCircle, FileImage, Info, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface DocumentUploadProps {
  userId: string;
  documentType: 'rg' | 'cnh' | 'passaporte';
  side: 'front' | 'back';
  label: string;
  required?: boolean;
  existingUrl?: string | null;
  onUploadComplete?: (success: boolean) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  userId,
  documentType,
  side,
  label,
  required = false,
  existingUrl,
  onUploadComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [accountAlreadyVerified, setAccountAlreadyVerified] = useState(false);
  const [documentVerificationStatus, setDocumentVerificationStatus] = useState<string | null>(null);
  const { uploadState, uploadDocument, clearUpload, removeDocument, loadExistingDocument } = useDocumentUpload();

  // Carregar documento existente e status da conta se houver
  useEffect(() => {
    const loadAccountStatus = async () => {
      if (userId) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('account_already_verified, document_verification_status')
            .eq('id', userId)
            .single();

          if (!error && profile) {
            setAccountAlreadyVerified(!!profile.account_already_verified);
            setDocumentVerificationStatus(profile.document_verification_status);
          }
        } catch (error) {
          console.log('ℹ️ Não foi possível carregar status da conta:', error);
        }
      }
    };

    loadAccountStatus();

    if (existingUrl && userId && !uploadState.stripeFileId) {
      loadExistingDocument(userId, side);
    }
  }, [existingUrl, userId, side, uploadState.stripeFileId]);

  const handleFileSelect = async (file: File) => {
    const success = await uploadDocument(file, userId, documentType, side);
    onUploadComplete?.(success);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemove = async () => {
    await removeDocument(userId, documentType, side);
    onUploadComplete?.(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const currentPreviewUrl = uploadState.previewUrl || existingUrl;
  
  // Se há URL existente, considerar como enviado (exceto se houver erro atual)
  // Se há upload state, usar o estado atual
  const hasExistingDocument = !!existingUrl;
  const hasCurrentUpload = uploadState.stripeFileId && !uploadState.error;
  const isUploaded = !uploadState.isUploading && (hasExistingDocument || hasCurrentUpload);
  
  const hasError = uploadState.error;
  
  // Verificar se deve ocultar elementos (conta já verificada)
  const shouldHideUploadElements = documentVerificationStatus === 'verified' || accountAlreadyVerified;

  return (
    <div className="space-y-4">
      {/* Diretrizes importantes da Stripe - Mostrar apenas se não estiver enviado E conta não estiver verificada */}
      {!isUploaded && !shouldHideUploadElements && (
        <>
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-2">
                <p className="font-semibold">Requisitos importantes para {label.toLowerCase()}:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Arquivo máximo: <strong>5MB</strong></li>
                  <li>Formatos aceitos: JPEG, PNG, PDF</li>
                  <li>Para imagens: mínimo 1000x1000 pixels</li>
                  <li>⚠️ <strong>A imagem deve ser colorida</strong> (não preto e branco)</li>
                  <li>⚠️ <strong>Não tire foto da tela do computador</strong></li>
                  <li>🔍 Documento deve estar totalmente visível, incluindo bordas</li>
                  <li>📄 Para PDF: máximo 4 páginas</li>
                </ul>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setShowGuidelines(!showGuidelines)}
                  className="p-0 h-auto text-blue-600"
                >
                  {showGuidelines ? 'Ocultar' : 'Ver mais'} diretrizes detalhadas
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Diretrizes detalhadas (expansível) */}
          {showGuidelines && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="space-y-3">
                  <h4 className="font-semibold">📋 Diretrizes Completas da Stripe:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">✅ Requisitos Técnicos:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Resolução mínima: 300 DPI</li>
                        <li>Dimensões: mínimo 1000x1000px</li>
                        <li>Tamanho: máximo 5MB</li>
                        <li>Formatos: JPEG, PNG, PDF</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">🎯 Qualidade da Imagem:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Imagem nítida e bem focada</li>
                        <li>Boa iluminação (evite sombras)</li>
                        <li>Colorida (não preto e branco)</li>
                        <li>Documento inteiro visível</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">❌ Não Permitido:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Fotos de tela de computador</li>
                        <li>Capturas de tela</li>
                        <li>Imagens borradas/desfocadas</li>
                        <li>Documentos danificados</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">💡 Dicas:</h5>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Use boa iluminação natural</li>
                        <li>Mantenha o celular estável</li>
                        <li>Foto direta (não inclinada)</li>
                        <li>Fundo contrastante</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Label - Ocultar asterisco obrigatório se conta verificada */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && !shouldHideUploadElements && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isUploaded && (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
      </div>

      <Card className={`transition-all duration-200 ${
        dragActive ? 'border-blue-500 bg-blue-50' : 
        hasError ? 'border-red-300' : 
        isUploaded ? 'border-green-300' : 'border-gray-200'
      }`}>
        <CardContent className="p-4">
          {isUploaded && currentPreviewUrl ? (
            // Preview do documento enviado
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 flex flex-col items-center justify-center">
                <div className="relative">
                  {/* Se é uma imagem, mostrar preview real; se não, mostrar ícone */}
                  {currentPreviewUrl && (currentPreviewUrl.includes('.jpg') || currentPreviewUrl.includes('.jpeg') || currentPreviewUrl.includes('.png') || uploadState.previewType === 'image') ? (
                    <div className="relative">
                      <img 
                        src={currentPreviewUrl} 
                        alt={label}
                        className="h-32 w-auto max-w-full object-contain rounded border border-green-300"
                        style={{ maxHeight: '128px' }}
                      />
                      <CheckCircle className="h-6 w-6 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full border border-green-300" />
                    </div>
                  ) : (
                <div className="relative">
                  <FileImage className="h-20 w-20 text-green-600 mb-3" />
                  <CheckCircle className="h-8 w-8 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1 mt-2">
                  {label}
                </p>
                <p className="text-xs text-green-700 font-medium">
                  ✅ Documento enviado
                </p>
                {(uploadState.fileName || hasExistingDocument) && (
                  <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate px-2">
                    {uploadState.fileName || 'Documento anterior'}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 shadow-md bg-white/90 hover:bg-red-50 hover:border-red-300"
                onClick={handleRemove}
                title="Substituir documento"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : uploadState.isUploading ? (
            // Estado de upload
            <div className="text-center py-8">
              <FileImage className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
              <p className="text-sm text-gray-600 mb-3">Enviando documento...</p>
              <Progress value={uploadState.progress} className="w-full" />
              <p className="text-xs text-gray-500 mt-2">{uploadState.progress}%</p>
              {uploadState.progress >= 10 && uploadState.progress < 20 && (
                <p className="text-xs text-blue-600 mt-1">🗑️ Removendo arquivo anterior...</p>
              )}
              {uploadState.progress >= 20 && uploadState.progress < 50 && (
                <p className="text-xs text-blue-600 mt-1">📁 Salvando no storage...</p>
              )}
              {uploadState.progress >= 50 && uploadState.progress < 90 && (
                <p className="text-xs text-blue-600 mt-1">📤 Enviando para Stripe...</p>
              )}
              {uploadState.progress >= 90 && (
                <p className="text-xs text-blue-600 mt-1">💾 Finalizando...</p>
              )}
            </div>
          ) : !shouldHideUploadElements ? (
            // Área de upload (mostrada quando não há upload em andamento E não há documento válido E conta não está verificada)
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={openFileDialog}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Clique para selecionar ou arraste o arquivo aqui
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG ou PDF até 5MB
              </p>
            </div>
          ) : (
            // Mostrar mensagem quando conta está verificada mas não há documento local
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    Documento já verificado
                  </h3>
                  <p className="text-sm text-green-700">
                    Sua identidade já foi verificada e aprovada. Não é necessário enviar novos documentos.
                  </p>
                </div>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </CardContent>
      </Card>

      {hasError && (
        <Alert variant={uploadState.error?.includes('já está verificada') ? 'default' : 'destructive'}>
          {uploadState.error?.includes('já está verificada') ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {uploadState.error}
            {uploadState.error?.includes('já está verificada') && (
              <div className="mt-2 text-sm text-green-700">
                🎉 Isso é ótimo! Sua conta já passou pela verificação e está pronta para receber pagamentos.
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isUploaded && !hasError && (uploadState.stripeFileId || existingUrl) && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {uploadState.stripeFileId ? (
              <>✅ Documento enviado com sucesso!</>
            ) : existingUrl ? (
              <>✅ Documento já anexado anteriormente</>
            ) : (
              <>✅ Documento validado</>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
