import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";
import { Eye, Headphones, BookOpen, Hand, Image, Volume2, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import KinestheticQuestion from "@/components/KinestheticQuestion";

// Enhanced quiz questions with media
const quizQuestions = [
  // Visual Questions (1-10) - with images
  { id: 1, type: "visual", question: "Look at this pyramid structure. Which civilization built it?", options: ["Egyptian", "Mayan", "Aztec", "Incan"], correct: 0, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a5e?w=400" },
  { id: 2, type: "visual", question: "Observe this ancient artifact. What does it represent?", options: ["Numbers", "Gods", "Seasons", "Trade routes"], correct: 1, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
  { id: 3, type: "visual", question: "Study this ancient map. Which continent is highlighted?", options: ["Africa", "Asia", "Europe", "Americas"], correct: 1, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1476673160081-cf065607f449?w=400" },
  { id: 4, type: "visual", question: "Look at these architectural columns. Which style is this?", options: ["Doric", "Ionic", "Corinthian", "Composite"], correct: 2, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1566404791232-af9fe86b1c22?w=400" },
  { id: 5, type: "visual", question: "Examine this ancient coin. Which emperor is depicted?", options: ["Julius Caesar", "Augustus", "Nero", "Constantine"], correct: 1, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400" },
  { id: 6, type: "visual", question: "View this ancient pottery. Which civilization created it?", options: ["Greek", "Roman", "Chinese", "Persian"], correct: 0, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },
  { id: 7, type: "visual", question: "Look at this timeline. When did the Bronze Age begin?", options: ["3300 BCE", "2000 BCE", "1200 BCE", "800 BCE"], correct: 0, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400" },
  { id: 8, type: "visual", question: "Study this temple. Which religion is it associated with?", options: ["Buddhism", "Hinduism", "Judaism", "Zoroastrianism"], correct: 1, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1566404791232-af9fe86b1c22?w=400" },
  { id: 9, type: "visual", question: "Observe this ancient sculpture. Which civilization created it?", options: ["Greek", "Egyptian", "Roman", "Persian"], correct: 0, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a5e?w=400" },
  { id: 10, type: "visual", question: "Look at this ancient writing system. What is it called?", options: ["Cuneiform", "Hieroglyphics", "Sanskrit", "Linear B"], correct: 0, icon: Eye, imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400" },

  // Auditory Questions (11-20) - with audio descriptions
  { id: 11, type: "auditory", question: "Listen: 'A civilization known for democracy and philosophy.' Which is it?", options: ["Greek", "Roman", "Persian", "Chinese"], correct: 0, icon: Headphones, audioText: "A civilization known for democracy and philosophy." },
  { id: 12, type: "auditory", question: "Hear: 'They built the Great Wall.' Who are they?", options: ["Japanese", "Mongols", "Chinese", "Koreans"], correct: 2, icon: Headphones, audioText: "They built the Great Wall." },
  { id: 13, type: "auditory", question: "Listen: 'Famous for their calendar system and astronomy.' Which civilization?", options: ["Mayan", "Incan", "Aztec", "Olmec"], correct: 0, icon: Headphones, audioText: "Famous for their calendar system and astronomy." },
  { id: 14, type: "auditory", question: "Hear: 'Empire that stretched from Spain to India.' Which one?", options: ["Roman", "Persian", "Ottoman", "Mongol"], correct: 1, icon: Headphones, audioText: "Empire that stretched from Spain to India." },
  { id: 15, type: "auditory", question: "Listen: 'Invented paper and gunpowder.' Which civilization?", options: ["Indian", "Chinese", "Arab", "Japanese"], correct: 1, icon: Headphones, audioText: "Invented paper and gunpowder." },
  { id: 16, type: "auditory", question: "Hear: 'Built Machu Picchu.' Who built it?", options: ["Mayan", "Aztec", "Incan", "Olmec"], correct: 2, icon: Headphones, audioText: "Built Machu Picchu." },
  { id: 17, type: "auditory", question: "Listen: 'Known for gladiators and aqueducts.' Which empire?", options: ["Greek", "Roman", "Byzantine", "Persian"], correct: 1, icon: Headphones, audioText: "Known for gladiators and aqueducts." },
  { id: 18, type: "auditory", question: "Hear: 'Developed the first writing system.' Who were they?", options: ["Sumerians", "Egyptians", "Phoenicians", "Hebrews"], correct: 0, icon: Headphones, audioText: "Developed the first writing system." },
  { id: 19, type: "auditory", question: "Listen: 'Famous for their library in Alexandria.' Which civilization?", options: ["Greek", "Roman", "Egyptian", "Persian"], correct: 2, icon: Headphones, audioText: "Famous for their library in Alexandria." },
  { id: 20, type: "auditory", question: "Hear: 'Created the alphabet used today.' Who were they?", options: ["Greeks", "Romans", "Phoenicians", "Egyptians"], correct: 2, icon: Headphones, audioText: "Created the alphabet used today." },

  // Reading/Writing Questions (21-30) - with extended passages
  { id: 21, type: "reading_writing", question: "Question about ancient laws.", options: ["Babylon", "Egypt", "Greece", "Rome"], correct: 0, icon: BookOpen, readingPassage: "The Code of Hammurabi, one of the oldest deciphered writings of significant length, established laws for ancient Babylon. It contained 282 laws, with scaled punishments, adjusting 'an eye for an eye, a tooth for a tooth' depending on social status." },
  { id: 22, type: "reading_writing", question: "Question about the Rosetta Stone.", options: ["Cuneiform", "Hieroglyphics", "Sanskrit", "Latin"], correct: 1, icon: BookOpen, readingPassage: "The Rosetta Stone, discovered in 1799, is a granodiorite stele inscribed with three versions of a decree. It provided the key to understanding Egyptian hieroglyphs, a writing system that had been a mystery for centuries." },
  { id: 23, type: "reading_writing", question: "Question about epic poems.", options: ["Greek", "Roman", "Persian", "Egyptian"], correct: 0, icon: BookOpen, readingPassage: "Homer, the ancient Greek poet, wrote the Iliad and the Odyssey, two epic poems that are among the oldest surviving works of Western literature. These texts provide insight into Greek mythology, warfare, and society around 800 BCE." },
  { id: 24, type: "reading_writing", question: "Question about trade routes.", options: ["Romans", "Persians", "Chinese", "Indians"], correct: 2, icon: BookOpen, readingPassage: "The Silk Road was an ancient network of trade routes that connected the East and West, stretching from China through Central Asia to the Mediterranean. It facilitated the exchange of goods, cultures, and ideas between civilizations." },
  { id: 25, type: "reading_writing", question: "Question about democracy.", options: ["750 BCE", "508 BCE", "300 BCE", "100 BCE"], correct: 1, icon: BookOpen, readingPassage: "Democracy, a system of government where citizens have a say in political decisions, originated in ancient Athens around 508 BCE. This innovative form of governance allowed male citizens to participate directly in political matters." },
  { id: 26, type: "reading_writing", question: "Question about the Phoenicians.", options: ["Asia", "Africa", "Mediterranean", "Americas"], correct: 2, icon: BookOpen, readingPassage: "The Phoenicians were an ancient civilization located on the coast of the Mediterranean Sea. They are credited with spreading their alphabet throughout the Mediterranean region, which would later influence the development of the Greek and Latin alphabets." },
  { id: 27, type: "reading_writing", question: "Question about Confucius.", options: ["Tang Dynasty", "Han Dynasty", "Zhou Dynasty", "Qin Dynasty"], correct: 2, icon: BookOpen, readingPassage: "Confucius, the Chinese philosopher and teacher, lived during the Zhou Dynasty, specifically the Spring and Autumn period. His teachings on ethics, family relationships, and social harmony profoundly influenced Chinese culture and philosophy." },
  { id: 28, type: "reading_writing", question: "Question about the Vedas.", options: ["Buddhism", "Hinduism", "Jainism", "Sikhism"], correct: 1, icon: BookOpen, readingPassage: "The Vedas are ancient sacred texts of Hinduism, composed in Sanskrit. These texts are considered the oldest scriptures of Hinduism and contain hymns, rituals, and philosophical teachings that have shaped Hindu religious thought for millennia." },
  { id: 29, type: "reading_writing", question: "Question about Alexander the Great.", options: ["450 BCE", "356 BCE", "330 BCE", "200 BCE"], correct: 2, icon: BookOpen, readingPassage: "Alexander the Great, the King of Macedonia, conquered the Persian Empire after defeating King Darius III. His conquest of Persia in 330 BCE marked the beginning of the Hellenistic era and spread Greek culture throughout the ancient world." },
  { id: 30, type: "reading_writing", question: "Question about the Parthenon.", options: ["Sparta", "Athens", "Corinth", "Thebes"], correct: 1, icon: BookOpen, readingPassage: "The Parthenon, a temple dedicated to Athena, the goddess of wisdom and warfare, is located in Athens, Greece. Built in the 5th century BCE on the Acropolis, it represents the pinnacle of classical Greek architecture." },

  // Kinesthetic Questions (31-40) - with drag-and-drop
  { id: 31, type: "kinesthetic", question: "Match each ancient civilization with its famous achievement.", options: ["Egyptian", "Greek", "Roman", "Chinese"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Pyramids", right: "Egyptians" },
    { id: "2", left: "Democracy", right: "Greeks" },
    { id: "3", left: "Aqueducts", right: "Romans" },
    { id: "4", left: "Great Wall", right: "Chinese" }
  ]},
  { id: 32, type: "kinesthetic", question: "Match each tool with its ancient use.", options: ["Hand", "Tool", "Use", "All"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Stylus", right: "Writing on clay" },
    { id: "2", left: "Chisel", right: "Sculpting marble" },
    { id: "3", left: "Plow", right: "Farming fields" },
    { id: "4", left: "Loom", right: "Weaving cloth" }
  ]},
  { id: 33, type: "kinesthetic", question: "Match each animal with where it was first domesticated.", options: ["Wild", "Domestic", "Both", "None"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Dog", right: "Middle East" },
    { id: "2", left: "Horse", right: "Central Asia" },
    { id: "3", left: "Cow", right: "Ancient India" },
    { id: "4", left: "Chicken", right: "Southeast Asia" }
  ]},
  { id: 34, type: "kinesthetic", question: "Match each ancient writing system with its civilization.", options: ["A", "B", "C", "D"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Hieroglyphics", right: "Egyptians" },
    { id: "2", left: "Cuneiform", right: "Sumerians" },
    { id: "3", left: "Linear B", right: "Mycenaeans" },
    { id: "4", left: "Oracle Bones", right: "Chinese" }
  ]},
  { id: 35, type: "kinesthetic", question: "Match each temple with its location.", options: ["1", "2", "3", "4"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Parthenon", right: "Athens" },
    { id: "2", left: "Pantheon", right: "Rome" },
    { id: "3", left: "Angkor Wat", right: "Cambodia" },
    { id: "4", left: "Machu Picchu", right: "Peru" }
  ]},
  { id: 36, type: "kinesthetic", question: "Match each ancient empire with its capital city.", options: ["A", "B", "C", "D"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Roman Empire", right: "Rome" },
    { id: "2", left: "Byzantine Empire", right: "Constantinople" },
    { id: "3", left: "Persian Empire", right: "Persepolis" },
    { id: "4", left: "Macedonian Empire", right: "Pella" }
  ]},
  { id: 37, type: "kinesthetic", question: "Match each invention with its inventor civilization.", options: ["1", "2", "3", "4"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Paper", right: "Chinese" },
    { id: "2", left: "Zero", right: "Indians" },
    { id: "3", left: "Wheel", right: "Mesopotamians" },
    { id: "4", left: "Mosaics", right: "Romans" }
  ]},
  { id: 38, type: "kinesthetic", question: "Match each ancient philosophy with its founder.", options: ["A", "B", "C", "D"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Confucianism", right: "Confucius" },
    { id: "2", left: "Socratic Method", right: "Socrates" },
    { id: "3", left: "Buddhism", right: "Buddha" },
    { id: "4", left: "Stoicism", right: "Zeno" }
  ]},
  { id: 39, type: "kinesthetic", question: "Match each battle with its war.", options: ["War", "Battle", "Both", "None"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Battle of Marathon", right: "Greco-Persian Wars" },
    { id: "2", left: "Battle of Cannae", right: "Punic Wars" },
    { id: "3", left: "Battle of Gaugamela", right: "Conquest of Persia" },
    { id: "4", left: "Battle of Zama", right: "Punic Wars" }
  ]},
  { id: 40, type: "kinesthetic", question: "Match each ancient structure with its purpose.", options: ["Purpose", "Structure", "Both", "None"], correct: 1, icon: Hand, dragDropPairs: [
    { id: "1", left: "Pyramid", right: "Tomb for Pharaohs" },
    { id: "2", left: "Colosseum", right: "Entertainment Arena" },
    { id: "3", left: "Great Wall", right: "Defense Barrier" },
    { id: "4", left: "Aqueduct", right: "Water Transport" }
  ]},
];

const Quiz = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Load from sessionStorage
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    const saved = sessionStorage.getItem('quiz-current-question');
    return saved ? parseInt(saved) : 0;
  });
  
  const [answers, setAnswers] = useState<number[]>(() => {
    const saved = sessionStorage.getItem('quiz-answers');
    return saved ? JSON.parse(saved) : new Array(40).fill(-1);
  });
  
  const [scores, setScores] = useState({ visual: 0, auditory: 0, reading_writing: 0, kinesthetic: 0 });
  const [loading, setLoading] = useState(false);
  const [userAge, setUserAge] = useState(18);
  const [kinestheticAnswers, setKinestheticAnswers] = useState<{ [key: number]: boolean }>({});
  const startTimeRef = useRef(Date.now());

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    sessionStorage.setItem('quiz-current-question', currentQuestion.toString());
    sessionStorage.setItem('quiz-answers', JSON.stringify(answers));
  }, [currentQuestion, answers]);

  // Cleanup audio on unmount or question change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentQuestion]);

  useEffect(() => {
    const checkProfile = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate("/login");
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('age, quiz_completed')
        .eq('firebase_uid', currentUser.uid)
        .single();

      if (!profile) {
        navigate("/onboarding");
        return;
      }

      if (profile.quiz_completed) {
        navigate("/dashboard");
        return;
      }

      setUserAge(profile.age || 18);
    };

    checkProfile();
  }, [navigate]);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    const question = quizQuestions[currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      const newScores = { ...scores };
      if (question.type === "visual") newScores.visual++;
      else if (question.type === "auditory") newScores.auditory++;
      else if (question.type === "reading_writing") newScores.reading_writing++;
      else if (question.type === "kinesthetic") newScores.kinesthetic++;
      setScores(newScores);
    }

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleSubmit();
      }
    }, 500);
  };

  // Sync quiz result to user profile for AI recommendations
  const syncQuizResultToProfile = async (
    userId: string,
    resultData: {
      userId: string;
      learningStyle: "visual" | "auditory" | "reading_writing" | "kinesthetic";
      questionType: "kinesthetic";
      correctAnswers: number;
      totalQuestions: number;
      timestamp: string;
      matchedPairs: { left: string; right: string; isCorrect: boolean }[];
    }
  ) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          quiz_data: resultData,
          quiz_completed: true,
          learning_style: resultData.learningStyle
        })
        .eq('firebase_uid', userId);

      if (error) throw error;
      
      console.log('Quiz result synced to profile for AI recommendations');
    } catch (error) {
      console.error('Error syncing quiz result:', error);
    }
  };

  // Fallback function to save quiz results directly to database
  const saveQuizResultsDirectly = async (currentUser: any, timeTaken: number) => {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('firebase_uid', currentUser.uid)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found. Please complete your profile first.');
    }

    // Determine quiz level based on age
    let quizLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
    if (userAge < 14) quizLevel = 'beginner';
    else if (userAge >= 20) quizLevel = 'advanced';

    // Calculate total score
    const totalScore = scores.visual + scores.auditory + scores.reading_writing + scores.kinesthetic;

    // Determine dominant learning style
    const scoreMap = {
      visual: scores.visual,
      auditory: scores.auditory,
      reading_writing: scores.reading_writing,
      kinesthetic: scores.kinesthetic
    };

    const dominantStyle = Object.entries(scoreMap)
      .sort(([, a], [, b]) => b - a)[0][0] as 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';

    // Insert quiz result
    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results')
      .insert({
        user_id: profile.id,
        visual_score: scores.visual,
        audio_score: scores.auditory,
        text_score: scores.reading_writing,
        kinesthetic_score: scores.kinesthetic,
        total_score: totalScore,
        quiz_level: quizLevel,
        time_taken: timeTaken
      })
      .select()
      .single();

    if (quizError) {
      throw new Error(`Failed to save quiz result: ${quizError.message}`);
    }

    // Update user profile with learning style
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        learning_style: dominantStyle,
        quiz_completed: true
      })
      .eq('id', profile.id);

    if (updateError) {
      console.warn('Failed to update user profile:', updateError);
      // Don't throw here, quiz result is already saved
    }

    return {
      learningStyle: dominantStyle,
      quizResult: quizResult
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      let data: any;
      let useFallback = false;

      // Try to use Edge Function first
      try {
        const { data: functionData, error: functionError } = await supabase.functions.invoke('process-quiz', {
          body: {
            userId: currentUser.uid,
            visualScore: scores.visual,
            audioScore: scores.auditory,
            textScore: scores.reading_writing,
            kinestheticScore: scores.kinesthetic,
            timeTaken: timeTaken,
            age: userAge,
          },
        });

        if (functionError) {
          console.warn('Edge Function failed, using fallback:', functionError);
          useFallback = true;
        } else {
          data = functionData;
        }
      } catch (functionError: any) {
        console.warn('Edge Function not available, using fallback:', functionError);
        useFallback = true;
      }

      // Use fallback if Edge Function failed
      if (useFallback) {
        data = await saveQuizResultsDirectly(currentUser, timeTaken);
      }

      // Sync quiz results to profile for AI recommendations
      await syncQuizResultToProfile(currentUser.uid, {
        userId: currentUser.uid,
        learningStyle: data.learningStyle || "visual",
        questionType: "kinesthetic",
        correctAnswers: scores.kinesthetic,
        totalQuestions: 10, // Assuming 10 kinesthetic questions
        timestamp: new Date().toISOString(),
        matchedPairs: Object.entries(kinestheticAnswers).map(([qId, isCorrect]) => ({
          left: "",
          right: "",
          isCorrect: isCorrect || false
        }))
      });

      // Clear sessionStorage
      sessionStorage.removeItem('quiz-current-question');
      sessionStorage.removeItem('quiz-answers');

      toast.success(`Your learning style is: ${data.learningStyle}!`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast.error(error.message || "Failed to process quiz");
    } finally {
      setLoading(false);
    }
  };

  // Text-to-speech for auditory learners
  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const Icon = question.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-orange-500 to-blue-600">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {question.type.replace('_', ' ').toUpperCase()} Question
                  </h2>
                  <p className="text-sm text-gray-400">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                <div className="text-xs text-gray-400">Complete</div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-semibold text-white mb-6">
                {question.question}
              </h3>

              {/* Visual: Show image */}
              {question.type === 'visual' && question.imageUrl && (
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative group cursor-pointer mb-6">
                      <img 
                        src={question.imageUrl} 
                        alt="Question visual" 
                        className="w-full h-64 object-cover rounded-lg border-2 border-white/20 group-hover:border-orange-500 transition-colors"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <Maximize2 className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <img src={question.imageUrl} alt="Question visual" className="w-full rounded-lg" />
                  </DialogContent>
                </Dialog>
              )}

              {/* Auditory: Play audio */}
              {question.type === 'auditory' && question.audioText && (
                <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border-2 border-blue-500/20">
                  <Button
                    variant="outline"
                    onClick={() => handleSpeak(question.audioText!)}
                    className="w-full bg-blue-500/20 border-blue-500 text-white hover:bg-blue-500/30"
                  >
                    <Headphones className="h-5 w-5 mr-2" />
                    Play Audio (Text-to-Speech)
                  </Button>
                  <p className="text-sm text-gray-400 mt-2 italic">"{question.audioText}"</p>
                </div>
              )}

              {/* Reading/Writing: Show reading passage */}
              {question.type === 'reading_writing' && question.readingPassage && (
                <div className="mb-6 p-6 bg-green-500/10 rounded-lg border-2 border-green-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-green-400">Reading Passage</h4>
                  </div>
                  <p className="text-white leading-relaxed">{question.readingPassage}</p>
                </div>
              )}

              {/* Kinesthetic: Drag-and-drop */}
              {question.type === 'kinesthetic' && question.dragDropPairs ? (
                <KinestheticQuestion
                  pairs={question.dragDropPairs}
                  onAnswer={(matches) => {
                    // Store the matches and auto-advance
                    setKinestheticAnswers({ ...kinestheticAnswers, [currentQuestion]: true });
                    
                    // Calculate correctness and update scores
                    const isCorrect = matches.every(m => m.leftId === m.rightId);
                    if (isCorrect && question.type === "kinesthetic") {
                      setScores({ ...scores, kinesthetic: scores.kinesthetic + 1 });
                    }
                    
                    // Auto-advance after feedback delay
                    setTimeout(() => {
                      if (currentQuestion < quizQuestions.length - 1) {
                        setCurrentQuestion(currentQuestion + 1);
                      } else {
                        handleSubmit();
                      }
                    }, 1500);
                  }}
                  isAnswered={kinestheticAnswers[currentQuestion] || false}
                  correctMatches={question.dragDropPairs.map(pair => ({
                    leftId: pair.id,
                    rightId: pair.id
                  }))}
                  questionId={currentQuestion}
                />
              ) : (
                /* Regular Options */
                <div className="grid gap-3">
                  {question.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={answers[currentQuestion] !== -1 || loading}
                      variant="outline"
                      className={`
                        w-full p-6 text-left justify-start text-lg
                        bg-white/5 hover:bg-white/10 border-white/20
                        text-white transition-all duration-300
                        ${answers[currentQuestion] === index ? 'bg-gradient-to-r from-orange-500 to-blue-600 border-transparent' : ''}
                      `}
                    >
                      <span className="mr-4 font-bold">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {loading && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
              <p className="text-white mt-4">Processing your results...</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Quiz;