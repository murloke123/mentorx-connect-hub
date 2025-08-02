import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Paperclip, XCircle } from 'lucide-react';

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
      <Label htmlFor="pdf-upload" className="text-white font-medium">Arquivo PDF</Label>
      <Alert className='bg-yellow-900/30 border-yellow-600/50 text-yellow-300'>
        <FileText className="h-4 w-4 !text-yellow-400" />
        <AlertTitle className='text-yellow-200 font-semibold'>Atenção</AlertTitle>
        <AlertDescription className='text-yellow-300'>
          O tamanho máximo para upload de PDF é 5MB.
        </AlertDescription>
      </Alert>

      {existingPdfUrl && !selectedFile ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">PDF atual:</p>
          <div className="flex items-center justify-between p-3 border border-slate-600 rounded-md bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-gray-400" />
              <a 
                href={existingPdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gold hover:text-gold/80 hover:underline truncate max-w-xs transition-colors"
                title={existingPdfFilename}
              >
                {existingPdfFilename || 'Visualizar PDF'}
              </a>
            </div>
          </div>
           <p className="text-xs text-gray-400 mt-1">
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
        className="bg-slate-800/50 border-slate-600 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gold/20 file:text-gold hover:file:bg-gold/30 transition-all duration-300"
      />

      {selectedFile && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">PDF selecionado:</p>
          <div className="flex items-center justify-between p-3 border border-slate-600 rounded-md bg-slate-800/50">
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-gray-400" />
              <span className="text-sm truncate max-w-xs text-white" title={selectedFile.name}>{selectedFile.name}</span>
              <span className="text-xs text-gray-400">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isSubmitting} className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfContentField;