import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, X, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FlashcardImageUpload } from "./FlashcardImageUpload";

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

interface FlashcardEditorProps {
  set: FlashcardSet;
  onSave: (updatedSet: FlashcardSet) => void;
  onCancel: () => void;
}

export const FlashcardEditor = ({ set, onSave, onCancel }: FlashcardEditorProps) => {
  const [title, setTitle] = useState(set.title);
  const [description, setDescription] = useState(set.description || '');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load existing flashcards when component mounts
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const { data: existingCards, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('flashcard_set_id', set.id)
          .order('position', { ascending: true });

        if (error) throw error;

        if (existingCards && existingCards.length > 0) {
          setCards(existingCards);
        } else {
          // If no cards exist, create one empty card
          setCards([{
            id: `temp-${Date.now()}`,
            question: "",
            answer: "",
            flashcard_set_id: set.id,
            position: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }]);
        }
      } catch (error) {
        console.error('Error loading flashcards:', error);
        toast({
          title: "Error",
          description: "Failed to load existing flashcards.",
          variant: "destructive",
        });
        // Create empty card as fallback
        setCards([{
          id: `temp-${Date.now()}`,
          question: "",
          answer: "",
          flashcard_set_id: set.id,
          position: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [set.id, toast]);

  const addCard = () => {
    const newCard: Flashcard = {
      id: `temp-${Date.now()}`,
      question: "",
      answer: "",
      flashcard_set_id: set.id,
      position: cards.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCards([...cards, newCard]);
  };

  const updateCard = (id: string, field: 'question' | 'answer' | 'question_image' | 'answer_image', value: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const deleteCard = (id: string) => {
    if (cards.length > 1) {
      setCards(cards.filter(card => card.id !== id));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your flashcard set.",
        variant: "destructive",
      });
      return;
    }

    const validCards = cards.filter(card => card.question.trim() && card.answer.trim());
    
    if (validCards.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one complete flashcard (both question and answer).",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save flashcards.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
        // Update the flashcard set
        const { error: setError } = await supabase
          .from('flashcard_sets')
          .update({
            title: title.trim(),
            description: description.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', set.id);

      if (setError) throw setError;

      // Delete existing flashcards for this set
      const { error: deleteError } = await supabase
        .from('flashcards')
        .delete()
        .eq('flashcard_set_id', set.id);

      if (deleteError) throw deleteError;

      // Insert new flashcards
      const flashcardData = validCards.map((card, index) => ({
        flashcard_set_id: set.id,
        question: card.question.trim(),
        answer: card.answer.trim(),
        question_image: card.question_image || null,
        answer_image: card.answer_image || null,
        position: index,
      }));

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(flashcardData);

      if (cardsError) throw cardsError;

      // Update the parent component
      const updatedSet: FlashcardSet = {
        ...set,
        title: title.trim(),
        description: description.trim() || '',
        cards: validCards.map((card, index) => ({
          ...card,
          position: index,
          question: card.question.trim(),
          answer: card.answer.trim(),
        })),
        updated_at: new Date().toISOString(),
      };

      onSave(updatedSet);
      
      toast({
        title: "Success!",
        description: `Saved ${validCards.length} flashcard(s) successfully.`,
      });

    } catch (error) {
      console.error('Error saving flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to save flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-8 pt-20">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-8 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Edit Flashcard Set
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Set Details */}
        <Card>
          <CardHeader>
            <CardTitle>Set Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input
                id="title"
                placeholder="Flashcard set title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                placeholder="Brief description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Flashcards ({cards.length})</h2>
            <Button onClick={addCard} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Card
            </Button>
          </div>

          {cards.map((card, index) => (
            <Card key={card.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">Card {index + 1}</span>
                  {cards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCard(card.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {/* Question Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Question</label>
                    <Textarea
                      placeholder="Enter your question here..."
                      value={card.question}
                      onChange={(e) => updateCard(card.id, 'question', e.target.value)}
                      rows={3}
                    />
                    <FlashcardImageUpload
                      onImageUploaded={(url) => updateCard(card.id, 'question_image', url)}
                      existingImageUrl={card.question_image}
                      onImageRemoved={() => updateCard(card.id, 'question_image', '')}
                    />
                  </div>
                  
                  {/* Answer Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Answer</label>
                    <Textarea
                      placeholder="Enter the answer here..."
                      value={card.answer}
                      onChange={(e) => updateCard(card.id, 'answer', e.target.value)}
                      rows={3}
                    />
                    <FlashcardImageUpload
                      onImageUploaded={(url) => updateCard(card.id, 'answer_image', url)}
                      existingImageUrl={card.answer_image}
                      onImageRemoved={() => updateCard(card.id, 'answer_image', '')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};