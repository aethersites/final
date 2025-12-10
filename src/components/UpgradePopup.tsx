import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePopupProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  timeUntilReset?: string | null;
}

export const UpgradePopup = ({ isOpen, onClose, feature = "this feature", timeUntilReset }: UpgradePopupProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/settings');
    onClose();
  };

  const features = [
    "Unlimited AI Quiz Generation",
    "Unlimited AI Flashcard Generation",
    "Advanced Analytics",
    "Priority Support",
    "Custom Themes"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-background/95 border border-white/20 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-light text-foreground">
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <p className="text-foreground/60 font-light">
              You've used your free weekly generation for {feature}.
            </p>
            
            {timeUntilReset && (
              <div className="flex items-center justify-center gap-2 text-sm text-foreground/50">
                <Clock className="w-4 h-4" />
                <span>Resets in {timeUntilReset}</span>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                7 Day Free Trial
              </Badge>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <div className="text-3xl font-bold text-foreground mb-1">$2.99</div>
            <div className="text-sm text-foreground/60 font-light">per month</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm text-left text-foreground/80">What's included:</h4>
            <div className="space-y-2">
              {features.map((feat, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-foreground/70">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleUpgrade} 
              className="w-full gap-2 h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90"
            >
              <Crown className="w-4 h-4" />
              Start Free Trial
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full rounded-2xl hover:bg-white/10">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
