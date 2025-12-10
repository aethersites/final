import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

const backgroundImages = {
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
  'galaxy-11': galaxy11,
};

type Task = Tables<'tasks'>;
const TasksContent = () => {
  const [mainGoal, setMainGoal] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [lightText, setLightText] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { settings } = useTheme();
  const { user } = useAuth();

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load main goal from localStorage
        const savedMainGoal = localStorage.getItem('mainGoal_free');
        if (savedMainGoal) {
          setMainGoal(savedMainGoal);
        }

        // Load tasks from localStorage for free access
        const savedTasks = localStorage.getItem('tasks_free');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }

        // If user is logged in, try to load from Supabase
        if (user) {
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (tasksData) {
            setTasks(tasksData);
          }
        }

        // Load text mode from localStorage
        const savedTextMode = localStorage.getItem('aether-text-mode');
        if (savedTextMode) {
          setLightText(savedTextMode === 'light');
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, toast]);

  // Simple main goal update with instant localStorage save
  const handleMainGoalChange = (value: string) => {
    setMainGoal(value);
    // Save to localStorage for free access
    localStorage.setItem('mainGoal_free', value);
  };

  // Save text mode to localStorage
  useEffect(() => {
    localStorage.setItem('aether-text-mode', lightText ? 'light' : 'dark');
  }, [lightText]);

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    
    try {
      const newTask = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        user_id: user?.id || 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // If user is logged in, save to Supabase
      if (user) {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            text: newTaskText.trim(),
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        setTasks(prev => [data, ...prev]);
      } else {
        // Free access - save to localStorage
        const updatedTasks = [newTask, ...tasks];
        setTasks(updatedTasks);
        localStorage.setItem('tasks_free', JSON.stringify(updatedTasks));
      }

      setNewTaskText("");
      
      toast({
        title: "Task added",
        description: "Your new task has been added to the list.",
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task.",
        variant: "destructive",
      });
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // If user is logged in, update in Supabase
      if (user) {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            completed: !task.completed,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) throw error;
      }

      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      );
      setTasks(updatedTasks);

      // If free access, save to localStorage
      if (!user) {
        localStorage.setItem('tasks_free', JSON.stringify(updatedTasks));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // If user is logged in, delete from Supabase
      if (user) {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) throw error;
      }

      // Update local state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);

      // If free access, save to localStorage
      if (!user) {
        localStorage.setItem('tasks_free', JSON.stringify(updatedTasks));
      }
      
      toast({
        title: "Task deleted",
        description: "The task has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const backgroundImage = backgroundImages[settings.background];
  const hasBackground = settings.background !== 'none';
  
  // Text color classes based on mode
  const headerTextClass = lightText ? 'text-white' : 'text-black';
  const bodyTextClass = lightText 
    ? (hasBackground ? 'text-white' : 'text-white') 
    : (hasBackground ? 'text-gray-700' : 'text-gray-700');
  const mutedTextClass = lightText 
    ? (hasBackground ? 'text-white/70' : 'text-white/70') 
    : (hasBackground ? 'text-gray-600' : 'text-muted-foreground');
  const placeholderClass = lightText 
    ? 'placeholder:text-white/70' 
    : 'placeholder:text-gray-600';

  return (
    <div 
      className="min-h-screen transition-all duration-500 ease-out relative overflow-hidden p-8 pt-20 font-inter"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      } : undefined}
    >
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 
            className={`text-4xl font-bold ${headerTextClass}`}
            style={{
              textShadow: lightText 
                ? '0 0 20px rgba(128, 128, 128, 0.8), 0 0 40px rgba(128, 128, 128, 0.6)' 
                : '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6)'
            }}
          >
            Daily Tasks
          </h1>
          <p 
            className={mutedTextClass}
            style={{
              textShadow: lightText 
                ? '0 0 15px rgba(128, 128, 128, 0.6), 0 0 30px rgba(128, 128, 128, 0.4)' 
                : '0 0 15px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)'
            }}
          >
            Stay focused with your main goal and organized task list
          </p>
        </div>

        {/* Main Goal Section */}
        <Card className={`backdrop-blur-sm transition-all duration-300 relative ${
          hasBackground 
            ? 'bg-white/10 backdrop-blur-md border border-white/20' 
            : 'bg-card/50 border-border/50'
        }`}>
          {hasBackground && <div className="absolute inset-0 bg-black/7 rounded-lg" />}
          <CardHeader>
            <CardTitle className={`text-lg font-semibold ${headerTextClass}`}>
              Main Goal Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="What's your main focus for today? Write your primary goal here..."
              value={mainGoal}
              onChange={(e) => handleMainGoalChange(e.target.value)}
              className={`min-h-[80px] resize-none text-base transition-all duration-300 ${
                hasBackground 
                  ? `bg-white/10 backdrop-blur-md border-white/20 ${bodyTextClass} ${placeholderClass}` 
                  : `bg-input border-border ${bodyTextClass} ${placeholderClass}`
              }`}
            />
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Card className={`backdrop-blur-sm transition-all duration-300 relative ${
          hasBackground 
            ? 'bg-white/10 backdrop-blur-md border border-white/20' 
            : 'bg-card/50 border-border/50'
        }`}>
          {hasBackground && <div className="absolute inset-0 bg-black/7 rounded-lg" />}
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg font-semibold ${headerTextClass}`}>
                Task List
              </CardTitle>
              <div className={`text-sm ${mutedTextClass}`}>
                {completedCount} of {totalCount} completed
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new task */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 transition-all duration-300 ${
                  hasBackground 
                    ? `bg-white/10 backdrop-blur-md border-white/20 ${bodyTextClass} ${placeholderClass}` 
                    : `bg-input border-border ${bodyTextClass} ${placeholderClass}`
                }`}
              />
              <Button onClick={addTask} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div className={`w-full rounded-full h-3 transition-all duration-300 ${
                hasBackground ? 'bg-white/20' : 'bg-secondary'
              }`}>
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{ width: `${tasks.length > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                >
                  {completedCount > 0 && (
                    <span className="text-xs text-white font-medium">
                      {Math.round((completedCount / totalCount) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Task list */}
            <div className="space-y-3">
              {tasks.length === 0 ? (
              <div className={`text-center py-8 ${mutedTextClass}`}>
                <p>No tasks yet. Add your first task above!</p>
              </div>
              ) : (
                tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 group ${
                      hasBackground 
                        ? 'bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10' 
                        : 'bg-background/50 border-border/50 hover:bg-background/80'
                    }`}
                  >
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="shrink-0"
                    />
                    <label 
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 cursor-pointer transition-all duration-200 ${
                        task.completed 
                          ? `${mutedTextClass} line-through`
                          : bodyTextClass
                      }`}
                    >
                      {task.text}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Text Mode Toggle */}
        <Card className={`backdrop-blur-sm transition-all duration-300 relative ${
          hasBackground 
            ? 'bg-white/10 backdrop-blur-md border border-white/20' 
            : 'bg-card/50 border-border/50'
        }`}>
          {hasBackground && <div className="absolute inset-0 bg-black/7 rounded-lg" />}
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className={`font-medium ${bodyTextClass}`}>Text Color Mode</div>
                <div className={`text-sm ${mutedTextClass}`}>
                  Switch between light and dark text colors
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${mutedTextClass}`}>Dark Text</span>
                <Switch
                  checked={lightText}
                  onCheckedChange={setLightText}
                />
                <span className={`text-sm ${mutedTextClass}`}>Light Text</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const Tasks = () => {
  return (
    <Layout>
      <TasksContent />
    </Layout>
  );
};