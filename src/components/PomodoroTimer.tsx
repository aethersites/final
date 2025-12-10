import { useState, useCallback } from "react";
import { Timer } from "./Timer";
import { ModeSelector, TimerMode } from "./ModeSelector";
import { TimerControls } from "./TimerControls";
import { SettingsDialog } from "./SettingsDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Music, X, Volume2, Play, Pause, ChevronDown, ChevronUp } from "lucide-react";

// Import background images
import nature1 from "@/assets/backgrounds/nature-1.jpg";
import nature2 from "@/assets/backgrounds/nature-2.jpg";
import nature3 from "@/assets/backgrounds/nature-3.jpg";
import nature4 from "@/assets/backgrounds/nature-4.jpg";
import nature5 from "@/assets/backgrounds/nature-5.jpg";
import nature6 from "@/assets/backgrounds/nature-6.jpg";
import nature7 from "@/assets/backgrounds/nature-7.jpg";
import nature8 from "@/assets/backgrounds/nature-8.jpg";
import nature9 from "@/assets/backgrounds/nature-9.jpg";
import nature10 from "@/assets/backgrounds/nature-10.jpg";
import nature11 from "@/assets/backgrounds/nature-11.jpg";
import nature12 from "@/assets/backgrounds/nature-12.jpg";
import modern1 from "@/assets/backgrounds/modern-1.jpg";
import modern2 from "@/assets/backgrounds/modern-2.jpg";
import modern3 from "@/assets/backgrounds/modern-3.jpg";
import modern4 from "@/assets/backgrounds/modern-4.jpg";
import modern5 from "@/assets/backgrounds/modern-5.jpg";
import modern6 from "@/assets/backgrounds/modern-6.jpg";
import modern7 from "@/assets/backgrounds/modern-7.jpg";
import galaxy1 from "@/assets/backgrounds/galaxy-1.jpg";
import galaxy2 from "@/assets/backgrounds/galaxy-2.jpg";
import galaxy3 from "@/assets/backgrounds/galaxy-3.jpg";
import galaxy4 from "@/assets/backgrounds/galaxy-4.jpg";
import galaxy5 from "@/assets/backgrounds/galaxy-5.jpg";
import galaxy6 from "@/assets/backgrounds/galaxy-6.jpg";
import galaxy7 from "@/assets/backgrounds/galaxy-7.jpg";
import galaxy8 from "@/assets/backgrounds/galaxy-8.jpg";
import galaxy9 from "@/assets/backgrounds/galaxy-9.jpg";
import galaxy10 from "@/assets/backgrounds/galaxy-10.jpg";
import galaxy11 from "@/assets/backgrounds/galaxy-11.jpg";

const TIMER_DURATIONS = {
  pomodoro: { minutes: 25, seconds: 0 },
  shortBreak: { minutes: 5, seconds: 0 },
  longBreak: { minutes: 15, seconds: 0 },
};

const backgroundImages = {
  none: undefined,
  'nature-1': nature1,
  'nature-2': nature2,
  'nature-3': nature3,
  'nature-4': nature4,
  'nature-5': nature5,
  'nature-6': nature6,
  'nature-7': nature7,
  'nature-8': nature8,
  'nature-9': nature9,
  'nature-10': nature10,
  'nature-11': nature11,
  'nature-12': nature12,
  'modern-1': modern1,
  'modern-2': modern2,
  'modern-3': modern3,
  'modern-4': modern4,
  'modern-5': modern5,
  'modern-6': modern6,
  'modern-7': modern7,
  'galaxy-1': galaxy1,
  'galaxy-2': galaxy2,
  'galaxy-3': galaxy3,
  'galaxy-4': galaxy4,
  'galaxy-5': galaxy5,
  'galaxy-6': galaxy6,
  'galaxy-7': galaxy7,
  'galaxy-8': galaxy8,
  'galaxy-9': galaxy9,
  'galaxy-10': galaxy10,
  'galaxy-11': galaxy11,
};

const whiteNoiseSounds = [
  { name: 'Rain', url: 'https://www.gstatic.com/voice_delight/sounds/long/rain.mp3' },
  { name: 'Thunderstorm', url: 'https://www.gstatic.com/voice_delight/sounds/long/thunder.mp3' },
  { name: 'Forest', url: 'https://www.gstatic.com/voice_delight/sounds/long/forest.mp3' },
  { name: 'Fireplace', url: 'https://www.gstatic.com/voice_delight/sounds/long/fireplace.mp3' },
  { name: 'Ocean', url: 'https://www.gstatic.com/voice_delight/sounds/long/ocean.mp3' },
  { name: 'Countryside', url: 'https://www.gstatic.com/voice_delight/sounds/long/country_night.mp3' },
  { name: 'Creek', url: 'https://www.gstatic.com/voice_delight/sounds/long/brook.mp3' },
  { name: 'Fan', url: 'https://www.gstatic.com/voice_delight/sounds/long/oscillating_fan.mp3' },
];

interface PomodoroTimerProps {
  isFullscreen?: boolean;
}

