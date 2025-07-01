import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DatabaseField {
  name: string;
  type: string;
  isNullable: boolean;
}

interface FieldMapping {
  name: string;
  value: string;
}

const DatabaseFieldsComparison = () => {
  const [databaseFields, setDatabaseFields] = useState<DatabaseField[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { name: 'id', value: 'ID' },
    { name: 'created_at', value: 'Data de Criação' },
    { name: 'updated_at', value: 'Data de Atualização' },
    { name: 'full_name', value: 'Nome Completo' },
    { name: 'avatar_url', value: 'URL do Avatar' },
    { name: 'role', value: 'Função' },
    { name: 'email', value: 'Email' },
    { name: 'bio', value: 'Biografia' },
    { name: 'phone', value: 'Telefone' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDatabaseFields = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(1);

        if (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Erro ao buscar campos do banco de dados",
            description: "Não foi possível carregar os campos da tabela 'profiles'.",
            variant: "destructive",
          });
          return;
        }

        if (!data || data.length === 0) {
          console.warn("No data found in the 'profiles' table.");
          return;
        }

        const firstRow = data[0];
        // Fix: properly handle column retrieval without using Object.getPrototypeOf
        const fields: DatabaseField[] = Object.keys(firstRow).map(key => {
          return {
            name: key,
            type: typeof firstRow[key as keyof typeof firstRow], // Fix: use keyof typeof for type safety
            isNullable: firstRow[key as keyof typeof firstRow] === null,
          };
        });

        setDatabaseFields(fields);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado ao buscar os campos do banco de dados.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabaseFields();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparação de Campos do Banco de Dados</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Carregando campos do banco de dados...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campo no Banco de Dados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome Amigável
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {databaseFields.map((field) => (
                  <tr key={field.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {field.name} ({field.type})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {fieldMappings.find(fm => fm.name === field.name)?.value || field.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseFieldsComparison;
