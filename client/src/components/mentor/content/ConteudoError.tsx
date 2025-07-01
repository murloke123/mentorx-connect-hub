
import { Button } from '@/components/ui/button';

interface ConteudoErrorProps {
  onRetry: () => void;
}

const ConteudoError = ({ onRetry }: ConteudoErrorProps) => {
  return (
    <div className="text-center py-10">
      <h1 className="text-2xl font-bold text-red-500">Erro ao carregar conteúdos</h1>
      <p className="mt-2">Não foi possível carregar os conteúdos deste módulo.</p>
      <Button 
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
      >
        Tentar novamente
      </Button>
    </div>
  );
};

export default ConteudoError;
