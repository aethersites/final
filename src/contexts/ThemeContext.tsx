import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ColorTheme = 'black' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gradient-sunset' | 'gradient-ocean' | 'gradient-purple' | 'gradient-fire' | 'gradient-nature' | 'gradient-midnight' | 'gradient-candy' | 'custom' | 'custom-gradient';
export type ThemeMode = 'light' | 'dark';
export type BackgroundType = 'none' | 'custom' | 'nature-1' | 'nature-2' | 'nature-3' | 'nature-4' | 'nature-5' | 'nature-6' | 'nature-7' | 'nature-8' | 'nature-9' | 'nature-10' | 'nature-11' | 'nature-12' | 'modern-1' | 'modern-2' | 'modern-3' | 'modern-4' | 'modern-5' | 'modern-6' | 'modern-7' | 'galaxy-1' | 'galaxy-2' | 'galaxy-3' | 'galaxy-4' | 'galaxy-5' | 'galaxy-6' | 'galaxy-7' | 'galaxy-8' | 'galaxy-9' | 'galaxy-10' | 'galaxy-11';
export type FontFamily = 'mono' | 'roboto' | 'playfair' | 'inter' | 'poppins';

interface ThemeSettings {
  colorTheme: ColorTheme;
  mode: ThemeMode;
  background: BackgroundType;
  font: FontFamily;
  customColor?: string;
  customBackgroundUrl?: string;
  customGradientStart?: string;
  customGradientEnd?: string;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateColorTheme: (color: ColorTheme) => void;
  updateMode: (mode: ThemeMode) => void;
  updateBackground: (bg: BackgroundType) => void;
  updateFont: (font: FontFamily) => void;
  updateCustomColor: (color: string) => void;
  updateCustomBackground: (url: string) => void;
  updateCustomGradient: (startColor: string, endColor: string) => void;
}

