/**
 * Supabase Study Materials Utilities
 * 
 * Re-exports from the main helper file and provides additional utilities.
 * Uses Firebase UID directly - no user_profiles dependency.
 */
import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/firebase';

// Re-export everything from the main helper
export * from '@/lib/supabaseStudyMaterials';

// ============================================
// Additional Types
// ============================================

export interface FlashcardData {
  user_id: string;
  material_id: string;
  front: string;
  back: string;
}

export interface QuizData {
  material_name: string;
  total_questions: number;
  correct_answers: number;
  score_percent: number;
  learning_style: string;
  date_taken: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get current Firebase user ID.
 * Returns the Firebase UID directly, no user_profiles lookup needed.
 */
export const getUserProfileId = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('[getUserProfileId] No authenticated user');
    return null;
  }
  // Return Firebase UID directly - no need to look up user_profiles
  return user.uid;
};

// ============================================
// Flashcard Operations
// ============================================

/**
 * Save flashcards to Supabase.
 */
export const saveFlashcards = async (
  flashcards: Array<{ front: string; back: string }>,
  materialName: string
): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('[saveFlashcards] No authenticated user');
    return false;
  }

  try {
    const flashcardsToInsert = flashcards.map(card => ({
      user_id: user.uid,
      material_id: materialName,
      front: card.front,
      back: card.back,
    }));

    const { error } = await supabase
      .from('flashcards')
      .insert(flashcardsToInsert);

    if (error) {
      console.error('[saveFlashcards] error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[saveFlashcards] catch:', error);
    return false;
  }
};

/**
 * Fetch flashcards for a specific material.
 */
export const getFlashcards = async (materialId: string): Promise<FlashcardData[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', user.uid)
      .eq('material_id', materialId);

    if (error) {
      console.error('[getFlashcards] error:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('[getFlashcards] catch:', error);
    return [];
  }
};

// ============================================
// Quiz Operations
// ============================================

/**
 * Save quiz result to Supabase.
 */
export const saveQuizResult = async (quizData: QuizData): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.error('[saveQuizResult] No authenticated user');
    return false;
  }

  try {
    const { error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: user.uid,
        material_name: quizData.material_name,
        total_questions: quizData.total_questions,
        correct_answers: quizData.correct_answers,
        score_percent: quizData.score_percent,
        learning_style: quizData.learning_style,
        date_taken: quizData.date_taken,
      });

    if (error) {
      console.error('[saveQuizResult] error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[saveQuizResult] catch:', error);
    return false;
  }
};

// ============================================
// Session Cache Utilities
// ============================================

/**
 * Cache data to sessionStorage for faster access.
 */
export const cacheToSession = (key: string, data: any): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('[cacheToSession] error:', error);
  }
};

/**
 * Get cached data from sessionStorage.
 */
export const getFromSession = <T>(key: string): T | null => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('[getFromSession] error:', error);
    return null;
  }
};

/**
 * Get data from cache or fetch fresh.
 */
export const getCachedOrFresh = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T | null>,
  ttl: number = 3600000 // 1 hour default
): Promise<T | null> => {
  const cached = getFromSession<T>(cacheKey);
  const cachedTime = getFromSession<number>(`${cacheKey}_time`);

  if (cached && cachedTime && Date.now() - cachedTime < ttl) {
    return cached;
  }

  const fresh = await fetcher();
  if (fresh) {
    cacheToSession(cacheKey, fresh);
    cacheToSession(`${cacheKey}_time`, Date.now());
  }

  return fresh;
};
