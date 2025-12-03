/**
 * Shared navigation items used by both SidebarDesktop and SidebarMobile
 */
import {
  Home,
  CheckSquare,
  BarChart3,
  FileText,
  Focus,
  Bot,
  Settings,
  HelpCircle,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const mainNavigationItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Study Materials", icon: BookOpen, path: "/dashboard/materials" },
  { name: "Tasks", icon: CheckSquare, path: "/dashboard/tasks" },
  { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { name: "Notes", icon: FileText, path: "/dashboard/notes" },
  { name: "Focus Mode", icon: Focus, path: "/dashboard/focus" },
  { name: "AI Assistant", icon: Bot, path: "/dashboard/ai" },
  { name: "Learning Style", icon: Lightbulb, path: "/dashboard/learning-style" },
];

const bottomNavigationItems = [
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  { name: "FAQ", icon: HelpCircle, path: "/dashboard/faq" },
];

interface SidebarNavProps {
  onNavClick?: () => void; // Close mobile drawer on navigation
  showLabels?: boolean;
}

export const SidebarNav = ({ onNavClick, showLabels = true }: SidebarNavProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Main Navigation - scrollable if menu is long */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {mainNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={onNavClick}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              isActive(item.path)
                ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-200",
                !isActive(item.path) && "group-hover:text-cyan-400"
              )}
            />
            {showLabels && (
              <span className="font-medium text-sm truncate">{item.name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        {bottomNavigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
              isActive(item.path)
                ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 flex-shrink-0 transition-all duration-200",
                !isActive(item.path) && "group-hover:text-cyan-400"
              )}
            />
            {showLabels && (
              <span className="font-medium text-sm truncate">{item.name}</span>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default SidebarNav;


