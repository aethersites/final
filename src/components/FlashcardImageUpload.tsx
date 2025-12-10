import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image } from 'lucide-react';

interface FlashcardImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  existingImageUrl?: string;
  onImageRemoved?: () => void;
}

export const FlashcardImageUpload = ({ 
  onImageUploaded, 
  existingImageUrl, 
  onImageRemoved 
}: FlashcardImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload images.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique file path with safe file extension
      const fileExt = file.name.split('.').pop() || 'jpg'; // Default to jpg if no extension
      const fileName = `${user.id}/flashcards/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      
      // Ensure uploadData exists before accessing path
      if (!uploadData?.path) {
        throw new Error('Upload data is missing');
      }

      // Get public URL
      const { data } = supabase.storage
        .from('user_files')
        .getPublicUrl(uploadData.path);

      console.log('Generated public URL:', data.publicUrl);

      onImageUploaded(data.publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset input - TypeScript safe way
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).value = '';
    }
  };

  const removeImage = () => {
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  return (
    <div className="space-y-2">
      {existingImageUrl ? (
        <div className="relative inline-block">
          <img 
            src={existingImageUrl}
            alt="Flashcard image" 
            className="w-16 h-16 object-cover rounded-xl border-2 border-border/50 shadow-sm hover:shadow-md transition-shadow"
            onLoad={() => console.log('Image loaded successfully:', existingImageUrl)}
            onError={(e) => console.error('Image failed to load:', existingImageUrl, e)}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
            onClick={removeImage}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ) : null}
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <Image className="w-4 h-4" />
        {uploading ? 'Uploading...' : existingImageUrl ? 'Change image' : 'Add image'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};