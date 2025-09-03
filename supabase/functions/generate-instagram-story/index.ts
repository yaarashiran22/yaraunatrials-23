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

    // Fetch user profile information
    let userProfile = null;
    if (data.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, profile_image_url')
        .eq('id', data.user_id)
        .single();
      
      if (profileError) {
        console.warn('Failed to fetch user profile:', profileError);
      } else {
        userProfile = profile;
        console.log('User profile fetched:', { name: profile.name, hasImage: !!profile.profile_image_url });
      }
    }

    let prompt = '';
    
    if (type === 'coupon' || type === 'community_perk') {
      // Create coupon/perk story prompt
      const businessInfo = data.business_name ? `Business: ${data.business_name}` : '';
      const discount = data.discount_amount ? ` - ${data.discount_amount}` : '';
      const neighborhood = data.neighborhood ? ` in ${data.neighborhood}` : '';
      
      // Add user profile information to the content
      const userInfo = userProfile ? `Posted by: ${userProfile.name || 'User'}` : '';
      const profileImageNote = userProfile?.profile_image_url ? 
        'Include a small circular profile picture placeholder in the bottom left corner of the story.' : '';
      
      prompt = `Create an ultra-modern, artistic Instagram story for a business coupon offer with maximum visual impact.
      DIMENSIONS: Vertical 9:16 aspect ratio (1080x1920px Instagram story format).
      
      CONTENT HIERARCHY:
      - Main Title: "${data.title || 'Special Offer'}${discount}" (Bold, eye-catching)
      - ${businessInfo}${neighborhood}
      - Description: "${data.description || 'Special offer available now!'}"
      ${userInfo ? `- Creator: ${userInfo}` : ''}
      - CTA: "CLAIM NOW!" or "GET YOURS!"
      
      ARTISTIC DESIGN SPECIFICATIONS:
      🎨 COLOR PALETTE: 
      - Primary: Vibrant gradient from electric blue (#00D4FF) to neon purple (#8A2BE2) to hot pink (#FF1493)
      - Secondary: Holographic rainbow accents, metallic gold highlights
      - Text: High contrast white/black with neon glows
      
      🌟 VISUAL ELEMENTS:
      - Holographic glass morphism background with subtle transparency layers
      - 3D floating geometric shapes (spheres, cubes, pyramids) with neon outlines
      - Animated-style lightning bolts, sparkles, and energy waves
      - Gradient mesh overlays with iridescent effects
      - Floating particles and light rays emanating from corners
      
      💫 TYPOGRAPHY STYLE:
      - Main title: Bold, futuristic sans-serif with 3D extrusion and neon glow
      - Body text: Clean, modern fonts with subtle shadow effects
      - Add text stroke outlines for maximum readability
      
      🎭 COMPOSITION:
      - Dynamic diagonal layouts with asymmetric balance
      - Layered depth with foreground, midground, background elements
      - Strategic negative space for text readability
      - Curved flowing lines connecting design elements
      
      ✨ SPECIAL EFFECTS:
      - Chrome/metallic text treatments with reflections
      - Prismatic light refractions and lens flares
      - Subtle animation-ready motion blur effects
      - Instagram-style modern filters with high saturation
      
      ${profileImageNote}
      
      🏷️ BRANDING: ${userProfile?.name ? `Include "${userProfile.name}" in stylized modern typography at bottom corner` : 'Modern user attribution'}
      
      STYLE REFERENCE: Think Cyberpunk 2077 meets Apple's modern design - ultra-futuristic, premium, Instagram-worthy with maximum visual punch. Should look like it belongs in a high-end design portfolio.`;
      
    } else if (type === 'event' || type === 'community_event') {
      // Create event story prompt  
      const eventDate = data.date ? `Date: ${data.date}` : '';
      const eventTime = data.time ? `Time: ${data.time}` : '';
      const eventLocation = data.location ? `Location: ${data.location}` : '';
      const eventPrice = data.price ? `Price: ${data.price}` : 'Free Entry';
      
      // Add user profile information to the content
      const userInfo = userProfile ? `Organized by: ${userProfile.name || 'User'}` : '';
      const profileImageNote = userProfile?.profile_image_url ? 
        'Include a small circular profile picture placeholder in the bottom left corner of the story.' : '';
      
      prompt = `Create a stunning, artistic Instagram story for an event promotion with festival-level visual impact.
      DIMENSIONS: Vertical 9:16 aspect ratio (1080x1920px Instagram story format).
      
      EVENT DETAILS:
      - Event: "${data.title || 'Event'}"
      - ${eventDate}
      - ${eventTime} 
      - ${eventLocation}
      - ${eventPrice}
      - "${data.description || 'Join us for this amazing event!'}"
      ${userInfo ? `- Organizer: ${userInfo}` : ''}
      - CTA: "RSVP NOW!" or "JOIN US!"
      
      ARTISTIC DESIGN SPECIFICATIONS:
      🎪 COLOR PALETTE: 
      - Primary: Explosive gradient from sunset orange (#FF6B35) to cosmic purple (#6A0572) to electric teal (#17C3B2)
      - Accent: Holographic gold, neon yellow (#FFE66D), pure white highlights
      - Energy: Pulsating neon borders and glowing accents
      
      🎊 VISUAL ELEMENTS:
      - Festival-style confetti explosions with metallic shine
      - 3D floating music notes, geometric crystals, and celebration icons
      - Dynamic wave patterns and flowing ribbons
      - Starburst patterns radiating from corners
      - Floating balloons, fireworks, and party streamers in 3D space
      
      🎵 TYPOGRAPHY MAGIC:
      - Event title: Bold, festival-style lettering with 3D depth and chrome finish
      - Details: Modern, clean fonts with colorful highlights
      - Date/time in eye-catching badge designs
      
      🎨 COMPOSITION:
      - Celebration-focused layout with explosive energy
      - Layered elements creating depth and movement
      - Strategic use of negative space around text
      - Curved, flowing design elements suggesting music and movement
      
      ⚡ SPECIAL EFFECTS:
      - Holographic shimmer overlays
      - Light beam effects and spotlight illumination
      - Particle systems with glowing trails
      - Festival-style stage lighting effects
      - Prism refractions creating rainbow highlights
      
      ${profileImageNote}
      
      🎤 BRANDING: ${userProfile?.name ? `Feature "${userProfile.name}" as event curator in modern, stylized text` : 'Contemporary organizer attribution'}
      
      STYLE REFERENCE: Think Coachella poster meets Apple's WWDC graphics - ultra-modern festival aesthetics with premium tech conference polish. Should scream "unmissable event" and look like professional concert promotion material.`;
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