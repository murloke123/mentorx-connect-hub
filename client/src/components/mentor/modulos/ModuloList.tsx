import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlusCircle, FileText, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modulo } from '@/services/moduloService';
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
} from '@/components/ui/alert-dialog';

interface ModuloListProps {
  modulos: Modulo[];
  cursoId: string;
  onAddModulo: () => void;
  onEditModulo: (modulo: Modulo) => void;
  onDeleteModulo: (moduloId: string) => Promise<void>;
  isLoading: boolean;
}

const ModuloList = ({ modulos, cursoId, onAddModulo, onEditModulo, onDeleteModulo, isLoading }: ModuloListProps) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400 animate-pulse" />
        <h3 className="mt-2 text-xl font-medium text-gray-900">
          Carregando módulos...
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Módulos do Curso</h2>
        <Button onClick={onAddModulo}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Módulo
        </Button>
      </div>

      {modulos.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-medium text-gray-900">
            Nenhum módulo criado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie seu primeiro módulo para começar a estruturar o conteúdo do curso
          </p>
          <Button onClick={onAddModulo} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Primeiro Módulo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {modulos.map((modulo) => (
            <Card key={modulo.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{modulo.title}</CardTitle>
                    {modulo.description && (
                      <CardDescription className="mt-1">
                        {modulo.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">
                    Módulo {modulo.order_index + 1}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mt-4">
                  <Button asChild>
                    <Link to={`/mentor/cursos/${cursoId}/modulos/${modulo.id}`}>
                      Gerenciar Conteúdos <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button variant="default" size="sm" onClick={() => onEditModulo(modulo)} className="bg-gray-800 hover:bg-gray-700 text-white">
                      <Edit className="mr-2 h-4 w-4" /> 
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir módulo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso irá excluir permanentemente o módulo{" "}
                            "{modulo.title}" e todos os seus conteúdos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setDeletingId(modulo.id);
                              onDeleteModulo(modulo.id).finally(() => {
                                setDeletingId(null);
                              });
                            }}
                            disabled={deletingId === modulo.id}
                          >
                            {deletingId === modulo.id ? 'Excluindo...' : 'Confirmar Exclusão'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuloList;
