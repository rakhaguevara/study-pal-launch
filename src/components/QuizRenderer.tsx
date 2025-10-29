import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, Play, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { useStudyStore } from '@/store/useStudyStore';
import { saveQuizResult } from '@/utils/supabaseStudyMaterials';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  imageUrl?: string;
  type: string;
}

interface QuizRendererProps {
  questions: QuizQuestion[];
  materialName: string;
}

const QuizRenderer = ({ questions, materialName }: QuizRendererProps) => {
  const { toast } = useToast();
  const user = auth.currentUser;
  const learningStyle = useStudyStore(state => state.learningStyle);

  // Load from sessionStorage
  const sessionKey = `quiz-${materialName}`;
  
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = sessionStorage.getItem(`${sessionKey}-index`);
    return saved ? parseInt(saved) : 0;
  });
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const [score, setScore] = useState(() => {
    const saved = sessionStorage.getItem(`${sessionKey}-score`);
    return saved ? parseInt(saved) : 0;
  });
  
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>(() => {
    const saved = sessionStorage.getItem(`${sessionKey}-answers`);
    return saved ? JSON.parse(saved) : {};
  });

  // Save to sessionStorage whenever state changes
  useEffect(() => {
    sessionStorage.setItem(`${sessionKey}-index`, currentIndex.toString());
    sessionStorage.setItem(`${sessionKey}-score`, score.toString());
    sessionStorage.setItem(`${sessionKey}-answers`, JSON.stringify(selectedAnswers));
  }, [currentIndex, score, selectedAnswers, sessionKey]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    // Store the answer
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: index });
    
    // Auto-advance for kinesthetic style
    if (learningStyle === 'kinesthetic') {
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          handleComplete();
        }
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(selectedAnswers[currentIndex + 1] ?? null);
      setShowResult(false);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsComplete(true);
    
    // Clear sessionStorage
    sessionStorage.removeItem(`${sessionKey}-index`);
    sessionStorage.removeItem(`${sessionKey}-score`);
    sessionStorage.removeItem(`${sessionKey}-answers`);
    
    const scorePercent = (score / questions.length) * 100;
    
    // Save to Supabase using the new utility
    if (user) {
      try {
        const saved = await saveQuizResult({
          material_name: materialName,
          total_questions: questions.length,
          correct_answers: score,
          score_percent: scorePercent,
          learning_style: learningStyle,
          date_taken: new Date().toISOString(),
        });

        if (saved) {
          toast({
            title: '🎉 Quiz Complete!',
            description: `You scored ${score}/${questions.length} (${scorePercent.toFixed(0)}%)`,
          });
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    }
  };

  const getAnswerButtonClass = (index: number) => {
    if (!showResult) {
      return 'hover:bg-primary/10 hover:border-primary';
    }
    
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-400';
    }
    
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-400';
    }
    
    return '';
  };

  if (isComplete) {
    const scorePercent = (score / questions.length) * 100;
    const isExcellent = scorePercent >= 80;
    const isGood = scorePercent >= 60;

    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center ${
              isExcellent ? 'bg-green-500/20' : isGood ? 'bg-yellow-500/20' : 'bg-red-500/20'
            }`}>
              <Trophy className={`h-16 w-16 ${
                isExcellent ? 'text-green-500' : isGood ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
          </motion.div>
          
          <div>
            <p className="text-4xl font-bold text-foreground">{score}</p>
            <p className="text-lg text-muted-foreground">out of {questions.length}</p>
            <div className="mt-4">
              <Progress value={scorePercent} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {scorePercent.toFixed(0)}% - {isExcellent ? 'Excellent!' : isGood ? 'Good job!' : 'Keep practicing!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  // Text-to-speech handler for auditory learners
  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            🎯 Quiz
            {learningStyle === 'auditory' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSpeak(currentQuestion.question)}
                className="ml-auto"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Question */}
          <div className="p-6 bg-muted/50 rounded-lg">
            <p className="text-lg font-medium text-foreground">{currentQuestion.question}</p>
          </div>

          {/* Adaptive rendering based on learning style */}
          {learningStyle === 'visual' && currentQuestion.imageUrl && (
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-orange-100 rounded-lg flex items-center justify-center border-2 border-primary/20">
              <img src={currentQuestion.imageUrl} alt="Question image" className="max-w-full max-h-full rounded" />
            </div>
          )}
          
          {learningStyle === 'reading_writing' && currentQuestion.type === 'reading' && (
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <p className="text-sm mb-3 text-muted-foreground">Reading Passage:</p>
              <p className="text-foreground leading-relaxed">
                {currentQuestion.question.split('?')[0] || 'Read the passage carefully and answer the question below.'}
              </p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !showResult && handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${getAnswerButtonClass(index)} ${
                  !showResult && 'cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  {showResult && index === selectedAnswer && index !== currentQuestion.correctAnswer && (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Next button */}
          {showResult && (
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizRenderer;

