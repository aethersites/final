import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionStatus } from "@/components/SubscriptionStatus";
import { PayPalSubscription } from "@/components/PayPalSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Settings as SettingsIcon } from "lucide-react";
export const Settings = () => {
  const {
    user,
    signOut
  } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const {
    updateSubscription
  } = useSubscription();

  // Handle PayPal subscription success/cancel redirects
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    if (subscriptionStatus === 'success') {
      toast({
        title: "Subscription Activated!",
        description: "Your AetherStudy Pro subscription has been activated successfully."
      });

      // Update subscription status to active
      updateSubscription('active');

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (subscriptionStatus === 'cancelled') {
      toast({
        title: "Subscription Cancelled",
        description: "Your PayPal subscription process was cancelled.",
        variant: "destructive"
      });

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, updateSubscription]);
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName.trim()) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: displayName.trim(),
        email: user.email
      });
      if (error) throw error;
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive"
      });
    }
  };
  return <ProtectedRoute>
      <Layout>
        <div className="min-h-screen p-8 pt-32">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-sm font-medium mb-4">
                <SettingsIcon className="w-4 h-4" />
                Account Management
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-foreground">
                Settings
              </h1>
              <p className="text-lg text-foreground/60 font-light max-w-md mx-auto">
                Manage your account, subscription, and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <div className="space-y-6">
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-light text-foreground">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground/70 font-light">Email</Label>
                        <Input id="email" type="email" value={user?.email || ""} disabled className="bg-white/5 border-white/20 rounded-xl text-foreground placeholder:text-foreground/40" />
                      </div>
                      
                      <Button type="submit" disabled={loading} className="w-full bg-white/20 hover:bg-white/30 text-foreground border border-white/30 rounded-xl backdrop-blur-sm transition-all duration-300">
                        {loading ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-light text-foreground">Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleSignOut} variant="destructive" className="w-full rounded-xl">
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Subscription Management */}
              <div className="space-y-6">
                <SubscriptionStatus />
                <PayPalSubscription />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>;
};