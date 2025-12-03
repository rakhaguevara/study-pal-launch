/**
 * AppShell - Main dashboard layout wrapper
 *
 * Structure:
 * - Desktop: Fixed sidebar on left (position: fixed), content offset with lg:ml-64
 * - Mobile: Drawer/hamburger sidebar (Sheet overlay)
 *
 * All padding is handled here in the main content area.
 * Child pages should NOT have their own padding.
 */
import { useState } from "react";
import { User } from "firebase/auth";
import { TopNav } from "./TopNav";
import { SidebarDesktop } from "./SidebarDesktop";
import { SidebarMobile } from "./SidebarMobile";

interface AppShellProps {
  user: User;
  children: React.ReactNode;
}

export const AppShell = ({ user, children }: AppShellProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* DESKTOP SIDEBAR - Fixed left, full height, only visible on lg+ */}
      <SidebarDesktop />

      {/* CONTENT WRAPPER - Offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-col lg:ml-64">
        {/* TOP NAVBAR - Always visible */}
        <TopNav
          user={user}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* MAIN CONTENT - Scrollable area */}
        <main className="flex-1 overflow-y-auto">
          {/* Padding applied here - child pages should not add their own */}
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE SIDEBAR - Drawer/Sheet from left, only for < lg screens */}
      <SidebarMobile
        open={isMobileSidebarOpen}
        onOpenChange={setIsMobileSidebarOpen}
      />
    </div>
  );
};

export default AppShell;
