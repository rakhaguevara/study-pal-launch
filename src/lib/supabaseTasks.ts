/**
 * Supabase Tasks Helper
 * 
 * CRUD operations for tasks table.
 * Uses Firebase UID directly as user_id.
 */
import { supabase } from "@/integrations/supabase/client";
import { auth } from "@/lib/firebase";

// ============================================
// Types
// ============================================

export type TaskSource = "manual" | "google";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  subject?: string | null;
  description?: string | null;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  source: TaskSource;
  google_event_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskPayload = {
  title: string;
  subject?: string;
  description?: string;
  start_time: string; // ISO string (date + time)
  end_time: string;   // ISO string (deadline)
  source?: TaskSource;
  google_event_id?: string | null;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

// ============================================
// Helper Functions
// ============================================

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
// CRUD Operations
// ============================================

/**
 * Fetch tasks within a time range for the current user.
 */
export async function fetchTasks(timeMin: string, timeMax: string): Promise<Task[]> {
  const userId = getCurrentUserId();

  // Build OR filter for tasks that overlap with the time range
  const orFilter = [
    `and(start_time.gte.${timeMin},start_time.lte.${timeMax})`,
    `and(end_time.gte.${timeMin},end_time.lte.${timeMax})`,
    `and(start_time.lte.${timeMin},end_time.gte.${timeMax})`,
  ].join(",");

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .or(orFilter)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("[fetchTasks] error:", error);
    throw error;
  }

  return (data ?? []) as Task[];
}

/**
 * Fetch all tasks for the current user (no time filter).
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
    throw error;
  }

  return (data ?? []) as Task[];
}

/**
 * Fetch a single task by ID.
 */
export async function fetchTask(id: string): Promise<Task | null> {
  const userId = getCurrentUserId();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("[fetchTask] error:", error);
    throw error;
  }

  return data as Task;
}

/**
 * Create a new task.
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const userId = getCurrentUserId();

  const insertData = {
    user_id: userId,
    title: payload.title,
    subject: payload.subject ?? null,
    description: payload.description ?? null,
    start_time: payload.start_time,
    end_time: payload.end_time,
    source: payload.source ?? "manual",
    google_event_id: payload.google_event_id ?? null,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(insertData)
    .select("*")
    .single();

  if (error) {
    console.error("[createTask] error:", error);
    throw error;
  }

  return data as Task;
}

/**
 * Update an existing task.
 */
export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const userId = getCurrentUserId();

  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    console.error("[updateTask] error:", error);
    throw error;
  }

  return data as Task;
}

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

