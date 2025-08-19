import { Conteudo } from '@/types/database';
import {
    ChevronDown,
    ChevronUp,
    Download,
    Edit,
    Eye,
    FileIcon,
    FileText,
    Trash2,
    Video
} from 'lucide-react';
import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../../ui/alert-dialog';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import VideoPlayer from './VideoPlayer';

interface ConteudoListProps {
  conteudos: Conteudo[];
  onEdit: (conteudoId: string) => void;
  onDelete: (conteudoId: string) => Promise<void>;
  isLoading: boolean;
}

const ConteudoList: React.FC<ConteudoListProps> = ({
  conteudos,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const togglePreview = (conteudoId: string) => {
    const newExpanded = new Set(expandedPreviews);
    if (newExpanded.has(conteudoId)) {
      newExpanded.delete(conteudoId);
    } else {
      newExpanded.add(conteudoId);
    }
    setExpandedPreviews(newExpanded);
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conteudos.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gold mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Nenhum conteúdo encontrado</h3>
        <p className="text-gray-400">Adicione o primeiro conteúdo a este módulo.</p>
      </div>
    );
  }

  const getContentIcon = (contentType: Conteudo['content_type']) => {
    switch (contentType) {
      case 'texto_rico':
        return <FileText className="w-5 h-5 text-gold" />;
      case 'video_externo':
        return <Video className="w-5 h-5 text-gold" />;
      case 'pdf':
        return <FileIcon className="w-5 h-5 text-gold" />;
      default:
        return <FileText className="w-5 h-5 text-gold" />;
    }
  };

  return (
    <div className="space-y-4">
      {conteudos.map((conteudo, index) => {
        const isExpanded = expandedPreviews.has(conteudo.id);
        
        return (
        <Card key={conteudo.id} className="bg-slate-800/50 border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {getContentIcon(conteudo.content_type)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base sm:text-lg text-white break-words">{conteudo.title}</CardTitle>
                  {conteudo.description && (
                    <p className="text-sm text-gray-300 mt-1 break-words">
                      {conteudo.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs bg-gold/20 text-gold border-gold/30">
                  {conteudo.content_type === 'texto_rico' ? 'Texto'
                    : conteudo.content_type === 'video_externo' ? 'Vídeo'
                    : 'PDF'}
                </Badge>
                <span className="text-xs text-gray-400">#{index + 1}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Preview do Conteúdo */}
              {conteudo.content_type === 'texto_rico' || (conteudo.content_type === 'video_externo' 
                && conteudo.content_data?.video_url) || conteudo.content_type === 'pdf' ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => togglePreview(conteudo.id)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                    >
                      <span>Preview</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onEdit(conteudo.id)}
                        className="h-8 px-3 bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300 w-full sm:w-auto"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Editar</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 bg-gray-800 hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-white transition-all duration-300 w-full sm:w-auto"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            <span className="hidden sm:inline">Excluir</span>
                            <span className="sm:hidden">Excluir</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl backdrop-blur-sm">
                          <AlertDialogHeader className="border-b border-slate-700 pb-4">
                            <AlertDialogTitle className="text-lg font-semibold text-white flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                                <Trash2 className="h-4 w-4 text-white" />
                              </div>
                              Excluir conteúdo?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300 mt-3">
                              Esta ação não pode ser desfeita. Isso irá excluir permanentemente o conteúdo{" "}
                              <span className="text-gold font-medium">"{conteudo.title}"</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-4">
                            <AlertDialogCancel className="bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                setDeletingId(conteudo.id);
                                try {
                                  await onDelete(conteudo.id);
                                } finally {
                                  setDeletingId(null);
                                }
                              }}
                              disabled={deletingId === conteudo.id}
                              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                              {deletingId === conteudo.id ? 'Excluindo...' : 'Confirmar Exclusão'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Conteúdo Texto Rico */}
                  {conteudo.content_type === 'texto_rico' && (
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className={`prose prose-sm max-w-none rich-text-content text-sm text-gray-300 transition-all duration-300 ${
                          isExpanded ? '' : 'line-clamp-3 max-h-[60px] overflow-hidden'
                        }`}
                        dangerouslySetInnerHTML={{ 
                          __html: conteudo.content_data?.texto || conteudo.content_data?.html_content || '<p>Sem conteúdo</p>'
                        }} 
                      />
                    </div>
                  )}

                  {/* Conteúdo Vídeo */}
                  {conteudo.content_type === 'video_externo' && conteudo.content_data?.video_url && (
                    <div className={`transition-all duration-300 ${
                      isExpanded 
                        ? 'aspect-video bg-black rounded-lg overflow-hidden' 
                        : 'h-[60px] bg-black rounded-lg overflow-hidden relative'
                    }`}>
                      {isExpanded ? (
                        <VideoPlayer
                          provider={conteudo.content_data.provider || 'youtube'}
                          url={conteudo.content_data.video_url}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
                          <div className="flex items-center space-x-2 text-white text-sm">
                            <Video className="w-4 h-4" />
                            <span>Vídeo: {conteudo.content_data.provider || 'YouTube'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conteúdo PDF */}
                  {conteudo.content_type === 'pdf' && conteudo.content_data?.pdf_url && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <FileIcon className="w-4 h-4" />
                        <span>
                          Visualizando: {conteudo.content_data.pdf_filename || 'Documento PDF'}
                        </span>
                      </div>
                      <iframe
                        src={conteudo.content_data.pdf_url}
                        className={`w-full border border-slate-600 rounded transition-all duration-300 ${
                          isExpanded ? 'h-96' : 'h-[60px]'
                        }`}
                        title={conteudo.title}
                      />
                      {isExpanded && (
                        <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => window.open(conteudo.content_data?.pdf_url, '_blank')}
                          className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Visualizar</span>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (conteudo.content_data?.pdf_url) {
                              const link = document.createElement('a');
                              link.href = conteudo.content_data.pdf_url;
                              link.download = conteudo.content_data.pdf_filename || 'documento.pdf';
                              link.click();
                            }
                          }}
                          className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-yellow-700">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Conteúdo sem preview disponível</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(conteudo.id)}
                      className="h-8 px-3"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl backdrop-blur-sm">
                        <AlertDialogHeader className="border-b border-slate-700 pb-4">
                          <AlertDialogTitle className="text-lg font-semibold text-white flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mr-3 shadow-lg">
                              <Trash2 className="h-4 w-4 text-white" />
                            </div>
                            Excluir conteúdo?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300 mt-3">
                            Esta ação não pode ser desfeita. Isso irá excluir permanentemente o conteúdo{" "}
                            <span className="text-gold font-medium">"{conteudo.title}"</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-4">
                          <AlertDialogCancel className="bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              setDeletingId(conteudo.id);
                              try {
                                await onDelete(conteudo.id);
                              } finally {
                                setDeletingId(null);
                              }
                            }}
                            disabled={deletingId === conteudo.id}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50"
                          >
                            {deletingId === conteudo.id ? 'Excluindo...' : 'Confirmar Exclusão'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
};

export default ConteudoList;
