import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings, Maximize2 } from "lucide-react";

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSettings: () => void;
  isFullscreen: boolean;
}

export const TimerControls = ({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSettings,
  isFullscreen
}: TimerControlsProps) => {
  return (
    <>
      {/* Main controls */}
      {!isFullscreen && (
        <div className="flex items-center gap-6">
          <Button
            variant="control-primary"
            size="control"
            onClick={isRunning ? onPause : onStart}
            className="w-16 h-16"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          
          <Button
            variant="control-secondary"
            size="control"
            onClick={onReset}
            className="w-12 h-12"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button
            variant="control-secondary"
            size="control"
            onClick={onSettings}
            className="w-12 h-12"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Fullscreen controls - centered */}
      {isFullscreen && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-50">
          <Button
            variant="control-primary"
            size="control"
            onClick={isRunning ? onPause : onStart}
            className="w-16 h-16"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>
          
          <Button
            variant="control-secondary"
            size="control"
            onClick={onReset}
            className="w-12 h-12"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <Button
            variant="control-secondary"
            size="control"
            onClick={onSettings}
            className="w-12 h-12"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      )}
    </>
  );
};