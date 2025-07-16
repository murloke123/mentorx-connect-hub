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
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import VideoPlayer from './VideoPlayer';

interface ConteudoListProps {
  conteudos: Conteudo[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const ConteudoList: React.FC<ConteudoListProps> = ({
  conteudos,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());

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
      <Card className="text-center py-8">
        <CardContent>
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum conteúdo encontrado
          </h3>
          <p className="text-gray-500">
            Adicione o primeiro conteúdo para este módulo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getContentIcon = (contentType: Conteudo['content_type']) => {
    switch (contentType) {
      case 'texto_rico':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'video_externo':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'pdf':
        return <FileIcon className="w-5 h-5 text-green-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      {conteudos.map((conteudo, index) => {
        const isExpanded = expandedPreviews.has(conteudo.id);
        
        return (
        <Card key={conteudo.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getContentIcon(conteudo.content_type)}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{conteudo.title}</CardTitle>
                  {conteudo.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {conteudo.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {conteudo.content_type === 'texto_rico' ? 'Texto'
                    : conteudo.content_type === 'video_externo' ? 'Vídeo'
                    : 'PDF'}
                </Badge>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Preview do Conteúdo */}
              {conteudo.content_type === 'texto_rico' || (conteudo.content_type === 'video_externo' 
                && conteudo.content_data?.video_url) || conteudo.content_type === 'pdf' ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => togglePreview(conteudo.id)}
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <span>Preview</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(conteudo.id)}
                        className="h-8 px-3 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>

                  {/* Conteúdo Texto Rico */}
                  {conteudo.content_type === 'texto_rico' && (
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className={`text-sm text-gray-700 transition-all duration-300 ${
                          isExpanded ? '' : 'line-clamp-3 max-h-[60px] overflow-hidden'
                        }`}
                        dangerouslySetInnerHTML={{ 
                          __html: conteudo.content_data?.texto || '<p>Sem conteúdo</p>'
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
                        <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center">
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
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FileIcon className="w-4 h-4" />
                        <span>
                          Visualizando: {conteudo.content_data.pdf_filename || 'Documento PDF'}
                        </span>
                      </div>
                      <iframe
                        src={conteudo.content_data.pdf_url}
                        className={`w-full border rounded transition-all duration-300 ${
                          isExpanded ? 'h-96' : 'h-[60px]'
                        }`}
                        title={conteudo.title}
                      />
                      {isExpanded && (
                        <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(conteudo.content_data.pdf_url, '_blank')}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Visualizar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = conteudo.content_data.pdf_url;
                            link.download = conteudo.content_data.pdf_filename || 'documento.pdf';
                            link.click();
                          }}
                          className="flex items-center space-x-1"
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(conteudo.id)}
                      className="h-8 px-3 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Excluir
                    </Button>
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
