import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginPromptDialogProps {
  open: boolean;
}

export const LoginPromptDialog = ({ open }: LoginPromptDialogProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Login Required</DialogTitle>
          <DialogDescription className="text-base">
            You need to login to access this page and unlock all features.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={() => navigate('/login')} 
            size="lg" 
            className="w-full"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline" 
            size="lg"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
