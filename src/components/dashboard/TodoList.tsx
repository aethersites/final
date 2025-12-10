import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, X, Check, Plus } from "lucide-react";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-todos");
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTask.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
      };
      setTodos([...todos, todo]);
      setNewTask("");
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-xl font-light">To-Do List</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          className="h-8 w-8 border border-white/30 text-white/70 hover:text-white hover:bg-white/10"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Add new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button
            onClick={addTodo}
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {todos.length === 0 ? (
            <p className="text-white/50 text-center py-4">No tasks yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="border-white/40 data-[state=checked]:bg-white/30 data-[state=checked]:border-white/50"
                />
                <span
                  className={`flex-1 text-white/90 ${
                    todo.completed ? "line-through text-white/50" : ""
                  }`}
                >
                  {todo.text}
                </span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTodo(todo.id)}
                    className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodoList;
