-- Create user_subscriptions table for PayPal subscriptions
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paypal_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  plan_id TEXT NOT NULL DEFAULT 'aetherstudy_pro',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create payment_logs table for PayPal webhook logging
CREATE TABLE public.payment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paypal_subscription_id TEXT,
  user_email TEXT
);

-- Enable RLS for payment_logs (admin only access)
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for payment logs (service role only)
CREATE POLICY "Service role can manage payment logs" 
ON public.payment_logs 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_paypal_id ON public.user_subscriptions(paypal_subscription_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX idx_payment_logs_paypal_id ON public.payment_logs(paypal_subscription_id);