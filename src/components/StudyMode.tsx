import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  question_image?: string;
  answer_image?: string;
  flashcard_set_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  tags: string[] | null;
}

interface StudyModeProps {
  set: FlashcardSet;
  currentIndex: number;
  isFlipped: boolean;
  onNext: () => void;
  onPrev: () => void;
  onFlip: () => void;
  onExit: () => void;
}

export const StudyMode = ({ set, currentIndex, isFlipped, onNext, onPrev, onFlip, onExit }: StudyModeProps) => {
  const currentCard = set.cards[currentIndex];
  const progress = ((currentIndex + 1) / set.cards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-8 pt-20">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onExit} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sets
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{set.title}</h1>
              <p className="text-muted-foreground">{set.description}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Card {currentIndex + 1} of {set.cards.length}
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center">
          <Card 
            className="w-full max-w-2xl min-h-[400px] cursor-pointer transform transition-all duration-500 hover:scale-105"
            onClick={onFlip}
          >
            <CardContent className="p-8 h-full flex items-center justify-center">
              <div className="text-center space-y-6 w-full">
                <div className="text-sm font-medium text-primary uppercase tracking-wider">
                  {isFlipped ? "Answer" : "Question"}
                </div>
                
                <div className="space-y-4">
                  {/* Text content */}
                  <div className="text-lg leading-relaxed min-h-[60px] flex items-center justify-center">
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </div>
                  
                  {/* Image content */}
                  {(isFlipped ? currentCard.answer_image : currentCard.question_image) && (
                    <div className="flex justify-center mt-4">
                      <img 
                        src={isFlipped ? currentCard.answer_image : currentCard.question_image}
                        alt={isFlipped ? "Answer image" : "Question image"}
                        className="max-w-xs max-h-32 object-contain rounded-2xl shadow-lg border border-border/20 animate-fade-in"
                        onLoad={() => console.log('Study mode image loaded successfully')}
                        onError={(e) => console.error('Study mode image failed to load:', e)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Click to {isFlipped ? "see question" : "reveal answer"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="lg"
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>
          
          <div className="text-center">
            <Button
              variant="secondary"
              onClick={onFlip}
              className="min-w-[120px]"
            >
              {isFlipped ? "Show Question" : "Show Answer"}
            </Button>
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={onNext}
            disabled={currentIndex === set.cards.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};