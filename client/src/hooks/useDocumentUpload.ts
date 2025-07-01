import { uploadAndAssociateDocument } from '@/services/stripeDocumentService';
import { supabase } from '@/utils/supabase';
import { useState } from 'react';

export interface DocumentUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  previewUrl: string | null;
  previewType: 'image' | 'pdf' | null;
  stripeFileId: string | null;
  supabaseUrl: string | null;
  fileName: string | null;
}

export interface UseDocumentUploadReturn {
  uploadState: DocumentUploadState;
  uploadDocument: (file: File, userId: string, documentType: string, side: 'front' | 'back') => Promise<boolean>;
  clearUpload: () => void;
  removeDocument: (userId: string, documentType: string, side: 'front' | 'back') => Promise<void>;
  loadExistingDocument: (userId: string, side: 'front' | 'back') => Promise<void>;
}

/**
 * Extrair caminho completo do arquivo do Supabase Storage
 */
const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Para URLs do Supabase Storage, o caminho está após '/object/public/documents/'
    const pathParts = urlObj.pathname.split('/object/public/documents/');
    if (pathParts.length < 2) {
      console.log('❌ URL não parece ser do Supabase Storage:', url);
      return null;
    }
    const filePath = pathParts[1];
    console.log('📁 Caminho do arquivo extraído:', filePath);
    return filePath;
  } catch (error) {
    console.error('❌ Erro ao extrair caminho do arquivo:', error);
    return null;
  }
};

/**
 * Deletar arquivo anterior do Supabase Storage
 */
const deleteOldFile = async (userId: string, documentType: string, side: 'front' | 'back'): Promise<void> => {
  try {
    console.log('🗑️ Verificando documento anterior para exclusão...');
    
    // Buscar documento atual no perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('document_front_url, document_back_url')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.log('👤 Perfil não encontrado ou sem documento anterior');
      return;
    }

    const oldUrl = side === 'front' ? profile.document_front_url : profile.document_back_url;
    if (!oldUrl) {
      console.log('📄 Nenhum documento anterior encontrado');
      return;
    }

    // Extrair caminho do arquivo da URL
    const filePath = extractFilePathFromUrl(oldUrl);
    if (!filePath) {
      console.log('❌ Não foi possível extrair caminho do arquivo da URL:', oldUrl);
      return;
    }

    // Deletar arquivo do Storage
    const { error: deleteError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (deleteError) {
      console.error('❌ Erro ao deletar arquivo anterior:', deleteError);
    } else {
      console.log('✅ Arquivo anterior deletado com sucesso:', filePath);
    }
  } catch (error) {
    console.error('❌ Erro inesperado ao deletar arquivo anterior:', error);
  }
};

/**
 * Criar preview URL baseado no tipo de arquivo
 */
const createPreviewUrl = (file: File): { url: string; type: 'image' | 'pdf' } => {
  const url = URL.createObjectURL(file);
  const type = file.type === 'application/pdf' ? 'pdf' : 'image';
  return { url, type };
};

