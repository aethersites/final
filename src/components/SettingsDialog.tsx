import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTheme, ColorTheme, BackgroundType, FontFamily } from "@/contexts/ThemeContext";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePopup } from "@/components/UpgradePopup";
import { HexColorPicker } from "react-colorful";
import { X, Crown, Upload } from "lucide-react";

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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorOptions: { value: ColorTheme; label: string; color: string; isPro?: boolean }[] = [
  { value: 'black', label: 'Black', color: 'bg-gray-800' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
];

const proColorOptions: { value: ColorTheme; label: string; gradient: string }[] = [
  { value: 'gradient-sunset', label: 'Sunset', gradient: 'linear-gradient(135deg, #ff6b6b, #ffa726)' },
  { value: 'gradient-ocean', label: 'Ocean', gradient: 'linear-gradient(135deg, #4fc3f7, #26c6da)' },
  { value: 'gradient-purple', label: 'Purple Magic', gradient: 'linear-gradient(135deg, #ab47bc, #e91e63)' },
  { value: 'gradient-fire', label: 'Fire', gradient: 'linear-gradient(135deg, #ff9800, #ffeb3b)' },
  { value: 'gradient-nature', label: 'Nature', gradient: 'linear-gradient(135deg, #66bb6a, #8bc34a)' },
  { value: 'gradient-midnight', label: 'Midnight Sky', gradient: 'linear-gradient(135deg, #001f4d, #1a1a80)' },
  { value: 'gradient-candy', label: 'Candy', gradient: 'linear-gradient(135deg, #ff69b4, #98ff98)' },
];

const backgroundImages = {
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

const backgroundOptions = [
  { category: 'Nature', options: [
    { value: 'nature-1' as BackgroundType, image: nature1 },
    { value: 'nature-2' as BackgroundType, image: nature2 },
    { value: 'nature-3' as BackgroundType, image: nature3 },
    { value: 'nature-4' as BackgroundType, image: nature4 },
    { value: 'nature-5' as BackgroundType, image: nature5 },
    { value: 'nature-6' as BackgroundType, image: nature6 },
    { value: 'nature-7' as BackgroundType, image: nature7 },
    { value: 'nature-8' as BackgroundType, image: nature8 },
    { value: 'nature-9' as BackgroundType, image: nature9 },
    { value: 'nature-10' as BackgroundType, image: nature10 },
    { value: 'nature-11' as BackgroundType, image: nature11 },
    { value: 'nature-12' as BackgroundType, image: nature12 },
  ]},
  { category: 'Modern', options: [
    { value: 'modern-1' as BackgroundType, image: modern1 },
    { value: 'modern-2' as BackgroundType, image: modern2 },
    { value: 'modern-3' as BackgroundType, image: modern3 },
    { value: 'modern-4' as BackgroundType, image: modern4 },
    { value: 'modern-5' as BackgroundType, image: modern5 },
    { value: 'modern-6' as BackgroundType, image: modern6 },
    { value: 'modern-7' as BackgroundType, image: modern7 },
  ]},
  { category: 'Galaxy', options: [
    { value: 'galaxy-1' as BackgroundType, image: galaxy1 },
    { value: 'galaxy-2' as BackgroundType, image: galaxy2 },
    { value: 'galaxy-3' as BackgroundType, image: galaxy3 },
    { value: 'galaxy-4' as BackgroundType, image: galaxy4 },
    { value: 'galaxy-5' as BackgroundType, image: galaxy5 },
    { value: 'galaxy-6' as BackgroundType, image: galaxy6 },
    { value: 'galaxy-7' as BackgroundType, image: galaxy7 },
    { value: 'galaxy-8' as BackgroundType, image: galaxy8 },
    { value: 'galaxy-9' as BackgroundType, image: galaxy9 },
    { value: 'galaxy-10' as BackgroundType, image: galaxy10 },
    { value: 'galaxy-11' as BackgroundType, image: galaxy11 },
  ]},
];

const fontOptions = [
  { value: 'mono' as FontFamily, label: 'Monospace', className: 'font-mono' },
  { value: 'roboto' as FontFamily, label: 'Roboto', className: 'font-roboto' },
  { value: 'playfair' as FontFamily, label: 'Playfair Display', className: 'font-playfair' },
  { value: 'inter' as FontFamily, label: 'Inter', className: 'font-inter' },
  { value: 'poppins' as FontFamily, label: 'Poppins', className: 'font-poppins' },
];

export const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const { settings, updateColorTheme, updateMode, updateBackground, updateFont, updateCustomColor, updateCustomGradient } = useTheme();
  const { isProUser } = useSubscription();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showCustomGradient, setShowCustomGradient] = useState(false);
  const [customColor, setCustomColor] = useState('#ff0000');
  const [gradientStartColor, setGradientStartColor] = useState('#ff0000');
  const [gradientEndColor, setGradientEndColor] = useState('#0000ff');

  const handleProFeatureClick = () => {
    if (!isProUser) {
      setShowUpgradePopup(true);
    }
  };

  const handleCustomImageUpload = () => {
    if (!isProUser) {
      setShowUpgradePopup(true);
      return;
    }
    // TODO: Implement custom image upload
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Color Theme Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Theme Color</Label>
            
            {/* Free Colors */}
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.colorTheme === option.value ? "default" : "outline"}
                  onClick={() => updateColorTheme(option.value)}
                  className="flex items-center gap-2 h-12"
                >
                  <div className={`w-4 h-4 rounded-full ${option.color}`} />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>

            {/* Pro Gradient Colors */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <Label className="text-sm font-medium text-muted-foreground">Pro Gradients</Label>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {proColorOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.colorTheme === option.value ? "default" : "outline"}
                    onClick={() => {
                      if (isProUser) {
                        updateColorTheme(option.value);
                      } else {
                        handleProFeatureClick();
                      }
                    }}
                    className="flex flex-col items-center gap-2 h-16 relative text-xs"
                    disabled={!isProUser}
                  >
                    <div 
                      className="w-5 h-5 rounded-full"
                      style={{ background: option.gradient }}
                    />
                    <span className="text-center leading-tight">{option.label}</span>
                    {!isProUser && <Crown className="w-3 h-3 text-yellow-500 absolute top-1 right-1" />}
                  </Button>
                ))}
                
                {/* Custom Gradient */}
                <Button
                  variant={settings.colorTheme === 'custom-gradient' ? "default" : "outline"}
                  onClick={() => {
                    if (isProUser) {
                      setShowCustomGradient(!showCustomGradient);
                    } else {
                      handleProFeatureClick();
                    }
                  }}
                  className="flex flex-col items-center gap-2 h-16 relative text-xs"
                  disabled={!isProUser}
                >
                  <div className="flex gap-1">
                    <div 
                      className="w-2.5 h-5 rounded-l-full"
                      style={{ backgroundColor: settings.customGradientStart || '#ff0000' }}
                    />
                    <div 
                      className="w-2.5 h-5 rounded-r-full"
                      style={{ backgroundColor: settings.customGradientEnd || '#0000ff' }}
                    />
                  </div>
                  <span className="text-center leading-tight">Custom Gradient</span>
                  {!isProUser && <Crown className="w-3 h-3 text-yellow-500 absolute top-1 right-1" />}
                </Button>
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <Label className="text-sm font-medium text-muted-foreground">Custom Color</Label>
              </div>
              <Button
                variant={settings.colorTheme === 'custom' ? "default" : "outline"}
                onClick={() => {
                  if (isProUser) {
                    setShowColorPicker(!showColorPicker);
                  } else {
                    handleProFeatureClick();
                  }
                }}
                className="flex items-center gap-2 h-12 w-full relative"
                disabled={!isProUser}
              >
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: settings.customColor || customColor }}
                />
                <span>Custom Color</span>
                {!isProUser && <Crown className="w-3 h-3 text-yellow-500 absolute top-1 right-1" />}
              </Button>
              
              {showColorPicker && isProUser && (
                <div className="p-4 border rounded-lg space-y-4">
                  <HexColorPicker 
                    color={settings.customColor || customColor} 
                    onChange={(color) => {
                      setCustomColor(color);
                      updateCustomColor(color);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.customColor || customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        updateCustomColor(e.target.value);
                      }}
                      placeholder="#ff0000"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowColorPicker(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Custom Gradient Picker */}
              {showCustomGradient && isProUser && (
                <div className="p-6 border rounded-lg space-y-4 max-w-md">
                  <h4 className="font-medium">Custom Gradient Colors</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Start Color</Label>
                      <HexColorPicker 
                        color={settings.customGradientStart || gradientStartColor} 
                        onChange={(color) => {
                          setGradientStartColor(color);
                          updateCustomGradient(color, settings.customGradientEnd || gradientEndColor);
                        }}
                      />
                      <Input
                        value={settings.customGradientStart || gradientStartColor}
                        onChange={(e) => {
                          setGradientStartColor(e.target.value);
                          updateCustomGradient(e.target.value, settings.customGradientEnd || gradientEndColor);
                        }}
                        placeholder="#ff0000"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">End Color</Label>
                      <HexColorPicker 
                        color={settings.customGradientEnd || gradientEndColor} 
                        onChange={(color) => {
                          setGradientEndColor(color);
                          updateCustomGradient(settings.customGradientStart || gradientStartColor, color);
                        }}
                      />
                      <Input
                        value={settings.customGradientEnd || gradientEndColor}
                        onChange={(e) => {
                          setGradientEndColor(e.target.value);
                          updateCustomGradient(settings.customGradientStart || gradientStartColor, e.target.value);
                        }}
                        placeholder="#0000ff"
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div 
                      className="flex-1 h-8 rounded border"
                      style={{ 
                        background: `linear-gradient(135deg, ${settings.customGradientStart || gradientStartColor}, ${settings.customGradientEnd || gradientEndColor})` 
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomGradient(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-base font-medium">Dark Mode</Label>
            <Switch
              checked={settings.mode === 'dark'}
              onCheckedChange={(checked) => updateMode(checked ? 'dark' : 'light')}
            />
          </div>

          {/* Background Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Background</Label>
            
            {/* None Option */}
            <div className="grid grid-cols-1 gap-3 mb-4">
              <Button
                variant={settings.background === 'none' ? "default" : "outline"}
                onClick={() => updateBackground('none')}
                className="h-16 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="font-medium">None</div>
                  <div className="text-sm text-muted-foreground">Plain background</div>
                </div>
              </Button>
            </div>

            {/* Custom Image Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <Label className="text-sm font-medium text-muted-foreground">Custom Background</Label>
              </div>
              <Button
                variant="outline"
                onClick={handleCustomImageUpload}
                className="h-16 flex items-center justify-center gap-2 relative"
                disabled={!isProUser}
              >
                <Upload className="w-4 h-4" />
                <div className="text-center">
                  <div className="font-medium">Upload Custom Image</div>
                  <div className="text-sm text-muted-foreground">Pro feature</div>
                </div>
                {!isProUser && <Crown className="w-3 h-3 text-yellow-500 absolute top-1 right-1" />}
              </Button>
            </div>

            {/* Background Categories */}
            {backgroundOptions.map((category) => (
              <div key={category.category} className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {category.category}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {category.options.map((bg) => (
                    <Button
                      key={bg.value}
                      variant={settings.background === bg.value ? "default" : "outline"}
                      onClick={() => updateBackground(bg.value)}
                      className="h-24 p-1 overflow-hidden"
                    >
                      <div className="relative w-full h-full rounded">
                        <img
                          src={bg.image}
                          alt={`Background ${bg.value}`}
                          className="w-full h-full object-cover rounded"
                        />
                        {settings.background === bg.value && (
                          <div className="absolute inset-0 bg-primary/20 rounded flex items-center justify-center">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Font Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Clock Font</Label>
            <div className="grid grid-cols-2 gap-3">
              {fontOptions.map((font) => (
                <Button
                  key={font.value}
                  variant={settings.font === font.value ? "default" : "outline"}
                  onClick={() => updateFont(font.value)}
                  className={`h-12 ${font.className}`}
                >
                  {font.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Upgrade Popup */}
      <UpgradePopup 
        isOpen={showUpgradePopup} 
        onClose={() => setShowUpgradePopup(false)} 
        feature="premium themes and custom colors" 
      />
    </Dialog>
  );
};
