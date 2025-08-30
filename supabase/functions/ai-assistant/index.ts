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
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
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
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
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
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});