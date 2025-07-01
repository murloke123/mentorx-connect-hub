
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoPlayer from './VideoPlayer';
import { useState, useEffect } from 'react';

interface VideoContentFieldProps {
  initialUrl?: string;
  initialProvider?: 'youtube' | 'vimeo';
  onChange: (url: string, provider: 'youtube' | 'vimeo') => void;
  isSubmitting?: boolean;
}

const VideoContentField = ({ 
  initialUrl = '', 
  initialProvider = 'youtube', 
  onChange,
  isSubmitting
}: VideoContentFieldProps) => {
  const [videoUrl, setVideoUrl] = useState(initialUrl);
  const [provider, setProvider] = useState<'youtube' | 'vimeo'>(initialProvider);

  useEffect(() => {
    onChange(videoUrl, provider);
  }, [videoUrl, provider, onChange]);

  const detectVideoProvider = (url: string): 'youtube' | 'vimeo' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'youtube'; // Default if can't detect
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (url) {
      const detectedProvider = detectVideoProvider(url);
      setProvider(detectedProvider);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <FormLabel>URL do Vídeo</FormLabel>
        <Input 
          placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
          value={videoUrl}
          onChange={handleVideoUrlChange}
          disabled={isSubmitting}
          className="w-full"
        />
        <p className="text-sm text-muted-foreground">
          Cole o link completo do seu vídeo do YouTube ou Vimeo.
        </p>
      </div>

      {videoUrl && (
        <Card className="w-full">
          <CardContent className="pt-6">
            <VideoPlayer provider={provider} url={videoUrl} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={provider} value={provider} onValueChange={(value) => setProvider(value as 'youtube' | 'vimeo')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="vimeo">Vimeo</TabsTrigger>
        </TabsList>
        <TabsContent value="youtube" className="p-4 border rounded-md mt-2">
          <h4 className="text-sm font-medium mb-2">Como obter o link do YouTube:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Vá até o vídeo no YouTube</li>
            <li>Clique em 'Compartilhar' abaixo do vídeo</li>
            <li>Copie o link fornecido</li>
          </ol>
        </TabsContent>
        <TabsContent value="vimeo" className="p-4 border rounded-md mt-2">
          <h4 className="text-sm font-medium mb-2">Como obter o link do Vimeo:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Abra o vídeo no Vimeo</li>
            <li>Clique no ícone de 'Compartilhar' (geralmente um avião de papel)</li>
            <li>Copie o link da seção 'Link'</li>
          </ol>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoContentField;
