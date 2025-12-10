import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, RotateCcw, Save, Sparkles, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAIRateLimit } from "@/hooks/useAIRateLimit";
import { UpgradePopup } from "@/components/UpgradePopup";
import { AdCards } from "@/components/AdCards";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export const AIFlashcards = () => {
  const [inputText, setInputText] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkAndShowUpgrade, recordUsage, showUpgradePopup, setShowUpgradePopup, getTimeUntilReset } = useAIRateLimit();
  const generateFlashcards = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate flashcards from.",
        variant: "destructive"
      });
      return;
    }
    if (inputText.length > 20000) {
      toast({
        title: "Error",
        description: "Text must be 20,000 characters or less.",
        variant: "destructive"
      });
      return;
    }
    
    // Check rate limit for free users
    if (!checkAndShowUpgrade('flashcards')) {
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: { text: inputText.trim() }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate flashcards. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data?.flashcards && Array.isArray(data.flashcards)) {
        // Record usage after successful generation
        recordUsage('flashcards');
        
        setFlashcards(data.flashcards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        toast({
          title: "Success!",
          description: `Generated ${data.flashcards.length} flashcards from your text.`
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };
  const flipCard = () => {
    setIsFlipped(prev => !prev);
  };
  const saveFlashcardsToDatabase = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (flashcards.length === 0) return;
    try {
      const {
        data: newSet,
        error: setError
      } = await supabase.from('flashcard_sets').insert({
        title: `AI Generated - ${new Date().toLocaleDateString()}`,
        description: `Generated from: ${inputText.slice(0, 100)}...`,
        user_id: user.id,
        is_public: false,
        tags: ['AI-generated']
      }).select().single();
      if (setError) throw setError;
      const flashcardData = flashcards.map((card, index) => ({
        flashcard_set_id: newSet.id,
        question: card.question,
        answer: card.answer,
        position: index
      }));
      const {
        error: cardsError
      } = await supabase.from('flashcards').insert(flashcardData);
      if (cardsError) throw cardsError;
      toast({
        title: "Saved!",
        description: "Flashcards saved to your collection successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save flashcards to your collection.",
        variant: "destructive"
      });
    }
  };
  const resetCards = () => {
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setInputText("");
  };
  const currentCard = flashcards[currentCardIndex];
  return <Layout>
      <div className="min-h-screen p-6 pt-28 md:p-8 md:pt-32">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl space-y-8">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI-Powered Learning
              </div>
              <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-foreground">
                Flashcard Generator
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto font-light text-base md:text-lg">
                Turn your study materials into beautiful flashcards instantly
              </p>
            </div>

            {/* Input Section */}
            {flashcards.length === 0 && <div className="relative group">
                {/* Glass glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative backdrop-blur-xl bg-background/60 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="study-text" className="text-sm font-medium text-foreground/80 flex items-center justify-between">
                        <span>Study Material</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {inputText.length.toLocaleString()}/20,000
                        </span>
                      </label>
                      <Textarea id="study-text" placeholder="Paste your study material here... (lecture notes, textbook content, articles, etc.)" value={inputText} onChange={e => setInputText(e.target.value)} onFocus={() => !user && setShowLoginPrompt(true)} className="min-h-[180px] md:min-h-[220px] resize-none bg-white/50 dark:bg-white/5 border-white/30 rounded-2xl placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all" maxLength={20000} />
                    </div>
                    <Button onClick={generateFlashcards} disabled={isGenerating || !inputText.trim()} className="w-full h-12 md:h-14 rounded-2xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 transition-all duration-300 hover:shadow-xl hover:shadow-foreground/20 hover:-translate-y-0.5" size="lg">
                      
                      {isGenerating ? "Generating Flashcards..." : "Generate Flashcards"}
                    </Button>
                  </div>
                </div>
              </div>}

            {/* Flashcard Display */}
            {flashcards.length > 0 && <div className="space-y-6">
                {/* Actions Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-sm text-muted-foreground">
                    {flashcards.length} flashcards generated
                  </div>
                  <div className="flex gap-2">
                    {user && <Button onClick={saveFlashcardsToDatabase} variant="outline" className="rounded-full gap-2 border-white/30 bg-white/50 dark:bg-white/5 hover:bg-white/70 backdrop-blur-sm">
                        <Save className="w-4 h-4" />
                        Save
                      </Button>}
                    <Button onClick={resetCards} variant="ghost" className="rounded-full gap-2 hover:bg-primary/10">
                      <RotateCcw className="w-4 h-4" />
                      New Set
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {currentCardIndex + 1} / {flashcards.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out" style={{
                  width: `${(currentCardIndex + 1) / flashcards.length * 100}%`
                }} />
                  </div>
                </div>

                {/* Flashcard */}
                <div className="relative group cursor-pointer perspective-1000" onClick={flipCard}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                  <div className={`relative w-full h-72 md:h-80 transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                    {/* Front */}
                    <div className="absolute inset-0 backdrop-blur-xl bg-background/60 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5 flex flex-col items-center justify-center backface-hidden" style={{
                  backfaceVisibility: 'hidden'
                }}>
                      <div className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-4">
                        Question
                      </div>
                      <div className="text-lg md:text-xl font-light text-center leading-relaxed text-foreground max-w-lg">
                        {currentCard.question}
                      </div>
                      <div className="absolute bottom-6 flex items-center gap-2 text-xs text-muted-foreground">
                        <RotateCw className="w-3 h-3" />
                        Tap to flip
                      </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5 flex flex-col items-center justify-center backface-hidden rotate-y-180" style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}>
                      <div className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-4">
                        Answer
                      </div>
                      <div className="text-lg md:text-xl font-light text-center leading-relaxed text-foreground max-w-lg">
                        {currentCard.answer}
                      </div>
                      <div className="absolute bottom-6 flex items-center gap-2 text-xs text-muted-foreground">
                        <RotateCw className="w-3 h-3" />
                        Tap to flip
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={prevCard} disabled={currentCardIndex === 0} className="w-12 h-12 rounded-2xl border-white/30 bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 backdrop-blur-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <Button variant="secondary" onClick={flipCard} className="px-8 h-12 rounded-2xl bg-primary/10 hover:bg-primary/20 text-foreground backdrop-blur-sm font-medium">
                    {isFlipped ? "Show Question" : "Show Answer"}
                  </Button>

                  <Button variant="outline" size="icon" onClick={nextCard} disabled={currentCardIndex === flashcards.length - 1} className="w-12 h-12 rounded-2xl border-white/30 bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 backdrop-blur-sm">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>}
          </div>

          {/* Ad Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <AdCards />
          </div>
        </div>
      </div>

      <UpgradePopup isOpen={showUpgradePopup} onClose={() => setShowUpgradePopup(false)} feature="AI Flashcard Generation" />
      <LoginPromptDialog open={showLoginPrompt} />
    </Layout>;
};