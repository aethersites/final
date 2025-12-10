import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { LoginPromptDialog } from "@/components/LoginPromptDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAIRateLimit } from "@/hooks/useAIRateLimit";
import { UpgradePopup } from "@/components/UpgradePopup";
import { AdCards } from "@/components/AdCards";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const AIQuiz = () => {
  const [inputText, setInputText] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { checkAndShowUpgrade, recordUsage, showUpgradePopup, setShowUpgradePopup, getTimeUntilReset } = useAIRateLimit();
  const generateQuiz = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate quiz questions from.",
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
    if (!checkAndShowUpgrade('quiz')) {
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { text: inputText.trim() }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to generate quiz questions. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data?.questions && Array.isArray(data.questions)) {
        // Record usage after successful generation
        recordUsage('quiz');
        
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        toast({
          title: "Success!",
          description: `Generated ${data.questions.length} quiz questions from your text.`
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz questions. Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
  };
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };
  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setInputText("");
  };
  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;
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
                Quiz Generator
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto font-light text-base md:text-lg">
                Transform your notes into interactive quizzes instantly
              </p>
            </div>

            {/* Input Section */}
            {questions.length === 0 && <div className="relative group">
                {/* Glass card */}
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
                    <Button onClick={generateQuiz} disabled={isGenerating || !inputText.trim()} className="w-full h-12 md:h-14 rounded-2xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 transition-all duration-300 hover:shadow-xl hover:shadow-foreground/20 hover:-translate-y-0.5" size="lg">
                      
                      {isGenerating ? "Generating Quiz..." : "Generate Quiz"}
                    </Button>
                  </div>
                </div>
              </div>}

            {/* Quiz Display */}
            {questions.length > 0 && currentQuestion && <div className="space-y-6">
                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-sm text-muted-foreground">
                    {questions.length} questions generated
                  </div>
                  <Button onClick={resetQuiz} variant="ghost" className="rounded-full gap-2 hover:bg-primary/10">
                    <RotateCcw className="w-4 h-4" />
                    New Quiz
                  </Button>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {currentQuestionIndex + 1} / {questions.length}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out" style={{
                  width: `${(currentQuestionIndex + 1) / questions.length * 100}%`
                }} />
                  </div>
                </div>

                {/* Question Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl opacity-50" />
                  <div className="relative backdrop-blur-xl bg-background/60 border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/5">
                    <div className="space-y-6">
                      <h2 className="text-xl md:text-2xl font-light text-center leading-relaxed text-foreground">
                        {currentQuestion.question}
                      </h2>

                      {/* Answer Options */}
                      <div className="grid gap-3">
                        {currentQuestion.options.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index);
                      let optionClass = "group/option relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ";
                      if (selectedAnswer === index) {
                        if (isCorrect) {
                          optionClass += "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400";
                        } else {
                          optionClass += "bg-red-500/10 border-red-500/50 text-red-700 dark:text-red-400";
                        }
                      } else if (showResult && index === currentQuestion.correctAnswer) {
                        optionClass += "bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400";
                      } else {
                        optionClass += "bg-white/40 dark:bg-white/5 border-white/30 hover:bg-white/60 dark:hover:bg-white/10 hover:border-primary/30 hover:shadow-lg";
                      }
                      return <div key={index} className={optionClass} onClick={() => selectAnswer(index)}>
                              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {optionLabel}
                              </div>
                              <div className="flex-1 text-left font-light">
                                {option}
                              </div>
                              {showResult && selectedAnswer === index && <div className="flex-shrink-0">
                                  {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                                </div>}
                              {showResult && index === currentQuestion.correctAnswer && selectedAnswer !== index && <CheckCircle className="w-5 h-5 text-green-600" />}
                            </div>;
                    })}
                      </div>

                      {/* Result Message */}
                      {showResult && <div className="pt-4 border-t border-white/10">
                          {isCorrect ? <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                              <CheckCircle className="w-5 h-5" />
                              Correct!
                            </div> : <div className="flex items-center justify-center gap-2 text-red-600 font-medium">
                              <XCircle className="w-5 h-5" />
                              The correct answer is {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                            </div>}
                        </div>}
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                  <Button variant="outline" size="icon" onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="w-12 h-12 rounded-2xl border-white/30 bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 backdrop-blur-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="px-6 py-2 rounded-full bg-secondary/50 backdrop-blur-sm text-sm text-muted-foreground">
                    {currentQuestionIndex + 1} of {questions.length}
                  </div>

                  <Button variant="outline" size="icon" onClick={nextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="w-12 h-12 rounded-2xl border-white/30 bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 backdrop-blur-sm">
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

      <UpgradePopup isOpen={showUpgradePopup} onClose={() => setShowUpgradePopup(false)} feature="AI Quiz Generation" />
      <LoginPromptDialog open={showLoginPrompt} />
    </Layout>;
};