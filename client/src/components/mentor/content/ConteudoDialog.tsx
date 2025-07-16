import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ConteudoForm from './ConteudoForm';
import { Conteudo } from '@/types/database';
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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>
            {editingId ? 'Editar Conteúdo' : 'Adicionar Novo Conteúdo'}
          </DialogTitle>
        </DialogHeader>

        {isLoading && editingId ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <ConteudoForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            isSubmitting={isSubmitting}
            initialData={{
              title: conteudoParaEditar?.title,
              description: conteudoParaEditar?.description,
              content_type: conteudoParaEditar?.content_type,
              html_content: conteudoParaEditar?.content_data?.texto,
              video_url: conteudoParaEditar?.content_data?.video_url,
              provider: conteudoParaEditar?.content_data?.provider,
              pdf_url: conteudoParaEditar?.content_data?.pdf_url,
              pdf_filename: conteudoParaEditar?.content_data?.pdf_filename,
              storage_path: conteudoParaEditar?.content_data?.storage_path,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConteudoDialog;