export const PomodoroTimer = ({ isFullscreen = false }: PomodoroTimerProps) => {
  const { settings } = useTheme();
  
  // For now, we'll use isFullscreen as a proxy for sidebar state
  // In fullscreen mode, treat as if sidebar is collapsed
  // In normal mode, assume sidebar could be expanded (use dark text for safety)  
  const shouldUseDarkText = !isFullscreen || settings.background === 'none';
  const [currentMode, setCurrentMode] = useState<TimerMode>('pomodoro');
  const [minutes, setMinutes] = useState(TIMER_DURATIONS.pomodoro.minutes);
  const [seconds, setSeconds] = useState(TIMER_DURATIONS.pomodoro.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState("");
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [tempSpotifyUrl, setTempSpotifyUrl] = useState("");
  
  // White noise state
  const [whiteNoiseAudio, setWhiteNoiseAudio] = useState<HTMLAudioElement | null>(null);
  const [currentSound, setCurrentSound] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [showWhiteNoise, setShowWhiteNoise] = useState(false);
  
  const { toast } = useToast();

  const handleModeChange = useCallback((mode: TimerMode) => {
    setCurrentMode(mode);
    setMinutes(TIMER_DURATIONS[mode].minutes);
    setSeconds(TIMER_DURATIONS[mode].seconds);
    setIsRunning(false);
  }, []);

  const handleTimeChange = useCallback((newMinutes: number, newSeconds: number) => {
    setMinutes(newMinutes);
    setSeconds(newSeconds);
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    const messages = {
      pomodoro: {
        title: "Pomodoro Complete! 🍅",
        description: "Great work! Time for a break.",
      },
      shortBreak: {
        title: "Break Complete! ☕",
        description: "Ready to get back to work?",
      },
      longBreak: {
        title: "Long Break Complete! 🌟",
        description: "Refreshed and ready to go!",
      },
    };

    toast({
      title: messages[currentMode].title,
      description: messages[currentMode].description,
    });
  }, [currentMode, toast]);

  const handleStart = useCallback(() => {
    setIsRunning(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setMinutes(TIMER_DURATIONS[currentMode].minutes);
    setSeconds(TIMER_DURATIONS[currentMode].seconds);
  }, [currentMode]);

  const handleSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  // Spotify playlist functions
  const convertSpotifyUrl = (url: string): string => {
    // Convert Spotify share URL to embed URL
    // Example: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // To: https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M
    
    if (!url.includes('spotify.com')) {
      return '';
    }
    
    if (url.includes('/embed/')) {
      return url; // Already an embed URL
    }
    
    return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  };

  const handleAddPlaylist = useCallback(() => {
    if (!tempSpotifyUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Spotify playlist URL.",
        variant: "destructive",
      });
      return;
    }

    const embedUrl = convertSpotifyUrl(tempSpotifyUrl.trim());
    if (!embedUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid Spotify playlist URL.",
        variant: "destructive",
      });
      return;
    }

    setSpotifyUrl(tempSpotifyUrl.trim());
    setSpotifyEmbedUrl(embedUrl);
    setShowPlaylistDialog(false);
    setTempSpotifyUrl("");
    
    toast({
      title: "Playlist Added!",
      description: "Your Spotify playlist is now ready to play.",
    });
  }, [tempSpotifyUrl, toast]);

  const handleRemovePlaylist = useCallback(() => {
    setSpotifyUrl("");
    setSpotifyEmbedUrl("");
    toast({
      title: "Playlist Removed",
      description: "Spotify playlist has been removed.",
    });
  }, [toast]);

  // White noise functions
  const playWhiteNoise = useCallback((soundUrl: string, soundName: string) => {
    // Stop current audio if playing
    if (whiteNoiseAudio) {
      whiteNoiseAudio.pause();
      whiteNoiseAudio.currentTime = 0;
    }

    // Create new audio instance
    const audio = new Audio(soundUrl);
    audio.loop = true;
    audio.volume = volume[0] / 100;
    
    audio.play().then(() => {
      setWhiteNoiseAudio(audio);
      setCurrentSound(soundName);
      setIsPlaying(true);
      toast({
        title: "White Noise Started",
        description: `Playing ${soundName}`,
      });
    }).catch((error) => {
      console.error('Error playing audio:', error);
      toast({
        title: "Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    });
  }, [whiteNoiseAudio, volume, toast]);

  const pauseWhiteNoise = useCallback(() => {
    if (whiteNoiseAudio) {
      whiteNoiseAudio.pause();
      setIsPlaying(false);
    }
  }, [whiteNoiseAudio]);

  const resumeWhiteNoise = useCallback(() => {
    if (whiteNoiseAudio) {
      whiteNoiseAudio.play();
      setIsPlaying(true);
    }
  }, [whiteNoiseAudio]);

  const stopWhiteNoise = useCallback(() => {
    if (whiteNoiseAudio) {
      whiteNoiseAudio.pause();
      whiteNoiseAudio.currentTime = 0;
      setWhiteNoiseAudio(null);
      setCurrentSound('');
      setIsPlaying(false);
    }
  }, [whiteNoiseAudio]);

  const handleVolumeChange = useCallback((newVolume: number[]) => {
    setVolume(newVolume);
    if (whiteNoiseAudio) {
      whiteNoiseAudio.volume = newVolume[0] / 100;
    }
  }, [whiteNoiseAudio]);

  const backgroundImage = backgroundImages[settings.background];

  // Determine playlist button text color based on fullscreen state and background
  const getPlaylistTextColor = () => {
    // In normal mode (sidebar could be open) OR no background: use dark gray
    if (shouldUseDarkText) {
      return 'text-gray-700';
    }
    // In fullscreen mode AND background is set: use white
    return 'text-white';
  };

  return (
    <div 
      className={`
        min-h-screen transition-all duration-500 ease-out relative overflow-hidden
        ${isFullscreen 
          ? 'flex items-center justify-center' 
          : 'flex flex-col items-center justify-center gap-12 p-8'
        }
      `}
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        <div className="animate-fade-in">
          <ModeSelector
            currentMode={currentMode}
            onModeChange={handleModeChange}
            isFullscreen={isFullscreen}
          />
        </div>

        <div className="animate-scale-in">
          <Timer
            minutes={minutes}
            seconds={seconds}
            isRunning={isRunning}
            onTimeChange={handleTimeChange}
            onTimerComplete={handleTimerComplete}
            isFullscreen={isFullscreen}
          />
        </div>

        {!isFullscreen && (
          <div className="animate-fade-in">
            <TimerControls
              isRunning={isRunning}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onSettings={handleSettings}
              isFullscreen={isFullscreen}
            />
          </div>
        )}
      </div>

      {/* Fullscreen controls */}
      {isFullscreen && (
        <TimerControls
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onSettings={handleSettings}
          isFullscreen={isFullscreen}
        />
      )}

      <SettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      {/* White Noise Module - Bottom Left */}
      <div className="fixed bottom-20 left-6 z-20">
        <Collapsible open={showWhiteNoise} onOpenChange={setShowWhiteNoise}>
          <CollapsibleTrigger asChild>
            <Button
              variant="secondary"
              className={`rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 gap-2 ${getPlaylistTextColor()}`}
              size="sm"
            >
              <Volume2 className="w-4 h-4" />
              White Noise
              {showWhiteNoise ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-lg min-w-[280px]">
              {/* Current playing status */}
              {currentSound && (
                <div className={`flex items-center justify-between mb-3 pb-3 border-b border-white/20 ${getPlaylistTextColor()}`}>
                  <span className="text-sm font-medium">Playing: {currentSound}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-white/20"
                      onClick={isPlaying ? pauseWhiteNoise : resumeWhiteNoise}
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-400"
                      onClick={stopWhiteNoise}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Sound selection */}
              <div className="space-y-2 mb-4">
                <Label className={`text-xs font-medium ${getPlaylistTextColor()}`}>
                  Choose Background Sound
                </Label>
                <div className="grid grid-cols-2 gap-1">
                  {whiteNoiseSounds.map((sound) => (
                    <Button
                      key={sound.name}
                      variant="ghost"
                      size="sm"
                      className={`justify-start text-xs h-8 hover:bg-white/20 ${
                        currentSound === sound.name 
                          ? 'bg-white/20 font-medium' 
                          : ''
                      } ${getPlaylistTextColor()}`}
                      onClick={() => playWhiteNoise(sound.url, sound.name)}
                    >
                      {sound.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Volume control */}
              <div className="space-y-2">
                <Label className={`text-xs font-medium ${getPlaylistTextColor()}`}>
                  Volume: {volume[0]}%
                </Label>
                <Slider
                  value={volume}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Spotify Playlist Button - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-20">
        {!spotifyEmbedUrl ? (
          <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className={`rounded-full shadow-lg backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 gap-2 ${getPlaylistTextColor()}`}
                size="sm"
              >
                <Music className="w-4 h-4" />
                Add Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Add Spotify Playlist
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spotify-url">Spotify Playlist URL</Label>
                  <Input
                    id="spotify-url"
                    type="url"
                    placeholder="https://open.spotify.com/playlist/..."
                    value={tempSpotifyUrl}
                    onChange={(e) => setTempSpotifyUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddPlaylist();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a Spotify playlist share link to add music to your focus sessions.
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPlaylistDialog(false);
                      setTempSpotifyUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddPlaylist}>
                    Add Playlist
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Spotify Player */}
            <div className="rounded-xl overflow-hidden shadow-lg backdrop-blur-md bg-white/10 border border-white/20">
              <iframe
                src={spotifyEmbedUrl}
                width="300"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Spotify Playlist"
              ></iframe>
            </div>
            {/* Remove button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePlaylist}
              className={`self-end rounded-full w-8 h-8 p-0 backdrop-blur-md bg-white/10 border border-white/20 hover:bg-red-500/20 hover:text-red-400 ${getPlaylistTextColor()}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isFullscreen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20">
          <span className={`text-sm ${settings.background !== 'none' ? 'text-white/70' : 'text-muted-foreground'}`}>
            Made by AetherSites
          </span>
          <a
            href="https://ko-fi.com/aethersites/shop"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Buy Me A Coffee ❤️
          </a>
        </div>
      )}
    </div>
  );
};