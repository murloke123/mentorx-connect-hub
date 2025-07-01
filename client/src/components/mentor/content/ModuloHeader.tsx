
import { Skeleton } from '@/components/ui/skeleton';

interface ModuloHeaderProps {
  modulo: {
    nome_modulo?: string;
    descricao_modulo?: string;
  } | null;
  isLoading: boolean;
}

const ModuloHeader = ({ modulo, isLoading }: ModuloHeaderProps) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">
        {isLoading ? <Skeleton className="h-9 w-64" /> : modulo?.nome_modulo}
      </h1>
      
      {modulo?.descricao_modulo && (
        <p className="text-muted-foreground mb-6">
          {modulo.descricao_modulo}
        </p>
      )}
    </>
  );
};

export default ModuloHeader;
