import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, CheckCircle2, TrendingUp, Eye, Headphones, BookMarked, Hand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyStore } from '@/store/useStudyStore';

interface ParsedSection {
  type: 'main-concepts' | 'step-by-step' | 'analogies' | 'practice' | 'summary';
  title: string;
  content: string[];
  icon: React.ReactNode;
}

interface ParsedSummaryProps {
  summary: string;
}

const ParsedSummary = ({ summary }: ParsedSummaryProps) => {
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
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-background rounded-lg border-2 border-muted"
            >
              <div className="flex items-center gap-3 mb-3">
                {section.icon}
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
              <ul className="space-y-3">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-3 text-sm">
                    <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParsedSummary;

