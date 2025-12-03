/**
 * Supabase Study Materials Helper
 * 
 * CRUD operations for study_materials table.
 * Uses Firebase UID directly as user_id.
 * 
 * Required columns in DB: id, user_id, title, subject, description, resource_url, created_at, updated_at
 */
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

// ============================================
// Types - Only fields that exist in DB
// ============================================

export type StudyMaterial = {
  id: string;
  user_id: string;
  title: string;
  subject?: string | null;
  description?: string | null;
  resource_url?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateStudyMaterialPayload = {
  title: string;
  subject?: string;
  description?: string;
  resource_url?: string;
};

export type UpdateStudyMaterialPayload = Partial<CreateStudyMaterialPayload>;

// ============================================
// Helper Functions
// ============================================

/**
 * Get current Firebase user ID.
 * Throws an error if no user is logged in.
 */
async function getCurrentUserId(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user. Please log in first.");
  }
  return user.uid;
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Fetch all study materials for the current user.
 */
export async function fetchStudyMaterials(): Promise<StudyMaterial[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("study_materials")
    .select("id, user_id, title, subject, description, resource_url, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[fetchStudyMaterials] error:", error);
    throw error;
  }

  return (data ?? []) as StudyMaterial[];
}

/**
 * Fetch a single study material by ID.
 */
export async function fetchStudyMaterial(id: string): Promise<StudyMaterial | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("study_materials")
    .select("id, user_id, title, subject, description, resource_url, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[fetchStudyMaterial] error:", error);
    throw error;
  }

  return data as StudyMaterial | null;
}

/**
 * Create a new study material.
 * Only sends fields that exist in the database.
 */
export async function createStudyMaterial(
  payload: CreateStudyMaterialPayload
): Promise<StudyMaterial> {
  const userId = await getCurrentUserId();

  // Only include fields that exist in the DB schema
  const insertData: Record<string, any> = {
    user_id: userId,
    title: payload.title,
  };

  // Only add optional fields if they have values
  if (payload.subject !== undefined) {
    insertData.subject = payload.subject;
  }
  if (payload.description !== undefined) {
    insertData.description = payload.description;
  }
  if (payload.resource_url !== undefined) {
    insertData.resource_url = payload.resource_url;
  }

  const { data, error } = await supabase
    .from("study_materials")
    .insert(insertData)
    .select("id, user_id, title, subject, description, resource_url, created_at, updated_at")
    .single();

  if (error) {
    console.error("[createStudyMaterial] error:", error);
    throw error;
  }

  return data as StudyMaterial;
}

/**
 * Update an existing study material.
 */
export async function updateStudyMaterial(
  id: string,
  payload: UpdateStudyMaterialPayload
): Promise<StudyMaterial> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("study_materials")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, user_id, title, subject, description, resource_url, created_at, updated_at")
    .single();

  if (error) {
    console.error("[updateStudyMaterial] error:", error);
    throw error;
  }

  return data as StudyMaterial;
}

/**
 * Delete a study material.
 */
export async function deleteStudyMaterial(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("study_materials")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[deleteStudyMaterial] error:", error);
    throw error;
  }
}

// ============================================
// Legacy Exports (for backward compatibility)
// ============================================

/**
 * @deprecated Use createStudyMaterial instead
 */
export const saveStudyMaterial = async (
  material: Record<string, any>
): Promise<string | null> => {
  try {
    // Extract only the fields we support
    const result = await createStudyMaterial({
      title: material.title || "Untitled",
      subject: material.subject,
      description: material.description || material.summary,
      resource_url: material.resource_url,
    });
    return result.id;
  } catch (error) {
    console.error("[saveStudyMaterial] error:", error);
    return null;
  }
};

/**
 * @deprecated Use fetchStudyMaterials instead
 */
export const getStudyMaterials = fetchStudyMaterials;

/**
 * @deprecated Use fetchStudyMaterial instead
 */
export const getStudyMaterial = fetchStudyMaterial;
