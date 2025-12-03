/**
 * Desktop Sidebar - Fixed position, full height
 * Only visible on lg screens and above
 */
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";

interface SidebarDesktopProps {
  className?: string;
}

export const SidebarDesktop = ({ className }: SidebarDesktopProps) => {
  return (
    <aside
      className={cn(
        // Fixed position: stays in place while content scrolls
        "fixed inset-y-0 left-0 z-40",
        // Width: must match lg:ml-64 in AppShell
        "w-64",
        // Only show on lg screens and above
        "hidden lg:flex lg:flex-col",
        // Styling: dark background, full height
        "bg-[#020617] text-slate-50",
        "border-r border-white/10",
        className
      )}
    >
      {/* Logo Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <BookOpen className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-gradient">StudyPal</span>
      </div>

      {/* Navigation - scrollable if menu is long */}
      <SidebarNav />
    </aside>
  );
};

export default SidebarDesktop;
