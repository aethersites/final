import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PAYPAL_CLIENT_ID = 'AdPEKbF7enYBNUzpdfHfhjETidLXb4AIo5yZcbdYA0dcoEhoc5F9Fh-h0EIr-clVqHi8KwDCEq1WdSw1';
const PAYPAL_PLAN_ID = 'P-0462785562162011DNDNG7WA';

export const PayPalSubscription = () => {
  const { isProUser, updateSubscription, checkSubscriptionStatus } = useSubscription();
  const { user } = useAuth();
  const paypalRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (scriptLoaded.current || !user || isProUser) return;

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;

    script.onload = () => {
      scriptLoaded.current = true;
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'white',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: PAYPAL_PLAN_ID
            });
          },
          onApprove: function(data: any) {
            // Update subscription status
            updateSubscription('active', data.subscriptionID);
          }
        }).render(paypalRef.current);
      }
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [user, isProUser, updateSubscription]);

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setIsCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-paypal-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      toast.success('Subscription cancelled successfully');
      await checkSubscriptionStatus();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isProUser) {
    return (
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-light text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              AetherStudy Pro Active
            </CardTitle>
            <Badge className="bg-green-500 rounded-full">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground/60 font-light">
            You're already subscribed to AetherStudy Pro! Enjoy all premium features.
          </p>
          <Button 
            variant="outline" 
            onClick={handleCancelSubscription}
            disabled={isCancelling}
            className="w-full rounded-xl border-white/20 hover:bg-white/10"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Subscription'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="font-light text-foreground flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          AetherStudy Pro
        </CardTitle>
        <p className="text-sm text-foreground/60 font-light">
          Unlock premium features with our monthly subscription
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-3xl font-bold text-foreground">$2.99</span>
            <span className="text-foreground/60">/month</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-green-500" />
              <span>Unlimited flashcard sets</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-green-500" />
              <span>AI-powered study recommendations</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-green-500" />
              <span>Advanced analytics and progress tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-green-500" />
              <span>Export and backup features</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="w-4 h-4 text-green-500" />
              <span>Priority customer support</span>
            </div>
          </div>
        </div>

        {user ? (
          <div ref={paypalRef} id="paypal-button-container" />
        ) : (
          <p className="text-sm text-foreground/60 text-center font-light">
            Please sign in to subscribe
          </p>
        )}
      </CardContent>
    </Card>
  );
};