const defaultSettings: ThemeSettings = {
  colorTheme: 'black',
  mode: 'light',
  background: 'nature-9',
  font: 'mono',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorThemes: Record<ColorTheme, { primary: string; hover: string; gradient?: string }> = {
  black: { primary: '220 9% 15%', hover: '220 9% 25%' },
  red: { primary: '9 87% 67%', hover: '9 87% 60%' },
  orange: { primary: '25 95% 53%', hover: '25 95% 48%' },
  yellow: { primary: '45 93% 58%', hover: '45 93% 53%' },
  green: { primary: '160 84% 39%', hover: '160 84% 34%' },
  blue: { primary: '217 91% 60%', hover: '217 91% 55%' },
  purple: { primary: '262 83% 58%', hover: '262 83% 53%' },
  pink: { primary: '322 71% 52%', hover: '322 71% 47%' },
  // Pro gradient themes
  'gradient-sunset': { primary: '15 91% 67%', hover: '15 91% 60%', gradient: 'linear-gradient(135deg, #ff6b6b, #ffa726)' },
  'gradient-ocean': { primary: '195 87% 60%', hover: '195 87% 55%', gradient: 'linear-gradient(135deg, #4fc3f7, #26c6da)' },
  'gradient-purple': { primary: '262 83% 58%', hover: '262 83% 53%', gradient: 'linear-gradient(135deg, #ab47bc, #e91e63)' },
  'gradient-fire': { primary: '35 95% 53%', hover: '35 95% 48%', gradient: 'linear-gradient(135deg, #ff9800, #ffeb3b)' },
  'gradient-nature': { primary: '120 84% 39%', hover: '120 84% 34%', gradient: 'linear-gradient(135deg, #66bb6a, #8bc34a)' },
  'gradient-midnight': { primary: '225 100% 20%', hover: '225 100% 15%', gradient: 'linear-gradient(135deg, #001f4d, #1a1a80)' },
  'gradient-candy': { primary: '318 64% 70%', hover: '318 64% 65%', gradient: 'linear-gradient(135deg, #ff69b4, #98ff98)' },
  custom: { primary: '220 9% 15%', hover: '220 9% 25%' },
  'custom-gradient': { primary: '220 9% 15%', hover: '220 9% 25%' },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);

  // Load settings from localStorage on mount and sync with user profile
  useEffect(() => {
    const loadSettings = async () => {
      // First try localStorage for immediate loading
      const savedSettings = localStorage.getItem('pomodoro-theme-settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error('Failed to parse saved theme settings:', error);
        }
      }

          // Then sync with user profile from database (skip theme_settings for now)
          try {
            const { data: { user } } = await supabase.auth.getUser();
            // TODO: Add theme_settings support once column is added to database
          } catch (error) {
            console.error('Failed to load theme settings from profile:', error);
          }
    };

    loadSettings();
  }, []);

  // Apply theme changes to CSS variables and save to database
  useEffect(() => {
    const applyAndSaveSettings = async () => {
      const root = document.documentElement;
      const theme = colorThemes[settings.colorTheme];
      
      // Helper function to convert hex to HSL
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
          h = s = 0;
        } else {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h! /= 6;
        }
        
        return `${Math.round(h! * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
      };
      
      // Handle custom color
      if (settings.colorTheme === 'custom' && settings.customColor) {
        const hslColor = hexToHsl(settings.customColor);
        root.style.setProperty('--pomodoro', hslColor);
        root.style.setProperty('--pomodoro-hover', hslColor);
        root.style.setProperty('--primary', hslColor);
        root.style.setProperty('--primary-hover', hslColor);
        root.style.setProperty('--ring', hslColor);
      } else if (settings.colorTheme === 'custom-gradient' && settings.customGradientStart && settings.customGradientEnd) {
        // Handle custom gradient
        const customGradient = `linear-gradient(135deg, ${settings.customGradientStart}, ${settings.customGradientEnd})`;
        root.style.setProperty('--gradient-primary', customGradient);
        // Use the start color as the primary color for non-gradient elements
        const hslColor = hexToHsl(settings.customGradientStart);
        root.style.setProperty('--pomodoro', hslColor);
        root.style.setProperty('--pomodoro-hover', hslColor);
        root.style.setProperty('--primary', hslColor);
        root.style.setProperty('--primary-hover', hslColor);
        root.style.setProperty('--ring', hslColor);
      } else {
        root.style.setProperty('--pomodoro', theme.primary);
        root.style.setProperty('--pomodoro-hover', theme.hover);
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--primary-hover', theme.hover);
        root.style.setProperty('--ring', theme.primary);
      }

      // Apply gradient backgrounds for gradient themes
      if (theme.gradient) {
        root.style.setProperty('--gradient-primary', theme.gradient);
      } else {
        root.style.removeProperty('--gradient-primary');
      }

      // Apply dark/light mode
      if (settings.mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Save to localStorage for immediate access
      localStorage.setItem('pomodoro-theme-settings', JSON.stringify(settings));

      // Save to user profile in database (skip for now)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        // TODO: Add theme_settings support once column is added
      } catch (error) {
        console.error('Failed to save theme settings to profile:', error);
      }
    };

    applyAndSaveSettings();
  }, [settings]);

  const updateColorTheme = (color: ColorTheme) => {
    setSettings(prev => ({ ...prev, colorTheme: color }));
  };

  const updateMode = (mode: ThemeMode) => {
    setSettings(prev => ({ ...prev, mode }));
  };

  const updateBackground = (bg: BackgroundType) => {
    setSettings(prev => ({ ...prev, background: bg }));
  };

  const updateFont = (font: FontFamily) => {
    setSettings(prev => ({ ...prev, font }));
  };

  const updateCustomColor = (color: string) => {
    setSettings(prev => ({ ...prev, customColor: color, colorTheme: 'custom' }));
  };

  const updateCustomBackground = (url: string) => {
    setSettings(prev => ({ ...prev, customBackgroundUrl: url, background: 'custom' }));
  };

  const updateCustomGradient = (startColor: string, endColor: string) => {
    setSettings(prev => ({ 
      ...prev, 
      customGradientStart: startColor, 
      customGradientEnd: endColor, 
      colorTheme: 'custom-gradient' 
    }));
  };

  return (
    <ThemeContext.Provider value={{ 
      settings, 
      updateColorTheme, 
      updateMode, 
      updateBackground,
      updateFont,
      updateCustomColor,
      updateCustomBackground,
      updateCustomGradient
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};