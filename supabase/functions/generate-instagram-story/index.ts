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
    
    // Log environment variables (without revealing secrets)
    console.log('Environment check:', {
      hasOpenAI: !!openAIApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });
    
    const requestBody = await req.json();
    const { type, data } = requestBody;
    
    console.log('Request received:', { type, dataKeys: Object.keys(data || {}) });

    if (!openAIApiKey) {
      console.error('Missing OpenAI API key');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating Instagram story for:', type, data);

    let prompt = '';
    
    if (type === 'coupon' || type === 'community_perk') {
      // Create coupon/perk story prompt
      const businessInfo = data.business_name ? `Business: ${data.business_name}` : '';
      const discount = data.discount_amount ? ` - ${data.discount_amount}` : '';
      const neighborhood = data.neighborhood ? ` in ${data.neighborhood}` : '';
      
      prompt = `Create an ultra-modern, Gen Z Instagram story template for a business coupon offer. 
      The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
      
      Layout Structure (top to bottom):
      1. Top 20% - minimal branding/logo area with subtle background
      2. Middle 40% - main visual area with electric gradient backgrounds and floating elements
      3. Bottom 40% - LARGE TEXT SECTION with oversized typography:
         - Main Title: "${data.title || 'Special Offer'}${discount}" - use EXTRA LARGE bold fonts (72pt+) like Montserrat Black or Poppins ExtraBold
         - Make title text take up significant space in the lower portion
      4. Bottom info section with details positioned at the very bottom:
         - ${businessInfo}${neighborhood}
         - Description: "${data.description || 'Special offer available now!'}"
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
       // Create event story prompt  
       const eventDate = data.date ? `Date: ${data.date}` : '';
       const eventTime = data.time ? `Time: ${data.time}` : '';
       const eventLocation = data.location ? `Location: ${data.location}` : '';
       const eventPrice = data.price ? `Price: ${data.price}` : 'Free Entry';
       
       prompt = `Create an ultra-trendy, Gen Z Instagram story template for an event promotion.
       The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
       
       Layout Structure (top to bottom):
       1. Top 20% - minimal branding/logo area with subtle background
       2. Middle 40% - main visual area with dynamic electric gradient and floating elements
       3. Bottom 40% - LARGE TEXT SECTION with oversized typography:
          - Event Title: "${data.title || 'Event'}" - use EXTRA LARGE bold fonts (72pt+) like Montserrat Black or Poppins ExtraBold
          - Make title text take up significant space in the lower portion
       4. Bottom info section with event details positioned at the very bottom:
          - ${eventDate}
          - ${eventTime} 
          - ${eventLocation}
          - ${eventPrice}
          - Description: "${data.description || 'Join us for this amazing event!'}"
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
      
    } else {
      const errorMsg = `Unsupported content type: ${type}`;
      console.error(errorMsg);
      return new Response(JSON.stringify({ 
        error: errorMsg,
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generated prompt length:', prompt.length);

    // Generate image using OpenAI
    console.log('Making OpenAI API request...');
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

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${errorData.error?.message || 'Unknown error'}`,
        success: false 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageData = await response.json();
    console.log('OpenAI response received, keys:', Object.keys(imageData));

    // Get the base64 image from OpenAI (gpt-image-1 returns base64)
    if (!imageData.data || !imageData.data[0] || !imageData.data[0].b64_json) {
      console.error('Invalid OpenAI response structure:', imageData);
      return new Response(JSON.stringify({ 
        error: 'Invalid image data received from OpenAI',
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const base64Image = imageData.data[0].b64_json;
    console.log('Base64 image length:', base64Image.length);
    
    // Convert base64 to blob
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    console.log('Image buffer size:', imageBuffer.length);
    
    // Upload to Supabase storage
    const fileName = `${data.user_id || 'unknown'}/${type}-story-${Date.now()}.png`;
    console.log('Uploading to storage with filename:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-stories')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({ 
        error: `Failed to upload image: ${uploadError.message}`,
        success: false 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Upload successful, upload data:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('instagram-stories')
      .getPublicUrl(fileName);

    console.log('Story generated and uploaded successfully:', publicUrl);

    return new Response(JSON.stringify({ 
      success: true, 
      storyUrl: publicUrl,
      fileName: fileName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-instagram-story function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      success: false,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});