import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, Save, Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare, Minus, Link, Image, 
  Table, Palette, Highlighter, Type
} from "lucide-react";
import { toast } from "sonner";
import { marked } from "marked";

interface Note {
  id: string;
  title: string;
  content: any;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}

interface DocumentEditorProps {
  note: Note | null;
  onSave: (noteId: string, updates: Partial<Note>) => Promise<void>;
  onClose: () => void;
}

export const DocumentEditor = ({ note, onSave, onClose }: DocumentEditorProps) => {
  const [title, setTitle] = useState(note?.title || "Untitled Document");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [fontSize, setFontSize] = useState("16");
  const [fontFamily, setFontFamily] = useState("serif");
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const editorRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Initialize content from note
  useEffect(() => {
    if (note && isInitialLoad.current && editorRef.current) {
      let initialContent = '';
      
      if (typeof note.content === 'string') {
        // Check if content looks like markdown (contains markdown syntax)
        const isMarkdown = note.content.includes('**') || note.content.includes('*') || 
                          note.content.includes('#') || note.content.includes('[') ||
                          note.content.includes('- ') || note.content.includes('1. ');
        
        if (isMarkdown) {
          // Convert markdown to HTML
          initialContent = marked(note.content) as string;
        } else {
          // Treat as plain text, wrap in paragraph
          initialContent = note.content ? `<p>${note.content.replace(/\n/g, '</p><p>')}</p>` : '';
        }
      } else {
        // Handle JSON content or empty content
        initialContent = '';
      }
      
      editorRef.current.innerHTML = initialContent;
      setTitle(note.title || "Untitled Document");
      isInitialLoad.current = false;
    }
  }, [note]);

  // Get current content from editor
  const getCurrentContent = useCallback(() => {
    return editorRef.current?.innerHTML || '';
  }, []);

  // Auto-save function
  const performSave = useCallback(async (currentTitle: string, currentContent: string) => {
    if (!note) return;

    setIsSaving(true);
    try {
      await onSave(note.id, {
        title: currentTitle,
        content: currentContent
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  }, [note, onSave]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((currentTitle: string, currentContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(currentTitle, currentContent);
    }, 2000);
  }, [performSave]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!isInitialLoad.current) {
      const currentContent = getCurrentContent();
      scheduleAutoSave(title, currentContent);
    }
  }, [title, scheduleAutoSave, getCurrentContent]);

  // Handle title changes
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (!isInitialLoad.current) {
      const currentContent = getCurrentContent();
      scheduleAutoSave(newTitle, currentContent);
    }
  }, [scheduleAutoSave, getCurrentContent]);

  // Execute formatting commands
  const executeCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleContentChange();
  }, [handleContentChange]);

  // Format text with enhanced functionality
  const formatText = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    
    // Special handling for lists to ensure they work properly
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        document.execCommand(command, false, value);
        handleContentChange();
      }
      return;
    }
    
    // Enhanced header formatting
    if (command === 'formatBlock') {
      document.execCommand(command, false, value);
      handleContentChange();
      return;
    }
    
    executeCommand(command, value);
  }, [executeCommand, handleContentChange]);

  // Insert HTML content
  const insertHTML = useCallback((html: string) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    handleContentChange();
  }, [handleContentChange]);

  // Manual save
  const handleManualSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const currentContent = getCurrentContent();
    await performSave(title, currentContent);
  }, [performSave, title, getCurrentContent]);

  // Insert link
  const insertLink = useCallback(() => {
    const selection = document.getSelection();
    const selectedText = selection?.toString() || '';
    const url = prompt("Enter URL:", selectedText.startsWith('http') ? selectedText : 'https://');
    if (url) {
      if (selectedText && !selectedText.startsWith('http')) {
        executeCommand('createLink', url);
      } else {
        const linkText = selectedText || url;
        insertHTML(`<a href="${url}" target="_blank">${linkText}</a>`);
      }
    }
  }, [executeCommand, insertHTML]);

  // Insert image via file upload
  const insertImage = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            insertHTML(`<img src="${result}" alt="${file.name}" style="max-width: 100%; height: auto; margin: 10px 0;" />`);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  }, [insertHTML]);

  // Insert table with grid selector
  const insertTable = useCallback((rows: number, cols: number) => {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    for (let r = 0; r < rows; r++) {
      tableHTML += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHTML += '<td style="padding: 8px; border: 1px solid #ddd; min-width: 100px; min-height: 30px;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table>';
    insertHTML(tableHTML);
  }, [insertHTML]);

  // Table Grid Selector Component
  const TableGridSelector = ({ onSelect }: { onSelect: (rows: number, cols: number) => void }) => {
    const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });
    
    return (
      <div className="p-3">
        <div className="text-sm font-medium mb-2">Insert Table</div>
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 64 }, (_, index) => {
            const row = Math.floor(index / 8) + 1;
            const col = (index % 8) + 1;
            const isSelected = row <= hoveredCell.row && col <= hoveredCell.col;
            
            return (
              <div
                key={index}
                className={`w-4 h-4 border cursor-pointer ${
                  isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-100'
                }`}
                onMouseEnter={() => setHoveredCell({ row, col })}
                onClick={() => onSelect(row, col)}
              />
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {hoveredCell.row} x {hoveredCell.col}
        </div>
      </div>
    );
  };

  // Apply font changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = fontFamily === 'serif' ? 'ui-serif, Georgia, serif' : 
                                           fontFamily === 'sans' ? 'ui-sans-serif, system-ui, sans-serif' : 
                                           'ui-monospace, Menlo, monospace';
      editorRef.current.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize, fontFamily]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const hasUnsavedChanges = lastSaved === null || (note && (
    title !== note.title || 
    getCurrentContent() !== (typeof note.content === 'string' ? 
      (note.content.includes('**') || note.content.includes('*') || note.content.includes('#') ? 
        marked(note.content) as string : 
        (note.content ? `<p>${note.content.replace(/\n/g, '</p><p>')}</p>` : '')) : 
      note.content)
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-3 py-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>

            <div className="flex items-center gap-3">
              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Saving...
                  </div>
                )}
                {hasUnsavedChanges && !isSaving && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Unsaved changes
                  </div>
                )}
                {!hasUnsavedChanges && !isSaving && lastSaved && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Saved
                  </div>
                )}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualSave}
                disabled={isSaving}
                className="rounded-full border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Container */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title Section */}
        <div className="mb-8">
          <Input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Document"
            className="w-full text-4xl font-light text-slate-900 placeholder:text-slate-400 border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          />
          <div className="mt-3 text-sm text-slate-500 flex items-center gap-4">
            <span>
              {new Date(note?.updated_at || Date.now()).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
            <span>{editorRef.current?.textContent?.length || 0} characters</span>
            {lastSaved && (
              <>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <span>Last saved {lastSaved.toLocaleTimeString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Writing Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Comprehensive Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Font Settings */}
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="sans">Sans Serif</SelectItem>
                  <SelectItem value="mono">Monospace</SelectItem>
                </SelectContent>
              </Select>

              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="14">14</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-px h-6 bg-slate-300"></div>

              {/* Text Formatting */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('bold')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('italic')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('underline')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('strikeThrough')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>

              {/* Colors */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                    title="Text Color"
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text Color</label>
                    <Input
                      type="color"
                      onChange={(e) => formatText('foreColor', e.target.value)}
                      className="h-8 w-16"
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                    title="Highlight"
                  >
                    <Highlighter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Highlight Color</label>
                    <Input
                      type="color"
                      onChange={(e) => formatText('backColor', e.target.value)}
                      className="h-8 w-16"
                    />
                  </div>
                </PopoverContent>
              </Popover>

              <div className="w-px h-6 bg-slate-300"></div>

              {/* Headings and Paragraph */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', 'p')}
                className="h-8 px-2 hover:bg-white hover:shadow-sm text-xs"
                title="Paragraph"
              >
                P
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', 'h1')}
                className="h-8 px-2 hover:bg-white hover:shadow-sm text-xs"
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', 'h2')}
                className="h-8 px-2 hover:bg-white hover:shadow-sm text-xs"
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('formatBlock', 'h3')}
                className="h-8 px-2 hover:bg-white hover:shadow-sm text-xs"
                title="Heading 3"
              >
                H3
              </Button>

              <div className="w-px h-6 bg-slate-300"></div>

              {/* Alignment */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyLeft')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyCenter')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyRight')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('justifyFull')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-slate-300"></div>

              {/* Lists */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertUnorderedList')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => formatText('insertOrderedList')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>

              <div className="w-px h-6 bg-slate-300"></div>

              {/* Insert Elements */}
              <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Insert Link"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertImage}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Insert Image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                    title="Insert Table"
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <TableGridSelector onSelect={insertTable} />
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => insertHTML('<hr style="border: 1px solid #ddd; margin: 20px 0;" />')}
                className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm"
                title="Horizontal Line"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="p-8">
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className="w-full min-h-[600px] leading-relaxed text-slate-900 border-none outline-none resize-none bg-transparent focus:ring-0 [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-400 [&:empty]:before:pointer-events-none [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-2 [&_p]:text-[var(--base-font-size)] [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:text-[var(--base-font-size)] [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:text-[var(--base-font-size)] [&_li]:mb-1 [&_li]:text-[var(--base-font-size)]"
              style={{ 
                lineHeight: '1.8',
                fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : 
                          fontFamily === 'sans' ? 'Arial, sans-serif' : 
                          'Monaco, monospace',
                '--base-font-size': `${fontSize}px`
              } as React.CSSProperties & { '--base-font-size': string }}
              data-placeholder="Start writing your thoughts..."
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

        {/* Footer Spacing */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};