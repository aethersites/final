-- Enable Row Level Security on user_subscriptions table
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions table
-- Allow users to view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT  
USING (auth.uid() = user_id);

-- Allow service role to manage subscriptions (for webhooks and admin operations)
CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions
FOR ALL
USING (current_setting('role') = 'service_role')
WITH CHECK (current_setting('role') = 'service_role');