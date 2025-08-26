import React, { memo } from 'react';
import { ChevronDown, ChevronRight, Play, FileText, Download } from 'lucide-react';
import { ConteudoItemLocal, ModuloItemLocal } from '../services/coursePlayerService';

interface ModuleItemProps {
  modulo: ModuloItemLocal;
  moduleIndex: number;
  isExpanded: boolean;
  onToggle: (moduleIndex: number) => void;
  onPreviewClick?: (content: ConteudoItemLocal) => void;
}

const ModuleItem = memo(({ modulo, moduleIndex, isExpanded, onToggle, onPreviewClick }: ModuleItemProps) => {
  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video_externo':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'texto_rico':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'pdf':
        return <Download className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="border border-gold/20 rounded-lg mb-4 bg-card/50 backdrop-blur-sm">
      <button
        onClick={() => onToggle(moduleIndex)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gold/10 transition-colors rounded-lg"
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gold" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gold" />
          )}
          <div>
            <h3 className="font-semibold text-foreground">{modulo.title}</h3>
            {modulo.description && (
              <p className="text-sm text-muted-foreground mt-1">{modulo.description}</p>
            )}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-4">
          <div className="space-y-2">
            {modulo.conteudos
              .sort((a, b) => a.ordem - b.ordem)
              .map((conteudo) => (
                <div
                  key={conteudo.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gold/5 cursor-pointer transition-colors border border-transparent hover:border-gold/20"
                  onClick={() => onPreviewClick?.(conteudo)}
                >
                  {getContentIcon(conteudo.content_type)}
                  <span className="text-foreground flex-1">{conteudo.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
});

ModuleItem.displayName = 'ModuleItem';

export default ModuleItem;