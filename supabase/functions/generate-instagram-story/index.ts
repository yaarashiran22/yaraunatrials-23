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
    const { type, data } = await req.json();
    
    console.log('Generating Instagram story for:', type, data);

    let prompt = '';
    let businessInfo = '';
    
    if (type === 'coupon') {
      // Create coupon story prompt
      businessInfo = data.business_name ? `Business: ${data.business_name}` : '';
      const discount = data.discount_amount ? ` - ${data.discount_amount}` : '';
      const neighborhood = data.neighborhood ? ` in ${data.neighborhood}` : '';
      
      prompt = `Create a professional Instagram story template for a business coupon offer. 
      The story should be 1080x1920 pixels (Instagram story dimensions).
      
      Content to include:
      - Title: "${data.title}${discount}"
      - ${businessInfo}${neighborhood}
      - Description: "${data.description || 'Special offer available now!'}"
      - Call to action: "Get Your Coupon!"
      
      Style: Modern, vibrant, eye-catching design with gradient background (purple to pink), 
      clean typography, professional business aesthetic, include coupon/discount graphics, 
      use bright colors that pop on mobile screens. Add decorative elements like stars or 
      geometric shapes. Make it look like a premium business promotion.`;
      
    } else if (type === 'event') {
      // Create event story prompt  
      const eventDate = data.date ? `Date: ${data.date}` : '';
      const eventTime = data.time ? `Time: ${data.time}` : '';
      const eventLocation = data.location ? `Location: ${data.location}` : '';
      const eventPrice = data.price ? `Price: ${data.price}` : 'Free Entry';
      
      prompt = `Create a professional Instagram story template for an event promotion.
      The story should be 1080x1920 pixels (Instagram story dimensions).
      
      Content to include:
      - Event Title: "${data.title}"
      - ${eventDate}
      - ${eventTime} 
      - ${eventLocation}
      - ${eventPrice}
      - Description: "${data.description || 'Join us for this amazing event!'}"
      - Call to action: "RSVP Now!"
      
      Style: Dynamic, festive design with vibrant gradient background (blue to purple), 
      modern typography, event-focused aesthetic with celebration elements like confetti 
      or party graphics. Use energetic colors, include calendar/clock icons, make it 
      exciting and inviting for social sharing.`;
    }

    console.log('Sending request to OpenAI with prompt:', prompt);

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
        size: '1024x1536', // Supported Instagram story-like ratio
        output_format: 'png',
        quality: 'high'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const imageData = await response.json();
    console.log('OpenAI response received');

    // Get the base64 image from OpenAI (gpt-image-1 returns base64)
    const base64Image = imageData.data[0].b64_json;
    
    // Convert base64 to blob
    const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    
    // Upload to Supabase storage
    const fileName = `${data.user_id}/${type}-story-${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('instagram-stories')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

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
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});