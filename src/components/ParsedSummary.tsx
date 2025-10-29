import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, CheckCircle2, TrendingUp, Eye, Headphones, BookMarked, Hand, Play, Pause, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudyStore } from '@/store/useStudyStore';

interface ParsedSection {
  type: 'main-concepts' | 'step-by-step' | 'analogies' | 'practice' | 'summary';
  title: string;
  content: string[];
  icon: React.ReactNode;
}

interface ParsedSummaryProps {
  summary: string;
  insights?: string[];
  studyPath?: string;
  ttsOptimizedText?: string;
  onPlayAudio?: (text: string) => void;
  onPauseAudio?: () => void;
  isPlaying?: boolean;
}

const ParsedSummary = ({ 
  summary, 
  insights = [], 
  studyPath,
  ttsOptimizedText,
  onPlayAudio,
  onPauseAudio,
  isPlaying = false
}: ParsedSummaryProps) => {
  const learningStyle = useStudyStore(state => state.learningStyle);
  const [sections, setSections] = useState<ParsedSection[]>([]);
  const [isParsing, setIsParsing] = useState(true);

  // Parse AI summary into structured sections
  useEffect(() => {
    parseSummary(summary);
  }, [summary]);

  const parseSummary = (text: string) => {
    setIsParsing(true);
    
    // Try to extract sections based on common patterns
    const parsed: ParsedSection[] = [];
    
    // Extract main concepts (usually comes first or has keywords)
    const mainConceptsMatch = text.match(/(?:main concepts|key points|important concepts|core ideas|fundamentals)(?:\s*:?\s*)([^]+?)(?:\n\n|$)/i);
    if (mainConceptsMatch) {
      const concepts = mainConceptsMatch[1]
        .split(/[-•\n]/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 6);
      
      parsed.push({
        type: 'main-concepts',
        title: 'Main Concepts',
        content: concepts,
        icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      });
    }

    // Extract step-by-step instructions
    const stepsMatch = text.match(/(?:step by step|how to|instructions|process)(?:\s*:?\s*)([^]+?)(?:\n\n|$)/i);
    if (stepsMatch) {
      const steps = stepsMatch[1]
        .split(/(?:\d+\.|\n)/)
        .map(item => item.trim())
        .filter(item => item.length > 10)
        .slice(0, 8);
      
      parsed.push({
        type: 'step-by-step',
        title: 'Step-by-Step Practice',
        content: steps,
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    }

    // Extract analogies
    const analogiesMatch = text.match(/(?:analog|like|imagine|think of)([^]+?)(?:\n\n|$)/i);
    if (analogiesMatch) {
      const analogies = analogiesMatch[1]
        .split(/[.!?]/)
        .map(item => item.trim())
        .filter(item => item.length > 20 && (item.toLowerCase().includes('like') || item.toLowerCase().includes('imagine') || item.toLowerCase().includes('think')))
        .slice(0, 3);
      
      if (analogies.length > 0) {
        parsed.push({
          type: 'analogies',
          title: 'Analogies & Explanations',
          content: analogies,
          icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
        });
      }
    }

    // If no specific sections found, create a general summary
    if (parsed.length === 0) {
      // Split by paragraphs
      const paragraphs = text
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 50)
        .slice(0, 5);
      
      parsed.push({
        type: 'summary',
        title: 'Summary',
        content: paragraphs,
        icon: <BookMarked className="h-5 w-5 text-purple-500" />,
      });
    }

    setSections(parsed);
    setIsParsing(false);
  };

  const getLearningStyleIcon = () => {
    switch (learningStyle) {
      case 'visual':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'auditory':
        return <Headphones className="h-4 w-4 text-green-500" />;
      case 'reading_writing':
        return <BookMarked className="h-4 w-4 text-purple-500" />;
      case 'kinesthetic':
        return <Hand className="h-4 w-4 text-orange-500" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isParsing) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Parsing summary...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-orange-50 dark:from-blue-950 dark:to-orange-950">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            AI Summary
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-2">
            {getLearningStyleIcon()}
            {learningStyle} style
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Detailed Summary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-background rounded-lg border-2 border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookMarked className="h-6 w-6 text-blue-500" />
                <h3 className="text-xl font-semibold text-foreground">📘 Detailed Summary</h3>
              </div>
              {/* Audio Playback Button for Auditory Learners */}
              {learningStyle === 'auditory' && ttsOptimizedText && onPlayAudio && onPauseAudio && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isPlaying) {
                      onPauseAudio();
                    } else {
                      onPlayAudio(ttsOptimizedText);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pause Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Listen
                    </>
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {sections.length > 0 ? (
                sections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    {section.content.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-foreground leading-relaxed">
                        {item}
                      </p>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              )}
            </div>
          </motion.div>

          {/* Key Insights Section */}
          {insights && insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950 rounded-lg border-2 border-orange-200 dark:border-orange-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="h-6 w-6 text-orange-500" />
                <h3 className="text-xl font-semibold text-foreground">💡 Key Insights</h3>
              </div>
              <ul className="space-y-3">
                {insights.map((insight, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <TrendingUp className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground font-medium">{insight}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Suggested Study Path for Kinesthetic Learners */}
          {learningStyle === 'kinesthetic' && studyPath && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border-2 border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-green-500" />
                <h3 className="text-xl font-semibold text-foreground">📖 Suggested Study Path</h3>
              </div>
              <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                {studyPath}
              </div>
            </motion.div>
          )}

          {/* Short Summary Recap */}
          {insights && insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-muted/50 rounded-lg border border-border"
            >
              <h4 className="text-sm font-semibold text-foreground mb-2">Quick Recap</h4>
              <p className="text-sm text-muted-foreground">
                This material covers {insights.length} key {insights.length === 1 ? 'insight' : 'insights'}. 
                Review the detailed summary above for comprehensive understanding.
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParsedSummary;

