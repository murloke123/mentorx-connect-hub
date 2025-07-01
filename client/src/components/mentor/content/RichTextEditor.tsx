
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, 
  AlignRight, List, ListOrdered, Type, Image
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RichTextEditorProps {
  initialValue?: string;
  onChange: (content: string) => void;
  disabled?: boolean;
}

const RichTextEditor = ({ initialValue = "", onChange, disabled = false }: RichTextEditorProps) => {
  const [editorInitialized, setEditorInitialized] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Inicializa o editor apenas uma vez após a montagem do componente
    if (!editorInitialized && editorRef.current) {
      // Preparar o conteúdo inicial, se houver
      if (initialValue && editorRef.current) {
        editorRef.current.innerHTML = initialValue;
      }
      setEditorInitialized(true);
    }
  }, [initialValue, editorInitialized]);

  // Atualiza o valor cada vez que o conteúdo do editor muda
  useEffect(() => {
    const editorElement = editorRef.current;
    if (editorElement && editorInitialized) {
      const handleEditorChange = () => {
        onChange(editorElement.innerHTML);
      };

      editorElement.addEventListener('input', handleEditorChange);

      return () => {
        editorElement.removeEventListener('input', handleEditorChange);
      };
    }
  }, [onChange, editorInitialized]);

  const execCommand = (command: string, value: string = "") => {
    if (disabled) return;
    
    document.execCommand(command, false, value);
    
    // Atualiza manualmente o valor após executar um comando
    const editorElement = editorRef.current;
    if (editorElement) {
      onChange(editorElement.innerHTML);
    }
    
    // Foca o editor após executar um comando
    editorElement?.focus();
  };

  const insertImage = () => {
    if (disabled) return;
    
    const url = prompt("Insira a URL da imagem:");
    if (url) {
      execCommand('insertHTML', `<img src="${url}" alt="Imagem" style="max-width: 100%; height: auto;" />`);
    }
  };

  const createHeading = (level: number) => {
    if (disabled) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText) {
        // Se há texto selecionado, substitui por um heading
        execCommand('insertHTML', `<h${level}>${selectedText}</h${level}>`);
      } else {
        // Se não há seleção, insere um heading vazio
        execCommand('insertHTML', `<h${level}>Título</h${level}>`);
      }
    }
  };

  return (
    <div className={`border rounded-md ${disabled ? 'opacity-70' : ''}`}>
      <div className="bg-muted p-2 border-b flex flex-wrap gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('bold')}
                disabled={disabled}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Negrito</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('italic')}
                disabled={disabled}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Itálico</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('underline')}
                disabled={disabled}
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sublinhado</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => createHeading(2)}
                disabled={disabled}
              >
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Título</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyLeft')}
                disabled={disabled}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alinhar à esquerda</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyCenter')}
                disabled={disabled}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Centralizar</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyRight')}
                disabled={disabled}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Alinhar à direita</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertUnorderedList')}
                disabled={disabled}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lista com marcadores</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertOrderedList')}
                disabled={disabled}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Lista numerada</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border mx-1"></div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={insertImage}
                disabled={disabled}
              >
                <Image className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Inserir imagem</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div
        ref={editorRef}
        id="rich-text-editor"
        contentEditable={!disabled}
        className={`p-4 min-h-[300px] max-h-[500px] overflow-y-auto ${!disabled ? 'focus:outline-none' : 'bg-muted-50'}`}
        data-gramm="false" // Desativa correções gramaticais de terceiros
        spellCheck="false" // Desativa verificação ortográfica nativa
        dir="ltr" // Garante a direção do texto da esquerda para a direita
      />
    </div>
  );
};

export default RichTextEditor;
