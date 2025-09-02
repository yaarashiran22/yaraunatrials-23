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
      
      prompt = `Create a cutting-edge urban Instagram story for a business coupon offer with brutal modern aesthetics.
      The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
      
      Layout Structure (top to bottom):
      1. Main Title: "${data.title || 'Special Offer'}${discount}" - aggressive modern typography with sharp edges
      2. Dark industrial bar with metallic texture and subtle RGB lighting effects
      3. Main visual area - dark urban backdrop with cyberpunk neon highlights
      4. Bottom info section with details:
         - ${businessInfo}${neighborhood}
         - Description: "${data.description || 'Special offer available now!'}"
         - Call to action: "CLAIM NOW"
      
      Design Style: Brutal modern urban aesthetic with:
      - Dark slate/charcoal backgrounds with concrete textures and industrial elements
      - Sharp angular geometric shapes with metallic chrome accents
      - Cyberpunk neon highlights in electric blue, hot pink, and acid green
      - Bold condensed typography with industrial weight and sharp edges
      - Urban decay meets luxury - weathered textures with premium metallic details  
      - Street art inspired elements with graffiti-style accents and stencil fonts
      - Moody dramatic lighting with harsh shadows and neon reflections
      - Tech-noir atmosphere with glitch effects and digital artifacts
      - Incorporate brutalist architecture elements, exposed concrete, steel beams
      - Add urban photography vibes: high contrast, desaturated base with neon pops
      - Mirror chrome surfaces reflecting neon lights and city elements
      - Make it look like premium streetwear brand advertising or luxury tech product launch`;
      
      
    } else if (type === 'event' || type === 'community_event') {
      // Create event story prompt  
      const eventDate = data.date ? `Date: ${data.date}` : '';
      const eventTime = data.time ? `Time: ${data.time}` : '';
      const eventLocation = data.location ? `Location: ${data.location}` : '';
      const eventPrice = data.price ? `Price: ${data.price}` : 'Free Entry';
      
      prompt = `Create a cutting-edge urban Instagram story for an event promotion with brutal modern aesthetics.
      The story should be vertical 9:16 aspect ratio (Instagram story dimensions).
      
      Layout Structure (top to bottom):
      1. Event Title: "${data.title || 'Event'}" - aggressive modern typography with industrial edges
      2. Dark metallic bar with chrome finish and RGB underglow effects
      3. Main visual area - dark urban cityscape with cyberpunk neon accents
      4. Bottom info section with event details:
         - ${eventDate}
         - ${eventTime} 
         - ${eventLocation}
         - ${eventPrice}
         - Description: "${data.description || 'Join us for this amazing event!'}"
         - Call to action: "JOIN NOW"
      
      Design Style: Brutal modern urban aesthetic with:
      - Dark concrete/charcoal backgrounds with raw industrial textures and steel elements
      - Sharp angular geometric shapes with brushed metal and chrome highlights
      - Cyberpunk neon accents in electric blue, hot magenta, and toxic green
      - Bold condensed typography with brutal weight and sharp industrial edges
      - Urban decay meets high-tech - weathered concrete with premium metallic overlays
      - Street culture inspired elements with stencil fonts and underground vibes
      - Harsh dramatic lighting with deep shadows and neon light leaks
      - Tech-noir atmosphere with glitch effects and digital distortion
      - Incorporate brutalist architecture: raw concrete, exposed steel, industrial pipes
      - Add street photography aesthetics: high contrast, moody urban atmosphere
      - Reflective chrome surfaces bouncing neon lights and urban elements
      - Make it look like premium underground event or luxury tech conference branding`;
      
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