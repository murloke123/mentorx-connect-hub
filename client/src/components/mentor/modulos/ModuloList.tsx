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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Modulo } from "@/services/moduloService";
import { ChevronRight, Edit, FileText, Library, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Módulos do Curso</h2>
        <Button onClick={onAddModulo} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Módulo
        </Button>
      </div>

      {modulos.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <Library className="mx-auto h-12 w-12 text-gold" />
          <h3 className="mt-2 text-xl font-medium text-white">
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
            <Card key={modulo.id} className="hover:shadow-md transition-shadow bg-slate-800/50">
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
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4">
                  <Button asChild className="w-full sm:w-auto">
                    <Link to={`/mentor/meus-cursos/${cursoId}/modulos/${modulo.id}`}>
                      Gerenciar Conteúdos <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Button variant="default" size="sm" onClick={() => onEditModulo(modulo)} className="bg-gray-800 hover:bg-gray-700 text-white flex-1 sm:flex-none">
                      <Edit className="mr-2 h-4 w-4" /> 
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm" className="bg-gray-800 hover:bg-red-600 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] text-white transition-all duration-300 flex-1 sm:flex-none">
                          <Trash2 className="mr-2 h-4 w-4" />
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
                            Excluir módulo?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-300 mt-3">
                            Esta ação não pode ser desfeita. Isso irá excluir permanentemente o módulo{" "}
                            <span className="text-gold font-medium">"{modulo.title}"</span> e todos os seus conteúdos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="pt-4">
                          <AlertDialogCancel className="bg-white/10 border-white/20 text-gray-300 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              setDeletingId(modulo.id);
                              onDeleteModulo(modulo.id).finally(() => {
                                setDeletingId(null);
                              });
                            }}
                            disabled={deletingId === modulo.id}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200 disabled:opacity-50"
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
