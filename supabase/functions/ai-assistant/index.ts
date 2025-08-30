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
    
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('Anthropic API key not found');
      throw new Error('Anthropic API key not found');
    }

    console.log('Processing AI request:', message);

    // Simplified system prompt without database queries for faster response
    const systemPrompt = `You are a helpful assistant for a neighborhood social platform. You help users find events, meetups, communities, and connect with neighbors based on their interests and needs.

User Location: ${userLocation || 'Not specified'}

Guidelines:
1. Be friendly and conversational
2. Help users with finding local events, communities, and connecting with neighbors
3. Keep responses concise but helpful (under 200 words)
4. Ask clarifying questions when needed
5. Provide general advice about community engagement if specific data isn't available`;

    console.log('Calling Claude API...');

    // Call Claude API directly with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 200,
        messages: [
          { 
            role: 'user', 
            content: `${systemPrompt}\n\nUser question: ${message}` 
          }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Claude API response received');
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude response format:', data);
      throw new Error('Invalid response format from Claude API');
    }
    
    const aiResponse = data.content[0].text;
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
    } else if (error.message.includes('Claude API')) {
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