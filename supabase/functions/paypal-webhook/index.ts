import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource_type: string
  summary: string
  resource: {
    id: string
    status: string
    status_update_time: string
    plan_id: string
    subscriber?: {
      email_address: string
      payer_id: string
    }
    billing_info?: {
      next_billing_time: string
      last_payment: {
        amount: {
          currency_code: string
          value: string
        }
        time: string
      }
    }
  }
  links: Array<{
    href: string
    rel: string
    method: string
  }>
  event_version: string
  create_time: string
  resource_version: string
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify PayPal webhook signature (in production, you should verify the webhook signature)
    const payload = await req.text()
    const webhookEvent: PayPalWebhookEvent = JSON.parse(payload)
    
    console.log('PayPal webhook received:', {
      eventType: webhookEvent.event_type,
      resourceType: webhookEvent.resource_type,
      resourceId: webhookEvent.resource.id
    })

    // Log the webhook event
    await supabase.from('payment_logs').insert({
      paypal_subscription_id: webhookEvent.resource.id,
      event_type: webhookEvent.event_type,
      event_data: webhookEvent,
      user_email: webhookEvent.resource.subscriber?.email_address || null
    })

    // Handle different event types
    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(supabase, webhookEvent)
        break
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(supabase, webhookEvent)
        break
      
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(supabase, webhookEvent)
        break
        
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePaymentFailed(supabase, webhookEvent)
        break
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(supabase, webhookEvent)
        break
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(supabase, webhookEvent)
        break
        
      default:
        console.log('Unhandled webhook event type:', webhookEvent.event_type)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing PayPal webhook:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'An error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function handleSubscriptionActivated(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id
  const subscriberEmail = event.resource.subscriber?.email_address
  
  if (!subscriberEmail) {
    console.error('No subscriber email found in activation event')
    return
  }

  // Find user by email
  const { data: user, error: userError } = await supabase.auth.admin.listUsers()
  const targetUser = user?.users?.find((u: any) => u.email === subscriberEmail)
  
  if (!targetUser) {
    console.error('User not found for email:', subscriberEmail)
    return
  }

  const nextBillingDate = event.resource.billing_info?.next_billing_time
  const expiresAt = nextBillingDate ? new Date(nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  // Create or update subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: targetUser.id,
      paypal_subscription_id: subscriptionId,
      status: 'active',
      plan_id: 'aetherstudy_pro',
      expires_at: expiresAt.toISOString(),
      next_billing_date: nextBillingDate || null,
      updated_at: new Date().toISOString(),
      metadata: {
        activation_event: event,
        subscriber_email: subscriberEmail
      }
    }, {
      onConflict: 'paypal_subscription_id'
    })

  if (error) {
    console.error('Error updating subscription:', error)
  } else {
    console.log('Subscription activated for user:', targetUser.id)
  }
}

async function handleSubscriptionCancelled(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
      metadata: supabase.rpc('jsonb_set', {
        target: supabase.raw('metadata'),
        path: '{cancellation_event}',
        new_value: JSON.stringify(event)
      })
    })
    .eq('paypal_subscription_id', subscriptionId)

  if (error) {
    console.error('Error cancelling subscription:', error)
  } else {
    console.log('Subscription cancelled:', subscriptionId)
  }
}

async function handleSubscriptionExpired(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'expired',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId)

  if (error) {
    console.error('Error expiring subscription:', error)
  } else {
    console.log('Subscription expired:', subscriptionId)
  }
}

async function handlePaymentFailed(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id
  
  // Don't immediately cancel - PayPal usually retries failed payments
  // Just log the failure
  console.log('Payment failed for subscription:', subscriptionId)
}

async function handleSubscriptionSuspended(supabase: any, event: PayPalWebhookEvent) {
  const subscriptionId = event.resource.id
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq('paypal_subscription_id', subscriptionId)

  if (error) {
    console.error('Error suspending subscription:', error)
  } else {
    console.log('Subscription suspended:', subscriptionId)
  }
}

async function handlePaymentCompleted(supabase: any, event: PayPalWebhookEvent) {
  // Update next billing date and ensure subscription is active
  const subscriptionId = event.resource.id
  
  if (event.resource_type === 'sale') {
    // This is a recurring payment - extend the subscription
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        expires_at: nextMonth.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('paypal_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription after payment:', error)
    } else {
      console.log('Subscription renewed:', subscriptionId)
    }
  }
}