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
      throw new Error('Anthropic API key not found');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch relevant data based on the query
    const [eventsData, communitiesData, postsData] = await Promise.all([
      supabase.from('events').select('*').limit(10),
      supabase.from('communities').select('*').limit(10),
      supabase.from('posts').select('*').limit(10)
    ]);

    // Prepare context data for AI
    const contextData = {
      events: eventsData.data || [],
      communities: communitiesData.data || [],
      posts: postsData.data || [],
      userLocation: userLocation || 'Not specified'
    };

    // Create system prompt with context
    const systemPrompt = `You are a helpful assistant for a neighborhood social platform. You help users find events, meetups, communities, and connect with neighbors based on their interests and needs.

Available data:
- Events: ${JSON.stringify(contextData.events)}
- Communities: ${JSON.stringify(contextData.communities)} 
- Posts: ${JSON.stringify(contextData.posts)}
- User Location: ${contextData.userLocation}

Guidelines:
1. Be friendly and conversational
2. Recommend specific events, communities, or posts based on the user's query
3. If location is relevant, prioritize nearby options
4. Ask clarifying questions when needed
5. Keep responses concise but helpful
6. Always mention specific names and details from the available data
7. If no relevant matches found, suggest general categories or ask for more details`;

    // Call Claude API directly with no fallbacks - always get real AI responses
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        messages: [
          { 
            role: 'user', 
            content: `${systemPrompt}\n\nUser question: ${message}` 
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', response.status, errorData);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
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
    
    // Instead of fallback messages, return an actual error that the client can handle
    return new Response(
      JSON.stringify({ 
        response: "I'm having trouble processing your request right now. Please try asking your question again.",
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});