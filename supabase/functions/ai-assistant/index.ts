import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('AI Assistant function started - v2.0');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userLocation } = await req.json();
    console.log('AI Assistant v4.0 - Debug Mode - Processing request:', { message, userLocation });
    
    // Debug: List all available environment variables
    console.log('🔍 Available environment variables:');
    const envVars = Deno.env.toObject();
    Object.keys(envVars).forEach(key => {
      console.log(`  - ${key}: ${key.includes('KEY') ? '[REDACTED]' : envVars[key]}`);
    });
    
    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('🔑 OPENAI_API_KEY check result:', openAIApiKey ? 'FOUND' : 'NOT FOUND');
    
    if (!openAIApiKey) {
      console.error('❌ CRITICAL: OpenAI API key not found in environment variables');
      
      // Check for alternative names
      const altKey1 = Deno.env.get('OPENAI_KEY');
      const altKey2 = Deno.env.get('API_KEY');
      console.log('🔍 Alternative key check - OPENAI_KEY:', altKey1 ? 'FOUND' : 'NOT FOUND');
      console.log('🔍 Alternative key check - API_KEY:', altKey2 ? 'FOUND' : 'NOT FOUND');
      
      return new Response(
        JSON.stringify({ 
          response: `I'm missing my API configuration. Available env vars: ${Object.keys(envVars).join(', ')}. Please check the Edge Function secrets.`,
          success: true,
          error: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ OpenAI API key found! Using Assistants API...');
    
    const assistantId = 'asst_PxBjnbhjnzWu8u9D6rfnRDGZ';

    // Step 1: Create a thread
    console.log('📝 Creating thread...');
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      console.error('❌ Thread creation failed:', threadResponse.status);
      const errorText = await threadResponse.text();
      console.error('Thread error details:', errorText);
      throw new Error(`Failed to create thread: ${threadResponse.status}`);
    }

    const thread = await threadResponse.json();
    console.log('✅ Thread created:', thread.id);

    // Step 2: Add message to thread
    console.log('💬 Adding message to thread...');
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: `User location: ${userLocation || 'Not specified'}\n\nUser question: ${message}`
      })
    });

    if (!messageResponse.ok) {
      console.error('❌ Message creation failed:', messageResponse.status);
      throw new Error('Failed to add message to thread');
    }

    console.log('✅ Message added to thread');

    // Step 3: Run the assistant
    console.log('🤖 Running assistant...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      console.error('❌ Run creation failed:', runResponse.status);
      throw new Error('Failed to run assistant');
    }

    const run = await runResponse.json();
    console.log('✅ Run started:', run.id);

    // Step 4: Poll for completion (simplified for now)
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

    // Step 5: Get the response
    console.log('📖 Getting assistant response...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      console.error('❌ Failed to get messages:', messagesResponse.status);
      throw new Error('Failed to get assistant response');
    }

    const messagesData = await messagesResponse.json();
    const assistantMessages = messagesData.data.filter(msg => msg.role === 'assistant');
    
    if (assistantMessages.length === 0) {
      // Fallback response if no assistant message yet
      const aiResponse = "Hello! I'm your neighborhood assistant. I can help you find events, communities, and connect with neighbors. What are you looking for today?";
      console.log('🔄 Using fallback response');
      
      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          success: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = assistantMessages[0].content[0].text.value;
    console.log('🎉 AI Assistant request completed successfully using Assistants API');

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