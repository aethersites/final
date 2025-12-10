import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FolderPlus, Upload, File, Folder, Plus, Trash2, ArrowLeft, Image, FileText, Film, Music, Download, Move, FolderOpen } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

// Extended file and folder interfaces with UI properties
interface FileItemUI extends Tables<'files'> {
  content?: string;
}

interface FolderItemUI extends Tables<'folders'> {
  // UI folder inherits all database properties
}

export const Files = () => {
  const [folders, setFolders] = useState<FolderItemUI[]>([]);
  const [files, setFiles] = useState<FileItemUI[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'root' | string>('root');
  const [selectedFile, setSelectedFile] = useState<FileItemUI | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedFile, setDraggedFile] = useState<FileItemUI | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from Supabase with real-time updates
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load folders
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (foldersError) throw foldersError;
        setFolders(foldersData || []);

        // Load files and transform to UI format
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (filesError) throw filesError;
        
        // Transform database files to UI format
        const transformedFiles: FileItemUI[] = (filesData || []).map(file => ({
          ...file,
        }));
        
        console.log('Loaded files from database:', transformedFiles.length);
        setFiles(transformedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
        toast({
          title: "Error",
          description: "Failed to load your files.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up real-time subscription for files table
    const filesSubscription = supabase
      .channel('files_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'files',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Real-time file update:', payload);
          loadData(); // Reload data when changes occur
        }
      )
      .subscribe();

    return () => {
      filesSubscription.unsubscribe();
    };
  }, [user, toast]);

  // Test function to verify drag and drop functionality
  const testDragDrop = async () => {
    if (!user || files.length === 0 || folders.length === 0) {
      console.log('Cannot test: missing user, files, or folders');
      return;
    }
    
    const testFile = files[0];
    const testFolder = folders[0];
    
    console.log('Testing drag and drop:', { 
      fileId: testFile.id, 
      fileName: testFile.name,
      folderId: testFolder.id, 
      folderName: testFolder.name 
    });
    
    try {
      const { error } = await supabase
        .from('files')
        .update({ 
          folder_id: testFolder.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', testFile.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Test failed:', error);
      } else {
        console.log('Test successful - database can be updated');
        
        // Revert the test change
        await supabase
          .from('files')
          .update({ folder_id: null })
          .eq('id', testFile.id);
      }
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  // Add test button for debugging (remove in production)
  useEffect(() => {
    if (loading === false && user) {
      // testDragDrop(); // Uncomment to test
    }
  }, [loading, user, files, folders]);

  const folderColors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", 
    "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-red-500"
  ];

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'mkv':
        return <Film className="w-5 h-5 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const createFolder = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!newFolderName.trim()) return;
    
    try {
      const { data: newFolder, error } = await supabase
        .from('folders')
        .insert({
          name: newFolderName.trim(),
          user_id: user.id,
          color: folderColors[Math.floor(Math.random() * folderColors.length)]
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [newFolder, ...prev]);
      setNewFolderName("");
      
      toast({
        title: "Folder created",
        description: `"${newFolder.name}" folder has been created.`,
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder.",
        variant: "destructive",
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    try {
      // Get all files in the folder
      const folderFiles = files.filter(f => f.folder_id === folderId);
      
      // Delete files from storage
      const deletePromises = folderFiles.map(async (file) => {
        if (file.storage_path) {
          await supabase.storage
            .from('user_files')
            .remove([file.storage_path]);
        }
      });
      
      await Promise.all(deletePromises);
      
      // Delete folder from database (CASCADE will handle files)
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;
      
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setFiles(prev => prev.filter(f => f.folder_id !== folderId));
      
      if (currentView === folderId) {
        setCurrentView('root');
      }
      
      toast({
        title: "Folder deleted",
        description: `"${folder.name}" and all its files have been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = useCallback(async (uploadedFiles: FileList, targetFolderId?: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const uploadPromises = Array.from(uploadedFiles).map(async (file) => {
      try {
        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user_files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: uploadData.path,
            folder_id: targetFolderId || null,
            user_id: user.id,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Add to UI
        const newFileUI: FileItemUI = {
          ...fileRecord,
        };
        
        setFiles(prev => [newFileUI, ...prev]);
        return newFileUI;
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean);
    
    if (successfulUploads.length > 0) {
      toast({
        title: "Files uploaded",
        description: `${successfulUploads.length} file(s) uploaded successfully.`,
      });
    }
  }, [toast, user]);

  const handleDragStart = (e: React.DragEvent, file: FileItemUI) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', file.id);
    
    // Add visual feedback
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Set drag over folder for visual feedback
    if (targetFolderId && draggedFile) {
      setDragOverFolder(targetFolderId);
    }
    
    // Only show drag overlay when dragging external files, not when moving files between folders
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && !targetFolderId) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragOverFolder(null);
    
    console.log('Drop event triggered', { targetFolderId, draggedFile });
    
    // Remove visual feedback from dragged element
    const draggedElements = document.querySelectorAll('.opacity-50');
    draggedElements.forEach(el => el.classList.remove('opacity-50'));
    
    // Handle file upload from external sources
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      console.log('Uploading external files to folder:', targetFolderId);
      await handleFileUpload(droppedFiles, targetFolderId);
      return;
    }

    // Handle moving files between folders
    if (draggedFile && user) {
      console.log('Moving file to folder:', { fileId: draggedFile.id, targetFolderId });
      
      try {
        const { error } = await supabase
          .from('files')
          .update({ 
            folder_id: targetFolderId || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', draggedFile.id)
          .eq('user_id', user.id); // Add user check for security

        if (error) {
          console.error('Database update error:', error);
          throw error;
        }

        console.log('Database updated successfully');

        // Update local state
        setFiles(prev => prev.map(file => 
          file.id === draggedFile.id 
            ? { ...file, folder_id: targetFolderId || null, updated_at: new Date().toISOString() }
            : file
        ));
        
        const targetName = targetFolderId 
          ? folders.find(f => f.id === targetFolderId)?.name || 'folder'
          : 'root';
        
        toast({
          title: "File moved successfully",
          description: `"${draggedFile.name}" moved to ${targetName}.`,
        });
        
        console.log('File moved successfully to:', targetName);
      } catch (error) {
        console.error('Error moving file:', error);
        toast({
          title: "Error",
          description: "Failed to move file. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDraggedFile(null);
      }
    } else {
      console.log('No dragged file or user not authenticated');
    }
  };

  const triggerFileUpload = (folderId?: string) => {
    setSelectedFolder(folderId || null);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      await handleFileUpload(uploadedFiles, selectedFolder || undefined);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    
    const file = files.find(f => f.id === fileId);
    if (!file) return;
    
    try {
      // Delete from storage if path exists
      if (file.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('user_files')
          .remove([file.storage_path]);
        
        if (storageError) {
          console.error('Error deleting from storage:', storageError);
        }
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
      
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFile(null);
      
      toast({
        title: "File deleted",
        description: `"${file.name}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCurrentFiles = () => {
    if (currentView === 'root') {
      return files.filter(f => !f.folder_id);
    }
    return files.filter(f => f.folder_id === currentView);
  };

  const getCurrentFolders = () => {
    return currentView === 'root' ? folders : [];
  };

  const getCurrentFolder = () => {
    return currentView === 'root' ? null : folders.find(f => f.id === currentView);
  };

  const renderFilePreview = (file: FileItemUI) => {
    if (!file.storage_path) return null;

    const isImage = file.file_type.startsWith('image/');
    const isVideo = file.file_type.startsWith('video/');
    const isAudio = file.file_type.startsWith('audio/');
    const isPDF = file.file_type === 'application/pdf';

    // Get public URL from Supabase storage
    const { data } = supabase.storage
      .from('user_files')
      .getPublicUrl(file.storage_path);

    const fileUrl = data.publicUrl;

    if (isImage) {
      return (
        <div className="w-full flex items-center justify-center bg-muted/50 rounded-lg p-4" style={{ minHeight: '400px', maxHeight: '70vh' }}>
          <img 
            src={fileUrl} 
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{ maxHeight: '60vh' }}
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <video 
          controls 
          className="max-w-full max-h-96 rounded-lg"
          src={fileUrl}
        >
          Your browser does not support video playback.
        </video>
      );
    }

    if (isAudio) {
      return (
        <audio 
          controls 
          className="w-full"
          src={fileUrl}
        >
          Your browser does not support audio playback.
        </audio>
      );
    }

    if (isPDF) {
      return (
        <embed 
          src={fileUrl} 
          type="application/pdf"
          className="w-full h-96 rounded-lg"
        />
      );
    }

    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        {getFileIcon(file.name)}
        <p className="mt-2 text-sm text-muted-foreground">
          Preview not available for this file type
        </p>
        <Button 
          className="mt-4" 
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Layout>
      <div 
        className={`min-h-screen p-8 pt-32 transition-colors ${isDragging ? 'bg-primary/5' : ''}`}
        onDragOver={(e) => {
          if (currentView === 'root') {
            handleDragOver(e);
          }
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          if (currentView === 'root') {
            handleDrop(e);
          }
        }}
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 text-primary text-sm font-medium mb-4">
              <FolderOpen className="w-4 h-4" />
              Study Resources
            </div>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-foreground">
              File Management
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto font-light text-base md:text-lg">
              Organize your files with custom folders and easy drag-and-drop uploads
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {currentView !== 'root' && (
              <Button 
                variant="ghost" 
                onClick={() => setCurrentView('root')}
                className="gap-2 text-foreground/70 hover:text-foreground hover:bg-white/10 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Root
              </Button>
            )}
            <div className="text-lg font-light text-foreground">
              {getCurrentFolder()?.name || 'My Files'}
            </div>
          </div>

          {/* Upload Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative backdrop-blur-xl bg-background/60 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5">
              <div className="text-center space-y-4">
                <Button 
                  onClick={() => triggerFileUpload(currentView === 'root' ? undefined : currentView)} 
                  className="w-full h-12 md:h-14 rounded-2xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 transition-all duration-300 hover:shadow-xl hover:shadow-foreground/20 hover:-translate-y-0.5"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <p className="text-sm text-muted-foreground/50">
                  Or drag and drop files anywhere on this page
                </p>
              </div>
            </div>
          </div>

          {/* Create Folder (only in root) */}
          {currentView === 'root' && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative backdrop-blur-xl bg-background/60 border border-white/20 rounded-3xl p-6 shadow-2xl shadow-black/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <FolderPlus className="w-5 h-5" />
                    Create New Folder
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                      className="flex-1 bg-white/50 dark:bg-white/5 border-white/30 rounded-2xl placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                    <Button 
                      onClick={createFolder}
                      className="rounded-2xl bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Folders Grid */}
          {getCurrentFolders().length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-foreground">Folders</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentFolders().map((folder) => {
                  const folderFiles = files.filter(f => f.folder_id === folder.id);
                  return (
                    <Card 
                      key={folder.id} 
                      className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all cursor-pointer group ${
                        dragOverFolder === folder.id ? 'border-white/50 bg-white/20 scale-105' : ''
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDragOver(e, folder.id);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverFolder(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDrop(e, folder.id);
                      }}
                      onClick={() => setCurrentView(folder.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${folder.color} flex items-center justify-center transition-transform ${
                              dragOverFolder === folder.id ? 'scale-110' : ''
                            }`}>
                              <Folder className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-light text-foreground">{folder.name}</CardTitle> 
                              <p className="text-sm text-foreground/60 font-light">
                                {folderFiles.length} file{folderFiles.length !== 1 ? 's' : ''}
                                {dragOverFolder === folder.id && draggedFile && (
                                  <span className="text-foreground font-medium"> • Drop file here</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => triggerFileUpload(folder.id)}
                              className="h-8 w-8 text-foreground/70 hover:text-foreground hover:bg-white/10 rounded-xl"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteFolder(folder.id)}
                              className="h-8 w-8 text-destructive hover:bg-white/10 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Files Grid */}
          {getCurrentFiles().length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light text-foreground">Files</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getCurrentFiles().map((file) => (
                  <Card 
                    key={file.id}
                    className={`backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden hover:bg-white/15 transition-all cursor-pointer group ${
                      draggedFile?.id === file.id ? 'opacity-50 scale-95' : ''
                    }`}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(e, file);
                    }}
                    onDragEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDraggedFile(null);
                      setDragOverFolder(null);
                      e.currentTarget.classList.remove('opacity-50');
                    }}
                    onClick={() => setSelectedFile(file)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getFileIcon(file.name)}
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-light text-foreground truncate">{file.name}</CardTitle>
                            <p className="text-xs text-foreground/60 font-light">
                              {formatFileSize(file.file_size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteFile(file.id)}
                            className="h-6 w-6 text-destructive hover:bg-white/10 rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-xs text-foreground/50 font-light">
                        <Move className="w-3 h-3" />
                        <span>Drag to move to folder</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {getCurrentFolders().length === 0 && getCurrentFiles().length === 0 && (
            <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                    <Folder className="w-8 h-8 text-foreground/60" />
                  </div>
                  <div>
                    <h3 className="text-lg font-light text-foreground">
                      {currentView === 'root' ? 'No files or folders yet' : 'This folder is empty'}
                    </h3>
                    <p className="text-foreground/60 font-light">
                      {currentView === 'root' 
                        ? 'Create your first folder or upload some files to get started'
                        : 'Upload some files or go back to create folders'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Drag overlay */}
        {isDragging && (
          <div className="fixed inset-0 bg-primary/10 border-2 border-dashed border-primary z-50 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Upload className="w-12 h-12 mx-auto text-primary" />
              <p className="text-lg font-semibold text-primary">Drop files here to upload</p>
            </div>
          </div>
        )}

        {/* File Preview Dialog */}
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedFile && getFileIcon(selectedFile.name)}
                {selectedFile?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedFile && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Size: {formatFileSize(selectedFile.file_size)}</span>
                  <span>Uploaded: {new Date(selectedFile.created_at).toLocaleDateString()}</span>
                </div>
                {renderFilePreview(selectedFile)}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedFile.storage_path) {
                        const { data } = supabase.storage
                          .from('user_files')
                          .getPublicUrl(selectedFile.storage_path);
                        
                        const link = document.createElement('a');
                        link.href = data.publicUrl;
                        link.download = selectedFile.name;
                        link.target = '_blank';
                        link.click();
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteFile(selectedFile.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <LoginPromptDialog open={showLoginPrompt} />
    </Layout>
  );
};