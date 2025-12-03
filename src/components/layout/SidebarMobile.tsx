/**
 * Mobile Sidebar - Drawer/Sheet that slides in from the left
 * Only used on screens smaller than lg (overlay, not pushing content)
 */
import { BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "./SidebarNav";

interface SidebarMobileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SidebarMobile = ({ open, onOpenChange }: SidebarMobileProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-72 p-0 bg-[#020617] text-slate-50 border-r border-white/10 lg:hidden"
      >
        <SheetHeader className="px-6 py-4 border-b border-white/10">
          <SheetTitle className="flex items-center gap-3 text-slate-50">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-gradient">StudyPal</span>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation - close drawer on click */}
        <SidebarNav onNavClick={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMobile;
