import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  status: 'active' | 'inactive';
  expires_at: string | null;
  paypal_subscription_id: string | null;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    status: 'inactive',
    expires_at: null,
    paypal_subscription_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdminRole();
  }, [user]);

  // Load localStorage-stored subscription if present
  useEffect(() => {
    if (!user) {
      setSubscription({
        status: 'inactive',
        expires_at: null,
        paypal_subscription_id: null,
      });
      return;
    }

    const key = `subscription_${user.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      setSubscription({
        status: parsed.status === 'aetherstudy_pro' ? 'active' : 'inactive',
        expires_at: parsed.expires_at ?? null,
        paypal_subscription_id: parsed.paypal_subscription_id ?? null,
      });
    } catch (err) {
      console.warn('Failed to parse subscription from localStorage, removing key', err);
      localStorage.removeItem(key);
    }
  }, [user]);

  // Simplified subscription check from database
  const checkSubscriptionStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('status, expires_at, paypal_subscription_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }

      if (data) {
        setSubscription({
          status: 'active',
          expires_at: data.expires_at,
          paypal_subscription_id: data.paypal_subscription_id,
        });
      }
    } catch (error) {
      console.error('Error in checkSubscriptionStatus:', error);
    }
  };

  const updateSubscription = async (
    status: 'active' | 'inactive',
    paypalSubscriptionId?: string,
    expiresAt?: string
  ) => {
    if (!user) return;

    try {
      // Update database
      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          paypal_subscription_id: paypalSubscriptionId || null,
          status: status,
          plan_id: 'P-0462785562162011DNDNG7WA',
          expires_at: expiresAt || null,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to update subscription. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      const newSubscription = {
        status,
        expires_at: expiresAt || null,
        paypal_subscription_id: paypalSubscriptionId || null,
      };

      const key = `subscription_${user.id}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          status: status === 'active' ? 'aetherstudy_pro' : 'free',
          expires_at: expiresAt || null,
          paypal_subscription_id: paypalSubscriptionId || null,
        })
      );

      setSubscription(newSubscription);

      toast({
        title: 'Subscription Updated',
        description: `Your subscription status has been updated to ${status === 'active' ? 'AetherStudy Pro' : 'Free'}.`,
      });
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  // compute isProUser using useMemo (recomputes when subscription or admin status changes)
  const isProUser = useMemo(() => {
    // Admins bypass the paywall
    if (isAdmin) return true;
    
    if (subscription?.status !== 'active') return false;
    if (!subscription.expires_at) return true;
    const dt = new Date(subscription.expires_at);
    if (isNaN(dt.getTime())) return false;
    return dt > new Date();
  }, [subscription, isAdmin]);

  // Check database subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, [user]);

  return {
    subscription,
    loading,
    isProUser,
    updateSubscription,
    checkSubscriptionStatus,
  };
};
