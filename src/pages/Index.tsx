import { PomodoroTimer } from "@/components/PomodoroTimer";
import { Layout } from "@/components/Layout";
import { useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  return (
    <Layout isFullscreen={isFullscreen} onFullscreen={handleFullscreen}>
      <PomodoroTimer isFullscreen={isFullscreen} />
    </Layout>
  );
};

export default Index;
