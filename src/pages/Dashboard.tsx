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
import ComingSoon from "./ComingSoon";
import AIAssistant from "./AIAssistant";
import LearningStyle from "./LearningStyle";
import { SidebarProvider, useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import StudyMaterialManager from "@/components/StudyMaterialManager";
import { supabase } from "@/integrations/supabase/client";
import { useStudyStore } from "@/store/useStudyStore";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const setUserId = useStudyStore(state => state.setUserId);
  const setLearningStyle = useStudyStore(state => state.setLearningStyle);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setUserId(user.uid);
        fetchUserLearningStyle(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserLearningStyle = async (uid: string) => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('learning_style')
        .eq('firebase_uid', uid)
        .single();

      if (data?.learning_style) {
        setLearningStyle(data.learning_style as any);
      }
    } catch (error) {
      // Error fetching learning style - will use default
    }
  };

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
      <SidebarContentWrapper>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
          <SidebarTrigger className="lg:hidden" />
          <div className="flex-1">
            <DashboardNavbar user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
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
            <Route path="ai" element={<AIAssistant />} />
            <Route path="learning-style" element={<LearningStyle />} />
            <Route
              path="materials"
              element={
                <div className="p-8">
                  <StudyMaterialManager />
                </div>
              }
            />
            <Route
              path="tasks"
              element={
                <ComingSoon
                  title="Tasks Manager"
                  description="Organize and track your study tasks efficiently."
                />
              }
            />
            <Route
              path="analytics"
              element={
                <ComingSoon
                  title="Analytics Dashboard"
                  description="Detailed insights into your learning patterns and progress."
                />
              }
            />
            <Route
              path="notes"
              element={
                <ComingSoon
                  title="Smart Notes"
                  description="AI-powered note-taking and organization system."
                />
              }
            />
            <Route
              path="focus"
              element={
                <ComingSoon
                  title="Focus Mode"
                  description="Distraction-free environment to boost your productivity."
                />
              }
            />
            <Route
              path="faq"
              element={
                <ComingSoon
                  title="FAQ & Help"
                  description="Find answers to common questions about StudyPal."
                />
              }
            />
          </Routes>
        </main>
      </SidebarContentWrapper>
    </SidebarProvider>
  );
};

export default Dashboard;

/**
 * Wrapper untuk menyesuaikan margin-left konten utama
 * sesuai state sidebar collapse/expand
 */
const SidebarContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex w-full min-h-screen bg-background">
      {/* Sidebar fixed di kiri */}
      <DashboardSidebar />

      {/* Konten utama menyesuaikan sidebar */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-[--sidebar-width-icon]" : "ml-[--sidebar-width]"
        )}
      >
        {children}
      </div>
    </div>
  );
};
