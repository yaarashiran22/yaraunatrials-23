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
      
      prompt = `Create an ultra-trendy, Instagram-worthy story for a business coupon with maximum artistic impact and viral potential.
      DIMENSIONS: Vertical 9:16 aspect ratio (1080x1920px Instagram story format).
      
      CONTENT HIERARCHY:
      - Main Title: "${data.title || 'Special Offer'}${discount}" (Bold, eye-catching)
      - ${businessInfo}${neighborhood}
      - Description: "${data.description || 'Special offer available now!'}"
      ${userInfo ? `- Creator: ${userInfo}` : ''}
      - CTA: "CLAIM NOW!" or "GET YOURS!"
      
      ARTISTIC DESIGN SPECIFICATIONS:
      🎨 ULTRA-TRENDY COLOR PALETTE: 
      - Primary: Instagram-trendy gradient from sunset coral (#FF6B6B) through lavender (#C44569) to deep purple (#6C5CE7)
      - Secondary: Neon lime (#00FF88), electric cyan (#00D2FF), hot magenta (#FF0080)
      - Accent: Metallic rose gold, holographic silver, chrome finishes
      - Background: Dark mode aesthetic with rich blacks (#0D1117) and deep purples
      
      🔥 TYPOGRAPHY REVOLUTION:
      - Main Title: Ultra-bold sans-serif with EXTREME letter spacing, 3D extrusion, and rainbow gradient fill
      - Use trendy fonts like: Futura, Helvetica Black, or custom display fonts
      - Text shadows: Multi-layer neon glows (pink, blue, purple halos)
      - Text effects: Chromatic aberration, holographic reflections, liquid metal finish
      
      ✨ INSTAGRAM-VIRAL VISUAL ELEMENTS:
      - Y2K aesthetic: Chrome spheres, liquid mercury drops, iridescent textures
      - Neo-brutalism: Bold geometric shapes, overlapping elements, harsh contrasts
      - Glitch effects: Digital noise, pixelated edges, scan lines
      - Trending elements: Floating crystals, aurora borealis backgrounds, space gradients
      - Hologram stickers, emoji explosions, abstract blob shapes
      
      🌈 ADVANCED EFFECTS:
      - Gradient mesh backgrounds with 5+ color stops
      - Chromatic aberration on text edges
      - Gaussian blur overlays for depth
      - Iridescent foil textures
      - Neon tube lighting effects
      - Liquid chrome text treatments
      
      📱 INSTAGRAM-SPECIFIC DESIGN:
      - Stories-optimized layout with thumb-stopping power
      - Swipe-up friendly CTA placement
      - Trendy aspect ratios and safe zones
      - Filter-ready color schemes that look good with Instagram filters
      - Mobile-first readability with high contrast
      
      ${profileImageNote}
      
      🏷️ CREATOR BRANDING: ${userProfile?.name ? `Feature "${userProfile.name}" in stylized graffiti-style or neon typography` : 'Edgy creator attribution'}
      
      STYLE REFERENCE: Think TikTok viral aesthetic meets high-end fashion brand - Gen Z approved, maximalist design with controlled chaos. Should look like it belongs on Euphoria's Instagram or a Supreme drop announcement. Every element should scream "screenshot this!"`;
      
      
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
      
      prompt = `Create a viral-worthy, Instagram-trending event story with maximum artistic flair and social media appeal.
      DIMENSIONS: Vertical 9:16 aspect ratio (1080x1920px Instagram story format).
      
      EVENT DETAILS:
      - Event: "${data.title || 'Event'}"
      - ${eventDate}
      - ${eventTime} 
      - ${eventLocation}
      - ${eventPrice}
      - "${data.description || 'Join us for this amazing event!'}"
      ${userInfo ? `- Organizer: ${userInfo}` : ''}
      - CTA: "RSVP NOW!" or "JOIN THE VIBE!"
      
      TRENDING DESIGN SPECIFICATIONS:
      🎪 VIRAL COLOR PALETTE: 
      - Primary: Instagram-fire gradient from neon orange (#FF3E00) through electric pink (#FF006B) to cosmic blue (#8338EC)
      - Accent: Lime green (#32D74B), sunshine yellow (#FFD60A), pure white highlights
      - Special: Holographic chrome, liquid gold, iridescent rainbow effects
      - Background: Rich dark gradients with neon pops
      
      🎊 VIRAL VISUAL ELEMENTS:
      - Y2K revival: Holographic textures, chrome bubbles, liquid mercury effects
      - Festival vibes: Neon light trails, concert spotlights, laser beam effects
      - Trending shapes: Organic blobs, fluid forms, morphing geometries
      - Social elements: Floating hearts, fire emojis, sparkle explosions
      - 3D elements: Floating crystals, holographic pyramids, neon tubes
      
      🎵 TYPOGRAPHY THAT POPS:
      - Event title: Ultra-bold display font with extreme letter spacing and gradient fills
      - Trending fonts: Impact, Bebas Neue, or custom bubble letters
      - Text effects: Outline strokes, drop shadows, neon glows, chromatic shift
      - Date/time: Badge-style with metallic finish and glow effects
      
      🎨 INSTAGRAM-VIRAL COMPOSITION:
      - Asymmetric layouts with controlled chaos
      - Layered transparency effects for depth
      - Strategic emoji placement for engagement
      - Thumb-stopping color combinations
      - Stories-optimized text hierarchy
      
      ⚡ NEXT-LEVEL EFFECTS:
      - Holographic foil textures
      - Neon tube lighting simulation
      - Liquid metal text treatments
      - Prismatic light dispersions
      - Aurora borealis backgrounds
      - Glitch art overlays
      - Particle system explosions
      
      📱 SOCIAL MEDIA OPTIMIZATION:
      - High contrast for mobile viewing
      - Filter-friendly color schemes
      - Screenshot-worthy composition
      - Swipe-up action friendly layout
      - Stories engagement optimized
      
      ${profileImageNote}
      
      🎤 ORGANIZER BRANDING: ${userProfile?.name ? `Feature "${userProfile.name}" in trendy graffiti or neon sign style typography` : 'Street art style organizer credit'}
      
      STYLE REFERENCE: Think Travis Scott concert poster meets Billie Eilish album cover - Gen Z aesthetic with maximalist energy. Should look like it belongs on a viral TikTok or Instagram's trending page. Every pixel should demand attention and screenshots.`;
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