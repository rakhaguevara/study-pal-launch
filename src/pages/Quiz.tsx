import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";
import { Eye, Headphones, BookOpen, Hand } from "lucide-react";

// Quiz questions - 10 per learning style (40 total)
// Theme: "Ancient Civilizations"
const quizQuestions = [
  // Visual Questions (1-10)
  { id: 1, type: "visual", question: "Look at this pyramid structure. Which civilization built it?", options: ["Egyptian", "Mayan", "Aztec", "Incan"], correct: 0, icon: Eye },
  { id: 2, type: "visual", question: "Observe this hieroglyphic pattern. What does it represent?", options: ["Numbers", "Gods", "Seasons", "Trade routes"], correct: 1, icon: Eye },
  { id: 3, type: "visual", question: "Study this map showing ancient trade routes. Which continent is highlighted?", options: ["Africa", "Asia", "Europe", "Americas"], correct: 1, icon: Eye },
  { id: 4, type: "visual", question: "Look at the architectural columns. Which style is this?", options: ["Doric", "Ionic", "Corinthian", "Composite"], correct: 2, icon: Eye },
  { id: 5, type: "visual", question: "Examine this ancient coin. Which emperor is depicted?", options: ["Julius Caesar", "Augustus", "Nero", "Constantine"], correct: 1, icon: Eye },
  { id: 6, type: "visual", question: "View this irrigation system diagram. Which civilization created it?", options: ["Mesopotamian", "Egyptian", "Roman", "Chinese"], correct: 0, icon: Eye },
  { id: 7, type: "visual", question: "Look at this color-coded timeline. When did the Bronze Age begin?", options: ["3300 BCE", "2000 BCE", "1200 BCE", "800 BCE"], correct: 0, icon: Eye },
  { id: 8, type: "visual", question: "Study this pottery design. Which culture is it from?", options: ["Greek", "Roman", "Persian", "Phoenician"], correct: 0, icon: Eye },
  { id: 9, type: "visual", question: "Observe this temple layout. Which religion is it associated with?", options: ["Buddhism", "Hinduism", "Judaism", "Zoroastrianism"], correct: 1, icon: Eye },
  { id: 10, type: "visual", question: "Look at this ancient writing system. What is it called?", options: ["Cuneiform", "Hieroglyphics", "Sanskrit", "Linear B"], correct: 0, icon: Eye },

  // Auditory Questions (11-20)
  { id: 11, type: "auditory", question: "Listen to this description: 'A civilization known for democracy and philosophy.' Which is it?", options: ["Greek", "Roman", "Persian", "Chinese"], correct: 0, icon: Headphones },
  { id: 12, type: "auditory", question: "Hear the narrative: 'They built the Great Wall.' Who are they?", options: ["Japanese", "Mongols", "Chinese", "Koreans"], correct: 2, icon: Headphones },
  { id: 13, type: "auditory", question: "Audio: 'Famous for their calendar system and astronomy.' Which civilization?", options: ["Mayan", "Incan", "Aztec", "Olmec"], correct: 0, icon: Headphones },
  { id: 14, type: "auditory", question: "Listen: 'Empire that stretched from Spain to India.' Which one?", options: ["Roman", "Persian", "Ottoman", "Mongol"], correct: 1, icon: Headphones },
  { id: 15, type: "auditory", question: "Hear: 'Invented paper and gunpowder.' Which civilization?", options: ["Indian", "Chinese", "Arab", "Japanese"], correct: 1, icon: Headphones },
  { id: 16, type: "auditory", question: "Audio clip: 'Built Machu Picchu.' Who built it?", options: ["Mayan", "Aztec", "Incan", "Olmec"], correct: 2, icon: Headphones },
  { id: 17, type: "auditory", question: "Listen: 'Known for gladiators and aqueducts.' Which empire?", options: ["Greek", "Roman", "Byzantine", "Persian"], correct: 1, icon: Headphones },
  { id: 18, type: "auditory", question: "Hear: 'Developed the first writing system.' Who were they?", options: ["Sumerians", "Egyptians", "Phoenicians", "Hebrews"], correct: 0, icon: Headphones },
  { id: 19, type: "auditory", question: "Audio: 'Famous for their library in Alexandria.' Which civilization?", options: ["Greek", "Roman", "Egyptian", "Persian"], correct: 2, icon: Headphones },
  { id: 20, type: "auditory", question: "Listen: 'Created the alphabet used today.' Who were they?", options: ["Greeks", "Romans", "Phoenicians", "Egyptians"], correct: 2, icon: Headphones },

  // Reading/Writing Questions (21-30)
  { id: 21, type: "reading_writing", question: "Read: 'The Code of Hammurabi established laws.' Where was it from?", options: ["Babylon", "Egypt", "Greece", "Rome"], correct: 0, icon: BookOpen },
  { id: 22, type: "reading_writing", question: "Text: 'The Rosetta Stone helped decipher which language?'", options: ["Cuneiform", "Hieroglyphics", "Sanskrit", "Latin"], correct: 1, icon: BookOpen },
  { id: 23, type: "reading_writing", question: "Read: 'Homer wrote the Iliad and Odyssey.' Which culture?", options: ["Greek", "Roman", "Persian", "Egyptian"], correct: 0, icon: BookOpen },
  { id: 24, type: "reading_writing", question: "Text: 'The Silk Road connected East and West.' Who initiated it?", options: ["Romans", "Persians", "Chinese", "Indians"], correct: 2, icon: BookOpen },
  { id: 25, type: "reading_writing", question: "Read: 'Democracy originated in Athens.' When approximately?", options: ["750 BCE", "508 BCE", "300 BCE", "100 BCE"], correct: 1, icon: BookOpen },
  { id: 26, type: "reading_writing", question: "Text: 'The Phoenicians spread their alphabet.' To which region?", options: ["Asia", "Africa", "Mediterranean", "Americas"], correct: 2, icon: BookOpen },
  { id: 27, type: "reading_writing", question: "Read: 'Confucius taught philosophy in China.' During which period?", options: ["Tang Dynasty", "Han Dynasty", "Zhou Dynasty", "Qin Dynasty"], correct: 2, icon: BookOpen },
  { id: 28, type: "reading_writing", question: "Text: 'The Vedas are ancient sacred texts.' From which religion?", options: ["Buddhism", "Hinduism", "Jainism", "Sikhism"], correct: 1, icon: BookOpen },
  { id: 29, type: "reading_writing", question: "Read: 'Alexander the Great conquered Persia.' When?", options: ["450 BCE", "356 BCE", "330 BCE", "200 BCE"], correct: 2, icon: BookOpen },
  { id: 30, type: "reading_writing", question: "Text: 'The Parthenon was dedicated to Athena.' In which city?", options: ["Sparta", "Athens", "Corinth", "Thebes"], correct: 1, icon: BookOpen },

  // Kinesthetic Questions (31-40)
  { id: 31, type: "kinesthetic", question: "Simulate building a pyramid. What shape is the base?", options: ["Circle", "Square", "Triangle", "Rectangle"], correct: 1, icon: Hand },
  { id: 32, type: "kinesthetic", question: "Act out sculpting a Greek statue. What tool do you use?", options: ["Hammer", "Chisel", "Brush", "Knife"], correct: 1, icon: Hand },
  { id: 33, type: "kinesthetic", question: "Pretend to navigate by stars like ancient sailors. What do you look for?", options: ["Sun", "North Star", "Moon", "Planets"], correct: 1, icon: Hand },
  { id: 34, type: "kinesthetic", question: "Mime plowing a field with ancient tools. What animal helps?", options: ["Horse", "Ox", "Donkey", "Camel"], correct: 1, icon: Hand },
  { id: 35, type: "kinesthetic", question: "Simulate writing on clay tablets. What tool do you use?", options: ["Stylus", "Brush", "Pen", "Feather"], correct: 0, icon: Hand },
  { id: 36, type: "kinesthetic", question: "Act out being a Roman soldier. What formation do you use?", options: ["Line", "Testudo", "Circle", "Square"], correct: 1, icon: Hand },
  { id: 37, type: "kinesthetic", question: "Pretend to build a Roman aqueduct. What principle is key?", options: ["Lever", "Gravity", "Pulley", "Wheel"], correct: 1, icon: Hand },
  { id: 38, type: "kinesthetic", question: "Mime creating pottery on a wheel. How do you shape it?", options: ["Hands", "Tools", "Molds", "All above"], correct: 3, icon: Hand },
  { id: 39, type: "kinesthetic", question: "Simulate trading goods on the Silk Road. What do you carry?", options: ["Silk", "Spices", "Gold", "All above"], correct: 3, icon: Hand },
  { id: 40, type: "kinesthetic", question: "Act out navigating a ship. What tool helps you steer?", options: ["Compass", "Rudder", "Oar", "Sail"], correct: 1, icon: Hand },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(40).fill(-1));
  const [startTime] = useState(Date.now());
  const [scores, setScores] = useState({ visual: 0, auditory: 0, reading_writing: 0, kinesthetic: 0 });
  const [loading, setLoading] = useState(false);
  const [userAge, setUserAge] = useState(18);

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const { data, error } = await supabase.functions.invoke('process-quiz', {
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

      if (error) throw error;

      toast.success(`Your learning style is: ${data.learningStyle}!`);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error submitting quiz:", error);
      toast.error(error.message || "Failed to process quiz");
    } finally {
      setLoading(false);
    }
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