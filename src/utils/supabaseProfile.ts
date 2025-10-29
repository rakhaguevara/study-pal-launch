import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/firebase';

/**
 * Get user profile by Firebase UID
 */
export async function getUserProfile(firebaseUid: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('firebase_uid', firebaseUid)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows found, which is okay for first-time users
    throw error;
  }

  return data;
}

/**
 * Save or update user profile
 * Uses Firebase UID for authentication since we're using Firebase Auth
 */
export async function saveProfile(
  profileData: {
    firebase_uid: string;
    name: string;
    email: string;
    date_of_birth?: string | null;
    age?: number | null;
    school?: string | null;
    class?: string | null;
    gender?: string | null;
    learning_style?: string | null;
    quiz_completed?: boolean;
    avatar_url?: string | null;
  }
) {
  const firebaseUser = auth.currentUser;
  
  if (!firebaseUser) {
    throw new Error('User not authenticated. Please log in first.');
  }

  // Ensure firebase_uid matches current user
  if (profileData.firebase_uid !== firebaseUser.uid) {
    throw new Error('Unauthorized: Cannot modify another user\'s profile');
  }

  // Check if profile exists
  const existingProfile = await getUserProfile(firebaseUser.uid);

  if (existingProfile) {
    // Update existing profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('firebase_uid', firebaseUser.uid)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  } else {
    // Insert new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        ...profileData,
        id: crypto.randomUUID(), // Generate UUID for new profile
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  }
}

/**
 * Update specific profile fields
 */
export async function updateProfileFields(
  updates: Partial<{
    name: string;
    email: string;
    date_of_birth: string | null;
    age: number | null;
    school: string | null;
    class: string | null;
    gender: string | null;
    learning_style: string | null;
    quiz_completed: boolean;
    avatar_url: string | null;
  }>
) {
  const firebaseUser = auth.currentUser;
  
  if (!firebaseUser) {
    throw new Error('User not authenticated. Please log in first.');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('firebase_uid', firebaseUser.uid)
    .select()
    .single();

  if (error) {
    console.error('Supabase update error:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}
