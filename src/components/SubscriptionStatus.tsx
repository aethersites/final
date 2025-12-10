import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Star } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionStatus = () => {
  const { subscription, loading, isProUser } = useSubscription();

  if (loading) {
    return (
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // compute expiration safely
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const hasValidExpiry = expiresAt instanceof Date && !isNaN(expiresAt.getTime());

  return (
    <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-light text-foreground flex items-center gap-2">
            {isProUser ? (
              <>
                <Crown className="w-5 h-5 text-yellow-500" />
                AetherStudy Pro
              </>
            ) : (
              <>
                <Star className="w-5 h-5 text-foreground/60" />
                Free Plan
              </>
            )}
          </CardTitle>
          <Badge variant={isProUser ? "default" : "secondary"} className="rounded-full">
            {isProUser ? 'PRO' : 'FREE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProUser ? (
          <div className="space-y-2">
            <p className="text-sm text-foreground/60 font-light">
              You have access to all premium features including:
            </p>
            <ul className="text-sm space-y-1 text-foreground/60 font-light">
              <li>• Unlimited flashcard sets</li>
              <li>• Advanced AI-powered study tools</li>
              <li>• Priority support</li>
              <li>• Export capabilities</li>
            </ul>
            {hasValidExpiry && (
              <p className="text-xs text-foreground/50 mt-2">
                Expires: {expiresAt!.toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-foreground/60 font-light">
              Upgrade to AetherStudy Pro for advanced features and unlimited access.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
