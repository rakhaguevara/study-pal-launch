/**
 * Tasks Service
 * 
 * Handles task CRUD operations using Firebase UID.
 */
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";
import { CreateTaskPayload, Task } from "@/types/tasks";

// ============================================
// Internal Helpers
// ============================================

interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  source: "google" | "manual";
  google_event_id?: string | null;
  created_at: string;
  updated_at: string;
}

const mapRowToTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  subject: row.subject,
  description: row.description,
  startTime: row.start_time,
  endTime: row.end_time,
  source: row.source || "manual",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/**
 * Get current Firebase user ID.
 */
function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user. Please log in first.");
  }
  return user.uid;
}

// ============================================
// Fetch Tasks
// ============================================

interface FetchManualTasksParams {
  userId?: string | null;
  timeMin: string;
  timeMax: string;
}

/**
 * Fetch manual tasks within a time range.
 * If userId is not provided, uses the current Firebase user.
 */
export async function fetchManualTasks({ 
  userId, 
  timeMin, 
  timeMax 
}: FetchManualTasksParams): Promise<Task[]> {
  // Use provided userId or get from Firebase
  const effectiveUserId = userId || (auth.currentUser?.uid);
  
  if (!effectiveUserId) {
    console.warn("[fetchManualTasks] No user ID available");
    return [];
  }

  const orFilter = [
    `and(start_time.gte.${timeMin},start_time.lte.${timeMax})`,
    `and(end_time.gte.${timeMin},end_time.lte.${timeMax})`,
    `and(start_time.lte.${timeMin},end_time.gte.${timeMax})`,
  ].join(",");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", effectiveUserId)
    .or(orFilter)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[fetchManualTasks] error:", error);
    return [];
  }

  return (data || []).map(mapRowToTask);
}

/**
 * Fetch all tasks for the current user.
 */
export async function fetchAllTasks(): Promise<Task[]> {
  const userId = getCurrentUserId();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[fetchAllTasks] error:", error);
    return [];
  }

  return (data || []).map(mapRowToTask);
}

// ============================================
// Create Task
// ============================================

interface CreateManualTaskParams extends CreateTaskPayload {
  userId?: string;
}

/**
 * Create a new manual task.
 * If userId is not provided, uses the current Firebase user.
 */
export async function createManualTask({ 
  userId, 
  ...payload 
}: CreateManualTaskParams): Promise<Task> {
  // Use provided userId or get from Firebase
  const effectiveUserId = userId || getCurrentUserId();
  const now = new Date().toISOString();

  const body = {
    user_id: effectiveUserId,
    title: payload.title,
    subject: payload.subject ?? null,
    description: payload.description ?? null,
    start_time: payload.startTime,
    end_time: payload.endTime,
    source: "manual" as const,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(body)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[createManualTask] error:", error);
    throw error || new Error("Failed to create task");
  }

  return mapRowToTask(data);
}

// ============================================
// Update Task
// ============================================

interface UpdateTaskParams {
  id: string;
  updates: Partial<CreateTaskPayload>;
}

/**
 * Update an existing task.
 */
export async function updateTask({ id, updates }: UpdateTaskParams): Promise<Task> {
  const userId = getCurrentUserId();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.subject !== undefined) updateData.subject = updates.subject;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime;

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[updateTask] error:", error);
    throw error || new Error("Failed to update task");
  }

  return mapRowToTask(data);
}

// ============================================
// Delete Task
// ============================================

/**
 * Delete a task.
 */
export async function deleteTask(id: string): Promise<void> {
  const userId = getCurrentUserId();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("[deleteTask] error:", error);
    throw error;
  }
}
