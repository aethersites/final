import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, FileText, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { DocumentEditor } from "@/components/DocumentEditor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";

interface Note {
  id: string;
  title: string;
  content: any;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

export const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: "Untitled Document",
          content: { type: "doc", content: [] }
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setIsCreating(true);
      toast.success("New document created");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create document");
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
      
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      toast.success("Document deleted");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete document");
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", noteId)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      if (!data) {
        console.error("No data returned from update");
        toast.error("Document not found");
        return;
      }
      
      setNotes(notes.map(note => note.id === noteId ? data : note));
      if (selectedNote?.id === noteId) {
        setSelectedNote(data);
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update document");
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Sign in to access Notes</h2>
            <p className="text-muted-foreground">Create and manage your documents with our rich text editor.</p>
          </div>
        </div>
        
        <LoginPromptDialog open={showLoginPrompt} />
      </Layout>
    );
  }

  if (selectedNote || isCreating) {
    return (
      <DocumentEditor
        note={selectedNote}
        onSave={updateNote}
        onClose={() => {
          setSelectedNote(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Notes</h1>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Create New Document Card */}
            <Card 
              className="h-64 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors group"
              onClick={createNote}
            >
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <span className="font-medium text-foreground/80 group-hover:text-foreground">
                  Blank Document
                </span>
              </CardContent>
            </Card>

            {/* Document Cards */}
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse">
                  <CardContent className="p-0 h-full">
                    <div className="bg-muted h-3/4 rounded-t-lg"></div>
                    <div className="p-3">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              filteredNotes.map((note) => (
                <Card key={note.id} className="h-64 hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-0 h-full">
                    {/* Document Preview */}
                    <div 
                      className="bg-card h-3/4 rounded-t-lg border-b flex items-center justify-center relative overflow-hidden"
                      onClick={() => setSelectedNote(note)}
                    >
                      <FileText className="h-12 w-12 text-muted-foreground/50" />
                      
                      {/* Hover Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNote(note);
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNote(note.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="p-3" onClick={() => setSelectedNote(note)}>
                      <h3 className="font-medium text-sm truncate mb-1">{note.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(note.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Empty State */}
          {!loading && filteredNotes.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms</p>
            </div>
          )}

          {!loading && notes.length === 0 && !searchQuery && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">Create your first document to get started</p>
              <Button onClick={createNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <LoginPromptDialog open={showLoginPrompt} />
    </Layout>
  );
};