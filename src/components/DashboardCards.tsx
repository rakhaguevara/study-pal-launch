import { useEffect, useState } from "react";
import { Clock, Calendar, Book, Target } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

const DashboardCards = () => {
  const [userData, setUserData] = useState({
    studyTime: "0 hrs",
    activeDays: "0 days",
    favoriteSubject: "Not set",
    learningStyle: "Take quiz to discover",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('learning_style, quiz_completed')
        .eq('firebase_uid', currentUser.uid)
        .maybeSingle();

      if (error) {
        console.warn('[DashboardCards] user_profiles query error:', error);
        return;
      }

      if (profile) {
        const learningStyleDisplay = profile.learning_style === 'undetermined' 
          ? 'Take quiz to discover'
          : profile.learning_style.replace('_', '/').split(' ').map((word: string) => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

        setUserData(prev => ({
          ...prev,
          learningStyle: learningStyleDisplay,
        }));

        if (profile.quiz_completed) {
          const { data: quizResults } = await supabase
            .from('quiz_results')
            .select('*')
            .order('date_taken', { ascending: false });

          if (quizResults && quizResults.length > 0) {
            const totalQuizzes = quizResults.length;
            const totalTime = quizResults.reduce((acc, quiz) => acc + (quiz.time_taken || 0), 0);
            const hours = Math.floor(totalTime / 3600);
            const minutes = Math.floor((totalTime % 3600) / 60);
            
            setUserData(prev => ({
              ...prev,
              studyTime: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
              activeDays: `${totalQuizzes} ${totalQuizzes === 1 ? 'quiz' : 'quizzes'}`,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const summaryData = [
    {
      icon: Clock,
      label: "Total Study Time",
      value: userData.studyTime,
      color: "from-orange-400 to-orange-600",
    },
    {
      icon: Calendar,
      label: "Quiz Activity",
      value: userData.activeDays,
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: Book,
      label: "Favorite Subject",
      value: userData.favoriteSubject,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      icon: Target,
      label: "Learning Style",
      value: userData.learningStyle,
      color: "from-purple-400 to-purple-600",
    },
  ];

  return (
    // Responsive grid: 1 col mobile, 2 col tablet, 4 col desktop
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {summaryData.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`p-2.5 sm:p-3 rounded-lg bg-gradient-to-br ${item.color} text-white flex-shrink-0`}
            >
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">{item.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;
