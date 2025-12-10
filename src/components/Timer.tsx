import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface TimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  onTimeChange: (minutes: number, seconds: number) => void;
  onTimerComplete: () => void;
  isFullscreen: boolean;
}

export const Timer = ({ 
  minutes, 
  seconds, 
  isRunning, 
  onTimeChange, 
  onTimerComplete,
  isFullscreen 
}: TimerProps) => {
  const { settings } = useTheme();
  const hasBackground = settings.background !== 'none';
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && (minutes > 0 || seconds > 0)) {
      interval = setInterval(() => {
        if (seconds > 0) {
          onTimeChange(minutes, seconds - 1);
        } else if (minutes > 0) {
          onTimeChange(minutes - 1, 59);
        } else {
          onTimerComplete();
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, minutes, seconds, onTimeChange, onTimerComplete]);

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`
        rounded-3xl shadow-lg border transition-all duration-300 ease-out
        ${isFullscreen ? 'text-9xl md:text-[12rem] p-16' : 'text-8xl md:text-9xl p-12 md:p-16'}
        ${hasBackground 
          ? 'bg-white/10 backdrop-blur-md border-white/20' 
          : 'bg-timer-bg border-timer-shadow/30'
        }
      `}
    >
      <div 
        className={`
          font-bold tracking-tight transition-all duration-300
          ${isFullscreen ? 'text-center' : ''}
          ${hasBackground ? 'text-white' : 'text-timer-text'}
          ${settings.font === 'mono' ? 'font-mono' : 
            settings.font === 'roboto' ? 'font-roboto' :
            settings.font === 'playfair' ? 'font-playfair' :
            settings.font === 'inter' ? 'font-inter' :
            settings.font === 'poppins' ? 'font-poppins' : 'font-mono'
          }
        `}
      >
        {formatTime(minutes, seconds)}
      </div>
    </div>
  );
};