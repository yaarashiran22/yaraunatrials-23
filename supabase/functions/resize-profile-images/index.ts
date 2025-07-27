import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resizeImage(imageUrl: string, maxSize: number = 150): Promise<Blob> {
  // Fetch the original image
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`)
  }
  
  const originalBlob = await response.blob()
  
  // Create canvas and context for resizing
  const canvas = new OffscreenCanvas(maxSize, maxSize)
  const ctx = canvas.getContext('2d')!
  
  // Create image bitmap from blob
  const imageBitmap = await createImageBitmap(originalBlob)
  
  // Calculate aspect ratio and new dimensions
  const { width, height } = imageBitmap
  const aspectRatio = width / height
  
  let newWidth = maxSize
  let newHeight = maxSize
  
  if (aspectRatio > 1) {
    newHeight = maxSize / aspectRatio
  } else {
    newWidth = maxSize * aspectRatio
  }
  
  // Resize canvas to actual dimensions
  canvas.width = newWidth
  canvas.height = newHeight
  
  // Draw resized image
  ctx.drawImage(imageBitmap, 0, 0, newWidth, newHeight)
  
  // Convert to blob
  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 })
}

Deno.serve(async (req) => {
  try {
    console.log('Starting profile image resize process...')
    
    // Get all profiles with profile images
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, profile_image_url')
      .not('profile_image_url', 'is', null)
    
    if (profilesError) {
      throw profilesError
    }
    
    console.log(`Found ${profiles?.length || 0} profiles with images`)
    
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No profiles with images found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
    
    const results = []
    
    for (const profile of profiles) {
      try {
        console.log(`Processing profile ${profile.id}`)
        
        // Download and resize the image
        const resizedBlob = await resizeImage(profile.profile_image_url, 100)
        
        // Upload resized image to storage
        const fileName = `${profile.id}/small-profile.jpg`
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, resizedBlob, {
            upsert: true,
            contentType: 'image/jpeg'
          })
        
        if (uploadError) {
          console.error(`Upload error for ${profile.id}:`, uploadError)
          results.push({ id: profile.id, status: 'error', error: uploadError.message })
          continue
        }
        
        // Get public URL for the small image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName)
        
        // Insert or update smallprofiles table
        const { error: insertError } = await supabase
          .from('smallprofiles')
          .upsert({
            id: profile.id,
            photo: publicUrl
          })
        
        if (insertError) {
          console.error(`Insert error for ${profile.id}:`, insertError)
          results.push({ id: profile.id, status: 'error', error: insertError.message })
        } else {
          console.log(`Successfully processed ${profile.id}`)
          results.push({ id: profile.id, status: 'success', smallImageUrl: publicUrl })
        }
        
      } catch (error) {
        console.error(`Error processing ${profile.id}:`, error)
        results.push({ id: profile.id, status: 'error', error: error.message })
      }
    }
    
    return new Response(JSON.stringify({
      message: 'Profile image resize process completed',
      results
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
    
  } catch (error) {
    console.error('Error in resize function:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})