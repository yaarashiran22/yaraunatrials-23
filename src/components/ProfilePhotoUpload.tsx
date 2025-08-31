import React, { useRef } from 'react';
import { Plus, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfilePhotos } from '@/hooks/useProfilePhotos';
import { useSecureAuth } from '@/hooks/useSecureAuth';

interface ProfilePhotoUploadProps {
  userId?: string;
  isOwnProfile?: boolean;
}

const ProfilePhotoUpload = ({ userId, isOwnProfile = false }: ProfilePhotoUploadProps) => {
  const { user } = useSecureAuth();
  const { photos, loading, uploading, uploadPhoto, deletePhoto } = useProfilePhotos(userId);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  console.log('ProfilePhotoUpload - Render with:', { 
    userId, 
    isOwnProfile, 
    userLoggedIn: !!user,
    userIdFromProps: userId,
    currentUserId: user?.id,
    photosCount: photos.length
  });

  // Show upload interface if user is authenticated and this is marked as their own profile
  const showUploadInterface = user && isOwnProfile;
  console.log('ProfilePhotoUpload - Show upload interface:', showUploadInterface);

  // If not showing upload interface but has photos, show view-only mode
  if (!showUploadInterface) {
    if (photos.length === 0) {
      console.log('ProfilePhotoUpload - No upload access and no photos, returning null');
      return null;
    }
    
    console.log('ProfilePhotoUpload - Showing view-only mode with', photos.length, 'photos');
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">User Photos</h3>
        <div className="flex gap-3 overflow-x-auto">
          {photos.map((photo) => (
            <div key={photo.id} className="flex-shrink-0">
              <img
                src={photo.photo_url}
                alt="User photo"
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleFileSelect = async (order: number, file: File | null) => {
    console.log('ProfilePhotoUpload - handleFileSelect called:', { order, file: file?.name, fileType: file?.type, fileSize: file?.size });
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('ProfilePhotoUpload - Invalid file type:', file.type);
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('ProfilePhotoUpload - File too large:', file.size);
      return;
    }
    
    console.log('ProfilePhotoUpload - Calling uploadPhoto...');
    const result = await uploadPhoto(file, order);
    console.log('ProfilePhotoUpload - Upload result:', result);
  };

  const getPhotoByOrder = (order: number) => {
    return photos.find(photo => photo.display_order === order);
  };

  const renderPhotoSlot = (order: number) => {
    const photo = getPhotoByOrder(order);
    const index = order - 1;

    return (
      <div key={order} className="relative">
        <input
          ref={fileInputRefs[index]}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(order, file);
            }
          }}
        />
        
        {photo ? (
          <div className="relative group">
            <img
              src={photo.photo_url}
              alt={`User photo ${order}`}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-8 w-8"
                onClick={() => deletePhoto(photo.id, photo.photo_url)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRefs[index].current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center hover:border-muted-foreground/50 transition-colors duration-200 bg-muted/20"
          >
            <Camera className="h-6 w-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Add Photo</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">User Photos</h3>
        <span className="text-sm text-muted-foreground">Up to 3 photos • Public</span>
      </div>
      
      <div className="flex gap-3">
        {[1, 2, 3].map(order => renderPhotoSlot(order))}
      </div>
      
      {uploading && (
        <p className="text-sm text-muted-foreground mt-2">Uploading photo...</p>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;