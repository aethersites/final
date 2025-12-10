import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTheme, ColorTheme, BackgroundType, FontFamily } from "@/contexts/ThemeContext";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradePopup } from "@/components/UpgradePopup";
import { Layout } from "@/components/Layout";
import { HexColorPicker } from "react-colorful";
import { Crown, Upload } from "lucide-react";
import { useState } from "react";

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

const colorOptions: { value: ColorTheme; label: string; color: string }[] = [
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

export const Themes = () => {
  const { settings, updateColorTheme, updateMode, updateBackground, updateFont, updateCustomColor } = useTheme();
  const { isProUser } = useSubscription();
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#ff0000');

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
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Theme Settings</h1>
          <p className="text-muted-foreground">Customize your pomodoro timer appearance</p>
        </div>

        <div className="space-y-12">
          {/* Color Theme Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Theme Color</h2>
              <p className="text-sm text-muted-foreground">Choose your primary color theme</p>
            </div>
            
            {/* Free Colors */}
            <div className="grid grid-cols-4 gap-4">
              {colorOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={settings.colorTheme === option.value ? "default" : "outline"}
                  onClick={() => updateColorTheme(option.value)}
                  className="flex items-center gap-3 h-14"
                >
                  <div className={`w-5 h-5 rounded-full ${option.color}`} />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>

            {/* Pro Gradient Colors */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Pro Gradients</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
                    className="flex items-center gap-3 h-14 relative"
                    disabled={!isProUser}
                  >
                    <div 
                      className="w-5 h-5 rounded-full"
                      style={{ background: option.gradient }}
                    />
                    <span>{option.label}</span>
                    {!isProUser && <Crown className="w-4 h-4 text-yellow-500 absolute top-2 right-2" />}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Custom Color</h3>
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
                className="flex items-center gap-3 h-14 w-full max-w-md relative"
                disabled={!isProUser}
              >
                <div 
                  className="w-5 h-5 rounded-full border"
                  style={{ backgroundColor: settings.customColor || customColor }}
                />
                <span>Custom Color Wheel</span>
                {!isProUser && <Crown className="w-4 h-4 text-yellow-500 absolute top-2 right-2" />}
              </Button>
              
              {showColorPicker && isProUser && (
                <div className="p-6 border rounded-lg space-y-4 max-w-md">
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
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Appearance Mode</h2>
              <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
              </div>
              <Switch
                checked={settings.mode === 'dark'}
                onCheckedChange={(checked) => updateMode(checked ? 'dark' : 'light')}
              />
            </div>
          </div>

          {/* Background Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Background</h2>
              <p className="text-sm text-muted-foreground">Select a background image for your workspace</p>
            </div>
            
            {/* None Option */}
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant={settings.background === 'none' ? "default" : "outline"}
                onClick={() => updateBackground('none')}
                className="h-20 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="font-medium">None</div>
                  <div className="text-sm text-muted-foreground">Plain background</div>
                </div>
              </Button>
            </div>

            {/* Custom Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Custom Background</h3>
              </div>
              <Button
                variant="outline"
                onClick={handleCustomImageUpload}
                className="h-20 flex items-center justify-center gap-3 max-w-md relative"
                disabled={!isProUser}
              >
                <Upload className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium">Upload Custom Image</div>
                  <div className="text-sm text-muted-foreground">Pro feature - Upload your own background</div>
                </div>
                {!isProUser && <Crown className="w-4 h-4 text-yellow-500 absolute top-2 right-2" />}
              </Button>
            </div>

            {/* Background Categories */}
            {backgroundOptions.map((category) => (
              <div key={category.category} className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">
                  {category.category}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {category.options.map((bg) => (
                    <Button
                      key={bg.value}
                      variant={settings.background === bg.value ? "default" : "outline"}
                      onClick={() => updateBackground(bg.value)}
                      className="h-32 p-2 overflow-hidden"
                    >
                      <div className="relative w-full h-full rounded">
                        <img
                          src={bg.image}
                          alt={`Background ${bg.value}`}
                          className="w-full h-full object-cover rounded"
                        />
                        {settings.background === bg.value && (
                          <div className="absolute inset-0 bg-primary/30 rounded flex items-center justify-center">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-primary-foreground rounded-full" />
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
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Clock Font</h2>
              <p className="text-sm text-muted-foreground">Choose the font for your timer display</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {fontOptions.map((font) => (
                <Button
                  key={font.value}
                  variant={settings.font === font.value ? "default" : "outline"}
                  onClick={() => updateFont(font.value)}
                  className={`h-16 text-lg ${font.className}`}
                >
                  {font.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Upgrade Popup */}
      <UpgradePopup 
        isOpen={showUpgradePopup} 
        onClose={() => setShowUpgradePopup(false)} 
        feature="premium themes and custom colors" 
      />
    </Layout>
  );
};