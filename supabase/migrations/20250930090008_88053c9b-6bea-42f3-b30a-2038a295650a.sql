-- Allow users to insert and update their own subscriptions
CREATE POLICY "Users can insert their own subscription"
ON user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);