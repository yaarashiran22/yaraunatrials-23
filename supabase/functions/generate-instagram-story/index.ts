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
       1. Top 15% - minimal branding/logo area with subtle background
       2. Middle 25% - main visual area with electric gradient backgrounds and floating elements
       3. Bottom 60% - MASSIVE TEXT SECTION with oversized typography positioned very low:
          - Main Title: "${data.title || 'Special Offer'}${discount}" - use GIGANTIC bold fonts (120pt+) like Impact, Bebas Neue, or Oswald ExtraBold
          - Position title text starting at 65% down the image (very low positioning)
          - Make title text take up enormous space in the lower two-thirds portion
       4. Bottom info section with details positioned at the very bottom edge:
          - ${businessInfo}${neighborhood}
          - Description: "${data.description || 'Special offer available now!'}"
          - Call to action: "GET COUPON!"
       
        Design Style: Ultra-streetwear, urban Gen Z aesthetic with:
        - Bold 3D geometric shapes with glass morphism and neon outlines
        - Cyberpunk-inspired gradient backgrounds (electric cyan to neon pink to acid green)
        - Streetwear typography with massive, chunky fonts - GIGANTIC TEXT IS PRIORITY
        - Dark metallic bars with holographic effects and electric glow
        - Urban street art vibe with graffiti-inspired elements and abstract spray paint textures
        - High contrast neon colors with street art aesthetics
        - Futuristic modern finish with industrial elements and tech-inspired spacing
        - Add trendy elements: floating 3D shapes, cyberpunk grid overlays, holographic textures
        - Make it look like premium streetwear branding that would dominate Instagram and TikTok
        - Use dramatic lighting effects, bold shadows, and cyberpunk UI elements
        - Include urban design trends like distressed textures, neon wireframes, and futuristic typography
        - ENSURE MAIN TITLE TEXT IS ABSOLUTELY MASSIVE AND POSITIONED VERY LOW (65%+ down)
        - Text should be positioned in the bottom 60% of the image with enormous sizing and urban spacing`;
       
       
     } else if (type === 'event' || type === 'community_event') {
       // Create event story prompt  
       const eventDate = data.date ? `Date: ${data.date}` : '';
       const eventTime = data.time ? `Time: ${data.time}` : '';
       const eventLocation = data.location ? `Location: ${data.location}` : '';
       const eventPrice = data.price ? `Price: ${data.price}` : 'Free Entry';
       
        prompt = `Create an ultra-trendy, Gen Z Instagram story template for an event promotion.
        The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
        
        Layout Structure (top to bottom):
        1. Top 15% - minimal branding/logo area with subtle background
        2. Middle 25% - main visual area with dynamic electric gradient and floating elements
        3. Bottom 60% - MASSIVE TEXT SECTION with oversized typography positioned very low:
           - Event Title: "${data.title || 'Event'}" - use GIGANTIC bold fonts (120pt+) like Impact, Bebas Neue, or Oswald ExtraBold
           - Position title text starting at 65% down the image (very low positioning)
           - Make title text take up enormous space in the lower two-thirds portion
        4. Bottom info section with event details positioned at the very bottom edge:
           - ${eventDate}
           - ${eventTime} 
           - ${eventLocation}
           - ${eventPrice}
           - Description: "${data.description || 'Join us for this amazing event!'}"
           - Call to action: "RSVP NOW!"
        
        Design Style: Ultra-streetwear, urban Gen Z aesthetic with:
        - Bold 3D geometric shapes with cyberpunk glass morphism and neon wireframes
        - Electric gradient backgrounds (neon cyan to electric purple to acid lime green)
        - Streetwear typography with massive, chunky fonts - GIGANTIC TEXT IS PRIORITY
        - Dark metallic bars with holographic effects and electric outline glow 
        - Urban nightlife/festival vibe with graffiti-inspired floating abstract elements
        - High-energy neon colors with street art aesthetics that dominate mobile screens
        - Futuristic, Instagram-worthy finish with industrial spacing and cyberpunk visual hierarchy
        - Add trendy elements: floating 3D cubes, urban grain texture, holographic overlays, spray paint effects
        - Make it look like premium streetwear event branding that would go viral on TikTok and Instagram
        - Use dramatic lighting effects, bold industrial shadows, and cyberpunk UI elements
        - Include urban design trends like distressed overlays, neon grid patterns, and futuristic typography
        - ENSURE EVENT TITLE TEXT IS ABSOLUTELY MASSIVE AND POSITIONED VERY LOW (65%+ down)
        - Text should be positioned in the bottom 60% of the image with enormous sizing and urban streetwear spacing`;
      
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