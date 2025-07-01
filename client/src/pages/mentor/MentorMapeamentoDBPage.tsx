
import React from "react";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import DatabaseFieldsComparison from "@/components/mentor/configuracoes/DatabaseFieldsComparison";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DatabaseMappingPage = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Migração concluída</AlertTitle>
          <AlertDescription>
            A estrutura do banco de dados foi atualizada com sucesso. A tabela "inscricoes" foi renomeada para "enrollments"
            e as colunas foram atualizadas para usar nomes em inglês compatíveis com as definições de tipo no TypeScript.
          </AlertDescription>
        </Alert>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertTitle>Compatibilidade</AlertTitle>
          <AlertDescription>
            Todas as consultas ao banco de dados foram atualizadas para refletir a nova estrutura. O código JavaScript agora usa
            consistentemente nomes em inglês em vez de português para maior clareza e padronização.
          </AlertDescription>
        </Alert>
        
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Tabela de Cursos Atualizada</AlertTitle>
          <AlertDescription>
            <p>Campos renomeados na tabela "cursos":</p>
            <ul className="list-disc pl-6 mt-2">
              <li>titulo → title</li>
              <li>descricao → description</li>
              <li>eh_publico → is_public</li>
              <li>eh_pago → is_paid</li>
              <li>preco → price</li>
              <li>url_imagem → image_url</li>
              <li>criado_em → created_at</li>
              <li>atualizado_em → updated_at</li>
              <li>foi_publicado → is_published</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="service-mappings" className="w-full">
          <TabsList>
            <TabsTrigger value="service-mappings">Mapeamentos por Serviço</TabsTrigger>
            <TabsTrigger value="table-mappings">Mapeamentos por Tabela</TabsTrigger>
            <TabsTrigger value="all-fields">Todos os Campos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="service-mappings">
            <Card>
              <CardHeader>
                <CardTitle>Mapeamentos de Campo por Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="course-service">
                  <TabsList className="mb-4">
                    <TabsTrigger value="course-service">courseService.ts</TabsTrigger>
                    <TabsTrigger value="mentor-service">mentorService.ts</TabsTrigger>
                    <TabsTrigger value="admin-service">adminService.ts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="course-service">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Campo TS</TableHead>
                          <TableHead>Nome na Tabela</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { ts: "title", db: "title", status: "success" },
                          { ts: "description", db: "description", status: "success" },
                          { ts: "is_public", db: "is_public", status: "success" },
                          { ts: "is_paid", db: "is_paid", status: "success" },
                          { ts: "price", db: "price", status: "success" },
                          { ts: "image_url", db: "image_url", status: "success" },
                          { ts: "mentor_id", db: "mentor_id", status: "success" },
                          { ts: "created_at", db: "created_at", status: "success" },
                          { ts: "updated_at", db: "updated_at", status: "success" },
                          { ts: "is_published", db: "is_published", status: "success" }
                        ].map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell>{mapping.ts}</TableCell>
                            <TableCell>{mapping.db}</TableCell>
                            <TableCell>
                              {mapping.status === "success" ? (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Compatível
                                </span>
                              ) : (
                                <span className="text-amber-600 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Incompatível
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="mentor-service">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Campo TS</TableHead>
                          <TableHead>Nome na Tabela</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { ts: "id", db: "id", status: "success" },
                          { ts: "title", db: "title", status: "success" },
                          { ts: "description", db: "description", status: "success" },
                          { ts: "is_public", db: "is_public", status: "success" },
                          { ts: "is_paid", db: "is_paid", status: "success" },
                          { ts: "price", db: "price", status: "success" },
                          { ts: "image_url", db: "image_url", status: "success" },
                          { ts: "created_at", db: "created_at", status: "success" },
                          { ts: "updated_at", db: "updated_at", status: "success" },
                          { ts: "mentor_id", db: "mentor_id", status: "success" },
                        ].map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell>{mapping.ts}</TableCell>
                            <TableCell>{mapping.db}</TableCell>
                            <TableCell>
                              {mapping.status === "success" ? (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Compatível
                                </span>
                              ) : (
                                <span className="text-amber-600 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Incompatível
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="admin-service">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome do Campo TS</TableHead>
                          <TableHead>Nome na Tabela</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { ts: "id", db: "id", status: "success" },
                          { ts: "title", db: "title", status: "success" },
                          { ts: "description", db: "description", status: "success" },
                          { ts: "is_paid", db: "is_paid", status: "success" },
                          { ts: "price", db: "price", status: "success" },
                          { ts: "created_at", db: "created_at", status: "success" },
                          { ts: "mentor_id", db: "mentor_id", status: "success" },
                        ].map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell>{mapping.ts}</TableCell>
                            <TableCell>{mapping.db}</TableCell>
                            <TableCell>
                              {mapping.status === "success" ? (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Compatível
                                </span>
                              ) : (
                                <span className="text-amber-600 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Incompatível
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table-mappings">
            <Card>
              <CardHeader>
                <CardTitle>Mapeamentos de Campo por Tabela</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="cursos">
                  <TabsList className="mb-4">
                    <TabsTrigger value="cursos">cursos</TabsTrigger>
                    <TabsTrigger value="modulos">modulos</TabsTrigger>
                    <TabsTrigger value="conteudos">conteudos</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="cursos">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome Atual</TableHead>
                          <TableHead>Nome Anterior</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { current: "title", previous: "titulo", status: "success" },
                          { current: "description", previous: "descricao", status: "success" },
                          { current: "is_public", previous: "eh_publico", status: "success" },
                          { current: "is_paid", previous: "eh_pago", status: "success" },
                          { current: "price", previous: "preco", status: "success" },
                          { current: "image_url", previous: "url_imagem", status: "success" },
                          { current: "created_at", previous: "criado_em", status: "success" },
                          { current: "updated_at", previous: "atualizado_em", status: "success" },
                          { current: "is_published", previous: "foi_publicado", status: "success" },
                        ].map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{mapping.current}</TableCell>
                            <TableCell>{mapping.previous}</TableCell>
                            <TableCell>
                              <span className="text-green-600 flex items-center">
                                <CheckCircle2 className="h-4 w-4 mr-1" /> Migrado
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="modulos">
                    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle>Pendente de Migração</AlertTitle>
                      <AlertDescription>
                        A tabela "modulos" ainda possui campos em português que precisam ser migrados para inglês.
                      </AlertDescription>
                    </Alert>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome Atual</TableHead>
                          <TableHead>Nome Recomendado</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { current: "nome_modulo", recommended: "name", status: "pending" },
                          { current: "descricao_modulo", recommended: "description", status: "pending" },
                          { current: "curso_id", recommended: "course_id", status: "pending" },
                          { current: "ordem", recommended: "order", status: "pending" },
                        ].map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{mapping.current}</TableCell>
                            <TableCell>{mapping.recommended}</TableCell>
                            <TableCell>
                              {mapping.status === "success" ? (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Migrado
                                </span>
                              ) : (
                                <span className="text-amber-600 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Pendente
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="conteudos">
                    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle>Pendente de Migração</AlertTitle>
                      <AlertDescription>
                        A tabela "conteudos" ainda possui campos em português que precisam ser migrados para inglês.
                      </AlertDescription>
                    </Alert>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome Atual</TableHead>
                          <TableHead>Nome Recomendado</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { current: "nome_conteudo", recommended: "title", status: "pending" },
                          { current: "descricao_conteudo", recommended: "description", status: "pending" },
                          { current: "tipo_conteudo", recommended: "content_type", status: "pending" },
                          { current: "dados_conteudo", recommended: "content_data", status: "pending" },
                          { current: "modulo_id", recommended: "module_id", status: "pending" },
                          { current: "ordem", recommended: "order", status: "pending" },
                        ].map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{mapping.current}</TableCell>
                            <TableCell>{mapping.recommended}</TableCell>
                            <TableCell>
                              {mapping.status === "success" ? (
                                <span className="text-green-600 flex items-center">
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Migrado
                                </span>
                              ) : (
                                <span className="text-amber-600 flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-1" /> Pendente
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all-fields">
            <DatabaseFieldsComparison />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DatabaseMappingPage;
