import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Canceling subscription for user:', user.id);

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('paypal_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription?.paypal_subscription_id) {
      throw new Error('No active subscription found');
    }

    const paypalSubscriptionId = subscription.paypal_subscription_id;
    console.log('PayPal subscription ID:', paypalSubscriptionId);

    // Get PayPal access token
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const baseUrl = Deno.env.get('PAYPAL_BASE_URL');

    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    console.log('Got PayPal access token');

    // Cancel subscription via PayPal API
    const cancelResponse = await fetch(
      `${baseUrl}/v1/billing/subscriptions/${paypalSubscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: 'User requested cancellation',
        }),
      }
    );

    if (!cancelResponse.ok) {
      const errorText = await cancelResponse.text();
      console.error('PayPal cancel failed:', errorText);
      throw new Error(`Failed to cancel PayPal subscription: ${errorText}`);
    }

    console.log('PayPal subscription cancelled successfully');

    // Update database
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    console.log('Database updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Subscription cancelled successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
