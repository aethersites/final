import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface ModeSelectorProps {
  currentMode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  isFullscreen: boolean;
}

export const ModeSelector = ({ currentMode, onModeChange, isFullscreen }: ModeSelectorProps) => {
  const { settings } = useTheme();
  const hasBackground = settings.background !== 'none';
  
  if (isFullscreen) return null;

  const modes = [
    { key: 'pomodoro' as TimerMode, label: 'Pomodoro', duration: '25:00' },
    { key: 'shortBreak' as TimerMode, label: 'Short Break', duration: '05:00' },
    { key: 'longBreak' as TimerMode, label: 'Long Break', duration: '15:00' },
  ];

  return (
    <div className={`
      flex items-center gap-3 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300
      ${hasBackground 
        ? 'bg-white/10 backdrop-blur-md border border-white/20' 
        : 'bg-secondary/50'
      }
    `}>
      {modes.map((mode) => (
        <Button
          key={mode.key}
          variant={currentMode === mode.key ? "pomodoro-active" : "mode"}
          onClick={() => onModeChange(mode.key)}
          className="transition-all duration-200"
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
};