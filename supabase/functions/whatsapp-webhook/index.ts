import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for calling other functions
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      console.log('🔍 Webhook verification request received');
      
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      const VERIFY_TOKEN = Deno.env.get('META_WEBHOOK_VERIFY_TOKEN');
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        console.log('❌ Webhook verification failed');
        return new Response('Forbidden', { status: 403 });
      }
    }

    // Handle incoming messages (POST request)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));

      // Check if this is a message event
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'messages') {
              const messages = change.value?.messages || [];
              
              for (const message of messages) {
                if (message.type === 'text') {
                  console.log(`💬 Processing message from ${message.from}: ${message.text.body}`);
                  
                  // Call the AI assistant function
                  try {
                    const aiResponse = await supabase.functions.invoke('ai-assistant', {
                      body: {
                        message: message.text.body,
                        userLocation: 'WhatsApp User'
                      }
                    });

                    console.log('🤖 AI response received:', aiResponse.data);

                    if (aiResponse.data?.response) {
                      // Send response back via WhatsApp
                      await sendWhatsAppMessage(message.from, aiResponse.data.response);
                    } else {
                      console.error('❌ No AI response received');
                      await sendWhatsAppMessage(message.from, "Lo siento, hubo un error procesando tu mensaje. Por favor intenta nuevamente.");
                    }
                  } catch (aiError) {
                    console.error('❌ Error calling AI assistant:', aiError);
                    await sendWhatsAppMessage(message.from, "Lo siento, hubo un error procesando tu mensaje. Por favor intenta nuevamente.");
                  }
                }
              }
            }
          }
        }
      }

      return new Response('OK', { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    return new Response('Method not allowed', { status: 405 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});

async function sendWhatsAppMessage(to: string, message: string) {
  const ACCESS_TOKEN = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');
  const PHONE_NUMBER_ID = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('❌ Missing WhatsApp credentials');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
  
  const payload = {
    messaging_product: "whatsapp",
    to: to,
    type: "text",
    text: {
      body: message
    }
  };

  try {
    console.log(`📤 Sending WhatsApp message to ${to}: ${message}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ WhatsApp message sent successfully:', result);
    } else {
      console.error('❌ Failed to send WhatsApp message:', result);
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
  }
}