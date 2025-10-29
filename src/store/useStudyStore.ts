import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LearningStyle = 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type?: string;
}

interface StudyState {
  // User info
  userId: string | null;
  learningStyle: LearningStyle;
  
  // Study materials
  uploadedFile: File | null;
  uploadedFileName: string;
  fileContent: string;
  
  // AI generated content
  summary: string;
  insights: string[];
  studyPath?: string; // Suggested study path for kinesthetic learners
  ttsOptimizedText?: string; // TTS-optimized version for auditory learners
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  
  // Session management
  currentSection: 'upload' | 'summary' | 'flashcards' | 'quiz' | null;
  
  // Actions
  setUserId: (userId: string | null) => void;
  setLearningStyle: (style: LearningStyle) => void;
  setUploadedFile: (file: File | null, content: string) => void;
  setSummary: (summary: string, insights?: string[], studyPath?: string, ttsOptimizedText?: string) => void;
  setFlashcards: (flashcards: Flashcard[]) => void;
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  setCurrentSection: (section: StudyState['currentSection']) => void;
  clearSession: () => void;
}

const initialLearningStyle: LearningStyle = 'visual';

export const useStudyStore = create<StudyState>()(
  persist(
    (set) => ({
      // Initial state
      userId: null,
      learningStyle: initialLearningStyle,
      uploadedFile: null,
      uploadedFileName: '',
      fileContent: '',
      summary: '',
      insights: [],
      studyPath: undefined,
      ttsOptimizedText: undefined,
      flashcards: [],
      quizQuestions: [],
      currentSection: null,

      // Actions
      setUserId: (userId) => set({ userId }),
      
      setLearningStyle: (learningStyle) => 
        set({ learningStyle }),
      
      setUploadedFile: (file, content) => 
        set({ 
          uploadedFile: file, 
          uploadedFileName: file?.name || '',
          fileContent: content 
        }),
      
      setSummary: (summary, insights = [], studyPath, ttsOptimizedText) => 
        set({ summary, insights, studyPath, ttsOptimizedText }),
      
      setFlashcards: (flashcards) => 
        set({ flashcards }),
      
      setQuizQuestions: (questions) => 
        set({ quizQuestions: questions }),
      
      setCurrentSection: (section) => 
        set({ currentSection: section }),
      
      clearSession: () => 
        set({
          uploadedFile: null,
          uploadedFileName: '',
          fileContent: '',
          summary: '',
          insights: [],
          studyPath: undefined,
          ttsOptimizedText: undefined,
          flashcards: [],
          quizQuestions: [],
          currentSection: null,
        }),
    }),
    {
      name: 'study-pal-session',
      // Only persist these fields (exclude File objects)
      partialize: (state) => ({
        userId: state.userId,
        learningStyle: state.learningStyle,
        uploadedFileName: state.uploadedFileName,
        fileContent: state.fileContent,
        summary: state.summary,
        insights: state.insights,
        studyPath: state.studyPath,
        ttsOptimizedText: state.ttsOptimizedText,
        flashcards: state.flashcards,
        quizQuestions: state.quizQuestions,
        currentSection: state.currentSection,
      }),
    }
  )
);





