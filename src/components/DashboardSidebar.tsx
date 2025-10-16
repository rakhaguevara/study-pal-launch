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
  ChevronLeft,
  BookOpen
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
  SidebarHeader,
  SidebarSeparator,
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
      className="border-r border-sidebar-border relative"
    >
      {/* Header with Logo */}
      <SidebarHeader className="bg-sidebar border-b border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3 px-4 py-5 transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <BookOpen className={cn(
            "text-primary transition-all duration-300",
            isCollapsed ? "h-7 w-7" : "h-10 w-10"
          )} />
          {!isCollapsed && (
            <span className="text-2xl font-bold text-gradient animate-in fade-in-50 duration-200">
              StudyPal
            </span>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarSeparator className="bg-sidebar-border" />
      
      <SidebarContent className="bg-sidebar">
        {/* Main Navigation */}
        <SidebarGroup>
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
                        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-out",
                        isActive(item.path)
                          ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                          : "text-sidebar-foreground hover:bg-white/8"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-200",
                        !isActive(item.path) && "group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                      )} />
                      {!isCollapsed && (
                        <span className={cn(
                          "font-medium animate-in fade-in-50 duration-200 transition-all duration-200",
                          !isActive(item.path) && "group-hover:translate-x-0.5"
                        )}>
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
      
      {/* Toggle Button - Middle Upper */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "absolute top-[35%] -translate-y-1/2 -right-3.5 z-50",
          "w-7 h-7 rounded-full",
          "bg-sidebar border-2 border-sidebar-border",
          "flex items-center justify-center",
          "text-sidebar-foreground",
          "transition-all duration-300",
          "hover:bg-primary hover:text-white hover:border-primary",
          "hover:shadow-[0_0_12px_rgba(var(--primary),0.5)]",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <ChevronLeft 
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} 
        />
      </button>

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
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-out",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-secondary to-primary text-white shadow-lg"
                      : "text-sidebar-foreground hover:bg-white/8"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all duration-200",
                      !isActive(item.path) && "group-hover:text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    )} 
                  />
                  {!isCollapsed && (
                    <span 
                      className={cn(
                        "font-medium transition-all duration-200 animate-in fade-in-50",
                        !isActive(item.path) && "group-hover:translate-x-0.5"
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
