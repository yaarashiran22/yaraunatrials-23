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

    // Try multiple times with exponential backoff for rate limiting
    let attempts = 0;
    const maxAttempts = 3;
    let response;
    
    while (attempts < maxAttempts) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
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

        if (response.ok) {
          break; // Success, exit retry loop
        }

        // Check if it's a rate limit error
        if (response.status === 429) {
          attempts++;
          if (attempts < maxAttempts) {
            // Wait with exponential backoff
            const waitTime = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
            console.log(`Rate limited, waiting ${waitTime}ms before retry ${attempts}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // If not rate limit error or max attempts reached, throw
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
        
      } catch (fetchError) {
        if (attempts === maxAttempts - 1) {
          throw fetchError;
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
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
    
    // Provide helpful fallback response for rate limiting
    let fallbackMessage = "I'm currently experiencing high demand. Please try again in a few moments.";
    
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      fallbackMessage = "I'm experiencing high demand right now. Please wait a moment and try your question again. I'm here to help you find events, communities, and neighbors in your area!";
    } else if (error.message.includes('API key')) {
      fallbackMessage = "I'm having trouble connecting to my knowledge base. Please try again shortly.";
    }
    
    return new Response(
      JSON.stringify({ 
        response: fallbackMessage,
        success: true, // Return success with fallback message
        fallback: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});