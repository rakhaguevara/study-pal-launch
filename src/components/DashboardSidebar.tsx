import { 
  Home, 
  CheckSquare, 
  BarChart3, 
  FileText, 
  Focus, 
  Bot, 
  User, 
  Settings, 
  HelpCircle,
  ChevronLeft
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavigationItems = [
  { name: "Dashboard", icon: Home, path: "/dashboard" },
  { name: "Tasks", icon: CheckSquare, path: "/dashboard/tasks" },
  { name: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { name: "Notes", icon: FileText, path: "/dashboard/notes" },
  { name: "Focus Mode", icon: Focus, path: "/dashboard/focus" },
  { name: "AI Assistant", icon: Bot, path: "/dashboard/ai" },
  { name: "Profile", icon: User, path: "/dashboard/profile" },
];

const bottomNavigationItems = [
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  { name: "FAQ", icon: HelpCircle, path: "/dashboard/faq" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar 
      collapsible="icon"
      className="border-r border-sidebar-border"
    >
      <SidebarContent className="bg-sidebar">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigationItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    tooltip={item.name}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/dashboard"}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                        isActive(item.path)
                          ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="font-medium animate-in fade-in-50 duration-200">
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Bottom Navigation with Special Hover Effect */}
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border mt-auto">
        <SidebarMenu>
          {bottomNavigationItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.path)}
                tooltip={item.name}
              >
                <NavLink
                  to={item.path}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                      : "text-sidebar-foreground hover:text-cyan-400"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform duration-300",
                      !isActive(item.path) && "group-hover:translate-x-1"
                    )} 
                  />
                  {!isCollapsed && (
                    <span 
                      className={cn(
                        "font-medium transition-transform duration-300 animate-in fade-in-50",
                        !isActive(item.path) && "group-hover:translate-x-1"
                      )}
                    >
                      {item.name}
                    </span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        {/* Toggle Button */}
        <div className="pt-2 border-t border-sidebar-border">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft 
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                isCollapsed && "rotate-180"
              )} 
            />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
