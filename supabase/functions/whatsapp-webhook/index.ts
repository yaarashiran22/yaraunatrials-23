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
      // Check content type and handle accordingly
      const contentType = req.headers.get('content-type') || '';
      
      let twilioData;
      if (contentType.includes('application/x-www-form-urlencoded')) {
        // Handle Twilio webhook format
        const formData = await req.formData();
        twilioData = Object.fromEntries(formData.entries());
        console.log('📱 Twilio webhook received:', JSON.stringify(twilioData, null, 2));
        
        // Check if this is an incoming message (not a status update)
        if (twilioData.SmsStatus === 'received' && twilioData.Body) {
          const messageBody = decodeURIComponent(twilioData.Body as string);
          const fromNumber = twilioData.From as string;
          const profileName = twilioData.ProfileName as string || 'User';
          
          console.log(`💬 Processing Twilio message from ${profileName} (${fromNumber}): ${messageBody}`);
          
          // Call the AI assistant function
          try {
            console.log('🔄 Calling AI assistant function...');
            const aiResponse = await supabase.functions.invoke('ai-assistant', {
              body: {
                message: messageBody,
                userLocation: `WhatsApp User: ${profileName}`
              }
            });

            console.log('🤖 AI response received:', JSON.stringify(aiResponse, null, 2));

            if (aiResponse.data?.response) {
              console.log('✅ Valid AI response, sending to Twilio...');
              await sendTwilioWhatsAppMessage(fromNumber, aiResponse.data.response);
              console.log('📤 Message sent successfully to Twilio');
            } else {
              console.error('❌ No AI response received, aiResponse:', aiResponse);
              await sendTwilioWhatsAppMessage(fromNumber, "Sorry, I'm having trouble processing your message. Please try again.");
            }
          } catch (aiError) {
            console.error('❌ Error calling AI assistant:', aiError);
            await sendTwilioWhatsAppMessage(fromNumber, "Sorry, I'm experiencing technical difficulties. Please try again later.");
          }
        } else {
          console.log('📱 Received status update or non-message webhook:', twilioData.SmsStatus);
        }
      } else if (contentType.includes('application/json')) {
        // Handle Meta WhatsApp Business API format (keeping for backward compatibility)
        const body = await req.json();
        console.log('📱 Meta WhatsApp webhook received:', JSON.stringify(body, null, 2));

        if (body.object === 'whatsapp_business_account') {
          for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
              if (change.field === 'messages') {
                const messages = change.value?.messages || [];
                
                for (const message of messages) {
                  if (message.type === 'text') {
                    console.log(`💬 Processing Meta message from ${message.from}: ${message.text.body}`);
                    
                    try {
                      const aiResponse = await supabase.functions.invoke('ai-assistant', {
                        body: {
                          message: message.text.body,
                          userLocation: 'WhatsApp User'
                        }
                      });

                      if (aiResponse.data?.response) {
                        await sendWhatsAppMessage(message.from, aiResponse.data.response);
                      }
                    } catch (aiError) {
                      console.error('❌ Error calling AI assistant:', aiError);
                      await sendWhatsAppMessage(message.from, "Sorry, I'm experiencing technical difficulties.");
                    }
                  }
                }
              }
            }
          }
        }
      } else {
        // Handle other content types
        const text = await req.text();
        console.log('📱 Non-standard webhook received:', text);
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

// Function to send messages via Twilio WhatsApp
async function sendTwilioWhatsAppMessage(to: string, message: string) {
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_WHATSAPP_NUMBER = Deno.env.get('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886';

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Missing Twilio credentials');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const payload = new URLSearchParams({
    From: TWILIO_WHATSAPP_NUMBER,
    To: to,
    Body: message
  });

  try {
    console.log(`📤 Sending Twilio WhatsApp message to ${to}: ${message}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Twilio WhatsApp message sent successfully:', result);
    } else {
      console.error('❌ Failed to send Twilio WhatsApp message:', result);
    }
  } catch (error) {
    console.error('❌ Error sending Twilio WhatsApp message:', error);
  }
}

// Function to send messages via Meta WhatsApp Business API (keeping for backward compatibility)
async function sendWhatsAppMessage(to: string, message: string) {
  const ACCESS_TOKEN = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN');
  const PHONE_NUMBER_ID = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');

  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    console.error('❌ Missing Meta WhatsApp credentials');
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
    console.log(`📤 Sending Meta WhatsApp message to ${to}: ${message}`);
    
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
      console.log('✅ Meta WhatsApp message sent successfully:', result);
    } else {
      console.error('❌ Failed to send Meta WhatsApp message:', result);
    }
  } catch (error) {
    console.error('❌ Error sending Meta WhatsApp message:', error);
  }
}