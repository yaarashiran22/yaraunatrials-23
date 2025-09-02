import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    console.log('Starting to update existing Instagram stories...');

    // List all files in the instagram-stories bucket
    const { data: files, error: listError } = await supabase.storage
      .from('instagram-stories')
      .list();

    if (listError) {
      console.error('Error listing stories:', listError);
      return new Response(JSON.stringify({ 
        error: `Failed to list stories: ${listError.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${files?.length || 0} existing stories to update`);

    const updateResults = [];

    // Process each existing story
    for (const file of files || []) {
      try {
        // Parse filename to extract info: userId/type-story-timestamp.png
        const nameParts = file.name.split('/');
        if (nameParts.length !== 2) continue;
        
        const userId = nameParts[0];
        const filePart = nameParts[1];
        
        // Extract type from filename (e.g., "coupon-story-123456.png" -> "coupon")
        const typeMatch = filePart.match(/^(coupon|event|community_perk|community_event)-story-/);
        if (!typeMatch) continue;
        
        const type = typeMatch[1];
        
        console.log(`Updating story: ${file.name}, type: ${type}, user: ${userId}`);

        // Generate new story with updated prompts
        const newStory = await generateUpdatedStory(type, userId, supabase);
        
        if (newStory.success) {
          // Delete old story
          await supabase.storage
            .from('instagram-stories')
            .remove([file.name]);
          
          updateResults.push({
            oldFile: file.name,
            newFile: newStory.fileName,
            success: true
          });
        } else {
          updateResults.push({
            oldFile: file.name,
            success: false,
            error: newStory.error
          });
        }
        
      } catch (error) {
        console.error(`Error updating ${file.name}:`, error);
        updateResults.push({
          oldFile: file.name,
          success: false,
          error: error.message
        });
      }
    }

    console.log('Update completed:', updateResults);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Updated ${updateResults.filter(r => r.success).length} stories successfully`,
      results: updateResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-existing-stories function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateUpdatedStory(type: string, userId: string, supabase: any) {
  try {
    // Create generic data for the story type
    let data: any = { user_id: userId };
    let prompt = '';
    
    if (type === 'coupon' || type === 'community_perk') {
      data = {
        ...data,
        title: 'Special Offer',
        description: 'Amazing discount available now!',
        business_name: 'Local Business',
        discount_amount: '20% OFF',
        neighborhood: 'Your Area'
      };
      
      prompt = `Create an ultra-modern, Gen Z Instagram story template for a business coupon offer. 
      The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
      
      Layout Structure (top to bottom):
      1. Top 20% - minimal branding/logo area with subtle background
      2. Middle 40% - main visual area with electric gradient backgrounds and floating elements
      3. Bottom 40% - LARGE TEXT SECTION with oversized typography:
         - Main Title: "${data.title}${data.discount_amount ? ` - ${data.discount_amount}` : ''}" - use EXTRA LARGE bold fonts (72pt+) like Montserrat Black or Poppins ExtraBold
         - Make title text take up significant space in the lower portion
      4. Bottom info section with details positioned at the very bottom:
         - ${data.business_name}${data.neighborhood ? ` in ${data.neighborhood}` : ''}
         - Description: "${data.description}"
         - Call to action: "Get Your Coupon!"
      
      Design Style: Ultra-trendy Gen Z aesthetic with:
      - Bold geometric shapes with rounded corners and glass morphism effects
      - Electric gradient backgrounds (neon purple to hot pink to electric blue)
      - Modern typography with varied font weights and sizes - PRIORITIZE LARGE TEXT SIZING
      - Glossy black bars with subtle transparency and glow effects
      - Urban street vibe with geometric patterns and abstract shapes
      - High contrast neon colors that scream "Gen Z energy"
      - Sleek modern finish with clean spacing and depth effects
      - Add trendy elements like floating geometric shapes, subtle grid patterns
      - Make it look like premium modern branding that would go viral on TikTok
      - Use dynamic lighting effects and subtle shadows for depth
      - Include trendy UI elements like rounded rectangles and soft gradients
      - ENSURE MAIN TITLE TEXT IS MASSIVE AND DOMINATES THE LOWER SECTION
      - Text should be positioned in the bottom 40% of the image with plenty of breathing room`;
      
    } else if (type === 'event' || type === 'community_event') {
      data = {
        ...data,
        title: 'Amazing Event',
        description: 'Join us for this incredible experience!',
        date: 'This Weekend',
        time: '8:00 PM',
        location: 'Cool Venue',
        price: 'Free Entry'
      };
      
      prompt = `Create an ultra-trendy, Gen Z Instagram story template for an event promotion.
      The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
      
      Layout Structure (top to bottom):
      1. Top 20% - minimal branding/logo area with subtle background
      2. Middle 40% - main visual area with dynamic electric gradient and floating elements
      3. Bottom 40% - LARGE TEXT SECTION with oversized typography:
         - Event Title: "${data.title}" - use EXTRA LARGE bold fonts (72pt+) like Montserrat Black or Poppins ExtraBold
         - Make title text take up significant space in the lower portion
      4. Bottom info section with event details positioned at the very bottom:
         - ${data.date}
         - ${data.time} 
         - ${data.location}
         - ${data.price}
         - Description: "${data.description}"
         - Call to action: "RSVP Now!"
      
      Design Style: Ultra-trendy Gen Z aesthetic with:
      - Bold 3D geometric shapes with glass morphism and depth
      - Electric gradient backgrounds (neon cyan to electric purple to hot pink)
      - Contemporary typography mixing bold and light weights - PRIORITIZE LARGE TEXT SIZING
      - Glossy black bars with transparent effects and neon outline glow 
      - Urban nightlife/festival vibe with floating abstract elements
      - High-energy neon colors that look incredible on mobile screens
      - Sleek, Instagram-worthy finish with perfect spacing and visual hierarchy
      - Add trendy elements: floating circles, subtle grain texture, holographic effects
      - Make it look like premium event branding that influencers would repost
      - Use dynamic lighting effects, subtle 3D shadows, and modern UI elements
      - Include contemporary design trends like bento box layouts and soft rounded shapes
      - ENSURE EVENT TITLE TEXT IS MASSIVE AND DOMINATES THE LOWER SECTION
      - Text should be positioned in the bottom 40% of the image with plenty of breathing room`;
    }

    // Generate image using OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: prompt,
        n: 1,
        size: '1024x1536',
        output_format: 'png',
        quality: 'high'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        success: false, 
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}` 
      };
    }

    const imageData = await response.json();
    
    if (!imageData.data || !imageData.data[0] || !imageData.data[0].b64_json) {
      return { 
        success: false, 
        error: 'Invalid image data received from OpenAI' 
      };
    }

    const base64Image = imageData.data[0].b64_json;
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    
    // Upload new image
    const fileName = `${userId}/${type}-story-updated-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-stories')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      return { 
        success: false, 
        error: `Failed to upload image: ${uploadError.message}` 
      };
    }

    return { 
      success: true, 
      fileName: fileName 
    };

  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}