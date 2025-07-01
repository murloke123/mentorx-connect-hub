import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Paperclip, XCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PdfContentFieldProps {
  onFileChange: (file: File | null) => void;
  isSubmitting: boolean;
  selectedFile: File | null;
  existingPdfUrl?: string;
  existingPdfFilename?: string;
}

const PdfContentField = ({
  onFileChange,
  isSubmitting,
  selectedFile,
  existingPdfUrl,
  existingPdfFilename,
}: PdfContentFieldProps) => {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    onFileChange(file);
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    // Resetar o input file (para permitir selecionar o mesmo arquivo novamente após remoção)
    const inputFile = document.getElementById('pdf-upload') as HTMLInputElement;
    if (inputFile) {
      inputFile.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="pdf-upload">Arquivo PDF</Label>
      <Alert className='bg-yellow-50 border-yellow-200 text-yellow-700'>
        <FileText className="h-4 w-4 !text-yellow-700" />
        <AlertTitle className='text-yellow-800 font-semibold'>Atenção</AlertTitle>
        <AlertDescription className='text-yellow-700'>
          O tamanho máximo para upload de PDF é 5MB.
        </AlertDescription>
      </Alert>

      {existingPdfUrl && !selectedFile ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">PDF atual:</p>
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
              <a 
                href={existingPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-primary hover:underline truncate max-w-xs"
                title={existingPdfFilename}
              >
                {existingPdfFilename || 'Visualizar PDF'}
              </a>
            </div>
          </div>
           <p className="text-xs text-muted-foreground mt-1">
            Para alterar, selecione um novo arquivo abaixo.
          </p>
        </div>
      ) : null}

      <Input
        id="pdf-upload"
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        disabled={isSubmitting}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
      />

      {selectedFile && (
        <div className="space-y-2">
          <p className="text-sm font-medium">PDF selecionado:</p>
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm truncate max-w-xs" title={selectedFile.name}>{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isSubmitting} className="text-muted-foreground hover:text-destructive">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfContentField; 