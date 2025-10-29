import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Headphones,
  BookOpen,
  GraduationCap,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { parseFile, validateFile, type ParsedContent } from '@/utils/fileParser';
import { useOpenAI } from '@/hooks/useOpenAI';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import FlashcardViewer from './FlashcardViewer';
import QuizRenderer from './QuizRenderer';
import ResourceRecommender from './ResourceRecommender';
import ParsedSummary from './ParsedSummary';
import { useStudyStore } from '@/store/useStudyStore';
import { saveStudyMaterial, saveFlashcards, getUserProfileId } from '@/utils/supabaseStudyMaterials';

const StudyMaterialManager = () => {
  const { toast } = useToast();
  const user = auth.currentUser;

  // Get state from Zustand store
  const {
    learningStyle,
    uploadedFileName,
    fileContent,
    summary,
    flashcards,
    quizQuestions,
    setUploadedFile,
    setSummary,
    setFlashcards,
    setQuizQuestions,
    setCurrentSection,
    clearSession,
  } = useStudyStore();

  const [uploadedFile, setLocalFile] = useState<File | null>(null);
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([]);
  const [articleLinks, setArticleLinks] = useState<string[]>([]);

  const { generateSummary, generateFlashcards, generateQuiz, isLoading, error } = useOpenAI();

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setLocalFile(file);
    setUploadedFile(file, ''); // Will update once parsed
    setIsParsing(true);
    setParseProgress(0);
    setCurrentSection('upload');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setParseProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const content = await parseFile(file);
      
      clearInterval(progressInterval);
      setParseProgress(100);
      
      setParsedContent(content);
      setUploadedFile(file, content.text);
      
      toast({
        title: '✅ File parsed successfully!',
        description: 'You can now generate a summary',
      });
    } catch (error: any) {
      toast({
        title: 'Parsing Failed',
        description: error.message || 'Failed to parse file',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
  });

  const handleGenerateSummary = async () => {
    if (!parsedContent) return;

    try {
      const summaryText = await generateSummary(
        parsedContent.text,
        learningStyle,
        summaryLength
      );
      setSummary(summaryText);
      setCurrentSection('summary');
      
      toast({
        title: '📝 Summary generated!',
        description: 'Summary is ready. Generate flashcards or quiz next.',
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate summary',
        variant: 'destructive',
      });
    }
  };

  const handleReferencesReady = (youtube: string[], articles: string[]) => {
    setYoutubeLinks(youtube);
    setArticleLinks(articles);
  };

  const handleSaveSummary = async () => {
    if (!summary || !user) return;
    
    setIsSaving(true);
    try {
      // Save to Supabase using the proper schema
      const materialId = await saveStudyMaterial({
        title: parsedContent?.fileName || 'Study Material',
        summary: summary,
        content: fileContent,
        learning_style: learningStyle,
        page_length: summaryLength === 'short' ? 1 : summaryLength === 'medium' ? 2 : 3,
        youtube_links: youtubeLinks,
        article_links: articleLinks,
        references: {
          summary_keywords: extractKeywords(summary),
          generated_at: new Date().toISOString(),
        },
      });

      if (!materialId) throw new Error('Failed to save material');

      toast({
        title: '✅ Saved successfully!',
        description: 'Your summary has been saved to your account.',
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save summary',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const extractKeywords = (text: string): string[] => {
    const keywords: string[] = [];
    const commonTopics = ['docker', 'react', 'javascript', 'python', 'kubernetes', 'git', 'node', 'api', 'database', 'cloud'];
    
    commonTopics.forEach(topic => {
      if (text.toLowerCase().includes(topic)) {
        keywords.push(topic);
      }
    });
    
    return keywords.slice(0, 5);
  };

  const handleGenerateFlashcards = async () => {
    if (!parsedContent) return;

    try {
      const cards = await generateFlashcards(
        parsedContent.text,
        learningStyle
      );
      setFlashcards(cards);
      setCurrentSection('flashcards');
      
      // Save to Supabase using new utility
      if (user && parsedContent) {
        await saveFlashcards(cards, parsedContent.fileName);
      }
      
      toast({
        title: '🎴 Flashcards generated!',
        description: `${cards.length} flashcards created`,
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate flashcards',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateQuiz = async () => {
    if (!parsedContent) return;

    try {
      const questions = await generateQuiz(
        parsedContent.text,
        learningStyle
      );
      setQuizQuestions(questions);
      setCurrentSection('quiz');
      
      toast({
        title: '🎯 Quiz generated!',
        description: `${questions.length} questions created`,
      });
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate quiz',
        variant: 'destructive',
      });
    }
  };

  const handleListenSummary = () => {
    if (!summary) return;
    
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setLocalFile(null);
    setParsedContent(null);
    clearSession();
    setParseProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">📚 Study Materials</h2>
          <p className="text-muted-foreground mt-1">
            Upload your materials • Style: <span className="font-semibold capitalize">{learningStyle}</span>
          </p>
        </div>
        {(uploadedFileName || summary) && (
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* File Upload Zone */}
      {!uploadedFileName && (
        <Card className="border-2 border-dashed border-primary/50 hover:border-primary transition-colors">
          <CardContent className="p-12">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-all ${
                isDragActive ? 'scale-[1.02]' : ''
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center rounded-full">
                  <Upload className="h-10 w-10 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your study material'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    PDF, PPT, PPTX, or TXT files (max 10MB)
                  </p>
                  <Button variant="outline" className="mt-4">
                    Browse Files
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Info & Progress */}
      {uploadedFileName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{uploadedFileName}</CardTitle>
                    <CardDescription>
                      {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB` : 'File uploaded'}
                    </CardDescription>
                  </div>
                </div>
                {parsedContent && (
                  <span className="text-sm font-medium text-green-600">✓ Parsed</span>
                )}
              </div>
            </CardHeader>
            {isParsing && (
              <CardContent>
                <Progress value={parseProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Parsing content... {parseProgress}%
                </p>
              </CardContent>
            )}
            {parsedContent && !summary && (
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Summary Length
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={summaryLength === 'short' ? 'default' : 'outline'}
                      onClick={() => setSummaryLength('short')}
                      className="w-full"
                    >
                      Short
                    </Button>
                    <Button
                      variant={summaryLength === 'medium' ? 'default' : 'outline'}
                      onClick={() => setSummaryLength('medium')}
                      className="w-full"
                    >
                      Medium
                    </Button>
                    <Button
                      variant={summaryLength === 'long' ? 'default' : 'outline'}
                      onClick={() => setSummaryLength('long')}
                      className="w-full"
                    >
                      Long
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:opacity-90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </>
                  )}
                </Button>
              </CardContent>
            )}
          </Card>
        </motion.div>
      )}

      {/* Summary Display */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="space-y-6">
              <ParsedSummary summary={summary} />
              
              {/* Action Buttons */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Additional Learning Tools
                  </CardTitle>
                  <CardDescription>
                    Generate flashcards, quizzes, or listen to the summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {learningStyle === 'auditory' && summary && (
                      <Button variant="outline" onClick={handleListenSummary} className="w-full">
                        <Headphones className="h-4 w-4 mr-2" />
                        Listen to Summary
                      </Button>
                    )}
                    <Button
                      variant="default"
                      onClick={handleSaveSummary}
                      disabled={isSaving}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Save Summary
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={handleGenerateFlashcards}
                      disabled={isLoading || flashcards.length > 0}
                      className="w-full"
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {flashcards.length > 0 ? 'Flashcards Ready ✓' : 'Generate Flashcards'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateQuiz}
                      disabled={isLoading || quizQuestions.length > 0}
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {quizQuestions.length > 0 ? 'Quiz Ready ✓' : 'Generate Quiz'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flashcards Section */}
      {flashcards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FlashcardViewer flashcards={flashcards} />
        </motion.div>
      )}

      {/* Quiz Section */}
      {quizQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <QuizRenderer
            questions={quizQuestions}
            materialName={parsedContent?.fileName || 'Study Material'}
          />
        </motion.div>
      )}

      {/* Recommendations */}
      {summary && (
        <ResourceRecommender
          summary={summary}
          materialName={parsedContent?.fileName || 'Study Material'}
          onReferencesReady={handleReferencesReady}
        />
      )}
    </div>
  );
};

export default StudyMaterialManager;

