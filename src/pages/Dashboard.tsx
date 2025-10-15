import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardCards from "@/components/DashboardCards";
import RecommendedTips from "@/components/RecommendedTips";
import Settings from "./Settings";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const getUserName = () => {
    if (!user) return "User";
    return user.displayName || user.email?.split("@")[0] || "User";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <SidebarInset className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1">
              <DashboardNavbar user={user} />
            </div>
          </header>
          <main className="flex-1">
            <Routes>
              <Route
                index
                element={
                  <div className="p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-2">
                          Welcome back, {getUserName()} 👋
                        </h1>
                        <p className="text-muted-foreground">
                          Here's a summary of your study performance.
                        </p>
                      </div>

                      <DashboardCards />
                      <RecommendedTips />
                    </motion.div>
                  </div>
                }
              />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
