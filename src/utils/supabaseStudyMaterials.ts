import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/firebase';

export interface StudyMaterial {
  id?: string;
  user_id?: string;
  title: string;
  content?: string;
  summary: string;
  learning_style: 'visual' | 'auditory' | 'reading_writing' | 'kinesthetic';
  youtube_links?: string[];
  article_links?: string[];
  reference_links?: Record<string, any>;
  page_length?: number;
  created_at?: string;
  updated_at?: string;
}

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

/**
 * Get user profile ID from Firebase UID
 */
export const getUserProfileId = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('firebase_uid', user.uid)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data.id;
};

/**
 * Save a study material to Supabase
 */
export const saveStudyMaterial = async (material: Omit<StudyMaterial, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
  const userProfileId = await getUserProfileId();
  if (!userProfileId) {
    console.error('User profile not found');
    return null;
  }

  const { data, error } = await supabase
    .from('study_materials')
    .insert({
      ...material,
      user_id: userProfileId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving study material:', error);
    return null;
  }

  return data.id;
};

/**
 * Get all study materials for the current user
 */
export const getStudyMaterials = async (): Promise<StudyMaterial[]> => {
  const userProfileId = await getUserProfileId();
  if (!userProfileId) return [];

  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('user_id', userProfileId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching study materials:', error);
    return [];
  }

  return data || [];
};

/**
 * Get a specific study material by ID
 */
export const getStudyMaterial = async (id: string): Promise<StudyMaterial | null> => {
  const { data, error } = await supabase
    .from('study_materials')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching study material:', error);
    return null;
  }

  return data;
};

/**
 * Update a study material
 */
export const updateStudyMaterial = async (id: string, updates: Partial<StudyMaterial>): Promise<boolean> => {
  const { error } = await supabase
    .from('study_materials')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating study material:', error);
    return false;
  }

  return true;
};

/**
 * Delete a study material
 */
export const deleteStudyMaterial = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('study_materials')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting study material:', error);
    return false;
  }

  return true;
};

/**
 * Save flashcards to Supabase
 */
export const saveFlashcards = async (flashcards: Array<{ front: string; back: string }>, materialName: string): Promise<boolean> => {
  const userProfileId = await getUserProfileId();
  if (!userProfileId) return false;

  const user = auth.currentUser;
  if (!user) return false;

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
    console.error('Error saving flashcards:', error);
    return false;
  }

  return true;
};

/**
 * Save quiz result to Supabase
 */
export const saveQuizResult = async (quizData: QuizData): Promise<boolean> => {
  const userProfileId = await getUserProfileId();
  if (!userProfileId) return false;

  const { error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: userProfileId,
      material_name: quizData.material_name,
      total_questions: quizData.total_questions,
      correct_answers: quizData.correct_answers,
      score_percent: quizData.score_percent,
      learning_style: quizData.learning_style,
      date_taken: quizData.date_taken,
    });

  if (error) {
    console.error('Error saving quiz result:', error);
    return false;
  }

  return true;
};

/**
 * Cache data to sessionStorage for faster access
 */
export const cacheToSession = (key: string, data: any): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error caching to sessionStorage:', error);
  }
};

/**
 * Get cached data from sessionStorage
 */
export const getFromSession = <T>(key: string): T | null => {
  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return null;
  }
};

/**
 * Get or create material reference from cache or fresh fetch
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

