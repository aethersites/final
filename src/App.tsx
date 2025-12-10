import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { AIFlashcards } from "./pages/AIFlashcards";
import { AIQuiz } from "./pages/AIQuiz";
import { AICitation } from "./pages/AICitation";
import { Flashcards } from "./pages/Flashcards";
import { Tasks } from "./pages/Tasks";
import { Files } from "./pages/Files";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Settings } from "./pages/Settings";
import { Themes } from "./pages/Themes";
import { Notes } from "./pages/Notes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/ai-flashcards" element={<AIFlashcards />} />
              <Route path="/ai-quiz" element={<AIQuiz />} />
              <Route path="/ai-citation" element={<AICitation />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/files" element={<Files />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/themes" element={<Themes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE the CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
