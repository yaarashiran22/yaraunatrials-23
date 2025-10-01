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
    const { message, messages = [], userLocation } = await req.json();
    console.log('AI Assistant v9.0 - Conversation Memory - Processing:', { message, messagesCount: messages.length, userLocation });
    
    // Detect greeting messages
    const greetingPatterns = /^(hi|hola|hello|hey|hiya|greetings|good morning|good afternoon|good evening|sup|what's up|whats up|yo)[\s!?,.]*$/i;
    if (greetingPatterns.test(message.trim())) {
      console.log('✨ Greeting detected, returning welcome message');
      return new Response(
        JSON.stringify({ 
          response: "Hey! Welcome to Yara AI 😊 If you're looking for cool events, hidden spots, or exclusive deals in BA - I got you. What vibe are you after?",
          success: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
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

    // Fetch essential data from key tables - optimized for speed
    const [
      eventsData,
      communitiesData, 
      itemsData,
      couponsData
    ] = await Promise.all([
      supabase.from('events').select('id, title, location, date, time, price').limit(5),
      supabase.from('communities').select('id, name, tagline, member_count').limit(4),
      supabase.from('items').select('id, title, category, location, price').eq('status', 'active').limit(4),
      supabase.from('user_coupons').select('id, title, business_name, discount_amount, neighborhood').eq('is_active', true).limit(3)
    ]);

    console.log('📊 Data fetched - Events:', eventsData.data?.length, 'Communities:', communitiesData.data?.length, 'Items:', itemsData.data?.length);

    // Prepare essential context with REAL data
    const realData = {
      currentEvents: eventsData.data || [],
      activeCommunities: communitiesData.data || [],
      marketplaceItems: itemsData.data || [],
      localCoupons: couponsData.data || [],
      userLocation: userLocation || 'Not specified'
    };

    // Check for repetition in recent messages
    let repetitionContext = '';
    if (messages.length >= 2) {
      const recentUserMessages = messages
        .filter(m => m.role === 'user')
        .slice(-3)
        .map(m => m.content.toLowerCase().trim());
      
      const lastMessage = message.toLowerCase().trim();
      const repetitionCount = recentUserMessages.filter(m => m === lastMessage).length;
      
      if (repetitionCount >= 2) {
        repetitionContext = '\n\n⚠️ IMPORTANT: The user just sent the same message multiple times. Address this directly! Say something like "I noticed you sent that a couple times - are you looking for something more specific?" or "Hey, seems like you might be stuck - let me help you out differently" Be helpful and acknowledge the repetition in a friendly way.';
      }
    }

    // Create concise system prompt with essential data
    const systemPrompt = `You're Yara AI, the cool friend who knows what's up in Buenos Aires. You're talking to 25-32 year olds, so keep it real, casual, and fun. Use natural conversational language - think texting a friend, not writing an essay.

CURRENT SCENE:
📅 EVENTS (${realData.currentEvents.length}):
${realData.currentEvents.map(e => `- "${e.title}" at ${e.location} on ${e.date} ${e.time || ''} ${e.price ? '$'+e.price : ''}`).join('\n')}

👥 COMMUNITIES (${realData.activeCommunities.length}):
${realData.activeCommunities.map(c => `- "${c.name}" (${c.member_count} members)`).join('\n')}

🏪 MARKETPLACE (${realData.marketplaceItems.length}):
${realData.marketplaceItems.map(i => `- ${i.title} in ${i.category} at ${i.location} $${i.price}`).join('\n')}

🎫 DEALS (${realData.localCoupons.length}):
${realData.localCoupons.map(c => `- ${c.discount_amount} off at ${c.business_name}`).join('\n')}

YOUR VIBE:
- Talk like you're texting a friend - use "gonna", "wanna", contractions, etc.
- Be enthusiastic but chill - no corporate speak or overly formal language
- Drop emojis when it feels natural
- Keep it under 80 words - nobody wants an essay
- When mentioning events/deals, make them sound exciting but authentic
- Use phrases like "there's this cool...", "you should check out...", "ngl (not gonna lie)..."
- Pay attention to conversation history and don't repeat yourself
- If the user seems confused or asks the same thing, offer to help differently

Remember: You're the friend who always knows the best spots and hookups in BA.${repetitionContext}`;

    console.log('🤖 Calling OpenAI with conversation history...');

    // Build conversation history for context
    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6), // Include last 6 messages for context
      { role: 'user', content: message }
    ];

    // Make OpenAI API call with conversation history
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        max_tokens: 120,
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