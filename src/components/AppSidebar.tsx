import { BookOpen, Timer, CheckSquare, FolderOpen, LogIn, Settings, User, Brain, Crown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { settings } = useTheme();
  const { user } = useAuth();
  const currentPath = location.pathname;

  // Productivity navigation items
  const productivityItems = [
    { title: "Pomodoro", url: "/" },
    { title: "Tasks", url: "/tasks" },
    { title: "Flashcards", url: "/flashcards" },
    { title: "AI Flashcards", url: "/ai-flashcards" },
    { title: "AI Quiz", url: "/ai-quiz" },
    { title: "AI Citation", url: "/ai-citation" }
  ];

  // Organization navigation items (conditional last item based on auth)
  const organizationItems = [
    { title: "Files", url: "/files" },
    { title: "Notes", url: "/notes" },
    { title: "Themes", url: "/themes" },
    ...(user ? [{ title: "Settings", url: "/settings" }] : [{ title: "Log In", url: "/login" }])
  ];
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({
    isActive
  }: {
    isActive: boolean;
  }) => isActive ? "bg-slate-200/60 text-slate-700 font-medium rounded-lg" : "hover:bg-slate-100/50 text-foreground/80 hover:text-foreground rounded-lg";
  return <Sidebar 
  className="[&_[data-sidebar=sidebar]]:!bg-white/20 
             [&_[data-sidebar=sidebar]]:backdrop-blur-2xl 
             border-r border-white/40 
             shadow-lg 
             supports-[backdrop-filter]:bg-white/25"
>
      <SidebarHeader className="border-b border-white/30 p-6 pt-16 bg-transparent">
        <div className="flex items-center gap-3">
          {state === "expanded" && <div className="flex items-center gap-3 w-full">
              <div>
                <h1 className="text-xl font-bold text-black">
                  AetherStudy
                </h1>
              </div>
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-4 flex flex-col h-full bg-transparent">
        {/* Productivity Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            PRODUCTIVITY
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {productivityItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <NavLink 
                    to={item.url} 
                    end 
                    className={({isActive}) => `flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-base w-full ${getNavCls({isActive})}`}
                  >
                    {state === "expanded" && <span className="truncate font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization Section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            ORGANIZATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {organizationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <NavLink 
                    to={item.url} 
                    end 
                    className={({isActive}) => `flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-base w-full ${getNavCls({isActive})}`}
                  >
                    {state === "expanded" && <span className="truncate font-medium">{item.title}</span>}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>;
}
