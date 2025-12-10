import { ThemeProvider } from "@/contexts/ThemeContext";
import { TopNav } from "@/components/TopNav";

interface LayoutProps {
  children: React.ReactNode;
  isFullscreen?: boolean;
  onFullscreen?: () => void;
}

export const Layout = ({ children, isFullscreen = false, onFullscreen }: LayoutProps) => {
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full relative">
        {!isFullscreen && <TopNav />}
        <main className="w-full">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
};
