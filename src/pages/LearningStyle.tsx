import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { Eye, Headphones, BookOpen, Hand, RefreshCw, Lightbulb } from "lucide-react";

const LearningStyle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [latestQuiz, setLatestQuiz] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('firebase_uid', currentUser.uid)
        .single();

      if (!userProfile) {
        navigate("/onboarding");
        return;
      }

      setProfile(userProfile);

      if (userProfile.quiz_completed) {
        const { data: quizData } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('date_taken', { ascending: false })
          .limit(1)
          .single();

        setLatestQuiz(quizData);
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load learning style data");
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Update quiz_completed to false
      const { error } = await supabase
        .from('user_profiles')
        .update({ quiz_completed: false, learning_style: 'undetermined' })
        .eq('firebase_uid', currentUser.uid);

      if (error) throw error;

      toast.success("Redirecting to quiz...");
      navigate("/quiz");
    } catch (error: any) {
      console.error("Error resetting quiz:", error);
      toast.error("Failed to retake quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile?.quiz_completed) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="mb-6">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h1 className="text-4xl font-bold mb-2">Discover Your Learning Style</h1>
            <p className="text-muted-foreground">
              Take our 40-question assessment to unlock personalized study recommendations
            </p>
          </div>
          <Button
            onClick={() => navigate("/quiz")}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700"
          >
            Start Learning Style Quiz
          </Button>
        </motion.div>
      </div>
    );
  }

  const styleInfo = {
    visual: {
      icon: Eye,
      title: "Visual Learner",
      description: "You learn best through seeing and visualizing information",
      tips: [
        "Use mind maps and diagrams",
        "Color-code your notes",
        "Watch educational videos",
        "Use flashcards with images"
      ]
    },
    auditory: {
      icon: Headphones,
      title: "Auditory Learner",
      description: "You learn best through listening and speaking",
      tips: [
        "Record lectures and listen back",
        "Discuss concepts with others",
        "Use mnemonic devices",
        "Read your notes aloud"
      ]
    },
    reading_writing: {
      icon: BookOpen,
      title: "Reading/Writing Learner",
      description: "You learn best through reading and writing",
      tips: [
        "Take detailed notes",
        "Rewrite information in your own words",
        "Create study guides",
        "Use text-based resources"
      ]
    },
    kinesthetic: {
      icon: Hand,
      title: "Kinesthetic Learner",
      description: "You learn best through hands-on experience",
      tips: [
        "Use physical objects and models",
        "Take frequent breaks to move",
        "Do experiments and projects",
        "Act out concepts or scenarios"
      ]
    }
  };

  const currentStyle = styleInfo[profile.learning_style as keyof typeof styleInfo] || styleInfo.visual;
  const Icon = currentStyle.icon;

  const maxScore = Math.max(
    latestQuiz?.visual_score || 0,
    latestQuiz?.audio_score || 0,
    latestQuiz?.text_score || 0,
    latestQuiz?.kinesthetic_score || 0
  );

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Learning Style</h1>
          <p className="text-muted-foreground">
            Personalized insights based on your assessment
          </p>
        </div>

        {/* Main Style Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-orange-500/10 to-blue-600/10 border-orange-500/20">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-blue-600">
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{currentStyle.title}</h2>
              <p className="text-lg text-muted-foreground mb-4">
                {currentStyle.description}
              </p>
              <Button
                onClick={handleRetakeQuiz}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retake Quiz
              </Button>
            </div>
          </div>
        </Card>

        {/* Score Breakdown */}
        {latestQuiz && (
          <Card className="p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6">Your Scores</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Visual
                  </span>
                  <span className="font-semibold">{latestQuiz.visual_score}/10</span>
                </div>
                <Progress 
                  value={(latestQuiz.visual_score / 10) * 100} 
                  className="h-3"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Headphones className="w-4 h-4" /> Auditory
                  </span>
                  <span className="font-semibold">{latestQuiz.audio_score}/10</span>
                </div>
                <Progress 
                  value={(latestQuiz.audio_score / 10) * 100} 
                  className="h-3"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Reading/Writing
                  </span>
                  <span className="font-semibold">{latestQuiz.text_score}/10</span>
                </div>
                <Progress 
                  value={(latestQuiz.text_score / 10) * 100} 
                  className="h-3"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Hand className="w-4 h-4" /> Kinesthetic
                  </span>
                  <span className="font-semibold">{latestQuiz.kinesthetic_score}/10</span>
                </div>
                <Progress 
                  value={(latestQuiz.kinesthetic_score / 10) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Study Tips */}
        <Card className="p-8">
          <h3 className="text-2xl font-bold mb-6">Personalized Study Tips</h3>
          <ul className="space-y-3">
            {currentStyle.tips.map((tip, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-white font-bold">{index + 1}</span>
                </div>
                <span className="text-lg">{tip}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </motion.div>
    </div>
  );
};

export default LearningStyle;