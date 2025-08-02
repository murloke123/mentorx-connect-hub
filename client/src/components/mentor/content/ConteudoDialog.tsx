import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Conteudo } from '@/types/database';
import { Edit, Plus } from 'lucide-react';
import ConteudoForm from './ConteudoForm';
import { ConteudoFormValues } from './types';

interface ConteudoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (values: ConteudoFormValues) => Promise<void>;
  onCancel: () => void;
  editingId: string | null;
  conteudoParaEditar: Conteudo | null;
}

const ConteudoDialog = ({
  isOpen,
  onOpenChange,
  isLoading,
  isSubmitting,
  onSubmit,
  onCancel,
  editingId,
  conteudoParaEditar,
}: ConteudoDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl backdrop-blur-sm">
        <DialogHeader className="p-6 pb-4 border-b border-slate-700">
          <DialogTitle className="text-lg font-semibold text-white flex items-center">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-gold via-gold-light to-gold-dark flex items-center justify-center mr-3 shadow-lg">
              {editingId ? (
                <Edit className="h-4 w-4 text-slate-900" />
              ) : (
                <Plus className="h-4 w-4 text-slate-900" />
              )}
            </div>
            {editingId ? 'Editar Conteúdo' : 'Adicionar Novo Conteúdo'}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-slate-800/50 backdrop-blur-sm">
          {isLoading && editingId ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-8 w-full bg-slate-700/50" />
              <Skeleton className="h-24 w-full bg-slate-700/50" />
              <Skeleton className="h-8 w-1/2 bg-slate-700/50" />
              <Skeleton className="h-40 w-full bg-slate-700/50" />
            </div>
          ) : (
            <ConteudoForm
              onSubmit={onSubmit}
              onCancel={onCancel}
              isSubmitting={isSubmitting}
              initialData={{
                title: conteudoParaEditar?.title || undefined,
                description: conteudoParaEditar?.description || undefined,
                content_type: conteudoParaEditar?.content_type,
                html_content: conteudoParaEditar?.content_data?.texto || undefined,
                video_url: conteudoParaEditar?.content_data?.video_url || undefined,
                provider: conteudoParaEditar?.content_data?.provider || undefined,
                pdf_url: conteudoParaEditar?.content_data?.pdf_url || undefined,
                pdf_filename: conteudoParaEditar?.content_data?.pdf_filename || undefined,
                storage_path: conteudoParaEditar?.content_data?.storage_path || undefined,
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConteudoDialog;
