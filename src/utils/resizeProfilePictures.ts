import { supabase } from '@/integrations/supabase/client';

export const resizeAndCopyProfilePictures = async () => {
  try {
    console.log('Starting profile picture resize process...');
    
    // Get all profiles with profile images
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, profile_image_url')
      .not('profile_image_url', 'is', null);
    
    if (profilesError) {
      throw profilesError;
    }
    
    console.log(`Found ${profiles?.length || 0} profiles with images`);
    
    if (!profiles || profiles.length === 0) {
      return { message: 'No profiles with images found' };
    }
    
    const results = [];
    
    for (const profile of profiles) {
      try {
        console.log(`Processing profile ${profile.id}`);
        
        // Download the original image
        const response = await fetch(profile.profile_image_url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const originalBlob = await response.blob();
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Create image element to get dimensions
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(originalBlob);
        });
        
        // Calculate new dimensions (100px max)
        const maxSize = 100;
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth = maxSize;
        let newHeight = maxSize;
        
        if (aspectRatio > 1) {
          newHeight = maxSize / aspectRatio;
        } else {
          newWidth = maxSize * aspectRatio;
        }
        
        // Set canvas size and draw resized image
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to blob
        const resizedBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.8);
        });
        
        // Upload resized image to storage
        const fileName = `${profile.id}/small-profile.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, resizedBlob, {
            upsert: true
          });
        
        if (uploadError) {
          console.error(`Upload error for ${profile.id}:`, uploadError);
          results.push({ id: profile.id, status: 'error', error: uploadError.message });
          continue;
        }
        
        // Get public URL for the small image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        // Insert or update smallprofiles table
        const { error: insertError } = await supabase
          .from('smallprofiles')
          .upsert({
            id: profile.id,
            photo: publicUrl
          });
        
        if (insertError) {
          console.error(`Insert error for ${profile.id}:`, insertError);
          results.push({ id: profile.id, status: 'error', error: insertError.message });
        } else {
          console.log(`Successfully processed ${profile.id}`);
          results.push({ id: profile.id, status: 'success', smallImageUrl: publicUrl });
        }
        
        // Clean up
        URL.revokeObjectURL(img.src);
        
      } catch (error) {
        console.error(`Error processing ${profile.id}:`, error);
        results.push({ id: profile.id, status: 'error', error: (error as Error).message });
      }
    }
    
    return {
      message: 'Profile picture resize process completed',
      results
    };
    
  } catch (error) {
    console.error('Error in resize function:', error);
    throw error;
  }
};