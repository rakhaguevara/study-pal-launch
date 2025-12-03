/**
 * Top Navigation Bar - Always visible
 * Contains: Logo, hamburger (mobile), learning style, user menu
 */
import { User } from "firebase/auth";
import { LogOut, Menu, User as UserIcon, BookOpen } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LearningStyleSelector from "@/components/LearningStyleSelector";

interface TopNavProps {
  user: User;
  onOpenSidebar: () => void;
}

export const TopNav = ({ user, onOpenSidebar }: TopNavProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You've been successfully signed out",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 sm:px-4 lg:px-6">
      {/* Left side: Hamburger (mobile) + Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger button - only visible on mobile (<lg) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo - visible on mobile, hidden on lg (sidebar has it) */}
        <div className="flex items-center gap-2 lg:hidden">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-gradient">StudyPal</span>
        </div>
      </div>

      {/* Right side: Learning Style + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Learning style selector - hide on very small screens */}
        <div className="hidden sm:block">
          <LearningStyleSelector />
        </div>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-orange-400 to-blue-500 text-white text-xs sm:text-sm">
                  {getInitials(user.email || "U")}
                </AvatarFallback>
              </Avatar>
              {/* Show user info on larger screens */}
              <div className="text-left hidden xl:block max-w-[150px]">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.displayName || user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || user.email?.split("@")[0]}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
              <UserIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopNav;


