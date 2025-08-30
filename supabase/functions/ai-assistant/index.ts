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
    console.log('AI Assistant - Processing request:', { message, userLocation });
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ 
          response: "Configuration error: API key not found. Please check the Edge Function secrets.",
          success: true,
          error: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('OpenAI API key found successfully, calling OpenAI API...');

    // Simplified system prompt for faster response
    const systemPrompt = `You are a helpful assistant for a neighborhood social platform. You help users find events, meetups, communities, and connect with neighbors based on their interests and needs.

User Location: ${userLocation || 'Not specified'}

Guidelines:
1. Be friendly and conversational
2. Help users with finding local events, communities, and connecting with neighbors
3. Keep responses concise but helpful (under 150 words)
4. Ask clarifying questions when needed
5. Provide general advice about community engagement`;

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response format:', data);
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log('AI Assistant request processed successfully');

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