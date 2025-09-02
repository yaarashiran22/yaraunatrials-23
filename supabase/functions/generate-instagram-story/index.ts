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
      
      prompt = `Create an ultra-modern, highly creative Instagram story for a business coupon offer with cutting-edge contemporary design.
      Vertical 9:16 aspect ratio (Instagram story dimensions) with innovative, dynamic layout.
      
      CREATIVE LAYOUT STRUCTURE:
      • TOP SECTION: Floating "${data.title || 'Special Offer'}${discount}" in futuristic typography with 3D depth, holographic shimmer effects, and dynamic shadow casting
      • MIDDLE HERO: Sophisticated glassmorphism card with frosted glass effect, floating in space with subtle parallax layers and ambient lighting
      • DYNAMIC ELEMENTS: Floating geometric shapes, orbiting particles, and interactive-style UI elements positioned asymmetrically
      • BOTTOM SECTION: Sleek info panel with:
         - ${businessInfo}${neighborhood}
         - "${data.description || 'Special offer available now!'}"
         - Futuristic "CLAIM NOW" button with holographic glow
      
      ULTRA-MODERN DESIGN LANGUAGE:
      • BACKGROUND: Deep gradient mesh from midnight black through rich purples to electric blues, with subtle noise texture and floating light particles
      • TYPOGRAPHY: Ultra-modern variable fonts with dynamic weight changes, kinetic letter spacing, and holographic text effects
      • GLASSMORPHISM: Frosted glass panels with soft blur, subtle reflections, and rainbow light refractions around edges
      • NEOMORPHISM: Soft embossed elements with realistic lighting and subtle depth shadows
      • FLOATING ELEMENTS: 3D geometric shapes (spheres, cubes, pyramids) with realistic materials - chrome, glass, liquid mercury
      • COLOR PALETTE: Rich midnight gradients with electric accent colors - cyber lime, hot magenta, electric purple, arctic blue
      • LIGHTING: Sophisticated ambient lighting with realistic ray tracing effects, soft bloom, and atmospheric perspective
      • CONTEMPORARY TOUCHES: iOS-style blur effects, Apple-inspired minimalism meets maximalist creativity, TikTok-style dynamic elements
      • TEXTURE LAYERS: Subtle film grain, holographic rainbow sheens, liquid metal surfaces, and prismatic light dispersions
      • MODERN EFFECTS: Depth-of-field blur, chromatic aberration, lens flares, and realistic material physics
      • Make it feel like a premium Apple product launch meets cutting-edge fashion brand meets next-gen gaming interface`;
      
      
    } else if (type === 'event' || type === 'community_event') {
      // Create event story prompt  
      const eventDate = data.date ? `Date: ${data.date}` : '';
      const eventTime = data.time ? `Time: ${data.time}` : '';
      const eventLocation = data.location ? `Location: ${data.location}` : '';
      const eventPrice = data.price ? `Price: ${data.price}` : 'Free Entry';
      
      prompt = `Create an ultra-sophisticated, creatively modern Instagram story for an event promotion with next-generation design aesthetics.
      Vertical 9:16 aspect ratio (Instagram story dimensions) with innovative, magazine-quality layout.
      
      CREATIVE LAYOUT COMPOSITION:
      • HERO TITLE: "${data.title || 'Event'}" displayed with kinetic typography, 3D letterforms floating in space with prismatic reflections
      • VISUAL HIERARCHY: Dynamic asymmetrical layout with floating content cards and interactive-style elements
      • MAIN FOCAL AREA: Sophisticated depth-layered scene with atmospheric perspective and cinematic lighting
      • INFORMATION ARCHITECTURE: Elegantly organized details in floating glass panels:
         - ${eventDate}
         - ${eventTime}
         - ${eventLocation}
         - ${eventPrice}
         - "${data.description || 'Join us for this amazing event!'}"
         - Premium "JOIN NOW" with holographic activation state
      
      CUTTING-EDGE DESIGN SYSTEM:
      • FOUNDATION: Rich gradient mesh backgrounds transitioning from deep space black through royal purples to electric teals, with subtle particle systems
      • ADVANCED TYPOGRAPHY: Variable font families with fluid weight transitions, letter-spacing animations, and holographic text rendering
      • MATERIAL DESIGN 3.0: Elevated surfaces with realistic physics, soft shadows, and dynamic color temperature
      • GLASSMORPHISM ADVANCED: Multi-layer frosted glass with chromatic aberration, realistic light refraction, and depth-aware transparency
      • FLOATING ARCHITECTURE: 3D geometric installations - crystalline structures, liquid blobs, metallic frameworks suspended in space
      • PREMIUM COLOR SCIENCE: Deep saturated gradients with electric accent punctuation - neon lime, hot coral, electric violet, ice blue
      • CINEMATIC LIGHTING: Realistic global illumination with soft area lighting, rim lights, and atmospheric fog effects
      • CONTEMPORARY LUXURY: Combines Apple's design philosophy with high-fashion editorial layouts and gaming UI sophistication
      • SURFACE MATERIALS: Liquid chrome, brushed titanium, frosted acrylics, holographic foils, and prismatic crystals
      • POST-PRODUCTION EFFECTS: Subtle film grain, lens distortion, color grading, and depth-of-field for photographic realism
      • Make it feel like a luxury brand launch meets architectural visualization meets premium mobile app interface`;
      
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