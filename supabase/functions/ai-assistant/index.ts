import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('AI Assistant function started - v5.0 - Fresh Deploy!');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLocation } = await req.json();
    console.log('AI Assistant v7.0 - With Real Data - Processing request:', { message, userLocation });
    
    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('🔑 Checking for API key...');
    
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          response: "I'm having configuration issues. My API key isn't set up properly.",
          success: true,
          error: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ API key found! Fetching website and database data...');

    // Initialize Supabase client to get real data
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch real data from your database in parallel
    const [eventsData, communitiesData, postsData, websiteData] = await Promise.all([
      supabase.from('events').select('*').limit(10),
      supabase.from('communities').select('*').limit(10),
      supabase.from('posts').select('*').limit(5),
      fetch('https://theunahub.com').then(res => res.text()).catch(() => null)
    ]);

    console.log('📊 Data fetched - Events:', eventsData.data?.length, 'Communities:', communitiesData.data?.length, 'Posts:', postsData.data?.length);

    // Prepare context with real data
    const contextData = {
      events: eventsData.data || [],
      communities: communitiesData.data || [],
      posts: postsData.data || [],
      websiteContent: websiteData ? 'Website accessible' : 'Website not accessible',
      userLocation: userLocation || 'Not specified'
    };

    // Enhanced system prompt with real data context
    const systemPrompt = `You are a helpful assistant for TheUnaHub (theunahub.com), a neighborhood social platform. You help users find events, meetups, communities, and connect with neighbors based on REAL DATA from the platform.

CURRENT REAL DATA AVAILABLE:
- Events: ${JSON.stringify(contextData.events.slice(0, 5))} (showing first 5)
- Communities: ${JSON.stringify(contextData.communities.slice(0, 3))} (showing first 3)  
- Recent Posts: ${JSON.stringify(contextData.posts.slice(0, 3))} (showing first 3)
- User Location: ${contextData.userLocation}

INSTRUCTIONS:
1. ALWAYS reference specific events, communities, or posts from the real data when relevant
2. Mention actual event names, locations, and details from the database
3. If someone asks about events, mention specific ones like "Picnic in boco park" or "Going to art market"
4. Be specific about locations (like "Boco Buenos Aires", "Palermo", etc.) from the real data
5. Keep responses helpful and under 150 words
6. If no relevant data matches their query, suggest they browse the available events and communities
7. Always sound like you know the actual content and activities on TheUnaHub`;

    // Make API call with real data context
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
      })
    });

    console.log('📡 OpenAI response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorData);
      
      return new Response(
        JSON.stringify({ 
          response: "I'm having trouble connecting to my AI service. Please try again in a moment.",
          success: true,
          error: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('✅ Got OpenAI response successfully');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response format');
      throw new Error('Invalid response format');
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log('🎉 Success! Returning AI response with real data context');

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
    console.error('💥 Error in ai-assistant function:', error);
    
    let errorMessage = "Sorry, I'm having technical difficulties. Please try again.";
    
    if (error.message.includes('API key')) {
      errorMessage = "I'm having API configuration issues. Please contact support.";
    } else if (error.message.includes('timeout')) {
      errorMessage = "The request timed out. Please try a shorter question.";
    }
    
    return new Response(
      JSON.stringify({ 
        response: errorMessage,
        success: true,
        error: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});