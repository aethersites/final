import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, ArrowRight, Link as LinkIcon, BookOpen } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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
const backgroundImages: Record<string, string | undefined> = {
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
  'galaxy-11': galaxy11
};
export function AICitation() {
  const [linksInput, setLinksInput] = useState("");
  const [format, setFormat] = useState("MLA");
  const [isGenerating, setIsGenerating] = useState(false);
  const [citations, setCitations] = useState<string[]>([]);
  const {
    toast
  } = useToast();
  const {
    settings
  } = useTheme();
  const backgroundImage = backgroundImages[settings.background];
  const handleGenerate = async () => {
    const links = linksInput.split('\n').map(link => link.trim()).filter(link => link.length > 0);
    if (links.length === 0) {
      toast({
        title: "No links provided",
        description: "Please enter at least one URL to generate citations.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    setCitations([]);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-citation", {
        body: {
          links,
          format
        }
      });
      if (error) throw error;
      setCitations(data.citations || []);
      toast({
        title: "Citations generated!",
        description: `Successfully generated ${data.citations?.length || 0} citation(s).`
      });
    } catch (error: any) {
      console.error("Error generating citations:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate citations",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const handleCopyAll = () => {
    navigator.clipboard.writeText(citations.join('\n\n'));
    toast({
      title: "Copied!",
      description: "All citations copied to clipboard"
    });
  };
  const handleCopySingle = (citation: string) => {
    navigator.clipboard.writeText(citation);
    toast({
      title: "Copied!",
      description: "Citation copied to clipboard"
    });
  };
  return <Layout>
      <div className="min-h-screen p-8 pt-24 relative" style={backgroundImage ? {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    } : {
      backgroundColor: '#1a1a2e'
    }}>
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              
              <h1 className="text-4xl font-bold text-white">AI Citation Generator</h1>
            </div>
            <p className="text-white/70">
              Enter URLs and generate properly formatted citations
            </p>
          </div>

          {/* Main Content - Two Cards with Arrow */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Left Card - Input Links */}
            <Card className="flex-1 p-6 backdrop-blur-xl bg-white/20 border-white/30 shadow-none">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-white" />
                  <Label className="text-lg font-semibold text-white">Enter URLs</Label>
                </div>
                <p className="text-sm text-white/60">
                  Enter one URL per line
                </p>
                <Textarea value={linksInput} onChange={e => setLinksInput(e.target.value)} placeholder="https://example.com/article1&#10;https://example.com/article2&#10;https://example.com/article3" className="flex-1 min-h-[300px] bg-white/10 border-white/30 text-white placeholder:text-white/40 resize-none" />
              </div>
            </Card>

            {/* Arrow + Controls */}
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              <div className="lg:hidden flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 rotate-90">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
              
              {/* Format Selection */}
              <div className="w-full max-w-[200px] space-y-2">
                <Label className="text-sm text-white/80">Citation Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/30">
                    <SelectItem value="MLA" className="text-white hover:bg-white/20">MLA</SelectItem>
                    <SelectItem value="APA" className="text-white hover:bg-white/20">APA 7th Edition</SelectItem>
                    <SelectItem value="Harvard" className="text-white hover:bg-white/20">Harvard</SelectItem>
                    <SelectItem value="Chicago" className="text-white hover:bg-white/20">Chicago/Turabian</SelectItem>
                    <SelectItem value="IEEE" className="text-white hover:bg-white/20">IEEE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full max-w-[200px] bg-white/20 hover:bg-white/30 text-white border border-white/30">
                {isGenerating ? <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </> : "Generate Citations"}
              </Button>
            </div>

            {/* Right Card - Output Citations */}
            <Card className="flex-1 p-6 backdrop-blur-xl bg-white/20 border-white/30 shadow-none">
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-white" />
                    <Label className="text-lg font-semibold text-white">Generated Citations</Label>
                  </div>
                  {citations.length > 0 && <Button size="sm" variant="ghost" onClick={handleCopyAll} className="text-white/70 hover:text-white hover:bg-white/20">
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </Button>}
                </div>
                
                <div className="flex-1 min-h-[300px] overflow-y-auto space-y-3">
                  {citations.length === 0 ? <div className="h-full flex items-center justify-center">
                      <p className="text-white/40 text-center">
                        Your generated citations will appear here
                      </p>
                    </div> : citations.map((citation, index) => <div key={index} className="p-4 bg-white/10 rounded-lg border border-white/20 group relative">
                        <p className="text-white text-sm pr-8">{citation}</p>
                        <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white hover:bg-white/20" onClick={() => handleCopySingle(citation)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>)}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>;
}