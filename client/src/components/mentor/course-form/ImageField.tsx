
import React, { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CourseFormData } from "./FormSchema";
import { uploadCourseImage, removeImage } from "@/utils/uploadImage";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface ImageFieldProps {
  form: UseFormReturn<CourseFormData>;
}

const ImageField = ({ form }: ImageFieldProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
  const { toast } = useToast();

  // Extract path from URL
  const extractPathFromUrl = (url: string | null): string | null => {
    if (!url) return null;
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1].split('?')[0]; // Get filename and remove query params
  };

  // Initialize previewImage and currentImagePath from form value
  useEffect(() => {
    const imageUrl = form.getValues("image");
    if (imageUrl) {
      setPreviewImage(imageUrl);
      setCurrentImagePath(extractPathFromUrl(imageUrl));
    }
  }, [form]);

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Create a preview immediately for better UX
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);
      
      // Upload new image, replacing the existing one if there is a path
      const result = await uploadCourseImage(file, currentImagePath);
      
      // Update form value with the new URL
      form.setValue("image", result.url, { shouldValidate: true });
      
      // Update preview with the actual URL from storage and current path
      setPreviewImage(result.url);
      setCurrentImagePath(result.path);
      
      // Clean up the temporary object URL
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      
      // Reset preview if upload fails
      const currentImage = form.getValues("image");
      setPreviewImage(currentImage || null);
      
      toast({
        title: "Erro ao fazer upload da imagem",
        description: "Verifique se o bucket 'courses' existe no Supabase.",
        variant: "destructive"
      });
      form.setError("image", {
        type: "manual",
        message: "Erro ao fazer upload da imagem. Tente novamente."
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem className="mb-4">
          <FormLabel>Imagem do Curso*</FormLabel>
          <FormControl>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="courseImage"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                disabled={isUploading}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(e.target.files[0]);
                  }
                }}
              />
              
              {previewImage ? (
                <div className="rounded-md border mt-2 overflow-hidden relative">
                  <img 
                    src={previewImage}
                    alt="Prévia do curso" 
                    className="h-48 w-full object-cover"
                    key={`preview-${Date.now()}`} // Force re-render of image
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Spinner className="w-8 h-8" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-md flex items-center justify-center h-48 bg-muted mt-2">
                  <div className="flex flex-col items-center text-muted-foreground">
                    {isUploading ? (
                      <>
                        <Spinner className="w-8 h-8 mb-2" />
                        <span>Fazendo upload...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 mb-2" />
                        <span>Tamanho sugerido: 1280x720px</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageField;
