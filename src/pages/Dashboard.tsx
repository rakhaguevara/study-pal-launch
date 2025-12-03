import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import DashboardHome from "@/components/dashboard/DashboardHome";
import Settings from "./Settings";
import ComingSoon from "./ComingSoon";
import AIAssistant from "./AIAssistant";
import LearningStyle from "./LearningStyle";
import Tasks from "./Tasks";
import StudyMaterialManager from "@/components/StudyMaterialManager";
import { supabase } from "@/integrations/supabase/client";
import { useStudyStore } from "@/store/useStudyStore";
import { AppShell } from "@/components/layout/AppShell";

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
      const { data, error } = await supabase
        .from('user_profiles')
        .select('learning_style')
        .eq('firebase_uid', uid)
        .maybeSingle();

      // Handle case where profile doesn't exist
      if (error) {
        console.warn('[fetchUserLearningStyle] error:', error);
        return;
      }

      if (data?.learning_style) {
        setLearningStyle(data.learning_style as any);
      }
    } catch (error) {
      // Error fetching learning style - will use default
      console.warn('[fetchUserLearningStyle] catch:', error);
    }
  };

  const getUserName = () => {
    if (!user) return "User";
    return user.displayName || user.email?.split("@")[0] || "User";
  };

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppShell user={user}>
      <Routes>
        <Route
          index
          element={<DashboardHome userName={getUserName()} />}
        />
        <Route path="settings" element={<Settings />} />
        <Route path="ai" element={<AIAssistant />} />
        <Route path="learning-style" element={<LearningStyle />} />
        <Route path="materials" element={<StudyMaterialManager />} />
        <Route path="tasks" element={<Tasks />} />
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
    </AppShell>
  );
};

export default Dashboard;
