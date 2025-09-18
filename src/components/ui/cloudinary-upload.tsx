import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface CloudinaryUploadProps {
  currentImage?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  userId: string;
  className?: string;
}

export function CloudinaryUpload({ 
  currentImage, 
  onImageUploaded, 
  userId,
  className = "" 
}: CloudinaryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  console.log(previewImage)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validações locais
    if (file.size > 2 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 2MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("Apenas arquivos de imagem são aceitos.");
      return;
    }

    setUploading(true);

    try {
      // Preview local imediato
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPreviewImage(result.url);
        onImageUploaded(result.url);
        toast.success("Foto atualizada com sucesso.");
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Erro ao fazer upload');
      setPreviewImage(currentImage!); // Reverter preview
      toast.error("Não foi possível fazer o upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!previewImage || uploading) return;

    try {
      setUploading(true);
      
      // Se é uma URL do Cloudinary, extrair public_id e deletar
      if (previewImage.includes('cloudinary.com')) {
        const publicId = `avatars/user_${userId}`;
        await fetch(`/api/upload/avatar?publicId=${encodeURIComponent(publicId)}`, {
          method: 'DELETE',
        });
      }

      setPreviewImage(null);
      onImageUploaded(''); // String vazia para remover do banco
      toast.success("Sua foto foi removida com sucesso.");
    } catch (error) {
      toast.error("Não foi possível remover a foto.");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="w-20 h-20 border-2 border-gray-200">
            <AvatarImage 
              src={previewImage || undefined} 
              alt="Foto do perfil"
              className="object-cover"
            />
            <AvatarFallback className="text-lg font-semibold bg-gray-100">
              {userId ? getInitials(userId) : 'UN'}
            </AvatarFallback>
          </Avatar>
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          
          {previewImage && !uploading && (
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
              type="button"
              title="Remover foto"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              type="button"
              className="min-w-[120px]"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {previewImage ? 'Alterar Foto' : 'Enviar Foto'}
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              JPG, PNG, WebP até 2MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {previewImage && !error && !uploading && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Foto carregada com sucesso!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}