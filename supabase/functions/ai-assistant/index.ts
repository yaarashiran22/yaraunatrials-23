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
    console.log('AI Assistant v8.0 - Full Database Integration - Processing:', { message, userLocation });
    
    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({ 
          response: "I'm having configuration issues. Please try again later.",
          success: true,
          error: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ API key found! Fetching comprehensive data from TheUnaHub...');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch comprehensive data from ALL relevant tables in parallel
    const [
      eventsData,
      communitiesData, 
      postsData,
      itemsData,
      neighborIdeasData,
      neighborQuestionsData,
      couponsData,
      storiesData
    ] = await Promise.all([
      supabase.from('events').select('id, title, description, location, date, time, price, mood, event_type').limit(8),
      supabase.from('communities').select('id, name, tagline, description, category, subcategory, member_count').limit(6),
      supabase.from('posts').select('id, content, location, created_at').limit(5),
      supabase.from('items').select('id, title, description, category, location, price').eq('status', 'active').limit(6),
      supabase.from('neighborhood_ideas').select('id, question, neighborhood, market').limit(4),
      supabase.from('neighbor_questions').select('id, content, market, message_type').limit(4),
      supabase.from('user_coupons').select('id, title, description, business_name, discount_amount, neighborhood').eq('is_active', true).limit(4),
      supabase.from('stories').select('id, text_content, story_type').gt('expires_at', 'now()').limit(3)
    ]);

    console.log('📊 Data fetched - Events:', eventsData.data?.length, 'Communities:', communitiesData.data?.length, 'Posts:', postsData.data?.length, 'Items:', itemsData.data?.length);

    // Prepare comprehensive context with REAL data
    const realData = {
      currentEvents: eventsData.data || [],
      activeCommunities: communitiesData.data || [],
      recentPosts: postsData.data || [],
      marketplaceItems: itemsData.data || [],
      neighborhoodIdeas: neighborIdeasData.data || [],
      neighborQuestions: neighborQuestionsData.data || [],
      localCoupons: couponsData.data || [],
      activeStories: storiesData.data || [],
      userLocation: userLocation || 'Not specified'
    };

    // Create detailed system prompt with ALL real data
    const systemPrompt = `You are the AI assistant for TheUnaHub (theunahub.com), a vibrant neighborhood social platform. You have access to REAL, current data and should provide specific, helpful responses based on actual content.

🎯 REAL CURRENT DATA AVAILABLE:

📅 EVENTS (${realData.currentEvents.length} active):
${realData.currentEvents.map(e => `- "${e.title}" at ${e.location} on ${e.date} ${e.time ? 'at ' + e.time : ''} ${e.price ? '($' + e.price + ')' : ''} - ${e.description?.substring(0, 100)}...`).join('\n')}

👥 COMMUNITIES (${realData.activeCommunities.length} active):
${realData.activeCommunities.map(c => `- "${c.name}" (${c.member_count} members) - ${c.category} - ${c.tagline || c.description?.substring(0, 80)}`).join('\n')}

🏪 MARKETPLACE (${realData.marketplaceItems.length} items):
${realData.marketplaceItems.map(i => `- "${i.title}" in ${i.category} at ${i.location} for $${i.price} - ${i.description?.substring(0, 60)}...`).join('\n')}

💡 NEIGHBORHOOD IDEAS (${realData.neighborhoodIdeas.length} recent):
${realData.neighborhoodIdeas.map(n => `- "${n.question}" in ${n.neighborhood}`).join('\n')}

❓ NEIGHBOR QUESTIONS (${realData.neighborQuestions.length} recent):
${realData.neighborQuestions.map(q => `- ${q.content?.substring(0, 80)}...`).join('\n')}

🎫 LOCAL DEALS (${realData.localCoupons.length} active):
${realData.localCoupons.map(c => `- ${c.discount_amount} off at ${c.business_name} - ${c.title}`).join('\n')}

📍 User Location: ${realData.userLocation}

🤖 INSTRUCTIONS:
1. ALWAYS mention specific events, communities, or items from the real data when relevant
2. Reference actual names, locations, dates, and prices from the database
3. Be conversational and helpful, like a local neighborhood expert
4. Keep responses under 150 words but packed with specific information
5. If asked about events, mention specific ones by name and details
6. If asked about communities, reference actual community names and member counts
7. For marketplace questions, mention real items and prices
8. Always sound knowledgeable about the current neighborhood activity`;

    console.log('🤖 Calling OpenAI with comprehensive data context...');

    // Make OpenAI API call with comprehensive context
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
    console.log('🎉 Success! Returning AI response with comprehensive real data');

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