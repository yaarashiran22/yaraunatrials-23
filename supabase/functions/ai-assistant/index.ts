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
    console.log('AI Assistant v3.0 - Using OpenAI Assistants API:', { message, userLocation });
    
    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('Checking for OpenAI API key...');
    
    if (!openAIApiKey) {
      console.error('CRITICAL: OpenAI API key not found in environment variables');
      return new Response(
        JSON.stringify({ 
          response: "I'm having configuration issues right now. The API key seems to be missing from the server.",
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
      throw new Error('Failed to create thread');
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

    // Step 4: Poll for completion
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      console.log(`⏳ Polling run status... Attempt ${attempts}`);
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
        console.log('📊 Run status:', runStatus);
      }
    }

    if (runStatus !== 'completed') {
      console.error('❌ Run did not complete. Final status:', runStatus);
      throw new Error('Assistant run did not complete in time');
    }

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
      throw new Error('No assistant response found');
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