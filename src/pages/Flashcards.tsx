import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Edit, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { FlashcardEditor } from "@/components/FlashcardEditor";
import { StudyMode } from "@/components/StudyMode";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useEffect } from "react";

// Extended flashcard interfaces with UI properties
interface FlashcardSetUI extends Omit<Tables<'flashcard_sets'>, 'is_public' | 'created_at'> {
  isPublic: boolean;
  createdAt: string;
  cards: FlashcardUI[];
}

interface FlashcardUI extends Tables<'flashcards'> {
  // UI flashcard inherits all database properties
}

export const Flashcards = () => {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetUI[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardUI[]>([]);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<FlashcardSetUI | null>(null);
  const [studyingSet, setStudyingSet] = useState<FlashcardSetUI | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load flashcard sets and cards from Supabase
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Load flashcard sets
      const { data: setsData, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (setsError) throw setsError;
      
      // Transform to UI format
      const transformedSets: FlashcardSetUI[] = (setsData || []).map(set => ({
        ...set,
        isPublic: set.is_public,
        createdAt: set.created_at,
        cards: [], // Will be populated from flashcards
      }));
      
      setFlashcardSets(transformedSets);

      // Load all flashcards for the user's sets
      if (transformedSets.length > 0) {
        const setIds = transformedSets.map(set => set.id);
        const { data: cardsData, error: cardsError } = await supabase
          .from('flashcards')
          .select('*')
          .in('flashcard_set_id', setIds)
          .order('position', { ascending: true });

        if (cardsError) throw cardsError;
        setFlashcards(cardsData || []);
      } else {
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to load your flashcards.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const createNewSet = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    if (!newSetTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your flashcard set.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: newSet, error } = await supabase
        .from('flashcard_sets')
        .insert({
          title: newSetTitle,
          description: newSetDescription || null,
          user_id: user.id,
          is_public: false,
          tags: []
        })
        .select()
        .single();

      if (error) throw error;

      const transformedSet: FlashcardSetUI = {
        ...newSet,
        isPublic: newSet.is_public,
        createdAt: newSet.created_at,
        cards: [],
      };

      // Reset form and close dialog
      setNewSetTitle("");
      setNewSetDescription("");
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success!",
        description: "New flashcard set created successfully.",
      });

      // Reload data to ensure consistency
      await loadData();
      
      // Set editing after data is reloaded
      setEditingSet(transformedSet);
    } catch (error) {
      console.error('Error creating flashcard set:', error);
      toast({
        title: "Error",
        description: "Failed to create flashcard set.",
        variant: "destructive",
      });
    }
  };

  const deleteSet = async (id: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Flashcard set deleted successfully.",
      });
      
      // Reload data to ensure consistency
      await loadData();
    } catch (error) {
      console.error('Error deleting flashcard set:', error);
      toast({
        title: "Error",
        description: "Failed to delete flashcard set.",
        variant: "destructive",
      });
    }
  };

  const startStudying = (set: FlashcardSetUI) => {
    const setCards = flashcards.filter(card => card.flashcard_set_id === set.id);
    if (setCards.length === 0) {
      toast({
        title: "No cards",
        description: "Add some flashcards before studying.",
        variant: "destructive",
      });
      return;
    }
    setStudyingSet(set);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (studyingSet) {
      const setCards = flashcards.filter(card => card.flashcard_set_id === studyingSet.id);
      if (currentCardIndex < setCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      }
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

  const updateFlashcardSet = async (updatedSet: FlashcardSetUI) => {
    setEditingSet(null);
    // Reload all data to ensure flashcards are up to date
    await loadData();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Render study mode
  if (studyingSet) {
    const setCards = flashcards.filter(card => card.flashcard_set_id === studyingSet.id);
    return (
      <Layout>
        <StudyMode
          set={{
            ...studyingSet,
            is_public: studyingSet.isPublic,
            created_at: studyingSet.createdAt,
            cards: setCards
          }}
          currentIndex={currentCardIndex}
          isFlipped={isFlipped}
          onNext={nextCard}
          onPrev={prevCard}
          onFlip={flipCard}
          onExit={() => setStudyingSet(null)}
        />
      </Layout>
    );
  }

  // Render editor mode
  if (editingSet) {
    return (
      <Layout>
        <FlashcardEditor
          set={{
            ...editingSet,
            is_public: editingSet.isPublic,
            created_at: editingSet.createdAt,
          }}
          onSave={(updatedSet) => {
            const transformedSet: FlashcardSetUI = {
              ...updatedSet,
              isPublic: updatedSet.is_public,
              createdAt: updatedSet.created_at,
              cards: [],
            };
            updateFlashcardSet(transformedSet);
          }}
          onCancel={() => setEditingSet(null)}
        />
      </Layout>
    );
  }

  // Render main list view
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-background/50 p-8 pt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                {user ? 'My Flashcard Sets' : 'Flashcard Sets'}
              </h1>
              <p className="text-muted-foreground">
                {user ? 'Create and manage your flashcard collections for effective studying' : 'Sign in to create and manage your flashcard collections'}
              </p>
            </div>

            {user ? (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" size="lg">
                    <Plus className="w-5 h-5" />
                    Create New Set
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Flashcard Set</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id="title"
                        placeholder="e.g., Spanish Vocabulary"
                        value={newSetTitle}
                        onChange={(e) => setNewSetTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description (Optional)
                      </label>
                      <Input
                        id="description"
                        placeholder="Brief description of this set"
                        value={newSetDescription}
                        onChange={(e) => setNewSetDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createNewSet}>
                        Create Set
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button className="gap-2" size="lg" onClick={() => window.location.href = '/login'}>
                <Plus className="w-5 h-5" />
                Sign In to Create
              </Button>
            )}
          </div>

          {/* Flashcard Sets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map((set) => (
              <Card key={set.id} className="group hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-card/50 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <Badge variant={set.isPublic ? "default" : "secondary"} className="text-xs">
                        {set.isPublic ? "Public" : "Private"}
                      </Badge>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingSet(set)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteSet(set.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{set.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{set.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {flashcards.filter(card => card.flashcard_set_id === set.id).length} cards
                    </span>
                    <span className="text-muted-foreground">
                      Created {new Date(set.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {set.tags && set.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {set.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1 gap-2" 
                      size="sm"
                      onClick={() => startStudying(set)}
                    >
                      <Play className="w-4 h-4" />
                      Study
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 gap-2" 
                      size="sm"
                      onClick={() => setEditingSet(set)}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {flashcardSets.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {user ? 'No flashcard sets yet' : 'Welcome to Flashcards'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {user 
                  ? 'Create your first flashcard set to start studying more effectively. You can add terms, definitions, and organize them by topics.'
                  : 'Sign in to create your own flashcard sets and start studying more effectively.'
                }
              </p>
              <Button 
                onClick={() => user ? setIsCreateDialogOpen(true) : window.location.href = '/login'} 
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                {user ? 'Create Your First Set' : 'Sign In to Get Started'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};