
import { FormLabel } from '@/components/ui/form';
import RichTextEditor from './RichTextEditor';

interface TextContentFieldProps {
  initialValue?: string;
  onChange: (content: string) => void;
  isSubmitting?: boolean;
}

const TextContentField = ({ initialValue, onChange, isSubmitting }: TextContentFieldProps) => {
  return (
    <div className="space-y-2 w-full">
      <FormLabel>Conteúdo</FormLabel>
      <RichTextEditor initialValue={initialValue} onChange={onChange} disabled={isSubmitting} />
    </div>
  );
};

export default TextContentField;
