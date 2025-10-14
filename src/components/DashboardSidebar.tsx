import { Home, TrendingUp, Brain, ClipboardList, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "My Progress", icon: TrendingUp, path: "/dashboard/progress" },
  { name: "Study Insights", icon: Brain, path: "/dashboard/insights" },
  { name: "Learning Style Test", icon: ClipboardList, path: "/dashboard/test" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-border min-h-screen p-6 hidden md:block">
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-orange-400 to-blue-500 text-white shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                <span className="font-medium">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
