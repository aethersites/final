import { Helmet } from "react-helmet";
import { TopNav } from "@/components/TopNav";
import DigitalClock from "@/components/dashboard/DigitalClock";
import QuickLinks from "@/components/dashboard/QuickLinks";
import TodoList from "@/components/dashboard/TodoList";
import DailyInspiration from "@/components/dashboard/DailyInspiration";
import UpcomingDeadlines from "@/components/dashboard/UpcomingDeadlines";
import galaxyBg from "@/assets/backgrounds/galaxy-5.jpg";
import { LayoutDashboard } from "lucide-react";

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Dashboard | AetherStudy</title>
        <meta
          name="description"
          content="Your personal study dashboard with quick links, to-do lists, and deadline tracking."
        />
      </Helmet>

      <div
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${galaxyBg})` }}
      >
        <div className="min-h-screen bg-black/40 backdrop-blur-sm">
          <TopNav />

          <main className="container mx-auto px-4 pt-32 pb-12">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm text-white/80 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4">
                <LayoutDashboard className="w-4 h-4" />
                Personal Workspace
              </span>
              <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-wide">
                Dashboard
              </h1>
              <p className="text-white/60 mt-2 font-light">
                Organize your study life in one place
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {/* Left Column */}
              <div className="space-y-6">
                <DigitalClock />
                <QuickLinks />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <TodoList />
                <DailyInspiration />
                <UpcomingDeadlines />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
