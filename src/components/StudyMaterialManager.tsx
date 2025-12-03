import { useState, useEffect, useRef, useCallback } from 'react';
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
  Play,
  Pause,
  RefreshCw,
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
    insights,
    studyPath,
    ttsOptimizedText,
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
  
  // Audio TTS state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      const result = await generateSummary(
        parsedContent.text,
        learningStyle,
        summaryLength
      );
      setSummary(result.summary, result.insights, result.studyPath, result.ttsOptimizedText);
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

  const handleReferencesReady = useCallback((youtube: string[], articles: string[]) => {
    setYoutubeLinks(youtube);
    setArticleLinks(articles);
  }, []);

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
        reference_links: {
          summary_keywords: extractKeywords(summary),
          insights: insights,
          summary_length: summaryLength,
          study_path: studyPath,
          tts_optimized_text: ttsOptimizedText,
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

  // Enhanced audio handler that uses TTS-optimized text when available
  const handleListenSummary = (textToRead?: string) => {
    // Use TTS-optimized text if available and provided, otherwise fall back to regular summary
    const textForAudio = textToRead || (learningStyle === 'auditory' && ttsOptimizedText) || summary;
    
    if (!textForAudio) return;
    
    // If already playing, pause it
    if (isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsPlayingAudio(false);
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
      return;
    }
    
    // If paused, resume from where we left off
    if (window.speechSynthesis.paused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      // Restart progress tracking
      let progress = audioProgress;
      const estimatedDuration = (textForAudio.length / 150) * 1000;
      const interval = 100;
      audioProgressIntervalRef.current = setInterval(() => {
        progress += (interval / estimatedDuration) * 100;
        if (progress >= 100) {
          progress = 100;
          if (audioProgressIntervalRef.current) {
            clearInterval(audioProgressIntervalRef.current);
          }
        }
        setAudioProgress(Math.min(progress, 100));
      }, interval);
      return;
    }
    
    // Clear any existing speech before starting new
    window.speechSynthesis.cancel();
    
    // Start new playback
    const utterance = new SpeechSynthesisUtterance(textForAudio);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setAudioProgress(100);
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
      utteranceRef.current = null;
    };
    
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
      utteranceRef.current = null;
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
    
    // Simple progress simulation (since SpeechSynthesis doesn't provide direct progress)
    let progress = 0;
    const estimatedDuration = (textForAudio.length / 150) * 1000; // Rough estimate: 150 words per minute
    const interval = 100; // Update every 100ms
    
    audioProgressIntervalRef.current = setInterval(() => {
      progress += (interval / estimatedDuration) * 100;
      if (progress >= 100) {
        progress = 100;
        if (audioProgressIntervalRef.current) {
          clearInterval(audioProgressIntervalRef.current);
        }
      }
      setAudioProgress(Math.min(progress, 100));
    }, interval);
  };

  const handlePauseAudio = () => {
    window.speechSynthesis.pause();
    setIsPlayingAudio(false);
    if (audioProgressIntervalRef.current) {
      clearInterval(audioProgressIntervalRef.current);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleReset = () => {
    // Stop audio if playing
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      if (audioProgressIntervalRef.current) {
        clearInterval(audioProgressIntervalRef.current);
      }
      setAudioProgress(0);
      utteranceRef.current = null;
    }
    setLocalFile(null);
    setParsedContent(null);
    clearSession();
    setParseProgress(0);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - responsive layout */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">📚 Study Materials</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Upload your materials • Style: <span className="font-semibold capitalize">{learningStyle}</span>
          </p>
        </div>
        {(uploadedFileName || summary) && (
          <Button variant="outline" onClick={handleReset} size="sm" className="self-start sm:self-auto">
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* File Upload Zone - responsive padding */}
      {!uploadedFileName && (
        <Card className="border-2 border-dashed border-primary/50 hover:border-primary transition-colors">
          <CardContent className="p-6 sm:p-8 lg:p-12">
            <div
              {...getRootProps()}
              className={`text-center cursor-pointer transition-all ${
                isDragActive ? 'scale-[1.02]' : ''
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center">
                  <Upload className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your study material'}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
                    PDF, PPT, PPTX, or TXT files (max 10MB)
                  </p>
                  <Button variant="outline" className="mt-3 sm:mt-4 text-xs sm:text-sm">
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
              <ParsedSummary 
                summary={summary} 
                insights={insights}
                studyPath={studyPath}
                ttsOptimizedText={ttsOptimizedText}
                onPlayAudio={handleListenSummary}
                onPauseAudio={handlePauseAudio}
                isPlaying={isPlayingAudio}
              />
              
              {/* Action Buttons - responsive grid */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                    Additional Learning Tools
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Generate flashcards, quizzes, or listen to the summary
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {summary && learningStyle === 'auditory' && (
                      <div className="w-full">
                        <Button 
                          variant="outline" 
                          onClick={() => handleListenSummary()} 
                          className="w-full text-xs sm:text-sm h-9 sm:h-10"
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              Pause Audio
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              Listen to Summary
                            </>
                          )}
                        </Button>
                        {isPlayingAudio && (
                          <div className="mt-2">
                            <Progress value={audioProgress} className="h-1.5 sm:h-2" />
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 text-center">
                              {Math.round(audioProgress)}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      variant="default"
                      onClick={handleSaveSummary}
                      disabled={isSaving}
                      className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-9 sm:h-10"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          Save Summary
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={handleGenerateFlashcards}
                      disabled={isLoading || flashcards.length > 0}
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      {flashcards.length > 0 ? 'Flashcards Ready ✓' : 'Generate Flashcards'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGenerateQuiz}
                      disabled={isLoading || quizQuestions.length > 0}
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
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
            questions={quizQuestions as any}
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