export const useDocumentUpload = (): UseDocumentUploadReturn => {
  const [uploadState, setUploadState] = useState<DocumentUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    previewUrl: null,
    previewType: null,
    stripeFileId: null,
    supabaseUrl: null,
    fileName: null
  });

  // Função para buscar documento existente do perfil
  const loadExistingDocument = async (userId: string, side: 'front' | 'back'): Promise<void> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('document_front_url, document_back_url, stripe_document_front_file_id, stripe_document_back_file_id, account_already_verified, document_verification_status')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        const existingUrl = side === 'front' ? profile.document_front_url : profile.document_back_url;
        const existingFileId = side === 'front' ? profile.stripe_document_front_file_id : profile.stripe_document_back_file_id;
        
        if (existingUrl && existingFileId) {
          setUploadState(prev => ({
            ...prev,
            stripeFileId: existingFileId,
            supabaseUrl: existingUrl,
            fileName: 'Documento anexado anteriormente'
          }));
        }
        
        // Se a conta já está verificada, não mostrar elementos de upload
        if (profile.account_already_verified) {
          console.log('✅ Conta já verificada - ocultando elementos de upload');
        }
      }
    } catch (error) {
      console.log('ℹ️ Não foi possível carregar documento existente:', error);
    }
  };

  const uploadDocument = async (
    file: File, 
    userId: string, 
    documentType: string, 
    side: 'front' | 'back'
  ): Promise<boolean> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null
      }));

      console.log('🚀 ===== INICIANDO UPLOAD DE DOCUMENTO =====');
      console.log('📋 Dados:', { 
        fileName: file.name, 
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        fileType: file.type, 
        userId, 
        documentType, 
        side 
      });

      // 1. Criar preview local
      const preview = createPreviewUrl(file);
      setUploadState(prev => ({
        ...prev,
        previewUrl: preview.url,
        previewType: preview.type,
        fileName: file.name,
        progress: 10
      }));

      // 2. Deletar documento anterior (se existir)
      await deleteOldFile(userId, documentType, side);
      setUploadState(prev => ({ ...prev, progress: 20 }));

      // 3. Upload para Supabase Storage
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${documentType}_${side}_${Date.now()}.${fileExtension}`;
      
      console.log('📁 Fazendo upload para Supabase Storage:', fileName);
      const { data: supabaseData, error: supabaseError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (supabaseError) {
        throw new Error(`Erro no upload para Supabase: ${supabaseError.message}`);
      }

      setUploadState(prev => ({ ...prev, progress: 50 }));

      // 4. Obter URL do Supabase (privada, mas acessível com token)
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      console.log('✅ Upload para Supabase concluído:', publicUrl);
      setUploadState(prev => ({
        ...prev,
        supabaseUrl: publicUrl,
        progress: 70
      }));

      // 5. Upload para Stripe e associação automática à conta conectada
      console.log('📤 Fazendo upload para Stripe e associando à conta...');
      const stripeResult = await uploadAndAssociateDocument(
        file, 
        userId, 
        side, // 'front' | 'back'  
        'identity_document'
      );
      
      if (!stripeResult.success) {
        // Verificar se é erro de conta já verificada
        if (stripeResult.error === 'ACCOUNT_ALREADY_VERIFIED') {
          // Marcar conta como já verificada no banco de dados
          console.log('🔄 Atualizando status de verificação para "verified" no perfil do usuário...');
          try {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                account_already_verified: true,
                document_verification_status: 'verified',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
            
            if (updateError) {
              console.error('❌ Erro ao atualizar status de verificação:', updateError);
            } else {
              console.log('✅ Status de verificação atualizado para "verified" no banco de dados');
              console.log('📋 User ID:', userId);
            }
          } catch (updateError) {
            console.error('❌ Erro crítico ao marcar conta como verificada:', updateError);
          }
          
          throw new Error('Sua conta já está verificada! Os documentos já foram aprovados e não podem ser alterados.');
        }
        throw new Error(stripeResult.error || 'Erro no upload para Stripe');
      }

      if (stripeResult.associated) {
        console.log('✅ Documento enviado para Stripe e associado à conta conectada:', stripeResult.fileId);
      } else {
        console.log('⚠️ Documento enviado para Stripe mas NÃO foi associado à conta conectada:', stripeResult.fileId);
      }

      console.log('✅ Upload para Stripe concluído:', stripeResult.fileId);
      setUploadState(prev => ({
        ...prev,
        stripeFileId: stripeResult.fileId || null,
        progress: 90
      }));

      // 6. Salvar referências no perfil do usuário
      const updateData: any = {
        document_type: documentType,
        updated_at: new Date().toISOString()
      };
      
      if (side === 'front') {
        updateData[`document_front_url`] = publicUrl;
        updateData[`stripe_document_front_file_id`] = stripeResult.fileId;
      } else {
        updateData[`document_back_url`] = publicUrl;
        updateData[`stripe_document_back_file_id`] = stripeResult.fileId;
      }

      console.log('💾 Salvando referências no perfil...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100
      }));

      console.log('🎉 ===== UPLOAD CONCLUÍDO COM SUCESSO =====');
      return true;

    } catch (error: any) {
      console.error('💥 ERRO NO UPLOAD:', error);
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: error.message,
        previewUrl: null,
        previewType: null,
        fileName: null
      }));
      return false;
    }
  };

  const clearUpload = () => {
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      previewUrl: null,
      previewType: null,
      stripeFileId: null,
      supabaseUrl: null,
      fileName: null
    });
  };

  const removeDocument = async (userId: string, documentType: string, side: 'front' | 'back') => {
    try {
      console.log('🗑️ ===== REMOVENDO DOCUMENTO =====');
      
      // Deletar arquivo do Storage
      await deleteOldFile(userId, documentType, side);

      // Limpar referências no perfil
      const updateData: any = {};
      
      if (side === 'front') {
        updateData[`document_front_url`] = null;
        updateData[`stripe_document_front_file_id`] = null;
      } else {
        updateData[`document_back_url`] = null;
        updateData[`stripe_document_back_file_id`] = null;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Erro ao limpar perfil: ${updateError.message}`);
      }

      // Limpar estado local
      clearUpload();
      
      console.log('✅ ===== DOCUMENTO REMOVIDO COM SUCESSO =====');
    } catch (error) {
      console.error('❌ Erro ao remover documento:', error);
    }
  };

  return {
    uploadState,
    uploadDocument,
    clearUpload,
    removeDocument,
    loadExistingDocument
  };
};
