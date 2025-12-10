import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const TopNav = () => {
  const { user } = useAuth();

  const navItems = [
    { title: "Pomodoro", url: "/" },
    { title: "Dashboard", url: "/dashboard" },
    { title: "AI Quiz", url: "/ai-quiz" },
    { title: "AI Flashcards", url: "/ai-flashcards" },
    { title: "Files", url: "/files" },
  ];

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "px-4 py-1.5 text-sm font-medium text-foreground bg-white/30 rounded-full transition-all duration-200"
      : "px-4 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/20 rounded-full transition-all duration-200";

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 px-2 py-1.5 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full shadow-lg">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className={getNavCls}
          >
            {item.title}
          </NavLink>
        ))}
        <NavLink
          to={user ? "/settings" : "/login"}
          className={getNavCls}
        >
          {user ? "Settings" : "Log In"}
        </NavLink>
      </div>
    </nav>
  );
};
