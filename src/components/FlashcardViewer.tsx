import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStudyStore } from '@/store/useStudyStore';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

const FlashcardViewer = ({ flashcards }: FlashcardViewerProps) => {
  const learningStyle = useStudyStore(state => state.learningStyle);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  if (!currentCard) return null;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <RotateCw className="h-5 w-5" />
            Flashcards
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-12 w-12 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative h-64">
            <motion.div
              className="absolute inset-0 cursor-pointer"
              onClick={handleFlip}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="w-full h-full border-2 border-primary/20 bg-gradient-to-br from-blue-500/10 to-orange-500/10">
                <CardContent className="flex items-center justify-center h-full p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${isFlipped}-${currentIndex}`}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <p className="text-sm text-muted-foreground mb-2">
                        {isFlipped ? 'Answer' : 'Question'}
                      </p>
                      <p className="text-lg font-medium text-foreground">
                        {isFlipped ? currentCard.back : currentCard.front}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="h-12 w-12 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex justify-center mt-6 gap-2">
          {learningStyle === 'auditory' && (
            <Button 
              variant="outline" 
              onClick={() => handleSpeak(isFlipped ? currentCard.back : currentCard.front)}
              className="flex-1"
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Listen
            </Button>
          )}
          <Button variant="outline" onClick={handleFlip} className={learningStyle === 'auditory' ? 'flex-1' : 'w-full'}>
            <RotateCw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlashcardViewer;


