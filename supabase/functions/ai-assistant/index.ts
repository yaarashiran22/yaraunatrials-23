import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLocation } = await req.json();
    console.log('Request received:', { message, userLocation });
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment');
      return new Response(
        JSON.stringify({ 
          response: "Configuration error: API key not found. Please check the Edge Function secrets.",
          success: true,
          error: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('OpenAI API key found, length:', openAIApiKey.length);

    // Test simple response first
    const testResponse = `Hello! You asked: "${message}". I'm your neighborhood assistant, here to help you find local events, communities, and connect with neighbors. What specific information are you looking for?`;
    
    console.log('Returning test response');
    return new Response(
      JSON.stringify({ 
        response: testResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    // Provide a user-friendly error message based on the error type
    let errorMessage = "Sorry, I'm having trouble processing your request. Please try again.";
    
    if (error.message.includes('API key')) {
      errorMessage = "I'm having configuration issues. Please contact support.";
    } else if (error.message.includes('AbortError') || error.message.includes('timeout')) {
      errorMessage = "The request timed out. Please try a shorter question.";
    } else if (error.message.includes('OpenAI API') || error.message.includes('Claude API')) {
      errorMessage = "I'm having trouble connecting to my AI service. Please try again in a moment.";
    }
    
    return new Response(
      JSON.stringify({ 
        response: errorMessage,
        success: true, // Return as success so the UI shows the message
        error: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});