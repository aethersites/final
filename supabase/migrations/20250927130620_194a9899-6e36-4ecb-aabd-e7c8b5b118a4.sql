-- Enable Row Level Security on payment_logs table
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Create restrictive RLS policies for payment_logs
-- Only service role can insert payment logs (for webhooks)
CREATE POLICY "Service role can insert payment logs"
ON public.payment_logs
FOR INSERT
WITH CHECK (current_setting('role') = 'service_role');

-- No other policies for payment_logs to keep it highly secure
-- Only admin/service access should be allowed for this sensitive financial data