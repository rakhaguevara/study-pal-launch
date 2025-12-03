import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Headphones, BookOpen, Hand, Lightbulb, Brain, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

const defaultTips = [
  {
    icon: Lightbulb,
    title: "Start with Learning Style Quiz",
    description: "Take our assessment to discover your personalized learning path.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    icon: Brain,
    title: "Active Recall Practice",
    description: "Test yourself regularly instead of just re-reading notes.",
    color: "from-purple-400 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Take Regular Breaks",
    description: "Use the Pomodoro technique: 25 min study, 5 min break.",
    color: "from-green-400 to-teal-500",
  },
];

const learningStyleTips = {
  visual: [
    {
      icon: Eye,
      title: "Use Mind Maps",
      description: "Create visual diagrams to connect and organize complex concepts.",
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: Eye,
      title: "Color-Code Your Notes",
      description: "Use different colors to categorize information and improve retention.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: Eye,
      title: "Watch Educational Videos",
      description: "Visual demonstrations help you understand concepts faster.",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: Eye,
      title: "Create Flashcards",
      description: "Use image-rich flashcards for better visual memorization.",
      color: "from-green-400 to-teal-500",
    },
  ],
  auditory: [
    {
      icon: Headphones,
      title: "Record and Listen",
      description: "Record lectures and your own explanations, then listen back.",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Headphones,
      title: "Discuss with Others",
      description: "Join study groups and verbalize concepts to reinforce learning.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: Headphones,
      title: "Use Mnemonic Devices",
      description: "Create rhymes, songs, or acronyms to remember information.",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: Headphones,
      title: "Read Aloud",
      description: "Speaking your notes out loud helps reinforce memory.",
      color: "from-green-400 to-teal-500",
    },
  ],
  reading_writing: [
    {
      icon: BookOpen,
      title: "Take Detailed Notes",
      description: "Write comprehensive notes during lectures and while reading.",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: BookOpen,
      title: "Rewrite in Your Words",
      description: "Summarize information by rewriting it in your own language.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: BookOpen,
      title: "Create Study Guides",
      description: "Make written outlines and summaries of key topics.",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: BookOpen,
      title: "Use Text Resources",
      description: "Read textbooks, articles, and written materials for deep understanding.",
      color: "from-green-400 to-teal-500",
    },
  ],
  kinesthetic: [
    {
      icon: Hand,
      title: "Hands-On Practice",
      description: "Use physical objects, models, and experiments to learn.",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: Hand,
      title: "Take Movement Breaks",
      description: "Study in short bursts with physical activity in between.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: Hand,
      title: "Act Out Concepts",
      description: "Role-play scenarios or use gestures to understand ideas.",
      color: "from-orange-400 to-red-500",
    },
    {
      icon: Hand,
      title: "Do Projects",
      description: "Apply knowledge through practical projects and real-world tasks.",
      color: "from-green-400 to-teal-500",
    },
  ],
};

const RecommendedTips = () => {
  const [tips, setTips] = useState(defaultTips);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonalizedTips();
  }, []);

  const fetchPersonalizedTips = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('learning_style, quiz_completed')
        .eq('firebase_uid', currentUser.uid)
        .maybeSingle();

      if (error) {
        console.warn('[RecommendedTips] user_profiles query error:', error);
        return;
      }

      if (profile && profile.quiz_completed && profile.learning_style !== 'undetermined') {
        const styleTips = learningStyleTips[profile.learning_style as keyof typeof learningStyleTips];
        if (styleTips) {
          setTips(styleTips);
        }
      }
    } catch (error) {
      console.error("Error fetching personalized tips:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 sm:mt-8 lg:mt-12">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-4 sm:mb-6">
          Loading Recommendations...
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-border animate-pulse">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8 lg:mt-12">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-4 sm:mb-6">
        Recommended Tips for You
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {tips.map((tip, index) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-border hover:shadow-md transition-shadow card-hover"
          >
            <div className="flex gap-3 sm:gap-4">
              <div
                className={`flex-shrink-0 p-2.5 sm:p-3 rounded-lg bg-gradient-to-br ${tip.color} text-white`}
              >
                <tip.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">
                  {tip.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedTips;